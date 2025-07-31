import { useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const useAutoSave = (content, saveFunction, dependencies = []) => {
  const { autoSaveEnabled, autoSaveInterval } = useSettings();
  const timeoutRef = useRef(null);
  const lastSavedContentRef = useRef(content);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only auto-save if enabled and content has changed
    if (autoSaveEnabled && content !== lastSavedContentRef.current && content.trim() !== '') {
      timeoutRef.current = setTimeout(async () => {
        try {
          await saveFunction();
          lastSavedContentRef.current = content;

        } catch (error) {

        }
      }, autoSaveInterval * 1000);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, autoSaveEnabled, autoSaveInterval, saveFunction, ...dependencies]);

  // Update last saved content when content is manually saved
  const updateLastSavedContent = (newContent) => {
    lastSavedContentRef.current = newContent;
  };

  return { updateLastSavedContent };
};

