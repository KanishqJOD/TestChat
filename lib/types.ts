// Input types for chat messages
export type InputType = 'text' | 'image' | 'audio';

// Base message interface
interface BaseMessage {
  type: InputType;
  message?: string;
  timestamp: string;
}

// Text message
export interface TextMessage extends BaseMessage {
  type: 'text';
  message: string;
}

// Image message
export interface ImageMessage extends BaseMessage {
  type: 'image';
  base64Data: string;
  message?: string; // Optional caption
}

// Audio message
export interface AudioMessage extends BaseMessage {
  type: 'audio';
  base64Data: string;
  message?: string; // Optional transcription
}

// Union type for all message types
export type ChatMessage = TextMessage | ImageMessage | AudioMessage;

// Response types
export interface BoundingBox {
  label: string;
  box_2d: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface ChatResponse {
  text: string;
  boundingBoxes?: BoundingBox[];
}

// Chat session types
export interface ChatSession {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: ChatMessage | ChatResponse;
    timestamp: string;
  }>;
} 