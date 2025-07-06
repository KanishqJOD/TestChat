"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"

interface BoundingBox {
  box_2d: number[]
  label: string
}

interface MessageContent {
  text: string
  boundingBoxes?: BoundingBox[]
}

interface Message {
  content: string | MessageContent
  role: "user" | "assistant"
  timestamp: Date
  images?: string[]
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant"

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#0071dc] shadow-md">
          <Image
            src="/walmart-spark.png"
            alt="Walmart Assistant"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-md",
          isAssistant
            ? "bg-white dark:bg-[#2a2a2a] text-[#2a2a2a] dark:text-white border border-[#e8e8e8] dark:border-[#3a3a3a]"
            : "bg-[#0071dc] text-white"
        )}
      >
        <div className="text-base break-words">
          {typeof message.content === "string" ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div>
              <p className="whitespace-pre-wrap leading-relaxed">{message.content.text}</p>
              {message.content.boundingBoxes && message.content.boundingBoxes.length > 0 && (
                <div className="mt-3 p-3 bg-[#f8f9fa] dark:bg-[#1a1a1a] rounded-lg border border-[#e8e8e8] dark:border-[#3a3a3a]">
                  <h4 className="font-semibold mb-2 text-[#2a2a2a] dark:text-white">Detected Objects:</h4>
                  <ul className="space-y-1 text-sm text-[#4a4a4a] dark:text-gray-300">
                    {message.content.boundingBoxes.map((box: BoundingBox, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#0071dc] dark:bg-[#ffc220] mr-2"></span>
                        {box.label} at coordinates [{box.box_2d.join(", ")}]
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {message.images && message.images.length > 0 && (
        <div className="mt-2 flex gap-2 flex-wrap">
          {message.images.map((image, index) => (
            <div
              key={index}
              className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-[#0071dc] dark:border-[#ffc220] shadow-md"
            >
              <Image
                src={image}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {!isAssistant && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#4a4a4a] shadow-md">
          <Image
            src="/user-avatar.png"
            alt="User"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      )}
    </div>
  )
}