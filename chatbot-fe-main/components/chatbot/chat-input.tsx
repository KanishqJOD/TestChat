"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Image as ImageIcon, Send, X, StopCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"

interface ChatInputProps {
  onSubmit: (text: string, images?: string[], audioBlob?: Blob) => void
  isLoading: boolean
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [text, setText] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [text])

  const handleSubmit = () => {
    if (!text.trim() && images.length === 0) return
    onSubmit(text, images)
    setText("")
    setImages([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    if (images.length + files.length > 3) {
      toast.error("You can only upload up to 3 images")
      return
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages(prev => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" })
        onSubmit("", [], audioBlob)
        setIsRecording(false)
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast.error("Could not access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-[#1a1a1a] border-t border-[#e8e8e8] dark:border-[#3a3a3a] shadow-lg">
      {images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-[#0071dc] dark:border-[#ffc220] shadow-md">
                <Image
                  src={image}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about products, prices, or recommendations..."
            className="w-full resize-none rounded-xl border-2 border-[#e8e8e8] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0071dc] dark:focus:ring-[#ffc220] text-[#2a2a2a] dark:text-white placeholder:text-gray-400 min-h-[44px] max-h-[200px] text-base shadow-sm transition-all duration-200 ease-in-out"
            rows={1}
            style={{ caretColor: '#0071dc' }}
          />
        </div>
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={images.length >= 3}
          />
          <Button
            size="icon"
            variant="outline"
            className={cn(
              "border-2 border-[#e8e8e8] dark:border-[#3a3a3a] hover:bg-[#f8f8f8] dark:hover:bg-[#2a2a2a] shadow-sm transition-all duration-200",
              images.length >= 3 && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= 3 || isLoading}
          >
            <ImageIcon className="h-5 w-5 text-[#0071dc] dark:text-[#ffc220]" />
          </Button>
          
          <Button
            size="icon"
            variant="outline"
            className={cn(
              "border-2 border-[#e8e8e8] dark:border-[#3a3a3a] hover:bg-[#f8f8f8] dark:hover:bg-[#2a2a2a] shadow-sm transition-all duration-200",
              isRecording && "bg-red-50 dark:bg-red-900 border-red-500"
            )}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            {isRecording ? (
              <StopCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Mic className="h-5 w-5 text-[#0071dc] dark:text-[#ffc220]" />
            )}
          </Button>
          
          <Button
            className="bg-[#0071dc] hover:bg-[#004c9e] text-white shadow-md transition-all duration-200 border-2 border-[#0071dc]"
            size="icon"
            onClick={handleSubmit}
            disabled={(!text.trim() && images.length === 0) || isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}