import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model
function getGeminiModel() {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
}

// Process image with Gemini and extract bounding boxes
export async function processImageWithGemini(base64Data, message) {
  try {
    const model = getGeminiModel();
    
    // Remove the data URL prefix if present
    const imageData = base64Data.replace(/^data:image\/\w+;base64,/, '');
    
    // Create parts array for Gemini with specific detection prompt
    const parts = [
      {
        inlineData: {
          data: imageData,
          mimeType: "image/png"
        }
      },
      { 
        text: message || `Please analyze this image and provide:
1. All text visible in the image
2. Location and dimensions of detected objects
3. Any brand names or product information
4. Detailed description of the layout
Please format bounding box detections as JSON with coordinates and labels.`
      }
    ];

    // Generate content
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    // Try to extract bounding box data if present
    try {
      const boundingBoxMatch = text.match(/```json\s*(\[.*?\])\s*```/s);
      if (boundingBoxMatch) {
        const boundingBoxData = JSON.parse(boundingBoxMatch[1]);
        return {
          text: text.replace(boundingBoxMatch[0], '').trim(), // Remove JSON from text
          boundingBoxes: boundingBoxData
        };
      }
    } catch (e) {
      console.log('No valid bounding box data found in response');
    }

    // Return regular response if no bounding boxes found
    return {
      text,
      boundingBoxes: []
    };
  } catch (error) {
    console.error('Error processing image with Gemini:', error);
    throw error;
  }
}

// Process text with Gemini
export async function processTextWithGemini(message) {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error processing text with Gemini:', error);
    throw error;
  }
}

// Helper function to detect image format
export function detectImageFormat(base64Data) {
  const prefix = base64Data.substring(0, 50);
  
  if (prefix.includes('data:image/jpeg')) return 'JPEG';
  if (prefix.includes('data:image/png')) return 'PNG';
  if (prefix.includes('data:image/gif')) return 'GIF';
  if (prefix.includes('data:image/webp')) return 'WEBP';
  return 'Unknown format';
}

// Function to validate image data
export function validateImageData(base64Data) {
  if (!base64Data) return false;
  if (!base64Data.startsWith('data:image/')) return false;
  if (!base64Data.includes(';base64,')) return false;
  return true;
}

// Function to format base64 image data
export function formatImageData(base64Data) {
  // If it's already in the correct format, return as is
  if (base64Data.startsWith('data:image/')) {
    return base64Data;
  }

  // Try to detect the image format from the binary data
  let format = 'png'; // default to PNG if can't detect
  if (base64Data.startsWith('/9j/')) {
    format = 'jpeg';
  } else if (base64Data.startsWith('R0lGOD')) {
    format = 'gif';
  } else if (base64Data.startsWith('UklGR')) {
    format = 'webp';
  }

  // Add the proper data URL prefix
  return `data:image/${format};base64,${base64Data}`;
}

export const GeminiService = {
  processImageWithGemini,
  processTextWithGemini,
  detectImageFormat,
  validateImageData,
  formatImageData
}; 