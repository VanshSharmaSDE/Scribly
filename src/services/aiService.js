import { GoogleGenerativeAI } from "@google/generative-ai";
import settingsService from './settingsService';

class AIService {
  constructor() {
    this.apiKey = null;
    this.genAI = null;
    this.model = null;
  }

  // Initialize with API key
  initialize(apiKey) {
    if (!apiKey) {
      throw new Error("Google Gemini API key is required");
    }

    // Force complete cleanup first
    this.forceCleanup();

    try {
      this.apiKey = apiKey;
      this.genAI = new GoogleGenerativeAI(apiKey);

      // Use single model without complex configuration
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    } catch (error) {
      // If initialization fails, ensure cleanup
      this.forceCleanup();
      throw new Error(`Failed to initialize AI service: ${error.message}`);
    }
  }

  // Force complete cleanup of all instances
  forceCleanup() {
    this.apiKey = null;
    this.genAI = null;
    this.model = null;
    
    // Force garbage collection hint (browser environment)
    if (typeof window !== 'undefined' && window.gc) {
      window.gc();
    }
  }

  // Centralized error handling for API calls
  handleApiError(error, operation = 'API operation') {
    if (
      error.message?.includes("API_KEY_INVALID") ||
      error.message?.includes("invalid_api_key") ||
      error.message?.includes("Invalid API key") ||
      error.message?.includes("API key not valid")
    ) {
      // Force cleanup on invalid API key
      this.forceCleanup();
      throw new Error(
        "Invalid API key detected. Please update your Google Gemini API key in settings and try again."
      );
    } else if (
      error.message?.includes("QUOTA_EXCEEDED") ||
      error.message?.includes("quota exceeded") ||
      error.message?.toLowerCase().includes("quota")
    ) {
      // Force cleanup on quota issues to allow new key
      this.forceCleanup();
      throw new Error(
        "API quota exceeded. Please wait, check your usage limits, or try a different API key."
      );
    } else if (
      error.message?.includes("RATE_LIMIT_EXCEEDED") ||
      error.message?.includes("Too Many Requests") ||
      error.message?.toLowerCase().includes("rate limit") ||
      error.message?.toLowerCase().includes("too many requests")
    ) {
      // Force cleanup on rate limiting to allow fresh start
      this.forceCleanup();
      throw new Error(
        "Rate limit exceeded. Please wait a few minutes, then try changing your API key if the issue persists."
      );
    } else if (error.message?.includes("PERMISSION_DENIED")) {
      throw new Error(
        "Permission denied. Please check your API key permissions and ensure it has access to Gemini API."
      );
    } else if (
      error.message?.includes("NETWORK") ||
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      throw new Error(
        "Network error. Please check your internet connection and try again."
      );
    } else {
      throw new Error(`Failed to ${operation}: ${error.message}`);
    }
  }

  // Check if AI service is initialized
  isInitialized() {
    return this.genAI && this.model;
  }

  // Ensure AI service is initialized with the latest API key
  async ensureInitialized() {
    if (!this.isInitialized()) {
      const apiKey = await this.getApiKey();
      if (apiKey) {
        this.initialize(apiKey);
        return true;
      }
      return false;
    }
    return true;
  }

