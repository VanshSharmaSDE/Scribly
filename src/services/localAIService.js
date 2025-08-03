import { CreateMLCEngine } from '@mlc-ai/web-llm';

class LocalAIService {
  constructor() {
    this.engine = null;
    this.isInitialized = false;
    this.currentModel = null;
    this.progressCallback = null;
    this.isDownloading = false;
    this.shouldCancelDownload = false;
    this.autoInitAttempted = false; // Track if auto-init was attempted
    this.downloadAbortController = null; // For cancelling downloads
    this.enginePromise = null; // Track the engine creation promise
  }

  // Auto-initialize model on page load if user has selected one
  async autoInitialize() {
    if (this.autoInitAttempted || this.isInitialized) {
      return { success: this.isInitialized, message: 'Already initialized or attempted' };
    }

    this.autoInitAttempted = true;

    try {
      // Import settings service to get user's selected model
      const settingsService = (await import('./settingsService')).default;
      const settings = await settingsService.getUserSettings();
      
      if (!settings.localModelPath || settings.aiProvider !== 'local') {
        return { success: false, message: 'No local model selected' };
      }

      // Check if model is already cached (downloaded previously)
      const isCached = await this.isModelCached(settings.localModelPath);
      
      if (!isCached) {
        return { 
          success: false, 
          message: 'Model not downloaded yet',
          modelPath: settings.localModelPath 
        };
      }

      console.log('Auto-initializing local AI model:', settings.localModelPath);
      
      // Initialize the model silently
      await this.initializeModel(settings.localModelPath);
      
      return { 
        success: true, 
        message: 'Model auto-initialized successfully',
        modelPath: settings.localModelPath 
      };
      
    } catch (error) {
      console.error('Auto-initialization failed:', error);
      return { 
        success: false, 
        message: error.message,
        error: true 
      };
    }
  }

  // Check if a model is cached/downloaded
  async isModelCached(modelPath) {
    try {
      // Check browser cache for the model files
      const cacheNames = await caches.keys();
      const mlcCaches = cacheNames.filter(name => name.includes('mlc') || name.includes('webllm'));
      
      for (const cacheName of mlcCaches) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        // Look for model-specific files
        const hasModelFiles = requests.some(req => 
          req.url.includes(modelPath) || req.url.includes(modelPath.split('-')[0])
        );
        
        if (hasModelFiles) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.warn('Could not check model cache:', error);
      return false;
    }
  }

  // Reset auto-init flag (for manual re-initialization)
  resetAutoInit() {
    this.autoInitAttempted = false;
  }

  // Set progress callback for UI updates
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  // Clear progress callback to prevent duplicate notifications
  clearProgressCallback() {
    this.progressCallback = null;
  }

