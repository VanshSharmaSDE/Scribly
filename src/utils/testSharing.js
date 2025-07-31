// Database setup test utility
// Run this in browser console after adding the database attributes

import notesService from './src/services/notesService.js';

// Test sharing functionality
window.testSharing = async () => {
  try {
    console.log('🧪 Testing sharing functionality...');
    
    // Get a sample note (replace with actual note ID)
    const notes = await notesService.getNotes('your-user-id', { page: 1, limit: 1 });
    
    if (notes.documents.length === 0) {
      console.log('❌ No notes found. Create a note first.');
      return;
    }
    
    const note = notes.documents[0];
    console.log('📝 Testing with note:', note.title);
    
    // Test share token generation
    const shareToken = await notesService.generateShareToken(note.$id);
    console.log('🔗 Share token generated:', shareToken);
    
    // Test getting shared note
    const sharedNote = await notesService.getSharedNote(shareToken);
    console.log('✅ Shared note retrieved:', sharedNote.title);
    
    // Test share URL
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;
    console.log('🌐 Share URL:', shareUrl);
    
    // Test revoking
    await notesService.revokeSharing(note.$id);
    console.log('🚫 Sharing revoked successfully');
    
    console.log('✅ All sharing tests passed!');
    
  } catch (error) {
    console.error('❌ Sharing test failed:', error);
    
    if (error.message.includes('shareToken')) {
      console.log('💡 Tip: Make sure you\'ve added the database attributes mentioned in DATABASE_SETUP.md');
    }
  }
};

console.log('🚀 Sharing test utility loaded. Run window.testSharing() to test.');
