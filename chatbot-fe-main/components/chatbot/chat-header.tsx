"use client"

import React from 'react';
import { CreditCard, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

interface ChatHeaderProps {
  onReset: () => void
  isLoading: boolean
}

export function ChatHeader({ onReset, isLoading }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-4 border-b bg-white dark:bg-gray-800">
      <div className="w-10 h-10 relative rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-2xl">🤖</span>
      </div>
      <div>
        <h1 className="text-lg font-semibold text-primary">ArjunMart Assistant</h1>
        <p className="text-sm text-muted-foreground">Your shopping helper</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isLoading}
          className="gap-2 border-[#4379FF]/30 dark:border-[#4379FF]/40 hover:bg-[#4379FF]/10 dark:hover:bg-[#4379FF]/20"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Chat
        </Button>
        <ThemeToggle />
      </div>
    </div>
  )
}