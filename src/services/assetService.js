import { databases, storage, account, Query, ID } from '../lib/appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const ASSETS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ASSETS_COLLECTION_ID;
const ASSETS_BUCKET_ID = import.meta.env.VITE_APPWRITE_ASSETS_BUCKET_ID;

class AssetService {
  constructor() {
    // Temporary storage for assets during note creation
    this.tempAssets = new Map();
  }

  // Upload asset to storage and create database record
  async uploadAsset({ file, noteId, type = null, isTemporary = false }) {
    try {
      console.log('Uploading asset:', file.name, 'for note:', noteId, 'temporary:', isTemporary);
      
      // Get current user
      const currentUser = await account.get();
      const userId = currentUser.$id;
      
      // Upload file to storage
      const uploadedFile = await storage.createFile(
        ASSETS_BUCKET_ID,
        ID.unique(),
        file
      );

      console.log('File uploaded to storage:', uploadedFile);

      // Determine file type if not provided
      const fileType = type || this.getFileType(file.type);
      
      if (isTemporary || !noteId) {
        // Store temporarily until note is created
        const tempAsset = {
          fileId: uploadedFile.$id,
          fileName: file.name,
          fileType: fileType,
          mimeType: file.type,
          fileSize: file.size,
          url: this.getFileUrl(uploadedFile.$id),
          userId,
          createdAt: new Date().toISOString(),
          isTemporary: true,
          // Temporary storage for styling settings
          tempDisplaySettings: null,
          isStyled: false
        };
        
        // Use a temporary session key for the assets
        const sessionKey = noteId || 'temp_' + Date.now();
        if (!this.tempAssets.has(sessionKey)) {
          this.tempAssets.set(sessionKey, []);
        }
        this.tempAssets.get(sessionKey).push(tempAsset);
        
        console.log('Asset stored temporarily:', tempAsset);
        return tempAsset;
      }
      
      // Create database record for permanent assets
      const assetData = {
        fileId: uploadedFile.$id,
        noteId,
        userId,
        fileName: file.name,
        fileType: fileType,
        mimeType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
        displaySettings: null, // Will be set when user customizes
        isStyled: false,
        lastModified: new Date().toISOString()
      };

      const assetRecord = await databases.createDocument(
        DATABASE_ID,
        ASSETS_COLLECTION_ID,
        ID.unique(),
        assetData
      );

      console.log('Asset record created:', assetRecord);
      
      return {
        ...assetRecord,
        url: this.getFileUrl(uploadedFile.$id)
      };
    } catch (error) {
      console.error('Error uploading asset:', error);
      throw error;
    }
  }

  // Convert temporary assets to permanent ones after note creation
  async commitTemporaryAssets(sessionKey, noteId) {
    try {
      console.log('Committing temporary assets for session:', sessionKey, 'to note:', noteId);
      
      const tempAssets = this.tempAssets.get(sessionKey) || [];
      const permanentAssets = [];
      
      for (const tempAsset of tempAssets) {
        try {
          // Create database record for the temporary asset
          const assetData = {
            fileId: tempAsset.fileId,
            noteId,
            userId: tempAsset.userId,
            fileName: tempAsset.fileName,
            fileType: tempAsset.fileType,
            mimeType: tempAsset.mimeType,
            fileSize: tempAsset.fileSize,
            createdAt: tempAsset.createdAt,
            displaySettings: tempAsset.tempDisplaySettings || null, // Apply temporary styling
            isStyled: tempAsset.isStyled || false,
            lastModified: new Date().toISOString()
          };

          const assetRecord = await databases.createDocument(
            DATABASE_ID,
            ASSETS_COLLECTION_ID,
            ID.unique(),
            assetData
          );

          permanentAssets.push({
            ...assetRecord,
            url: this.getFileUrl(assetRecord.fileId)
          });
          
          console.log('Committed temporary asset:', tempAsset.fileName);
        } catch (error) {
          console.error('Failed to commit temporary asset:', tempAsset.fileName, error);
          // Keep the asset in temporary storage for retry
        }
      }
      
      // Clear temporary storage for this session
      this.tempAssets.delete(sessionKey);
      
      console.log(`Committed ${permanentAssets.length} assets to note ${noteId}`);
      return permanentAssets;
      
    } catch (error) {
      console.error('Error committing temporary assets:', error);
      throw error;
    }
  }

