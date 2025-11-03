/**
 * AudioRecorder component
 * Allows admins to record pronunciation audio for flashcards
 * Features:
 * - Start/stop recording
 * - Preview playback with "Use", "Re-record", "Cancel" options
 * - MP3 conversion and upload to Supabase Storage
 * - 30-second maximum duration limit
 */

import { useState, useEffect, useRef } from 'react';
import { 
  isMediaRecorderSupported, 
  requestMicrophoneAccess, 
  startRecording, 
  stopRecording, 
  convertToMP3
} from '../utils/audioUtils.js';
import { uploadAudio, deleteAudio } from '../services/audioService.js';
import './AudioRecorder.css';

const MAX_DURATION = 30; // 30 seconds maximum
const WARNING_DURATION = 25; // Show warning at 25 seconds

export default function AudioRecorder({ onAudioRecorded, onCancel, existingAudioUrl = null }) {
  const [state, setState] = useState(existingAudioUrl ? 'existing' : 'idle'); // idle, recording, preview, uploading, existing
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [previewAudioUrl, setPreviewAudioUrl] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Update state when existingAudioUrl prop changes (e.g., when card loads in EditCardForm)
  useEffect(() => {
    if (existingAudioUrl) {
      // If we have an existing audio URL, show it in 'existing' state
      setAudioUrl(existingAudioUrl);
      if (state !== 'recording' && state !== 'preview' && state !== 'uploading') {
        // Only change state if we're not in the middle of recording/previewing/uploading
        setState('existing');
      }
    } else if (!existingAudioUrl && !audioUrl && state === 'existing') {
      // If existingAudioUrl is removed and we don't have a local audioUrl, go back to idle
      setState('idle');
    }
  }, [existingAudioUrl, audioUrl, state]); // Include all dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (previewAudioUrl) {
        URL.revokeObjectURL(previewAudioUrl);
      }
    };
  }, [previewAudioUrl]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      setError('');
      
      if (!isMediaRecorderSupported()) {
        throw new Error('MediaRecorder API is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      // Request microphone access
      const stream = await requestMicrophoneAccess();
      streamRef.current = stream;

      // Start recording
      const mediaRecorder = startRecording(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Start duration timer
      startTimeRef.current = Date.now();
      setDuration(0);
      setState('recording');

      durationIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDuration(elapsed);

        // Auto-stop at 30 seconds
        if (elapsed >= MAX_DURATION) {
          handleStopRecording();
        }
      }, 100);

    } catch (err) {
      setError(err.message || 'Failed to start recording');
      setState('idle');
    }
  };

  const handleStopRecording = async () => {
    try {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        const blob = await stopRecording(mediaRecorderRef.current);
        setAudioBlob(blob);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Create preview URL
        const url = URL.createObjectURL(blob);
        setPreviewAudioUrl(url);

        setState('preview');
      }
    } catch (err) {
      setError(err.message || 'Failed to stop recording');
      setState('idle');
    }
  };

  const handleUseRecording = async () => {
    if (!audioBlob) return;

    try {
      setError('');
      
      console.log('[AudioRecorder] Starting MP3 conversion...');
      console.log('[AudioRecorder] Audio blob size:', audioBlob.size, 'bytes');
      console.log('[AudioRecorder] Audio blob type:', audioBlob.type);
      
      // Convert to MP3
      const mp3Blob = await convertToMP3(audioBlob, { bitrate: 64 });
      
      console.log('[AudioRecorder] MP3 conversion complete. Size:', mp3Blob.size, 'bytes');
      console.log('[AudioRecorder] MP3 blob type:', mp3Blob.type);
      
      setState('uploading');
      console.log('[AudioRecorder] Starting upload to Supabase...');

      // Upload to Supabase Storage
      const result = await uploadAudio(mp3Blob);
      
      console.log('[AudioRecorder] Upload result:', result);

      if (result.success) {
        console.log('[AudioRecorder] Upload successful. Audio URL:', result.audioUrl);
        
        // Clean up preview URL
        if (previewAudioUrl) {
          URL.revokeObjectURL(previewAudioUrl);
          setPreviewAudioUrl(null);
        }

        // If there was existing audio, delete it
        if (existingAudioUrl) {
          console.log('[AudioRecorder] Deleting old audio:', existingAudioUrl);
          await deleteAudio(existingAudioUrl).catch(err => {
            console.warn('Failed to delete old audio:', err);
            // Don't fail the operation if deletion fails
          });
        }

        // Update state to show the uploaded audio
        setAudioUrl(result.audioUrl);
        setAudioBlob(null); // Clear the blob since we've uploaded it
        
        // Call callback with new audio URL (this updates parent component)
        if (onAudioRecorded) {
          console.log('[AudioRecorder] Calling onAudioRecorded callback');
          onAudioRecorded(result.audioUrl);
        }

        // Transition to existing state to show the uploaded audio
        setState('existing');
      } else {
        throw new Error(result.error || 'Failed to upload audio');
      }
    } catch (err) {
      console.error('[AudioRecorder] Error in handleUseRecording:', err);
      setError(err.message || 'Failed to save recording');
      setState('preview');
    }
  };

  const handleRerecord = () => {
    // Clean up preview
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }
    
    setAudioBlob(null);
    setDuration(0);
    setError('');
    setState('idle');
  };

  const handleDeleteExisting = async () => {
    // Use audioUrl if available (newly uploaded), otherwise use existingAudioUrl prop
    const urlToDelete = audioUrl || existingAudioUrl;
    if (!urlToDelete) return;

    if (!confirm('Are you sure you want to delete this audio recording?')) {
      return;
    }

    try {
      setError('');
      setState('uploading');

      const result = await deleteAudio(urlToDelete);

      if (result.success) {
        // Clear local state
        setAudioUrl(null);
        
        if (onAudioRecorded) {
          onAudioRecorded(null); // Pass null to indicate deletion
        }
        
        // Return to idle state since there's no audio now
        setState('idle');
      } else {
        throw new Error(result.error || 'Failed to delete audio');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete audio');
      setState('existing');
    }
  };

  if (state === 'existing') {
    // Use audioUrl if available (newly uploaded), otherwise use existingAudioUrl prop
    const displayUrl = audioUrl || existingAudioUrl;
    
    return (
      <div className="audio-recorder existing-audio">
        <div className="audio-recorder-header">
          <h3>Pronunciation Audio</h3>
        </div>
        <div className="audio-recorder-content">
          {displayUrl && (
            <audio controls src={displayUrl} className="audio-preview-player">
              Your browser does not support audio playback.
            </audio>
          )}
          <div className="audio-recorder-actions">
            <button 
              type="button"
              className="btn-audio btn-audio-primary"
              onClick={handleStartRecording}
            >
              {displayUrl ? 'Replace Audio' : 'Record Audio'}
            </button>
            {displayUrl && (
              <button 
                type="button"
                className="btn-audio btn-audio-danger"
                onClick={handleDeleteExisting}
              >
                Delete Audio
              </button>
            )}
            {onCancel && (
              <button 
                type="button"
                className="btn-audio btn-audio-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
          {error && <div className="audio-recorder-error">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="audio-recorder">
      <div className="audio-recorder-header">
        <h3>Record Pronunciation Audio</h3>
      </div>
      <div className="audio-recorder-content">
        {state === 'idle' && (
          <div className="audio-recorder-idle">
            <p className="audio-recorder-hint">
              Click "Start Recording" to record pronunciation. Maximum duration: {MAX_DURATION} seconds.
            </p>
            <button 
              type="button"
              className="btn-audio btn-audio-primary"
              onClick={handleStartRecording}
            >
              Start Recording
            </button>
            {onCancel && (
              <button 
                type="button"
                className="btn-audio btn-audio-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {state === 'recording' && (
          <div className="audio-recorder-recording">
            <div className="recording-indicator">
              <div className="recording-dot"></div>
              <span className="recording-duration">
                {formatDuration(duration)}
                {duration >= WARNING_DURATION && (
                  <span className="duration-warning"> (Almost at limit)</span>
                )}
              </span>
            </div>
            <button 
              type="button"
              className="btn-audio btn-audio-danger"
              onClick={handleStopRecording}
            >
              Stop Recording
            </button>
          </div>
        )}

        {state === 'preview' && (
          <div className="audio-recorder-preview">
            <p className="audio-recorder-hint">Preview your recording:</p>
            <audio controls src={previewAudioUrl} className="audio-preview-player">
              Your browser does not support audio playback.
            </audio>
            <div className="audio-recorder-actions">
              <button 
                type="button"
                className="btn-audio btn-audio-primary"
                onClick={handleUseRecording}
              >
                Use This Recording
              </button>
              <button 
                type="button"
                className="btn-audio btn-audio-secondary"
                onClick={handleRerecord}
              >
                Re-record
              </button>
              {onCancel && (
                <button 
                  type="button"
                  className="btn-audio btn-audio-secondary"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {state === 'uploading' && (
          <div className="audio-recorder-uploading">
            <div className="loading-spinner"></div>
            <p>Uploading audio...</p>
          </div>
        )}

        {error && (
          <div className="audio-recorder-error">{error}</div>
        )}
      </div>
    </div>
  );
}
