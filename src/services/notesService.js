import { databases, DATABASE_ID, NOTES_COLLECTION_ID, ID } from '../lib/appwrite';
import { Query } from 'appwrite';
import userService from './userService';

class NotesService {
  // Create new note
  async createNote(noteData) {
    try {
      const defaultStyle = {
        backgroundColor: '#1e3a8a',
        textColor: '#ffffff',
        fontSize: '16px',
        fontFamily: 'Inter, sans-serif'
      };

      // Ensure tags is an array
      let tagsToSave = noteData.tags || [];
      if (typeof tagsToSave === 'string') {
        try {
          tagsToSave = JSON.parse(tagsToSave);
        } catch (e) {
          console.warn('Tags is a string but not valid JSON, treating as empty array');
          tagsToSave = [];
        }
      }
      if (!Array.isArray(tagsToSave)) {
        console.warn('Tags is not an array, converting to empty array');
        tagsToSave = [];
      }

      const documentData = {
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        emoji: noteData.emoji || '📝',
        tags: tagsToSave,
        customStyle: JSON.stringify(noteData.customStyle || defaultStyle),
        starred: Boolean(noteData.starred || false),
        userId: noteData.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await databases.createDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        ID.unique(),
        documentData
      );
    } catch (error) {
      console.error('Create note error:', error);
      throw error;
    }
  }