  // Get temporary assets for a session
  getTemporaryAssets(sessionKey) {
    return this.tempAssets.get(sessionKey) || [];
  }

  // Remove a specific temporary asset
  async removeTemporaryAsset(sessionKey, fileId) {
    try {
      console.log('Removing temporary asset:', { sessionKey, fileId });
      
      // Remove from temporary storage in memory
      const tempAssets = this.tempAssets.get(sessionKey) || [];
      const filteredAssets = tempAssets.filter(asset => asset.fileId !== fileId);
      this.tempAssets.set(sessionKey, filteredAssets);
      
      // Also delete the file from storage bucket since it was uploaded
      console.log('Deleting temporary asset from storage bucket...');
      await storage.deleteFile(ASSETS_BUCKET_ID, fileId);
      console.log('Temporary asset deleted from storage:', fileId);
      
      console.log(`Removed temporary asset ${fileId} from session ${sessionKey}`);
      return true;
    } catch (error) {
      console.error('Error removing temporary asset:', error);
      console.error('Temporary asset details:', { sessionKey, fileId });
      
      if (error.message?.includes('file not found')) {
        console.log('Storage file not found - may already be deleted');
        // Still remove from memory even if storage deletion fails
        const tempAssets = this.tempAssets.get(sessionKey) || [];
        const filteredAssets = tempAssets.filter(asset => asset.fileId !== fileId);
        this.tempAssets.set(sessionKey, filteredAssets);
        return true;
      }
      
      throw error;
    }
  }

  // Clean up temporary assets (remove from storage)
  async cleanupTemporaryAssets(sessionKey) {
    try {
      const tempAssets = this.tempAssets.get(sessionKey) || [];
      
      for (const asset of tempAssets) {
        try {
          await storage.deleteFile(ASSETS_BUCKET_ID, asset.fileId);
          console.log('Cleaned up temporary asset:', asset.fileName);
        } catch (error) {
          console.error('Failed to cleanup temporary asset:', asset.fileName, error);
        }
      }
      
      this.tempAssets.delete(sessionKey);
      console.log(`Cleaned up ${tempAssets.length} temporary assets`);
      
    } catch (error) {
      console.error('Error cleaning up temporary assets:', error);
    }
  }

  // Get assets for a specific note
  async getNoteAssets(noteId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ASSETS_COLLECTION_ID,
        [
          Query.equal('noteId', noteId),
          Query.orderDesc('createdAt')
        ]
      );

      // Add URLs to each asset
      const assetsWithUrls = response.documents.map(asset => ({
        ...asset,
        url: this.getFileUrl(asset.fileId)
      }));

