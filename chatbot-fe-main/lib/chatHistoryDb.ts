import { openDB } from 'idb';

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  images?: string[]
}

const dbName = 'chatbot-history';
const storeName = 'messages';
const version = 1;

async function initDB() {
  return openDB(dbName, version, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    },
  });
}

export async function loadChatHistory(): Promise<Message[]> {
  try {
    const db = await initDB();
    const messages = await db.getAll(storeName);
    return messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
}

export async function addMessageToHistory(message: Message): Promise<void> {
  try {
    const db = await initDB();
    await db.add(storeName, {
      ...message,
      timestamp: message.timestamp.toISOString()
    });
  } catch (error) {
    console.error('Error adding message to history:', error);
  }
}

export async function clearHistory(): Promise<void> {
  try {
    const db = await initDB();
    await db.clear(storeName);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
}