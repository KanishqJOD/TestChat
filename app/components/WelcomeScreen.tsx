import React from 'react';

export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6">
        <img 
          src="/robot-avatar.png" 
          alt="Bot Avatar" 
          className="w-14 h-14"
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.parentElement!.innerHTML = '🤖';
          }}
        />
      </div>
      <h1 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">
        How can I help you today?
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        I can help you find products, answer questions, and make recommendations
      </p>
      
      <div className="w-full max-w-md bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Try asking me:</h2>
        <div className="space-y-3 text-gray-600 dark:text-gray-300">
          <p className="text-sm">"Show me the latest smartphones"</p>
          <p className="text-sm">"What are your best-selling products?"</p>
          <p className="text-sm">"Help me find a gift under $50"</p>
          <p className="text-sm">"Tell me about your return policy"</p>
        </div>
      </div>
    </div>
  );
} 