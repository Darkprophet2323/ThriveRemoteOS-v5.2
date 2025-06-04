import React, { createContext, useContext, useRef } from 'react';

// Sound Manager Context for luxury sound effects
const SoundContext = createContext();

export const useSounds = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSounds must be used within a SoundProvider');
  }
  return context;
};

export const SoundProvider = ({ children }) => {
  // Create audio objects for different sound effects
  const sounds = useRef({
    windowOpen: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewgFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewgFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsF'),
    windowClose: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewgFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewgFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsF'),
    click: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewgFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewgFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsF'),
    hover: new Audio('data:audio/wav;base64,UklGRj4DAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRoDAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewgFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewgFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsF'),
    success: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewgFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewgFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsFIXi/8N2QQAoUXrTp66hVFApGn+DyvmAcBjiS2e/NewsF')
  });

  // Set volume levels for all sounds
  Object.values(sounds.current).forEach(sound => {
    sound.volume = 0.3; // Subtle volume for luxury experience
  });

  const playSound = (soundType) => {
    try {
      const sound = sounds.current[soundType];
      if (sound) {
        sound.currentTime = 0; // Reset to beginning
        sound.play().catch(() => {
          // Silently handle autoplay restrictions
        });
      }
    } catch (error) {
      // Silently handle any audio errors
    }
  };

  const soundAPI = {
    playWindowOpen: () => playSound('windowOpen'),
    playWindowClose: () => playSound('windowClose'),
    playClick: () => playSound('click'),
    playHover: () => playSound('hover'),
    playSuccess: () => playSound('success'),
  };

  return (
    <SoundContext.Provider value={soundAPI}>
      {children}
    </SoundContext.Provider>
  );
};

export default SoundProvider;