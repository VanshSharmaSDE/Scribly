import { databases, DATABASE_ID, NOTES_COLLECTION_ID, ID } from '../lib/appwrite';
import { Query } from 'appwrite';

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
}

export default new NotesService();