  // Initialize the MLC engine with a specific model
  async initializeModel(modelPath, modelId = 'custom-model') {
    try {
      console.log('Initializing local AI model...');
      
      // Use the passed modelPath as the model ID, or default to Phi-3
      const selectedModel = modelPath || 'Phi-3-mini-4k-instruct-q4f16_1-MLC';
      
      // Check if the same model is already loaded and ready
      if (this.isInitialized && this.engine && this.currentModel === selectedModel) {
        console.log('Model already loaded and ready:', selectedModel);
        return true;
      }
      
      // If a different model is loaded, clean up first
      if (this.isInitialized && this.engine && this.currentModel !== selectedModel) {
        console.log('Switching from', this.currentModel, 'to', selectedModel);
        await this.cleanup();
      }
      
      // Reset cancellation flag and create new abort controller
      this.shouldCancelDownload = false;
      this.isDownloading = true;
      this.downloadAbortController = new AbortController();
      
      // Track if we've sent completion notification to prevent duplicates
      let completionNotified = false;
      
      // Create a promise that can be cancelled
      this.enginePromise = new Promise(async (resolve, reject) => {
        let isCancelled = false;
        
        // Set up cancellation listener
        this.downloadAbortController.signal.addEventListener('abort', () => {
          console.log('Download aborted by user');
          isCancelled = true;
          reject(new Error('Download cancelled by user'));
        });
        
        // Periodic cancellation check
        const cancellationCheckInterval = setInterval(() => {
          if (this.shouldCancelDownload || this.downloadAbortController.signal.aborted || isCancelled) {
            clearInterval(cancellationCheckInterval);
            if (!isCancelled) {
              isCancelled = true;
              reject(new Error('Download cancelled by user'));
            }
          }
        }, 200); // Check every 200ms
        
        try {
          const engine = await CreateMLCEngine(selectedModel, {
            initProgressCallback: (report) => {
              console.log('Model loading progress:', report);
              
              // Check if download should be cancelled
              if (this.shouldCancelDownload || this.downloadAbortController.signal.aborted || isCancelled) {
                clearInterval(cancellationCheckInterval);
                this.isDownloading = false;
                if (!isCancelled) {
                  isCancelled = true;
                  reject(new Error('Download cancelled by user'));
                }
                return;
              }
              
              // Forward progress to UI callback (only if not completed)
              if (this.progressCallback && !completionNotified && !isCancelled) {
                this.progressCallback({
                  progress: report.progress || 0,
                  text: report.text || 'Downloading model...',
                  timeElapsed: report.timeElapsed || 0
                });
                
                // Mark as completed when progress reaches 1
                if (report.progress >= 1) {
                  completionNotified = true;
                }
              }
            }
          });
          
          clearInterval(cancellationCheckInterval);
          if (!isCancelled) {
            resolve(engine);
          }
        } catch (error) {
          clearInterval(cancellationCheckInterval);
          if (!isCancelled) {
            reject(error);
          }
        }
      });
      
      // Wait for engine creation or cancellation with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Download timeout - operation cancelled')), 300000) // 5 minute timeout
      );
      
      this.engine = await Promise.race([this.enginePromise, timeoutPromise]);
      
      this.isInitialized = true;
      this.currentModel = selectedModel;
      this.isDownloading = false;
      this.downloadAbortController = null;
      this.enginePromise = null;
      
      console.log('Local AI model initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize local AI model:', error);
      this.isInitialized = false;
      this.isDownloading = false;
      this.downloadAbortController = null;
      this.enginePromise = null;
      
      // If download was cancelled, clean up partial data
      if (this.shouldCancelDownload || error.message.includes('cancelled') || error.message.includes('aborted')) {
        console.log('Cleaning up cancelled download...');
        await this.clearModelCache();
        
        if (this.progressCallback) {
          this.progressCallback({
            progress: 0,
            text: 'Download cancelled and cleaned up',
            timeElapsed: 0,
            cancelled: true
          });
        }
        
        return false;
      }
      
      // Notify UI of error
      if (this.progressCallback) {
        this.progressCallback({
          progress: 0,
          text: `Error: ${error.message}`,
          timeElapsed: 0,
          error: true
        });
      }
      
      throw error;
    }
  }

  // Cancel ongoing download
  async cancelDownload() {
    if (this.isDownloading) {
      console.log('Cancelling model download...');
      this.shouldCancelDownload = true;
      
      // Abort the download using AbortController
      if (this.downloadAbortController) {
        this.downloadAbortController.abort();
      }
      
      // Wait a bit for the abort to take effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force cleanup of browser resources
      try {
        // Try to interrupt any ongoing network requests
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            if (registration.scope.includes('mlc') || registration.scope.includes('webllm')) {
              await registration.unregister();
            }
          }
        }
      } catch (error) {
        console.warn('Could not cleanup service workers:', error);
      }
      
      // Clean up any partial download data
      await this.clearModelCache();
      
      // Reset state
      this.isDownloading = false;
      this.shouldCancelDownload = false;
      this.downloadAbortController = null;
      this.enginePromise = null;
      
      console.log('Download cancellation completed');
      return true;
    }
    return false;
  }

  // Check if currently downloading
  isCurrentlyDownloading() {
    return this.isDownloading;
  }

  // Generate text using the local model
  async generateText(prompt, options = {}) {
    // Check if model is ready
    if (!this.isInitialized || !this.engine) {
      throw new Error('Local AI model not initialized. Please load a model first.');
    }

    // Double-check engine is still available
    if (!this.engine) {
      throw new Error('AI model engine is not available. Please reload the model.');
    }

    try {
      console.log('Generating text with local AI model:', this.currentModel);
      
      const messages = [
        {
          role: 'user',
          content: prompt
        }
      ];

      const completion = await this.engine.chat.completions.create({
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500,
        stream: false
      });

      const response = completion.choices[0].message.content;
      console.log('Local AI response generated successfully');
      return response;
    } catch (error) {
      console.error('Error generating text with local AI:', error);
      
      // If the engine failed, mark as not initialized
      if (error.message.includes('engine') || error.message.includes('model')) {
        this.isInitialized = false;
        this.engine = null;
      }
      
      throw error;
    }
  }

  // Test the model with a simple prompt
  async testModel() {
    try {
      const testPrompt = "Write a brief hello message.";
      const response = await this.generateText(testPrompt, { maxTokens: 50 });
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Check if model is ready
  isReady() {
    return this.isInitialized && this.engine !== null;
  }

  // Get current model info
  getCurrentModel() {
    return this.currentModel;
  }

  // Check if a specific model is loaded and ready
  isModelReady(modelId) {
    return this.isReady() && this.currentModel === modelId;
  }

  // Get model status information
  getModelStatus() {
    return {
      isReady: this.isReady(),
      currentModel: this.currentModel,
      isDownloading: this.isDownloading,
      isInitialized: this.isInitialized
    };
  }

  // Reset/cleanup the model
  async cleanup() {
    if (this.engine) {
      // WebLLM doesn't have explicit cleanup, but we can reset our state
      this.engine = null;
      this.isInitialized = false;
      this.currentModel = null;
    }
    
    // Cancel any ongoing downloads
    if (this.downloadAbortController) {
      this.downloadAbortController.abort();
      this.downloadAbortController = null;
    }
    
    this.isDownloading = false;
    this.shouldCancelDownload = false;
    this.enginePromise = null;
  }

  // Clear model cache (frees up storage space) - Enhanced for cancellation
  async clearModelCache() {
    try {
      console.log('Starting aggressive cache clearing...');
      
      // Clear all caches related to WebLLM
      const cacheNames = await caches.keys();
      const webLLMCaches = cacheNames.filter(name => 
        name.includes('mlc') || 
        name.includes('webllm') || 
        name.includes('model') ||
        name.includes('huggingface') ||
        name.toLowerCase().includes('phi') ||
        name.toLowerCase().includes('qwen') ||
        name.toLowerCase().includes('tinyllama')
      );
      
      let clearedCaches = 0;
      for (const cacheName of webLLMCaches) {
        try {
          await caches.delete(cacheName);
          clearedCaches++;
          console.log(`Cleared cache: ${cacheName}`);
        } catch (err) {
          console.warn(`Failed to clear cache ${cacheName}:`, err);
        }
      }
      
      // Also clear any fetch caches that might contain partial downloads
      try {
        if ('caches' in window) {
          const cache = await caches.open('default');
          const requests = await cache.keys();
          const modelRequests = requests.filter(req => 
            req.url.includes('model') || 
            req.url.includes('mlc') || 
            req.url.includes('.wasm') ||
            req.url.includes('.bin')
          );
          
          for (const request of modelRequests) {
            await cache.delete(request);
          }
        }
      } catch (err) {
        console.warn('Failed to clear fetch cache:', err);
      }
      
      // Reset our state
      await this.cleanup();
      
      console.log(`Model cache cleared successfully. Cleared ${clearedCaches} cache entries.`);
      return true;
    } catch (error) {
      console.error('Failed to clear model cache:', error);
      return false;
    }
  }

  // Delete specific model and free storage space
  async deleteModel(modelId = null) {
    try {
      const targetModel = modelId || this.currentModel;
      
      if (!targetModel) {
        throw new Error('No model specified for deletion');
      }
      
      console.log(`Deleting model: ${targetModel}`);
      
      // Clear all WebLLM related caches
      const cacheNames = await caches.keys();
      const webLLMCaches = cacheNames.filter(name => 
        name.includes('mlc') || 
        name.includes('webllm') || 
        name.includes('model') ||
        name.toLowerCase().includes(targetModel.toLowerCase())
      );
      
      let deletedCaches = 0;
      for (const cacheName of webLLMCaches) {
        try {
          await caches.delete(cacheName);
          deletedCaches++;
          console.log(`Deleted cache: ${cacheName}`);
        } catch (err) {
          console.warn(`Failed to delete cache ${cacheName}:`, err);
        }
      }
      
      // Clear IndexedDB entries related to WebLLM
      try {
        // WebLLM uses IndexedDB for model metadata
        if ('indexedDB' in window) {
          const databases = await indexedDB.databases();
          for (const db of databases) {
            if (db.name && (
              db.name.includes('mlc') || 
              db.name.includes('webllm') || 
              db.name.includes('model')
            )) {
              console.log(`Clearing IndexedDB: ${db.name}`);
              // Note: Full DB deletion requires more complex handling
              // For now, we'll rely on cache deletion which handles most storage
            }
          }
        }
      } catch (err) {
        console.warn('Failed to clear IndexedDB:', err);
      }
      
      // Reset our state
      await this.cleanup();
      
      console.log(`Model ${targetModel} deleted successfully. Cleared ${deletedCaches} cache entries.`);
      return {
        success: true,
        deletedCaches,
        modelId: targetModel
      };
    } catch (error) {
      console.error('Failed to delete model:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get storage usage information
  async getStorageInfo() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage,
          available: estimate.quota,
          usedGB: (estimate.usage / (1024 * 1024 * 1024)).toFixed(2),
          availableGB: (estimate.quota / (1024 * 1024 * 1024)).toFixed(2)
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }

  // Get available models (WebLLM supported models) - Max 4GB only
  getAvailableModels() {
    const allModels = [
      // Tiny Models (Great for testing and low-end devices)
      {
        id: 'Qwen2-0.5B-Instruct-q4f16_1-MLC',
        name: 'Qwen2 0.5B',
        size: '0.3GB',
        sizeBytes: 0.3 * 1024 * 1024 * 1024,
        description: 'Extremely fast, minimal resource usage',
        category: 'tiny',
        recommended: 'Mobile devices, quick responses'
      },
      {
        id: 'TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC',
        name: 'TinyLlama 1.1B',
        size: '0.6GB',
        sizeBytes: 0.6 * 1024 * 1024 * 1024,
        description: 'Ultra-lightweight model for basic tasks',
        category: 'tiny',
        recommended: 'Low-end devices, testing'
      },
      
      // Small Models (Good balance for most users)
      {
        id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
        name: 'Phi-3 Mini',
        size: '2.3GB',
        sizeBytes: 2.3 * 1024 * 1024 * 1024,
        description: 'Fast and efficient for basic tasks',
        category: 'small',
        recommended: 'Beginners, general use (Recommended)'
      }
    ];

    // Filter to only models under 4GB
    return allModels.filter(model => model.sizeBytes <= 4 * 1024 * 1024 * 1024);
  }

  // Get models by category
  getModelsByCategory() {
    const models = this.getAvailableModels();
    return {
      tiny: models.filter(m => m.category === 'tiny'),
      small: models.filter(m => m.category === 'small'),
      medium: models.filter(m => m.category === 'medium')
    };
  }

  // Get recommended model based on storage available
  getRecommendedModel(availableGB = 10) {
    const models = this.getAvailableModels();
    
    if (availableGB < 1) {
      return models.find(m => m.id === 'Qwen2-0.5B-Instruct-q4f16_1-MLC');
    } else if (availableGB < 3) {
      return models.find(m => m.id === 'TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC');
    } else if (availableGB < 5) {
      return models.find(m => m.id === 'Phi-3-mini-4k-instruct-q4f16_1-MLC');
    } else {
      return models.find(m => m.id === 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC');
    }
  }
}

// Create singleton instance
const localAIService = new LocalAIService();
export default localAIService;
