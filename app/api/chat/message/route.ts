import { NextRequest, NextResponse } from 'next/server';
import { InputType } from '@/lib/types';

const VALID_TYPES = ['text', 'image', 'audio'] as const;

// Mock responses for different input types
const mockResponses = {
  text: (message: string) => ({
    text: `I understand you said: "${message}". This is a mock response that will be replaced with MCP agent integration.`
  }),
  image: (message: string) => ({
    text: "I can see the image you uploaded. Here's what I found:",
    boundingBoxes: [
      {
        label: "Sample Object 1",
        box_2d: [100, 100, 200, 200]
      },
      {
        label: "Sample Object 2",
        box_2d: [300, 300, 400, 400]
      }
    ]
  }),
  audio: (transcription: string) => ({
    text: `I heard your voice message${transcription ? `: "${transcription}"` : ''}. This will be processed by the MCP agent in the future.`
  })
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type, message, base64Data } = data;

    console.log('Received request:', { 
      type, 
      messageLength: message?.length, 
      hasBase64: !!base64Data,
      timestamp: new Date().toISOString()
    });

    // Validate input type
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid input type' }, { status: 400 });
    }

    // Validate message for text input
    if (!message && type === 'text') {
      return NextResponse.json({ error: 'Message is required for text input' }, { status: 400 });
    }

    // For image and audio, validate base64Data
    if ((type === 'image' || type === 'audio') && !base64Data) {
      return NextResponse.json({ error: 'Base64 data is required for media messages' }, { status: 400 });
    }

    // Get mock response based on type
    let response;
    switch (type) {
      case 'text':
        response = mockResponses.text(message);
        break;
      case 'image':
        response = mockResponses.image(message || '');
        break;
      case 'audio':
        response = mockResponses.audio(message || '');
        break;
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 