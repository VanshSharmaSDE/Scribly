import assetService from '../services/assetService';
import notesService from '../services/notesService';

/**
 * Utility functions for asset maintenance and cleanup
 */
class AssetMaintenance {
  
  /**
   * Clean up orphaned assets (assets that belong to deleted notes)
   * This should be run periodically for maintenance
   */
  async cleanupOrphanedAssets() {
    try {
      console.log('🧹 Starting orphaned assets cleanup...');
      
      // Get all user's notes to determine valid note IDs
      const notes = await notesService.getUserNotes();
      const validNoteIds = notes.map(note => note.$id);
      
      console.log(`Found ${validNoteIds.length} valid notes`);
      
      // Clean up orphaned assets
      const cleanedCount = await assetService.cleanupOrphanedAssets(validNoteIds);
      
      console.log(`✅ Cleanup complete: ${cleanedCount} orphaned assets removed`);
      return {
        success: true,
        cleanedCount,
        message: `Cleaned up ${cleanedCount} orphaned assets`
      };
      
    } catch (error) {
      console.error('❌ Error during assets cleanup:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to cleanup orphaned assets'
      };
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats() {
    try {
      console.log('📊 Calculating storage statistics...');
      
      const notes = await notesService.getUserNotes();
      let totalAssets = 0;
      let totalSize = 0;
      const typeStats = {};
      
      for (const note of notes) {
        try {
          const assets = await assetService.getNoteAssets(note.$id);
          totalAssets += assets.length;
          
          for (const asset of assets) {
            totalSize += asset.fileSize || 0;
            
            const type = asset.fileType || 'unknown';
            if (!typeStats[type]) {
              typeStats[type] = { count: 0, size: 0 };
            }
            typeStats[type].count++;
            typeStats[type].size += asset.fileSize || 0;
          }
        } catch (error) {
          console.warn(`Skipping assets for note ${note.$id}:`, error.message);
        }
      }
      
      return {
        totalNotes: notes.length,
        totalAssets,
        totalSize,
        formattedSize: assetService.formatFileSize(totalSize),
        typeStats
      };
      
    } catch (error) {
      console.error('❌ Error calculating storage stats:', error);
      throw error;
    }
  }

  /**
   * Validate asset integrity (check if files exist in storage)
   */
  async validateAssetIntegrity() {
    try {
      console.log('🔍 Validating asset integrity...');
      
      const notes = await notesService.getUserNotes();
      const results = {
        totalChecked: 0,
        validAssets: 0,
        invalidAssets: 0,
        invalidAssetsList: []
      };
      
      for (const note of notes) {
        try {
          const assets = await assetService.getNoteAssets(note.$id);
          
          for (const asset of assets) {
            results.totalChecked++;
            
            try {
              // Try to get file URL to verify it exists
              const url = assetService.getFileUrl(asset.fileId);
              if (url) {
                results.validAssets++;
              } else {
                results.invalidAssets++;
                results.invalidAssetsList.push({
                  assetId: asset.$id,
                  fileName: asset.fileName,
                  noteTitle: note.title
                });
              }
            } catch (error) {
              results.invalidAssets++;
              results.invalidAssetsList.push({
                assetId: asset.$id,
                fileName: asset.fileName,
                noteTitle: note.title,
                error: error.message
              });
            }
          }
        } catch (error) {
          console.warn(`Skipping validation for note ${note.$id}:`, error.message);
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Error during asset integrity validation:', error);
      throw error;
    }
  }
}

export default new AssetMaintenance();
