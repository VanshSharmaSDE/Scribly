// Common emoji categories for note taking
export const emojiCategories = {
  work: ['💼', '📊', '📈', '💻', '📝', '📋', '🎯', '⚡', '🔥', '💡'],
  personal: ['🏠', '💝', '🌟', '❤️', '😊', '🎉', '🌈', '☀️', '🌸', '🦋'],
  learning: ['📚', '🎓', '📖', '✏️', '🔬', '🧠', '💭', '🤔', '💡', '📝'],
  creative: ['🎨', '🖌️', '✨', '🌟', '🎭', '🎪', '🎨', '🎵', '📸', '✍️'],
  travel: ['✈️', '🌍', '🗺️', '🎒', '📍', '🏝️', '🌅', '🗾', '🚗', '🎫'],
  food: ['🍕', '☕', '🍰', '🥗', '🍜', '🍪', '🥐', '🍓', '🥑', '🍷'],
  fitness: ['💪', '🏃‍♂️', '🧘‍♀️', '🏋️‍♂️', '🚴‍♂️', '⚽', '🏊‍♂️', '🥾', '🎾', '🏆'],
  mood: ['😊', '😍', '🤗', '😴', '🤨', '😎', '🥳', '😔', '🤯', '🙃']
};

// Get random emoji from category
export const getRandomEmoji = (category = 'work') => {
  const emojis = emojiCategories[category] || emojiCategories.work;
  return emojis[Math.floor(Math.random() * emojis.length)];
};

// Get all emojis as flat array
export const getAllEmojis = () => {
  return Object.values(emojiCategories).flat();
};

// Search emojis by category or content
export const searchEmojis = (query) => {
  if (!query) return getAllEmojis().slice(0, 20);
  
  const lowerQuery = query.toLowerCase();
  const matchedCategories = Object.keys(emojiCategories).filter(category =>
    category.includes(lowerQuery)
  );
  
  if (matchedCategories.length > 0) {
    return matchedCategories.flatMap(category => emojiCategories[category]);
  }
  
  return getAllEmojis().slice(0, 20);
};
