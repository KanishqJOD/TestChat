"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"
import Image from "next/image"
import { ImageIcon, Mic } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  images?: string[]
}

interface ChatContainerProps {
  messages: Message[]
  isLoading: boolean
}

// Welcome message options that will rotate randomly
const welcomeMessages = [
  "Welcome to Walmart AI Shopping Assistant! 🛒",
  "Hi! I'm your Walmart shopping helper. What can I find for you? 🛍️",
  "Looking for great deals? I'm here to help! 🏷️",
  "Let me help you find the best products at Walmart! ⭐"
];

export function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Generate random welcome message on component mount
  const randomWelcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-white to-[#f8f9fa] dark:from-[#1a1a1a] dark:to-[#2a2a2a]">
        <div className="text-center max-w-md mx-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-[#0071dc] bg-opacity-10 shadow-lg transform hover:scale-105 transition-transform duration-200">
            <Image
              src="/walmart-spark.png"
              alt="Walmart AI Assistant"
              width={64}
              height={64}
              className="text-primary drop-shadow-md"
            />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-[#2a2a2a] dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-[#0071dc] to-[#004c9e] dark:from-[#ffc220] dark:to-[#ff9900]">
            {randomWelcomeMessage}
          </h3>
          <p className="text-[#4a4a4a] dark:text-gray-300 text-lg mb-8 leading-relaxed">
            I can help you find products, compare prices, and make shopping decisions. Upload images, use voice, or just type to get started!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-6 rounded-xl bg-white dark:bg-[#2a2a2a] shadow-lg hover:shadow-xl transition-shadow duration-200 border border-[#e8e8e8] dark:border-[#3a3a3a]">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-[#0071dc] bg-opacity-10 flex items-center justify-center mr-3">
                  <ImageIcon className="h-5 w-5 text-[#0071dc] dark:text-[#ffc220]" />
                </div>
                <p className="font-semibold text-[#2a2a2a] dark:text-white">Image Search</p>
              </div>
              <p className="text-[#4a4a4a] dark:text-gray-300">Upload product images or shopping lists for instant recommendations</p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-[#2a2a2a] shadow-lg hover:shadow-xl transition-shadow duration-200 border border-[#e8e8e8] dark:border-[#3a3a3a]">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-[#0071dc] bg-opacity-10 flex items-center justify-center mr-3">
                  <Mic className="h-5 w-5 text-[#0071dc] dark:text-[#ffc220]" />
                </div>
                <p className="font-semibold text-[#2a2a2a] dark:text-white">Voice Search</p>
              </div>
              <p className="text-[#4a4a4a] dark:text-gray-300">Speak naturally to search products and get instant assistance</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea 
      className="flex-1 bg-gradient-to-b from-[#f8f9fa] to-white dark:from-[#1a1a1a] dark:to-[#2a2a2a]" 
      ref={scrollAreaRef}
    >
      <div className="min-h-full p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}