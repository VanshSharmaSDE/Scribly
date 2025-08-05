// OCR Service for text extraction from images
import Tesseract from 'tesseract.js';
import localAIService from './localAIService.js';

class OCRService {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize OCR service (no worker needed for simple approach)
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Mark as initialized - Tesseract.recognize works without pre-initialization
      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw error;
    }
  }

  // Extract text from image using direct API with fallback strategies and AI enhancement
  async extractText(imageFile, options = {}) {
    try {
      console.log('Starting text extraction...');
      
      // Validate the image file first
      if (!this.validateImageFile(imageFile)) {
        throw new Error('Invalid image file format. Please use JPG, PNG, GIF, or WebP.');
      }

      // Use the fallback strategy for best results
      const result = await this.extractTextWithFallback(imageFile);
      
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('No text was detected in the image. Please try with a clearer image.');
      }

      const cleanedText = this.cleanText(result.text);
      
      console.log('OCR Result Preview:', cleanedText.substring(0, 100) + '...');
      console.log('Extraction details:', {
        strategy: result.strategy,
        confidence: result.confidence.toFixed(1) + '%',
        words: result.words,
        lines: result.lines
      });

      // Generate AI-enhanced note if requested
      let enhancedNote = null;
      if (options.enhanceWithAI !== false) { // Default to true unless explicitly disabled
        try {
          console.log('Starting AI enhancement for text:', cleanedText.substring(0, 100) + '...');
          enhancedNote = await this.generateEnhancedNote(cleanedText, options.useLocalAI);
          console.log('AI enhancement completed with provider:', enhancedNote.aiProvider);
          console.log('Enhanced note structure:', {
            hasTitle: !!enhancedNote.enhancedNote?.title,
            hasContent: !!enhancedNote.enhancedNote?.content,
            contentLength: enhancedNote.enhancedNote?.content?.length || 0,
            hasTags: !!enhancedNote.enhancedNote?.tags?.length,
            titlePreview: enhancedNote.enhancedNote?.title,
            contentPreview: enhancedNote.enhancedNote?.content?.substring(0, 100) + '...'
          });
        } catch (aiError) {
          console.warn('AI enhancement failed, returning original text:', aiError.message);
        }
      } else {
        console.log('AI enhancement disabled by options');
      }

      return {
        text: cleanedText,
        confidence: result.confidence,
        enhancedNote: enhancedNote,
        metadata: {
          strategy: result.strategy,
          words: result.words,
          lines: result.lines,
          processingTime: Date.now(),
          aiEnhanced: !!enhancedNote
        }
      };
    } catch (error) {
      console.error('Text extraction failed:', error);
      throw new Error(`OCR failed: ${error.message}`);
    }
  }

  // Extract text with detailed block information
  async extractTextWithBlocks(imageFile) {
    try {
      console.log('Starting detailed text extraction...');

      const { data } = await Tesseract.recognize(imageFile, 'eng', {
        tessedit_pageseg_mode: '1',
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:()-[]{}"\'/\\@#$%^&*+=<>~`|',
        preserve_interword_spaces: '1',
        tessedit_ocr_engine_mode: '1',
      });
      
      const blocks = data.blocks?.map(block => ({
        text: block.text?.trim(),
        confidence: block.confidence,
        bbox: block.bbox
      })).filter(block => block.text && block.text.length > 0) || [];

      return {
        fullText: data.text.trim(),
        confidence: data.confidence,
        blocks: blocks,
        totalWords: data.words?.length || 0,
        totalLines: data.lines?.length || 0
      };
    } catch (error) {
      console.error('Detailed text extraction failed:', error);
      throw error;
    }
  }

  // Try multiple OCR strategies for better results with enhanced accuracy
  async extractTextWithFallback(imageFile) {
    const strategies = [
      {
        name: 'Premium Accuracy',
        config: {
          tessedit_pageseg_mode: '1', // Auto with OSD
          tessedit_ocr_engine_mode: '1', // LSTM only
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:()-[]{}"\'/\\@#$%^&*+=<>~`|\n\t',
          preserve_interword_spaces: '1',
          tessedit_write_images: '0',
          user_defined_dpi: '300',
        }
      },
      {
        name: 'Document Scanner',
        config: {
          tessedit_pageseg_mode: '6', // Single uniform block
          tessedit_ocr_engine_mode: '1',
          preserve_interword_spaces: '1',
          user_defined_dpi: '300',
        }
      },
      {
        name: 'Text Line Focus',
        config: {
          tessedit_pageseg_mode: '7', // Single text line
          tessedit_ocr_engine_mode: '1',
          preserve_interword_spaces: '1',
        }
      },
      {
        name: 'Auto Detect',
        config: {
          tessedit_pageseg_mode: '3', // Fully automatic
          tessedit_ocr_engine_mode: '3', // Default (Legacy + LSTM)
          preserve_interword_spaces: '1',
        }
      },
      {
        name: 'Raw Text',
        config: {
          tessedit_pageseg_mode: '8', // Single word
          tessedit_ocr_engine_mode: '1',
        }
      }
    ];

    let bestResult = null;
    let bestConfidence = 0;

    for (const strategy of strategies) {
      try {
        console.log(`Trying ${strategy.name} strategy...`);
        const { data } = await Tesseract.recognize(imageFile, 'eng', strategy.config);
        
        const confidence = data.confidence;
        const text = data.text.trim();
        
        console.log(`${strategy.name}: ${confidence.toFixed(1)}% confidence`);
        
        if (confidence > bestConfidence && text.length > 0) {
          bestConfidence = confidence;
          bestResult = {
            text: text,
            confidence: confidence,
            words: data.words?.length || 0,
            lines: data.lines?.length || 0,
            strategy: strategy.name
          };
        }

        // If we get good confidence, use it
        if (confidence > 80) {
          break;
        }
      } catch (error) {
        console.warn(`${strategy.name} strategy failed:`, error.message);
        continue;
      }
    }

    if (!bestResult) {
      throw new Error('All OCR strategies failed');
    }

    console.log(`Best result from ${bestResult.strategy}: ${bestResult.confidence.toFixed(1)}% confidence`);
    return bestResult;
  }

  // Enhanced text cleaning with better formatting preservation
  cleanText(text) {
    return text
      // Fix common OCR errors
      .replace(/[|]/g, 'I') // Replace pipe with I
      .replace(/[0]/g, 'O') // Replace 0 with O in words
      .replace(/rn/g, 'm') // Replace rn with m
      .replace(/\[]/g, 'l') // Replace [] with l
      
      // Clean spacing
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines
      .replace(/\s{3,}/g, ' ') // Replace multiple spaces
      .replace(/^\s+|\s+$/gm, '') // Trim each line
      
      // Fix punctuation
      .replace(/\s+([.,!?;:])/g, '$1') // Remove space before punctuation
      .replace(/([.,!?;:])\s{2,}/g, '$1 ') // Single space after punctuation
      
      .trim();
  }

  // Generate AI-enhanced note from extracted text
  async generateEnhancedNote(extractedText, useLocalAI = false) {
    try {
      const aiService = useLocalAI 
        ? (await import('../services/localAIService.js')).default 
        : (await import('../services/aiService.js')).default;

      console.log('Generating AI-enhanced note...');

      const prompt = `
Transform this extracted text into a well-structured, comprehensive note with the following requirements:

EXTRACTED TEXT:
"""
${extractedText}
"""

Please create a formatted note with:

1. **Title**: Generate a clear, descriptive title (2-8 words)
2. **Summary**: Brief 1-2 sentence overview
3. **Key Points**: Main ideas as bullet points
4. **Details**: Organize content with proper headings and subheadings
5. **Tags**: Relevant tags for categorization

Format the response as JSON:
{
  "title": "Clear descriptive title",
  "summary": "Brief overview of the content",
  "content": "# Title\n\n## Summary\n[summary]\n\n## Key Points\n- Point 1\n- Point 2\n\n## Details\n### Section 1\nContent...\n\n### Section 2\nContent...",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 95
}

Make sure the content is well-organized with proper Markdown formatting, clear headings, and logical structure.`;

      let response;
      if (useLocalAI) {
        // Local AI service uses generateText method - returns raw text
        response = await localAIService.generateText(prompt);
        
        // Try to parse JSON response for local AI
        try {
          const aiResult = JSON.parse(response);
          console.log('Local AI Result (parsed):', {
            title: aiResult.title,
            contentLength: aiResult.content?.length,
            tags: aiResult.tags
          });
          return {
            originalText: extractedText,
            enhancedNote: aiResult,
            aiProvider: 'local'
          };
        } catch (parseError) {
          console.warn('Local AI JSON parse failed, using fallback structure');
          // If JSON parsing fails, create structured response manually
          const aiResult = {
            title: this.extractTitleFromText(extractedText),
            summary: extractedText.substring(0, 150) + '...',
            content: this.formatAsMarkdown(extractedText),
            tags: this.generateTags(extractedText),
            confidence: 75
          };
          console.log('Local AI Result (fallback):', {
            title: aiResult.title,
            contentLength: aiResult.content?.length,
            tags: aiResult.tags
          });
          return {
            originalText: extractedText,
            enhancedNote: aiResult,
            aiProvider: 'local'
          };
        }
      } else {
        // Regular AI service uses generateNote method - returns structured object
        const noteResult = await aiService.generateNote(prompt);
        
        // noteResult is already a structured object with title, content, tags, etc.
        const aiResult = {
          title: noteResult.title || this.extractTitleFromText(extractedText),
          summary: extractedText.substring(0, 150) + '...',
          content: noteResult.content || this.formatAsMarkdown(extractedText),
          tags: noteResult.tags || this.generateTags(extractedText),
          confidence: 90
        };
        
        console.log('Gemini AI Result:', {
          originalTitle: noteResult.title,
          originalContent: noteResult.content?.substring(0, 100) + '...',
          originalTags: noteResult.tags,
          finalTitle: aiResult.title,
          finalContentLength: aiResult.content?.length,
          finalTags: aiResult.tags
        });
        
        return {
          originalText: extractedText,
          enhancedNote: aiResult,
          aiProvider: 'gemini'
        };
      }

    } catch (error) {
      console.error('AI enhancement failed:', error);
      
      // Fallback: create structured note without AI
      return {
        originalText: extractedText,
        enhancedNote: {
          title: this.extractTitleFromText(extractedText),
          summary: extractedText.substring(0, 150) + '...',
          content: this.formatAsMarkdown(extractedText),
          tags: this.generateTags(extractedText),
          confidence: 60
        },
        aiProvider: 'fallback'
      };
    }
  }

  // Extract title from text (fallback method)
  extractTitleFromText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return 'Extracted Note';
    
    const firstLine = lines[0].trim();
    if (firstLine.length <= 50) {
      return firstLine;
    }
    
    const words = firstLine.split(' ');
    return words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '');
  }

  // Format text as markdown (fallback method)
  formatAsMarkdown(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return text;

    let markdown = `# ${this.extractTitleFromText(text)}\n\n`;
    
    // Add summary
    markdown += `## Summary\n\n${text.substring(0, 200)}${text.length > 200 ? '...' : ''}\n\n`;
    
    // Add content
    markdown += `## Content\n\n`;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length > 0) {
        // Convert potential headings
        if (line.length < 50 && !line.endsWith('.') && !line.endsWith(',')) {
          markdown += `### ${line}\n\n`;
        } else {
          markdown += `${line}\n\n`;
        }
      }
    }
    
    return markdown;
  }

  // Generate tags from text (fallback method)
  generateTags(text) {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  // Cleanup (no worker to terminate in direct API mode)
  async terminate() {
    // No worker to terminate when using direct API
    console.log('OCR Service cleanup completed');
  }

  // Check if service is ready
  isReady() {
    return this.isInitialized;
  }

  // Process multiple images
  async extractTextFromMultipleImages(imageFiles) {
    const results = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      try {
        console.log(`Processing image ${i + 1} of ${imageFiles.length}...`);
        const result = await this.extractText(imageFiles[i]);
        results.push({
          index: i,
          filename: imageFiles[i].name,
          ...result
        });
      } catch (error) {
        results.push({
          index: i,
          filename: imageFiles[i].name,
          error: error.message,
          text: '',
          confidence: 0
        });
      }
    }
    
    return results;
  }

  // Validate image file
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, BMP, WebP).');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image smaller than 10MB.');
    }

    return true;
  }
}

// Create singleton instance
const ocrService = new OCRService();

export default ocrService;
