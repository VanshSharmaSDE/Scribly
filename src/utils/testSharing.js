// Database setup test utility
// Run this in browser console after adding the database attributes

import notesService from './src/services/notesService.js';

// Test sharing functionality
window.testSharing = async () => {
  try {

    // Get a sample note (replace with actual note ID)
    const notes = await notesService.getNotes('your-user-id', { page: 1, limit: 1 });
    
    if (notes.documents.length === 0) {

      return;
    }
    
    const note = notes.documents[0];

    // Test share token generation
    const shareToken = await notesService.generateShareToken(note.$id);

    // Test getting shared note
    const sharedNote = await notesService.getSharedNote(shareToken);

    // Test share URL
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;

    // Test revoking
    await notesService.revokeSharing(note.$id);

  } catch (error) {

    if (error.message.includes('shareToken')) {

    }
  }
};

// Automatically expose to window for easy testing
window.testSharing = testSharing;

