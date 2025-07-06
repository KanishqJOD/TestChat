// Add these type declarations at the top of the file
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, X, Play, Pause, Volume2, Bot } from 'lucide-react';
import { Button } from '../../chatbot-fe-main/components/ui/button';
import { WelcomeScreen } from './WelcomeScreen';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'audio' | 'image';
  audioUrl?: string;
  imageBase64?: string[];
  imageMetadata?: Array<{
    type: string;
    size: number;
    name: string;
  }>;
}

// Mock transcription responses
const mockTranscriptions = [
  "I'd like to order a new smartphone",
  "Can you show me the latest laptops?",
  "I need help finding a gift for my friend",
  "What are your best-selling products?",
];

// Update bot avatar URL to use the correct path
const BOT_AVATAR_URL = "/bot-avatar.png"; // Make sure this image exists in the public folder

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const recognitionRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState<{[key: string]: boolean}>({});
  const [currentTime, setCurrentTime] = useState<{[key: string]: number}>({});
  const [duration, setDuration] = useState<{[key: string]: number}>({});
  const audioRefs = useRef<{[key: string]: HTMLAudioElement}>({});

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
      }
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const mockResponses = [
    "I can help you find the perfect product! What are you looking for?",
    "We have some great deals on smartphones right now. Would you like to see them?",
    "I understand you're interested in our products. Let me assist you with that.",
    "Is there anything specific you'd like to know about our products?",
  ];

  const generateMockResponse = () => {
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  };

  const getMockTranscription = () => {
    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
  };

  const getBase64FromDataUrl = (dataUrl: string): string => {
    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64 = dataUrl.split(',')[1];
    return base64;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      if (selectedImages.length + files.length > 3) {
        toast.error('Maximum 3 images allowed');
        return;
      }

      const processImage = async (file: File): Promise<{ base64: string | null; metadata: { type: string; size: number; name: string } }> => {
        return new Promise((resolve) => {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            toast.error(`File ${file.name} is not an image`);
            resolve({ base64: null, metadata: { type: file.type, size: file.size, name: file.name } });
            return;
          }

          // Validate file size (5MB)
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} must be less than 5MB`);
            resolve({ base64: null, metadata: { type: file.type, size: file.size, name: file.name } });
            return;
          }

          const reader = new FileReader();
          
          reader.onload = () => {
            try {
              const dataUrl = reader.result as string;
              resolve({ 
                base64: dataUrl, // Don't remove the data URL prefix
                metadata: {
                  type: file.type,
                  size: file.size,
                  name: file.name
                }
              });
            } catch (error) {
              console.error('Error processing image:', error);
              toast.error(`Error processing ${file.name}`);
              resolve({ base64: null, metadata: { type: file.type, size: file.size, name: file.name } });
            }
          };

          reader.onerror = () => {
            console.error('Error reading file:', file.name);
            toast.error(`Error reading ${file.name}`);
            resolve({ base64: null, metadata: { type: file.type, size: file.size, name: file.name } });
          };

          reader.readAsDataURL(file);
        });
      };

      try {
        const imagePromises = Array.from(files).map(file => processImage(file));
        const results = await Promise.all(imagePromises);
        
        const validImages = results
          .filter(result => result.base64 !== null)
          .map(result => result.base64 as string); // Keep the full data URL

        if (validImages.length > 0) {
          setSelectedImages(prev => [...prev, ...validImages]);
        }
      } catch (error) {
        console.error('Error processing images:', error);
        toast.error('Error processing images');
      }
    }
    event.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          
          if (event.results[event.results.length - 1].isFinal) {
            setInputMessage(transcript);
          }
        };

        recognitionRef.current.start();
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        // Send the message with the transcribed text and audio URL
        if (inputMessage.trim()) {
          handleSendMessage(inputMessage, 'audio', url);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleSendMessage = (overrideContent?: string, type: 'text' | 'audio' | 'image' = 'text', audioUrl?: string) => {
    const messageContent = overrideContent || inputMessage;
    
    if (!messageContent.trim() && !audioURL && selectedImages.length === 0) return;

    let finalContent = messageContent;
    let messageType = type;
    let messageAudioUrl = audioUrl;
    let imageBase64: string[] | undefined;

    if (type === 'audio') {
      finalContent = messageContent;
    } else if (selectedImages.length > 0) {
      messageType = 'image';
      imageBase64 = [...selectedImages]; // Keep the full data URLs
      finalContent = `📷 ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: finalContent,
      sender: 'user',
      timestamp: new Date(),
      type: messageType,
      audioUrl: messageAudioUrl,
      imageBase64
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAudioURL(null);
    setSelectedImages([]);
    setIsLoading(true);

    // Mock bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateMockResponse(),
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const formatAudioTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (messageId: string) => {
    const audio = audioRefs.current[messageId];
    if (!audio) return;

    if (isPlaying[messageId]) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(prev => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const handleTimeUpdate = (messageId: string) => {
    const audio = audioRefs.current[messageId];
    if (!audio) return;
    setCurrentTime(prev => ({ ...prev, [messageId]: audio.currentTime }));
  };

  const handleLoadedMetadata = (messageId: string) => {
    const audio = audioRefs.current[messageId];
    if (!audio) return;
    setDuration(prev => ({ ...prev, [messageId]: audio.duration }));
  };

  const handleSeek = (messageId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRefs.current[messageId];
    if (!audio) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * audio.duration;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
              >
                {message.sender === 'bot' && (
                  <Avatar className="w-8 h-8 bg-blue-500">
                    <AvatarImage src={BOT_AVATAR_URL} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.type === 'image' && message.imageBase64 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      {message.imageBase64.map((base64, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={base64} 
                            alt="Uploaded content" 
                            className="rounded-lg w-full h-auto max-h-[200px] object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {message.type === 'audio' && message.audioUrl && (
                    <div className="mb-2">
                      <audio
                        ref={(el) => {
                          if (el) audioRefs.current[message.id] = el;
                        }}
                        src={message.audioUrl}
                        onLoadedMetadata={() => handleLoadedMetadata(message.id)}
                        onTimeUpdate={() => handleTimeUpdate(message.id)}
                        onEnded={() => setIsPlaying(prev => ({ ...prev, [message.id]: false }))}
                        className="hidden"
                      />
                      <div className="flex items-center space-x-2 bg-background/10 rounded-lg p-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handlePlayPause(message.id)}
                          className="h-8 w-8"
                        >
                          {isPlaying[message.id] ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div 
                          className="flex-1 h-1 bg-background/20 rounded-full cursor-pointer"
                          onClick={(e) => handleSeek(message.id, e)}
                        >
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${(currentTime[message.id] || 0) / (duration[message.id] || 1) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs">
                          {formatAudioTime(currentTime[message.id] || 0)} / {formatAudioTime(duration[message.id] || 0)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </div>

                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {message.sender === 'user' && (
                  <Avatar className="w-8 h-8 bg-primary">
                    <AvatarFallback className="text-primary-foreground">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start items-start gap-2">
              <Avatar className="w-8 h-8 bg-blue-500">
                <AvatarImage src={BOT_AVATAR_URL} />
                <AvatarFallback className="bg-blue-500 text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-xl p-4 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image} 
                    alt={`Selected ${index + 1}`} 
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Audio Recording Preview */}
          {isRecording && (
            <div className="flex items-center gap-2 mb-2 text-sm text-primary">
              <span className="animate-pulse">●</span> Recording {formatTime(recordingTime)}
            </div>
          )}

          {/* Audio Playback Preview */}
          {audioURL && !isRecording && (
            <div className="mb-2">
              <audio
                ref={(el) => {
                  if (el) audioRefs.current['preview'] = el;
                }}
                src={audioURL}
                onLoadedMetadata={() => handleLoadedMetadata('preview')}
                onTimeUpdate={() => handleTimeUpdate('preview')}
                onEnded={() => setIsPlaying(prev => ({ ...prev, preview: false }))}
                className="hidden"
              />
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handlePlayPause('preview')}
                  className="h-8 w-8"
                >
                  {isPlaying['preview'] ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div 
                  className="flex-1 h-1 bg-background/20 rounded-full cursor-pointer"
                  onClick={(e) => handleSeek('preview', e)}
                >
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ 
                      width: `${(currentTime['preview'] || 0) / (duration['preview'] || 1) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-xs">
                  {formatAudioTime(currentTime['preview'] || 0)} / {formatAudioTime(duration['preview'] || 0)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setAudioURL(null)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Input Controls */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="w-full rounded-lg p-2 pr-20 min-h-[44px] max-h-32 bg-muted resize-none"
                style={{ paddingRight: '100px' }}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedImages.length >= 3 || isRecording}
                  className="h-8 w-8"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={selectedImages.length > 0}
                  className={`h-8 w-8 ${isRecording ? 'text-destructive' : ''}`}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              onClick={() => handleSendMessage()}
              disabled={(!inputMessage.trim() && !audioURL && selectedImages.length === 0) || isLoading}
              className="h-[44px] w-[44px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}