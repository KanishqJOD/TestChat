import { ChatInterface } from './components/ChatInterface';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="w-full h-full md:max-w-2xl lg:max-w-3xl mx-auto">
        <ChatInterface />
      </div>
    </div>
  );
} 