/**
 * AudioPlayer component
 * Displays a play button for audio pronunciation
 * Used in study mode to hear word pronunciations
 * Auto-stops when audio finishes playing
 */

import { useState, useRef, useEffect } from 'react';
import './AudioPlayer.css';

export default function AudioPlayer({ audioUrl, label = 'Listen' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  const handlePlay = async (e) => {
    // Prevent event from bubbling up to parent (prevents card flip)
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (!audioUrl) {
      setError('No audio available');
      return;
    }

    try {
      setError('');
      
      if (audioRef.current) {
        // If already playing, stop it first
        if (isPlaying) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
          return;
        }

        // Set source and play
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setError(err.message || 'Failed to play audio');
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = (e) => {
    console.error('Audio playback error:', e);
    setError('Failed to load audio');
    setIsPlaying(false);
  };

  if (!audioUrl) {
    return null; // Don't render if no audio URL
  }

  return (
    <div className="audio-player">
      <button
        type="button"
        className={`btn-audio-play ${isPlaying ? 'playing' : ''}`}
        onClick={handlePlay}
        aria-label={`${label} - ${isPlaying ? 'Stop' : 'Play'} pronunciation`}
        title={isPlaying ? 'Stop audio' : 'Play pronunciation'}
      >
        {isPlaying ? (
          <>
            <span className="audio-icon">⏸</span>
            <span>Stop</span>
          </>
        ) : (
          <>
            <span className="audio-icon">▶</span>
            <span>{label}</span>
          </>
        )}
      </button>
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onError={handleError}
        preload="none"
      />
      {error && (
        <span className="audio-player-error" aria-live="polite">
          {error}
        </span>
      )}
    </div>
  );
}