  // API Key management methods
  async setApiKey(apiKey) {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    // Force complete cleanup first
    this.forceCleanup();
    
    // Add small delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      // Just initialize with the provided API key - don't store it locally
      this.initialize(apiKey);
    } catch (error) {
      // If setting fails, clean up
      this.forceCleanup();
      throw error;
    }
  }

  async getApiKey() {
    try {
      const settings = await settingsService.getUserSettings();
      return settings.geminiApiKey || '';
    } catch (error) {
      console.warn('Failed to fetch API key from settings:', error);
      return '';
    }
  }

  removeApiKey() {
    // Just clean up the service - don't manage localStorage
    this.forceCleanup();
  }

  // Force refresh the service with current API key
  async refreshService() {
    try {
      const currentApiKey = await this.getApiKey();
      if (currentApiKey) {
        this.forceCleanup();
        await new Promise((resolve) => setTimeout(resolve, 500)); // Longer delay for refresh
        
        try {
          this.initialize(currentApiKey);
          return true;
        } catch (error) {
          console.error("Failed to refresh AI service:", error);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to get API key for refresh:", error);
      return false;
    }
  }

  // Test API key validity
  async testApiKey(apiKey) {
    try {
      const tempGenAI = new GoogleGenerativeAI(apiKey);
      let tempModel;

      // Try different model names with better error handling
      try {
        tempModel = tempGenAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 50,
          },
        });
      } catch (error) {
        try {
          tempModel = tempGenAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 50,
            },
          });
        } catch (fallbackError) {
          tempModel = tempGenAI.getGenerativeModel({
            model: "gemini-pro",
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 50,
            },
          });
        }
      }

      // Try a minimal generation to test the key
      const result = await tempModel.generateContent("Test");
      const response = await result.response;
      const text = response.text();

      return true;
    } catch (error) {
      // Check for specific error types
      if (
        error.message?.includes("API_KEY_INVALID") ||
        error.message?.includes("invalid_api_key")
      ) {
        throw new Error(
          "Invalid API key. Please check your Google Gemini API key."
        );
      } else if (
        error.message?.includes("QUOTA_EXCEEDED") ||
        error.message?.includes("quota")
      ) {
        throw new Error(
          "API quota exceeded. Please check your usage limits or try a different API key."
        );
      } else if (error.message?.includes("PERMISSION_DENIED")) {
        throw new Error(
          "Permission denied. Please ensure your API key has the necessary permissions."
        );
      }

      return false;
    }
  }

  // Validate API key (simple wrapper around testApiKey)
  async validateApiKey(apiKey) {
    try {
      return await this.testApiKey(apiKey);
    } catch (error) {
      return false;
    }
  }

  // Generate note content based on user prompt
  async generateNote(prompt, options = {}) {
    const isReady = await this.ensureInitialized();
    if (!isReady) {
      throw new Error(
        "AI service not initialized. Please set your Google Gemini API key in settings."
      );
    }

    try {
      const {
        includeTitle = true,
        includeTags = true,
        noteType = "general",
        language = "English",
        tone = "professional",
      } = options;

      // Create a comprehensive prompt for note generation
      const systemPrompt = `You are an intelligent note-taking assistant. Generate a well-structured note based on the user's request.

IMPORTANT FORMATTING REQUIREMENTS:
- Return ONLY a valid JSON object with the following structure:
{
  "title": "Note title",
  "content": "Note content in markdown format",
  "tags": ["tag1", "tag2", "tag3"],
  "emoji": "📝"
}

CONTENT GUIDELINES:
- Title should be concise and descriptive (max 100 characters)
- Content should be well-formatted using markdown syntax
- Use headers (##), bullet points (-), bold (**text**), italic (*text*) appropriately
- Include relevant information, examples, and structure
- Content should be comprehensive but not overly long
- Language: ${language}
- Tone: ${tone}
- Note type: ${noteType}

TAGS GUIDELINES:
- Generate 3-5 relevant tags that categorize the note
- Tags should be lowercase, single words or short phrases
- Tags should help with organization and searchability

EMOJI GUIDELINES:
- Choose an appropriate emoji that represents the note content
- Use relevant emojis like 📝, 📚, 💡, 🎯, 📊, 🔍, etc.

USER REQUEST: ${prompt}`;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse the JSON response
      let noteData;
      try {
        // Clean the response text to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          noteData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No valid JSON found in response");
        }
      } catch (parseError) {
        // Fallback: create note data from raw text
        noteData = {
          title: this.extractTitleFromText(text) || "AI Generated Note",
          content: text.replace(/```json[\s\S]*?```/g, "").trim() || text,
          tags: this.extractTagsFromText(text, prompt),
          emoji: this.selectEmojiFromContent(text, prompt),
        };
      }

      // Validate and clean the response
      noteData = this.validateNoteData(noteData);

      return noteData;
    } catch (error) {
      return this.handleApiError(error, 'generate note');
    }
  }

  // Extract title from text if JSON parsing fails
  extractTitleFromText(text) {
    const lines = text.split("\n").filter((line) => line.trim());
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.length > 0 &&
        trimmed.length <= 100 &&
        !trimmed.startsWith("{")
      ) {
        return trimmed.replace(/^#+\s*/, "").replace(/[*"`]/g, "");
      }
    }
    return null;
  }

  // Extract tags from text content
  extractTagsFromText(text, prompt) {
    const commonTags = {
      meeting: ["meeting", "discussion", "notes"],
      idea: ["idea", "brainstorm", "creative"],
      todo: ["todo", "task", "action"],
      project: ["project", "planning", "work"],
      research: ["research", "study", "analysis"],
      learning: ["learning", "education", "knowledge"],
      business: ["business", "strategy", "work"],
      personal: ["personal", "life", "self"],
    };

    const lowerPrompt = String(prompt || "").toLowerCase();
    const lowerText = String(text || "").toLowerCase();

    let tags = [];

    // Extract based on keywords in prompt and text
    for (const [key, tagList] of Object.entries(commonTags)) {
      if (lowerPrompt.includes(key) || lowerText.includes(key)) {
        tags.push(...tagList.slice(0, 2));
      }
    }

    // Add generic tags if none found
    if (tags.length === 0) {
      tags = ["note", "ai-generated", "general"];
    }

    return [...new Set(tags)].slice(0, 5); // Remove duplicates and limit to 5
  }

  // Select appropriate emoji based on content
  selectEmojiFromContent(text, prompt) {
    const emojiMap = {
      meeting: "🤝",
      idea: "💡",
      todo: "✅",
      task: "📋",
      project: "🎯",
      research: "🔍",
      study: "📚",
      learning: "🎓",
      business: "💼",
      analysis: "📊",
      creative: "🎨",
      planning: "📅",
      strategy: "🧠",
      note: "📝",
      documentation: "📄",
    };

    const lowerContent = (
      String(prompt || "") +
      " " +
      String(text || "")
    ).toLowerCase();

    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (lowerContent.includes(keyword)) {
        return emoji;
      }
    }

    return "📝"; // Default emoji
  }

  // Validate and clean note data
  validateNoteData(noteData) {
    return {
      title: (noteData.title || "Untitled Note").slice(0, 100),
      content: noteData.content || "No content generated.",
      tags: Array.isArray(noteData.tags)
        ? noteData.tags.slice(0, 5).map((tag) =>
            String(tag)
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .trim()
          )
        : ["ai-generated"],
      emoji: noteData.emoji || "📝",
    };
  }

  // Generate content based on title using AI
  async generateContentFromTitle(title, options = {}) {
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required for content generation");
    }

    const {
      noteType = "general",
      language = "English",
      tone = "professional",
      length = "medium", // short, medium, long
    } = options;

    // Check if AI service is available
    const isReady = await this.ensureInitialized();
    if (!isReady) {
      return this.generateContentFallback(title, options);
    }

    try {
      const prompt = this.createContentPrompt(
        title,
        noteType,
        language,
        tone,
        length
      );

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      const text = response.text().trim();

      if (!text || text.length === 0) {
        return this.generateContentFallback(title, options);
      }

      // Try to extract markdown content from response
      let content = this.extractContentFromResponse(text);

      // Validate and clean the content
      content = this.validateContent(content, title);

      return content;
    } catch (error) {
      return this.handleApiError(error, 'generate content from title');
    }
  }

  // Create a comprehensive prompt for content generation
  createContentPrompt(title, noteType, language, tone, length) {
    const lengthGuidance = {
      short: "Write 2-3 paragraphs (200-300 words)",
      medium: "Write 4-6 paragraphs (400-600 words)",
      long: "Write 6+ paragraphs (600-1000 words)",
    };

    const typeGuidance = {
      meeting:
        "Create meeting notes with agenda, discussion points, and action items",
      project:
        "Write about project overview, objectives, timeline, and milestones",
      research:
        "Structure with background, methodology, findings, and conclusions",
      tutorial: "Write step-by-step instructions with examples",
      idea: "Present the concept, benefits, and implementation steps",
      personal: "Write personal thoughts and reflections",
      business: "Create professional content with objectives and action points",
      creative: "Write creatively while maintaining structure",
      general: "Write informative content about the topic",
    };

    return `Write detailed content about: ${title}

Requirements:
- Topic: ${title}
- Style: ${typeGuidance[noteType] || typeGuidance["general"]}
- Length: ${lengthGuidance[length] || lengthGuidance["medium"]}
- Tone: ${tone}
- Language: ${language}

Please write well-structured content using markdown formatting:
- Use ## for main headings
- Use ### for subheadings  
- Use - for bullet points
- Use **bold** for emphasis
- Include practical examples and details

Start writing now:`;
  }

  // Extract content from AI response
  extractContentFromResponse(text) {
    // Remove any JSON formatting if present
    let content = text.replace(/```json[\s\S]*?```/g, "");

    // Remove markdown code blocks around the entire content
    content = content
      .replace(/^```markdown\s*\n?/i, "")
      .replace(/\n?```$/i, "");
    content = content.replace(/^```\s*\n?/, "").replace(/\n?```$/, "");

    // Clean up extra whitespace
    content = content.trim();

    // If content is wrapped in quotes, remove them
    if (content.startsWith('"') && content.endsWith('"')) {
      content = content.slice(1, -1);
    }

    return content;
  }

  // Validate and clean generated content
  validateContent(content, title) {
    if (!content || content.trim().length === 0) {
      return this.generateContentFallback(title, {});
    }

    // Ensure content is reasonable length (at least 50 characters)
    if (content.length < 50) {
      return this.generateContentFallback(title, {});
    }

    // Clean up excessive whitespace
    content = content.replace(/\n{3,}/g, "\n\n");

    // Ensure content doesn't start with the title if it's already included
    const titleWords = title.toLowerCase().split(" ").slice(0, 3).join(" ");
    if (content.toLowerCase().startsWith(titleWords)) {
      const lines = content.split("\n");
      if (lines[0].toLowerCase().includes(titleWords)) {
        content = lines.slice(1).join("\n").trim();
      }
    }

    return content;
  }

  // Fallback content generation without AI
  generateContentFallback(title, options = {}) {
    const { noteType = "general", tone = "professional" } = options;

    const templates = {
      meeting: this.generateMeetingTemplate(title),
      project: this.generateProjectTemplate(title),
      research: this.generateResearchTemplate(title),
      tutorial: this.generateTutorialTemplate(title),
      idea: this.generateIdeaTemplate(title),
      personal: this.generatePersonalTemplate(title),
      business: this.generateBusinessTemplate(title),
      creative: this.generateCreativeTemplate(title),
      general: this.generateGeneralTemplate(title),
    };

    return templates[noteType] || templates["general"];
  }

  // Template generators for different note types
  generateMeetingTemplate(title) {
    return `## Meeting Overview

**Purpose:** ${this.extractKeywords(title).join(", ")}

## Agenda
- Opening remarks
- Discussion points
- Action items review
- Next steps

## Discussion Points
- 

## Action Items
- [ ] 
- [ ] 
- [ ] 

## Next Meeting
**Date:** 
**Time:** 
**Location:** 

## Notes
`;
  }

  generateProjectTemplate(title) {
    return `## Project Overview

**Project Name:** ${title}

## Objectives
- 

## Scope
- 

## Timeline
- **Start Date:** 
- **End Date:** 
- **Key Milestones:** 

## Resources Needed
- 

## Success Criteria
- 

## Next Steps
1. 
2. 
3. 

## Notes
`;
  }

  generateResearchTemplate(title) {
    return `## Research Topic: ${title}

## Background
Provide context and background information about the research topic.

## Research Questions
- 
- 
- 

## Methodology
Describe the approach and methods used for this research.

## Key Findings
- 
- 
- 

## Sources
- 
- 
- 

## Conclusions
Summarize the main conclusions and insights from the research.

## Further Reading
- 
`;
  }

  generateTutorialTemplate(title) {
    return `## ${title}

## Overview
Brief description of what this tutorial covers and what you'll learn.

## Prerequisites
- 
- 

## Step-by-Step Instructions

### Step 1: 
Description and instructions for the first step.

### Step 2: 
Description and instructions for the second step.

### Step 3: 
Description and instructions for the third step.

## Tips and Best Practices
- 
- 
- 

## Troubleshooting
Common issues and solutions:
- **Issue:** 
  **Solution:** 

## Conclusion
Summary of what was accomplished and next steps.
`;
  }

  generateIdeaTemplate(title) {
    return `## Idea: ${title}

## Core Concept
Describe the main idea or concept in detail.

## Problem It Solves
- 
- 

## Potential Benefits
- 
- 
- 

## Implementation Ideas
1. 
2. 
3. 

## Challenges and Considerations
- 
- 

## Next Steps
- [ ] 
- [ ] 
- [ ] 

## Additional Thoughts
`;
  }

  generatePersonalTemplate(title) {
    return `## ${title}

## Thoughts and Reflections
Write your personal thoughts and reflections about this topic.

## Key Insights
- 
- 
- 

## Personal Goals
- 
- 

## Action Items
- [ ] 
- [ ] 

## Additional Notes
`;
  }

  generateBusinessTemplate(title) {
    return `## ${title}

## Executive Summary
Brief overview of the main points and recommendations.

## Current Situation
Description of the current business context and challenges.

## Opportunities
- 
- 
- 

## Recommendations
1. 
2. 
3. 

## Implementation Plan
- **Phase 1:** 
- **Phase 2:** 
- **Phase 3:** 

## Success Metrics
- 
- 

## Next Steps
- [ ] 
- [ ] 
`;
  }

  generateCreativeTemplate(title) {
    return `## ${title}

## Inspiration
What inspired this creative idea or project?

## Concept Development
Describe how the concept evolved and key creative decisions.

## Creative Elements
- **Style:** 
- **Theme:** 
- **Key Features:** 

## Creative Process
1. 
2. 
3. 

## Variations and Ideas
- 
- 
- 

## Next Creative Steps
- [ ] 
- [ ] 

## Notes and Sketches
`;
  }

  generateGeneralTemplate(title) {
    const keywords = this.extractKeywords(title);

    return `## ${title}

## Overview
This note covers important information about ${keywords
      .slice(0, 2)
      .join(" and ")}.

## Key Points
- 
- 
- 

## Details
Provide more detailed information and context here.

## Important Considerations
- 
- 

## Action Items
- [ ] 
- [ ] 

## References and Resources
- 
- 

## Additional Notes
`;
  }

  // Helper function to extract keywords from title
  extractKeywords(title) {
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "will",
      "would",
      "could",
      "should",
    ];

    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !commonWords.includes(word))
      .slice(0, 5);
  }

  // Generate tags based on title and content
  async generateTagsForNote(title, content) {
    const isReady = await this.ensureInitialized();
    if (!isReady) {
      return this.generateTagsFallback(title, content);
    }

    try {
      const prompt = `Create 3-5 relevant tags for this note:

Title: "${title}"
Content: "${content.slice(0, 500)}${content.length > 500 ? "..." : ""}"

Rules:
- Tags should be lowercase
- Use single words or short phrases  
- Focus on main topics and themes
- Make tags useful for organizing notes

Examples:
- Meeting notes → ["meeting", "discussion", "planning"]
- Recipe → ["cooking", "food", "recipes"]
- Project plan → ["project", "planning", "business"]

Return only the tags as a JSON array: ["tag1", "tag2", "tag3"]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      if (!text || text.length === 0) {
        return this.generateSmartTagsFallback(title, content);
      }

      // Try to extract JSON array from response
      let tags = [];

      // Look for JSON array pattern - more flexible matching
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        try {
          tags = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          // Try alternative parsing - extract content between quotes
          const quotedContent = text.match(/"([^"]+)"/g);
          if (quotedContent) {
            tags = quotedContent.map((item) => item.replace(/"/g, ""));
          }
        }
      } else {
        // Try to extract tags from text if no JSON found
        const lines = text.split("\n").filter((line) => line.trim());
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
              tags = JSON.parse(trimmed);
              break;
            } catch (e) {
              continue;
            }
          }
        }

        // If still no tags, try to extract from bullet points or comma-separated
        if (tags.length === 0) {
          const bulletMatch = text.match(/[-•]\s*(.+)/g);
          if (bulletMatch) {
            tags = bulletMatch.map((item) =>
              item.replace(/[-•]\s*/, "").trim()
            );
          } else {
            const commaMatch = text.match(/[a-zA-Z\s-]+/g);
            if (commaMatch) {
              tags = commaMatch.filter(
                (item) => item.trim().length > 2 && item.trim().length < 20
              );
            }
          }
        }

        if (tags.length === 0) {
          return this.generateSmartTagsFallback(title, content);
        }
      }

      // Validate and clean tags
      if (Array.isArray(tags) && tags.length > 0) {
        const cleanedTags = tags
          .slice(0, 5)
          .map((tag) =>
            String(tag)
              .toLowerCase()
              .replace(/[^\w\s-]/g, "") // Remove special chars except hyphens
              .replace(/\s+/g, "-") // Replace spaces with hyphens
              .trim()
          )
          .filter((tag) => tag.length > 1 && tag.length < 25) // Reasonable length
          .filter(
            (tag) => !["note", "text", "content", "document"].includes(tag)
          ); // Remove generic tags

        return cleanedTags.length > 0
          ? cleanedTags
          : this.generateSmartTagsFallback(title, content);
      } else {
        return this.generateSmartTagsFallback(title, content);
      }
    } catch (error) {
      // Use centralized error handling, but catch and return fallback instead of throwing
      try {
        this.handleApiError(error, 'generate tags for note');
      } catch (handledError) {
        // For tag generation, we prefer to return fallback instead of throwing
        console.warn('AI tag generation failed:', handledError.message);
        return this.generateSmartTagsFallback(title, content);
      }
    }
  }

  // Smart fallback tag generation without AI
  generateSmartTagsFallback(title, content) {
    const text = (
      String(title || "") +
      " " +
      String(content || "")
    ).toLowerCase();
    const tags = new Set();

    // Domain-specific keywords with their associated tags
    const domainKeywords = {
      // Technology & Programming
      javascript: ["programming", "javascript", "web-development"],
      python: ["programming", "python", "coding"],
      react: ["programming", "react", "frontend"],
      api: ["programming", "api", "development"],
      database: ["programming", "database", "backend"],
      code: ["programming", "coding", "development"],
      software: ["programming", "software", "technology"],
      algorithm: ["programming", "algorithms", "computer-science"],

      // Business & Work
      meeting: ["business", "meetings", "work"],
      project: ["business", "projects", "planning"],
      strategy: ["business", "strategy", "planning"],
      marketing: ["business", "marketing", "strategy"],
      sales: ["business", "sales", "revenue"],
      budget: ["business", "finance", "planning"],
      deadline: ["business", "project-management", "work"],
      client: ["business", "clients", "work"],
      proposal: ["business", "proposals", "work"],

      // Learning & Education
      study: ["education", "learning", "study"],
      research: ["education", "research", "analysis"],
      course: ["education", "courses", "learning"],
      tutorial: ["education", "tutorials", "learning"],
      book: ["education", "books", "reading"],
      lecture: ["education", "lectures", "learning"],
      assignment: ["education", "assignments", "study"],
      exam: ["education", "exams", "study"],

      // Health & Fitness
      workout: ["health", "fitness", "exercise"],
      diet: ["health", "nutrition", "diet"],
      exercise: ["health", "fitness", "exercise"],
      nutrition: ["health", "nutrition", "wellness"],
      medical: ["health", "medical", "wellness"],

      // Personal & Life
      recipe: ["cooking", "recipes", "food"],
      travel: ["travel", "vacation", "adventure"],
      goal: ["personal", "goals", "planning"],
      habit: ["personal", "habits", "self-improvement"],
      journal: ["personal", "journaling", "reflection"],
      family: ["personal", "family", "relationships"],

      // Creative & Arts
      design: ["creative", "design", "arts"],
      music: ["creative", "music", "arts"],
      writing: ["creative", "writing", "content"],
      art: ["creative", "arts", "visual"],
      photography: ["creative", "photography", "visual"],

      // Finance & Money
      investment: ["finance", "investments", "money"],
      budget: ["finance", "budgeting", "money"],
      expense: ["finance", "expenses", "money"],
      income: ["finance", "income", "money"],
      tax: ["finance", "taxes", "money"],

      // Task Management
      todo: ["productivity", "tasks", "planning"],
      task: ["productivity", "tasks", "work"],
      reminder: ["productivity", "reminders", "planning"],
      checklist: ["productivity", "checklists", "organization"],
      plan: ["productivity", "planning", "organization"],
    };

    // Content analysis patterns
    const patterns = {
      question: /\?/g,
      list: /[-•*]\s/g,
      code: /```|`[^`]+`/g,
      link: /https?:\/\/|www\./g,
      email: /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      date: /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/g,
      number: /\$\d+|\d+%|\d+\.\d+/g,
    };

    // Check for domain-specific keywords
    for (const [keyword, keywordTags] of Object.entries(domainKeywords)) {
      if (text.includes(keyword)) {
        keywordTags.forEach((tag) => tags.add(tag));
      }
    }

    // Check for content patterns
    if (patterns.question.test(text)) tags.add("questions");
    if (patterns.list.test(text)) tags.add("lists");
    if (patterns.code.test(text)) tags.add("programming");
    if (patterns.link.test(text)) tags.add("resources");
    if (patterns.email.test(text)) tags.add("contacts");
    if (patterns.date.test(text)) tags.add("scheduled");
    if (patterns.number.test(text)) tags.add("data");

    // Analyze title for specific patterns
    const titleWords = String(title || "")
      .toLowerCase()
      .split(/\s+/);
    const commonTitlePatterns = {
      how: ["tutorial", "guides", "how-to"],
      why: ["analysis", "explanation", "reasoning"],
      what: ["definition", "explanation", "reference"],
      when: ["scheduling", "timeline", "planning"],
      where: ["location", "reference", "travel"],
      review: ["reviews", "analysis", "feedback"],
      summary: ["summaries", "notes", "reference"],
      guide: ["guides", "tutorial", "reference"],
      tips: ["tips", "advice", "suggestions"],
      ideas: ["ideas", "brainstorming", "creative"],
    };

    titleWords.forEach((word) => {
      if (commonTitlePatterns[word]) {
        commonTitlePatterns[word].forEach((tag) => tags.add(tag));
      }
    });

    // Content length-based tags
    const contentLength = String(content || "").length;
    if (contentLength > 2000) tags.add("detailed");
    if (contentLength < 200) tags.add("quick-note");

    // Convert to array and limit
    const finalTags = Array.from(tags).slice(0, 5);

    // If no specific tags found, use intelligent defaults based on content
    if (finalTags.length === 0) {
      const titleString = String(title || "");
      if (titleString.length > 0) {
        // Extract meaningful words from title
        const meaningfulWords = titleString
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length > 3)
          .filter(
            (word) =>
              ![
                "with",
                "that",
                "this",
                "from",
                "they",
                "have",
                "will",
                "been",
                "were",
              ].includes(word)
          )
          .slice(0, 3);

        if (meaningfulWords.length > 0) {
          return meaningfulWords;
        }
      }

      return ["general", "notes"];
    }

    return finalTags;
  }

  // Fallback tag generation without AI (keep for backward compatibility)
  generateTagsFallback(title, content) {
    return this.generateSmartTagsFallback(title, content);
  }
}

export default new AIService();