  // Get user's notes
  async getUserNotes(userId) {
    try {
      console.log('Fetching notes for user:', userId);
      const result = await databases.listDocuments(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderDesc('updatedAt')
        ]
      );
      console.log('Notes fetched successfully:', result.documents.length, 'notes found');
      
      // Parse data for each note
      result.documents = result.documents.map(note => this.parseNoteData(note));
      
      return result;
    } catch (error) {
      console.error('Get user notes error:', error);
      throw error;
    }
  }

  // Get single note
  async getNote(noteId) {
    try {
      console.log('Fetching note with ID:', noteId);
      const note = await databases.getDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId
      );
      console.log('Note fetched successfully:', note);
      
      return this.parseNoteData(note);
    } catch (error) {
      console.error('Get note error:', error);
      if (error.message?.includes('Document with the requested ID could not be found')) {
        throw new Error(`Note not found. The note may have been deleted or you don't have permission to access it.`);
      }
      throw error;
    }
  }

  // Update note
  async updateNote(noteId, noteData) {
    try {
      const updateData = {
        ...noteData,
        updatedAt: new Date().toISOString()
      };

      // Stringify customStyle if it exists and is an object
      if (updateData.customStyle && typeof updateData.customStyle === 'object') {
        updateData.customStyle = JSON.stringify(updateData.customStyle);
      }

      // Ensure tags is properly handled
      if (updateData.tags !== undefined) {
        let tagsToSave = updateData.tags;
        
        if (typeof tagsToSave === 'string') {
          try {
            const parsed = JSON.parse(tagsToSave);
            if (Array.isArray(parsed)) {
              tagsToSave = parsed;
            } else {
              console.warn('Parsed tags is not an array, converting to empty array');
              tagsToSave = [];
            }
          } catch (e) {
            console.warn('Tags is a string but not valid JSON, treating as empty array');
            tagsToSave = [];
          }
        }
        
        if (!Array.isArray(tagsToSave)) {
          console.warn('Tags is not an array, converting to empty array');
          tagsToSave = [];
        }
        
        updateData.tags = tagsToSave;
      }

      // Convert starred to boolean if it exists
      if (updateData.hasOwnProperty('starred')) {
        updateData.starred = Boolean(updateData.starred);
      }

      return await databases.updateDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId,
        updateData
      );
    } catch (error) {
      console.error('Update note error:', error);
      throw error;
    }
  }

  // Delete note
  async deleteNote(noteId) {
    try {
      console.log('Deleting note with ID:', noteId);
      const result = await databases.deleteDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId
      );
      console.log('Note deleted successfully:', noteId);
      return result;
    } catch (error) {
      console.error('Delete note error:', error);
      throw error;
    }
  }

  // Toggle star status
  async toggleStar(noteId, starred) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId,
        { 
          starred: Boolean(starred),
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Toggle star error:', error);
      throw error;
    }
  }

  // Parse note data for proper display
  parseNoteData(note) {
    // Parse customStyle from string to object
    if (note.customStyle && typeof note.customStyle === 'string') {
      try {
        note.customStyle = JSON.parse(note.customStyle);
      } catch (parseError) {
        console.warn('Failed to parse customStyle for note', note.$id, parseError);
        note.customStyle = {
          backgroundColor: '#1e3a8a',
          textColor: '#ffffff',
          fontSize: '16px',
          fontFamily: 'Inter, sans-serif'
        };
      }
    }
    
    // Parse tags - handle both string (legacy) and array (new) formats
    if (note.tags) {
      if (typeof note.tags === 'string') {
        try {
          note.tags = JSON.parse(note.tags);
        } catch (parseError) {
          console.warn('Failed to parse tags for note', note.$id, parseError);
          note.tags = [];
        }
      } else if (!Array.isArray(note.tags)) {
        console.warn('Tags is not an array or string for note', note.$id);
        note.tags = [];
      }
    } else {
      note.tags = [];
    }
    
    // Convert starred from string to boolean if needed
    if (typeof note.starred === 'string') {
      note.starred = note.starred === 'true';
    }
    
    return note;
  }

  // Search notes
  async searchNotes(userId, searchTerm) {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.search('title', searchTerm),
          Query.orderDesc('updatedAt')
        ]
      );
      
      result.documents = result.documents.map(note => this.parseNoteData(note));
      
      return result;
    } catch (error) {
      console.error('Search notes error:', error);
      throw error;
    }
  }

  // Get notes by tag
  async getNotesByTag(userId, tag) {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.search('tags', tag),
          Query.orderDesc('updatedAt')
        ]
      );
      
      result.documents = result.documents.map(note => this.parseNoteData(note));
      
      return result;
    } catch (error) {
      console.error('Get notes by tag error:', error);
      throw error;
    }
  }

  // Generate a unique share token for a note (supports multiple links)
  async generateShareToken(noteId, linkName = null) {
    try {
      // Generate a unique share token
      const shareToken = ID.unique();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days
      
      // Get existing note to check current share links
      const note = await databases.getDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
      
      // Parse existing share links or create new array
      let shareLinks = [];
      if (note.shareLinks) {
        if (Array.isArray(note.shareLinks)) {
          // Array of JSON strings (new format)
          shareLinks = note.shareLinks.map(linkStr => {
            try {
              return typeof linkStr === 'string' ? JSON.parse(linkStr) : linkStr;
            } catch (e) {
              return null;
            }
          }).filter(link => link !== null);
        } else if (typeof note.shareLinks === 'string') {
          // JSON string (legacy format)
          try {
            shareLinks = JSON.parse(note.shareLinks);
          } catch (e) {
            shareLinks = [];
          }
        }
      }

      // Create new share link object
      const newShareLink = {
        token: shareToken,
        name: linkName || `Share Link ${shareLinks.length + 1}`,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        clicks: 0
      };

      // Add new share link to array
      shareLinks.push(newShareLink);
      
      // Update the note with share information (store as array of JSON strings)
      await databases.updateDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId,
        {
          shareLinks: shareLinks.map(link => JSON.stringify(link)), // Store as array of JSON strings
          isShared: true,
          sharedAt: new Date().toISOString()
        }
      );
      
      return {
        shareToken,
        shareUrl: `${window.location.origin}/shared/${shareToken}`,
        shareLinks
      };
    } catch (error) {
      console.error('Generate share token error:', error);
      throw error;
    }
  }

  // Get shared note by token (public access)
  async getSharedNote(shareToken) {
    try {
      // First try to find by old shareToken field for backward compatibility
      let result = await databases.listDocuments(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        [
          Query.equal('shareToken', shareToken),
          Query.equal('isShared', true)
        ]
      );
      
      let note = null;
      let shareLink = null;

      if (result.documents.length > 0) {
        // Found using old structure
        note = result.documents[0];
        if (note.shareExpiresAt && new Date(note.shareExpiresAt) < new Date()) {
          throw new Error('Shared note link has expired');
        }
      } else {
        // Search in shareLinks for new structure
        const allSharedNotes = await databases.listDocuments(
          DATABASE_ID,
          NOTES_COLLECTION_ID,
          [Query.equal('isShared', true)]
        );

        for (const doc of allSharedNotes.documents) {
          if (doc.shareLinks) {
            let shareLinks = [];
            
            if (Array.isArray(doc.shareLinks)) {
              // Array of JSON strings (new format)
              shareLinks = doc.shareLinks.map(linkStr => {
                try {
                  return typeof linkStr === 'string' ? JSON.parse(linkStr) : linkStr;
                } catch (e) {
                  return null;
                }
              }).filter(link => link !== null);
            } else if (typeof doc.shareLinks === 'string') {
              // JSON string (legacy format)
              try {
                shareLinks = JSON.parse(doc.shareLinks);
              } catch (e) {
                continue;
              }
            } else {
              continue;
            }
            
            shareLink = shareLinks.find(link => 
              link.token === shareToken && 
              link.isActive && 
              new Date(link.expiresAt) > new Date()
            );
            
            if (shareLink) {
              note = doc;
              // Update click count
              shareLink.clicks = (shareLink.clicks || 0) + 1;
              const updatedLinks = shareLinks.map(link => 
                link.token === shareToken ? shareLink : link
              );
              await databases.updateDocument(
                DATABASE_ID,
                NOTES_COLLECTION_ID,
                doc.$id,
                { shareLinks: updatedLinks.map(link => JSON.stringify(link)) } // Store as array of JSON strings
              );
              break;
            }
          }
        }
      }
      
      if (!note) {
        throw new Error('Shared note not found or has been revoked');
      }
      
      return this.parseNoteData(note);
    } catch (error) {
      console.error('Get shared note error:', error);
      throw error;
    }
  }

  // Revoke sharing for a note (revokes all links)
  async revokeSharing(noteId) {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId,
        {
          shareToken: null,
          isShared: false,
          sharedAt: null,
          shareExpiresAt: null,
          shareLinks: null
        }
      );
    } catch (error) {
      console.error('Revoke sharing error:', error);
      throw error;
    }
  }

  // Revoke a specific share link
  async revokeShareLink(noteId, shareToken) {
    try {
      const note = await databases.getDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
      
      if (note.shareLinks) {
        let shareLinks = [];
        
        if (Array.isArray(note.shareLinks)) {
          // Array of JSON strings (new format)
          shareLinks = note.shareLinks.map(linkStr => {
            try {
              return typeof linkStr === 'string' ? JSON.parse(linkStr) : linkStr;
            } catch (e) {
              return null;
            }
          }).filter(link => link !== null);
        } else if (typeof note.shareLinks === 'string') {
          try {
            shareLinks = JSON.parse(note.shareLinks);
          } catch (e) {
            shareLinks = [];
          }
        }
        
        const updatedLinks = shareLinks.map(link => 
          link.token === shareToken ? { ...link, isActive: false } : link
        );
        
        // Check if any links are still active
        const hasActiveLinks = updatedLinks.some(link => link.isActive);
        
        await databases.updateDocument(
          DATABASE_ID,
          NOTES_COLLECTION_ID,
          noteId,
          {
            shareLinks: updatedLinks.map(link => JSON.stringify(link)), // Store as array of JSON strings
            isShared: hasActiveLinks
          }
        );
      }
    } catch (error) {
      console.error('Revoke share link error:', error);
      throw error;
    }
  }

  // Get all share links for a note
  async getShareLinks(noteId) {
    try {
      const note = await databases.getDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
      
      if (!note.shareLinks) {
        return [];
      }
      
      let shareLinks = [];
      
      if (Array.isArray(note.shareLinks)) {
        // Array of JSON strings (new format)
        shareLinks = note.shareLinks.map(linkStr => {
          try {
            return typeof linkStr === 'string' ? JSON.parse(linkStr) : linkStr;
          } catch (e) {
            return null;
          }
        }).filter(link => link !== null);
      } else if (typeof note.shareLinks === 'string') {
        try {
          shareLinks = JSON.parse(note.shareLinks);
        } catch (e) {
          return [];
        }
      }
      
      return shareLinks.map(link => ({
        ...link,
        shareUrl: `${window.location.origin}/shared/${link.token}`,
        isExpired: new Date(link.expiresAt) < new Date()
      }));
    } catch (error) {
      console.error('Get share links error:', error);
      throw error;
    }
  }

  // Update share link name
  async updateShareLinkName(noteId, shareToken, newName) {
    try {
      const note = await databases.getDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
      
      if (note.shareLinks) {
        let shareLinks = [];
        
        if (Array.isArray(note.shareLinks)) {
          // Array of JSON strings (new format)
          shareLinks = note.shareLinks.map(linkStr => {
            try {
              return typeof linkStr === 'string' ? JSON.parse(linkStr) : linkStr;
            } catch (e) {
              return null;
            }
          }).filter(link => link !== null);
        } else if (typeof note.shareLinks === 'string') {
          try {
            shareLinks = JSON.parse(note.shareLinks);
          } catch (e) {
            return;
          }
        }
        
        const updatedLinks = shareLinks.map(link => 
          link.token === shareToken ? { ...link, name: newName } : link
        );
        
        await databases.updateDocument(
          DATABASE_ID,
          NOTES_COLLECTION_ID,
          noteId,
          {
            shareLinks: updatedLinks.map(link => JSON.stringify(link)) // Store as array of JSON strings
          }
        );
      }
    } catch (error) {
      console.error('Update share link name error:', error);
      throw error;
    }
  }

  // Get user info for shared note (minimal info for display)
  async getCreatorInfo(userId) {
    try {
      return await userService.getPublicUserInfo(userId);
    } catch (error) {
      console.error('Get creator info error:', error);
      return {
        name: 'Scribly User',
        avatar: null
      };
    }
  }
}

export default new NotesService();