      console.log('Fetched assets for note:', noteId, assetsWithUrls);
      return assetsWithUrls;
    } catch (error) {
      console.error('Error fetching note assets:', error);
      throw error;
    }
  }

  // Delete asset from both storage and database
  async deleteAsset(assetId, fileId) {
    try {
      console.log('Deleting asset:', { assetId, fileId });
      
      if (!assetId) {
        throw new Error('Asset ID is required for database deletion');
      }
      
      if (!fileId) {
        throw new Error('File ID is required for storage deletion');
      }

      // Step 1: Delete from database first (to maintain data consistency)
      console.log('Deleting from database...');
      await databases.deleteDocument(
        DATABASE_ID,
        ASSETS_COLLECTION_ID,
        assetId
      );
      console.log('Asset deleted from database:', assetId);
      
      // Step 2: Delete from storage bucket
      console.log('Deleting from storage bucket...');
      await storage.deleteFile(ASSETS_BUCKET_ID, fileId);
      console.log('Asset deleted from storage:', fileId);

      console.log('Asset completely deleted:', { assetId, fileId });
    } catch (error) {
      console.error('Error deleting asset:', error);
      console.error('Asset deletion details:', { assetId, fileId });
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      // Provide more specific error information
      if (error.message?.includes('document not found')) {
        console.error('Database record not found - asset may already be deleted');
      } else if (error.message?.includes('file not found')) {
        console.error('Storage file not found - file may already be deleted');
      }
      
      throw error;
    }
  }

  // Delete all assets for a specific note
  async deleteNoteAssets(noteId) {
    try {
      console.log('Deleting all assets for note:', noteId);
      
      // First, get all assets for this note
      const assets = await this.getNoteAssets(noteId);
      
      // Delete each asset from storage and database
      for (const asset of assets) {
        try {
          await this.deleteAsset(asset.$id, asset.fileId);
          console.log('Deleted asset:', asset.fileName);
        } catch (error) {
          console.error('Failed to delete asset:', asset.fileName, error);
          // Continue deleting other assets even if one fails
        }
      }
      
      console.log(`Deleted ${assets.length} assets for note:`, noteId);
      return assets.length;
    } catch (error) {
      console.error('Error deleting note assets:', error);
      throw error;
    }
  }

  // Clean up orphaned assets (assets whose notes no longer exist)
  async cleanupOrphanedAssets(validNoteIds = []) {
    try {
      console.log('Starting cleanup of orphaned assets...');
      
      // Get all assets
      const response = await databases.listDocuments(
        DATABASE_ID,
        ASSETS_COLLECTION_ID,
        [Query.orderDesc('createdAt')]
      );
      
      const orphanedAssets = [];
      
      // If no valid note IDs provided, we can't determine orphans
      if (validNoteIds.length === 0) {
        console.log('No valid note IDs provided for orphan cleanup');
        return 0;
      }
      
      // Find assets that don't belong to any valid note
      for (const asset of response.documents) {
        if (!validNoteIds.includes(asset.noteId)) {
          orphanedAssets.push(asset);
        }
      }
      
      console.log(`Found ${orphanedAssets.length} orphaned assets`);
      
      // Delete orphaned assets
      for (const asset of orphanedAssets) {
        try {
          await this.deleteAsset(asset.$id, asset.fileId);
          console.log('Cleaned up orphaned asset:', asset.fileName);
        } catch (error) {
          console.error('Failed to clean up orphaned asset:', asset.fileName, error);
        }
      }
      
      return orphanedAssets.length;
    } catch (error) {
      console.error('Error during orphaned assets cleanup:', error);
      throw error;
    }
  }

  // Get file URL for viewing
  getFileUrl(fileId) {
    try {
      const url = storage.getFileView(ASSETS_BUCKET_ID, fileId);
      return url;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }

  // Get download URL
  getDownloadUrl(fileId) {
    try {
      const url = storage.getFileDownload(ASSETS_BUCKET_ID, fileId);
      return url;
    } catch (error) {
      console.error('Error getting download URL:', error);
      return null;
    }
  }

  // Determine file type category
  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  }

  // Get file icon based on type
  getFileIcon(fileType) {
    switch (fileType) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'pdf': return '📄';
      case 'document': return '📝';
      default: return '📁';
    }
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Update asset display settings
  async updateAssetSettings(assetId, displaySettings) {
    try {
      console.log('Updating asset settings for asset:', assetId);
      console.log('Asset ID type:', typeof assetId, 'Length:', assetId?.length);
      
      if (!assetId) {
        throw new Error('Asset ID is required');
      }
      
      const updateData = {
        displaySettings: JSON.stringify(displaySettings),
        isStyled: true,
        lastModified: new Date().toISOString()
      };

      console.log('Update data:', updateData);

      const updatedAsset = await databases.updateDocument(
        DATABASE_ID,
        ASSETS_COLLECTION_ID,
        assetId,
        updateData
      );

      console.log('Asset settings updated:', updatedAsset);
      
      return {
        ...updatedAsset,
        url: this.getFileUrl(updatedAsset.fileId),
        parsedDisplaySettings: displaySettings
      };
    } catch (error) {
      console.error('Error updating asset settings:', error);
      console.error('Asset ID that failed:', assetId);
      throw error;
    }
  }

  // Update temporary asset styling (for assets not yet committed to database)
  updateTemporaryAssetSettings(sessionKey, fileId, displaySettings) {
    try {
      console.log('Updating temporary asset settings:', { sessionKey, fileId });
      
      const tempAssets = this.tempAssets.get(sessionKey) || [];
      const assetIndex = tempAssets.findIndex(asset => asset.fileId === fileId);
      
      if (assetIndex === -1) {
        throw new Error('Temporary asset not found');
      }
      
      // Update the temporary asset with styling settings
      tempAssets[assetIndex] = {
        ...tempAssets[assetIndex],
        tempDisplaySettings: JSON.stringify(displaySettings),
        isStyled: true
      };
      
      this.tempAssets.set(sessionKey, tempAssets);
      
      console.log('Temporary asset settings updated');
      return tempAssets[assetIndex];
    } catch (error) {
      console.error('Error updating temporary asset settings:', error);
      throw error;
    }
  }

  // Get parsed display settings for an asset
  getDisplaySettings(asset) {
    let settingsString = null;
    
    // Check if it's a temporary asset with temporary settings
    if (asset.isTemporary && asset.tempDisplaySettings) {
      settingsString = asset.tempDisplaySettings;
    } else if (asset.displaySettings) {
      settingsString = asset.displaySettings;
    }
    
    if (!settingsString) {
      // Return default settings
      return {
        dimensions: {
          width: asset.fileType === 'image' ? 400 : asset.fileType === 'video' ? 500 : 300,
          height: asset.fileType === 'image' ? 300 : asset.fileType === 'video' ? 280 : 200,
          aspectRatio: asset.fileType === 'video' ? '16:9' : 'auto'
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        borderRadius: 0,
        opacity: 100,
        transform: { scaleX: 1, scaleY: 1 }
      };
    }

    try {
      return JSON.parse(settingsString);
    } catch (error) {
      console.error('Error parsing display settings:', error);
      return this.getDisplaySettings({ ...asset, displaySettings: null, tempDisplaySettings: null });
    }
  }

  // Reset asset to default styling
  async resetAssetStyling(assetId) {
    try {
      console.log('Resetting asset styling for asset:', assetId);
      
      if (!assetId) {
        throw new Error('Asset ID is required');
      }
      
      const updateData = {
        displaySettings: null,
        isStyled: false,
        lastModified: new Date().toISOString()
      };

      const updatedAsset = await databases.updateDocument(
        DATABASE_ID,
        ASSETS_COLLECTION_ID,
        assetId,
        updateData
      );

      console.log('Asset styling reset:', updatedAsset);
      
      return {
        ...updatedAsset,
        url: this.getFileUrl(updatedAsset.fileId)
      };
    } catch (error) {
      console.error('Error resetting asset styling:', error);
      console.error('Asset ID that failed:', assetId);
      throw error;
    }
  }

  // Reset temporary asset styling (for assets not yet committed to database)
  resetTemporaryAssetStyling(sessionKey, fileId) {
    try {
      console.log('Resetting temporary asset styling:', { sessionKey, fileId });
      
      const tempAssets = this.tempAssets.get(sessionKey) || [];
      const assetIndex = tempAssets.findIndex(asset => asset.fileId === fileId);
      
      if (assetIndex === -1) {
        throw new Error('Temporary asset not found');
      }
      
      // Reset the temporary asset styling
      tempAssets[assetIndex] = {
        ...tempAssets[assetIndex],
        tempDisplaySettings: null,
        isStyled: false
      };
      
      this.tempAssets.set(sessionKey, tempAssets);
      
      console.log('Temporary asset styling reset');
      return tempAssets[assetIndex];
    } catch (error) {
      console.error('Error resetting temporary asset styling:', error);
      throw error;
    }
  }
}

export default new AssetService();
