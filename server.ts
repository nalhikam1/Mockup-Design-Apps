import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow large payloads for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI server-side client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Status check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    models: {
      highQuality: 'gemini-3-pro-image-preview',
      creativeAndEdit: 'gemini-nano-banana-2.1',
    },
  });
});

/**
 * Generate high-quality mockups and commercial images using gemini-3-pro-image-preview
 * Supports resolution affordance: 1K, 2K, 4K
 */
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '1:1', referenceImage } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.status(400).json({
        error: 'Gemini API key is not configured in your environment secrets. Please set GEMINI_API_KEY.',
      });
    }

    const parts: any[] = [];

    // Optional reference image (e.g. logo or current product mockup)
    if (referenceImage && typeof referenceImage === 'string') {
      const match = referenceImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      } else {
        const cleanBase64 = referenceImage.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: cleanBase64,
          },
        });
      }
    }

    parts.push({ text: prompt });

    const validSize = ['1K', '2K', '4K'].includes(imageSize) ? imageSize : '1K';
    const validAspect = ['1:1', '3:4', '4:3', '16:9', '9:16'].includes(aspectRatio) ? aspectRatio : '1:1';

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: validAspect,
          imageSize: validSize,
        },
      },
    });

    let imageUrl: string | null = null;
    let textDescription = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textDescription += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: textDescription || 'The model completed the request without producing an image.',
      });
    }

    res.json({
      imageUrl,
      text: textDescription,
      modelUsed: 'gemini-3-pro-image-preview',
      imageSize: validSize,
      aspectRatio: validAspect,
    });
  } catch (error: any) {
    console.error('Error generating image with gemini-3-pro-image-preview:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate image with Gemini 3 Pro Image.',
    });
  }
});

/**
 * Create and edit images using gemini-nano-banana-2.1
 * Can generate new logos/designs from text prompt OR edit existing logo/mockup
 */
app.post('/api/create-edit-image', async (req, res) => {
  try {
    const { prompt, image, aspectRatio = '1:1', imageSize = '1K' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.status(400).json({
        error: 'Gemini API key is not configured in your environment secrets. Please set GEMINI_API_KEY.',
      });
    }

    const parts: any[] = [];

    // If an image is provided for editing
    if (image && typeof image === 'string') {
      const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      } else {
        const cleanBase64 = image.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: cleanBase64,
          },
        });
      }
    }

    parts.push({ text: prompt });

    const validSize = ['1K', '2K', '4K'].includes(imageSize) ? imageSize : '1K';
    const supportedAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
    const validAspect = supportedAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: validAspect,
          imageSize: validSize,
        },
      },
    });

    let imageUrl: string | null = null;
    let textDescription = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textDescription += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: textDescription || 'The model completed the request without producing an image.',
      });
    }

    res.json({
      imageUrl,
      text: textDescription,
      modelUsed: 'gemini-nano-banana-2.1',
      aspectRatio: validAspect,
    });
  } catch (error: any) {
    console.error('Error creating/editing image with gemini-nano-banana-2.1:', error);
    res.status(500).json({
      error: error?.message || 'Failed to create or edit image with gemini-nano-banana-2.1.',
    });
  }
});

// Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
