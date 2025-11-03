/**
 * Audio Utilities
 * Handles MediaRecorder setup, audio recording, and MP3 conversion
 */

// Import @breezystack/lamejs - ES module compatible fork of lamejs
// This version properly exports all internal dependencies (MPEGMode, etc.)
import * as lamejs from '@breezystack/lamejs';

/**
 * Check if MediaRecorder API is supported
 * @returns {boolean} True if MediaRecorder is supported
 */
export function isMediaRecorderSupported() {
  return typeof MediaRecorder !== 'undefined' && 
         typeof navigator.mediaDevices !== 'undefined' &&
         typeof navigator.mediaDevices.getUserMedia !== 'undefined';
}

/**
 * Request microphone access
 * @returns {Promise<MediaStream>} MediaStream from microphone
 */
export async function requestMicrophoneAccess() {
  if (!isMediaRecorderSupported()) {
    throw new Error('MediaRecorder API is not supported in this browser');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('Microphone access denied. Please allow microphone access in your browser settings.');
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('No microphone found. Please connect a microphone and try again.');
    } else {
      throw new Error(`Failed to access microphone: ${error.message}`);
    }
  }
}

/**
 * Start recording audio from MediaStream
 * @param {MediaStream} stream - MediaStream from microphone
 * @param {Function} onDataAvailable - Callback when data is available
 * @returns {MediaRecorder} MediaRecorder instance
 */
export function startRecording(stream, onDataAvailable) {
  if (!isMediaRecorderSupported()) {
    throw new Error('MediaRecorder API is not supported in this browser');
  }

  // Determine MIME type based on browser support
  let mimeType = 'audio/webm'; // Default for Chrome/Firefox
  if (MediaRecorder.isTypeSupported('audio/mp4')) {
    mimeType = 'audio/mp4'; // Safari
  } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    mimeType = 'audio/webm;codecs=opus'; // Better quality for Chrome/Firefox
  }

  const options = {
    mimeType: mimeType,
    audioBitsPerSecond: 128000 // 128 kbps for better quality before conversion
  };

  const mediaRecorder = new MediaRecorder(stream, options);
  const chunks = [];

  // Store chunks on the recorder instance for access in stopRecording
  mediaRecorder.chunks = chunks;

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
      if (onDataAvailable) {
        onDataAvailable(event.data);
      }
    }
  };

  mediaRecorder.start(1000); // Collect data every second

  return mediaRecorder;
}

/**
 * Stop recording and get audio Blob
 * @param {MediaRecorder} mediaRecorder - MediaRecorder instance
 * @returns {Promise<Blob>} Recorded audio as Blob (native format: WebM/AAC)
 */
export async function stopRecording(mediaRecorder) {
  return new Promise((resolve, reject) => {
    // Get chunks from recorder instance (set in startRecording)
    const chunks = mediaRecorder.chunks || [];
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
      resolve(blob);
    };

    mediaRecorder.onerror = (error) => {
      reject(new Error(`Recording error: ${error.error?.message || error.error || 'Unknown error'}`));
    };

    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    } else if (mediaRecorder.state === 'inactive' && chunks.length > 0) {
      // Already stopped, create blob from existing chunks
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
      resolve(blob);
    } else {
      reject(new Error('MediaRecorder is not in a valid state to stop'));
    }
  });
}

/**
 * Convert audio Blob to MP3 format using Web Audio API and lamejs
 * @param {Blob} audioBlob - Recorded audio Blob (WebM/AAC format)
 * @param {Object} options - Conversion options (bitrate: 64-96, default: 64)
 * @returns {Promise<Blob>} MP3 audio Blob
 */
export async function convertToMP3(audioBlob, options = { bitrate: 64 }) {
  try {
    // Use statically imported lamejs (ensures all dependencies are bundled)
    const Mp3Encoder = lamejs.Mp3Encoder;
    
    if (!Mp3Encoder) {
      console.error('lamejs module structure:', lamejs);
      console.error('Available keys:', Object.keys(lamejs || {}));
      throw new Error('Mp3Encoder not found in @breezystack/lamejs module. Ensure @breezystack/lamejs is installed.');
    }

    // Use Web Audio API to decode audio to PCM
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get audio data
    const sampleRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;
    
    // Handle multi-channel audio by mixing to mono if needed
    let samples;
    if (numChannels === 1) {
      samples = audioBuffer.getChannelData(0);
    } else {
      // Mix multiple channels to mono
      const channelData = [];
      for (let i = 0; i < numChannels; i++) {
        channelData.push(audioBuffer.getChannelData(i));
      }
      samples = new Float32Array(channelData[0].length);
      for (let i = 0; i < samples.length; i++) {
        let sum = 0;
        for (let j = 0; j < numChannels; j++) {
          sum += channelData[j][i];
        }
        samples[i] = sum / numChannels;
      }
    }

    // Convert float32 to int16 PCM
    const pcmData = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      // Clamp and convert to int16
      const s = Math.max(-1, Math.min(1, samples[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Create MP3 encoder (always use mono for voice recordings)
    const bitrate = options.bitrate || 64;
    const kbps = bitrate; // kilobits per second
    const mp3Encoder = new Mp3Encoder(1, sampleRate, kbps); // Always mono for voice
    const sampleBlockSize = 1152; // MP3 frame size

    const mp3Data = [];

    // Encode in blocks
    for (let i = 0; i < pcmData.length; i += sampleBlockSize) {
      const sampleChunk = pcmData.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    // Flush remaining data
    const mp3buf = mp3Encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    // Create MP3 Blob
    const mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });
    return mp3Blob;
  } catch (error) {
    console.error('Error converting to MP3:', error);
    throw new Error(`Failed to convert audio to MP3: ${error.message}`);
  }
}

/**
 * Calculate audio duration from Blob
 * @param {Blob} audioBlob - Audio Blob
 * @returns {Promise<number>} Duration in seconds
 */
export async function getAudioDuration(audioBlob) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(audioBlob);
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });

    audio.addEventListener('error', (error) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load audio: ${error.message || 'Unknown error'}`));
    });

    audio.src = url;
  });
}

