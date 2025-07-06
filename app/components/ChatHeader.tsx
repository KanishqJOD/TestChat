import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/chatbot-fe-main/components/ui/button';

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-white/10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h1 className="text-sm font-medium text-white">ArjunMart Bot</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-xs text-white/70">Online</span>
            </div>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  );
} 