import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from '@wavesurfer/react';

const RealTimeAudioVisualizer = () => {
  const [audioData, setAudioData] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const wavesurferRef = useRef('');

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (e) => {
        const audioBlob = new Blob([e.data], { type: 'audio/wav' });
        setAudioData(audioBlob); // Set audio blob for visualizer
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('Please allow microphone access');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    if (audioStream) {
    audioStream.getTracks().forEach((track: MediaStreamTrack) => track.stop()); // Stop audio tracks
    }
  };

  // Handle the update of waveform when new data comes in
  useEffect(() => {
    if (audioData && wavesurferRef.current) {
      // Load the new audio data to WaveSurfer
      wavesurferRef.current = (URL.createObjectURL(audioData));
    }
  }, [audioData]);

  return (
    <div>
      <h1>Real-Time Audio Visualizer</h1>

      <div>
        {isRecording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
      </div>

      {/* WaveSurfer component to visualize audio */}
      <div>
        <WaveSurfer
          ref={wavesurferRef}
          audioFile={audioData}
          options={{
            waveColor: 'violet',
            progressColor: 'purple',
            height: 150,
            responsive: true,
            barWidth: 2,
          }}
        />
      </div>
    </div>
  );
};

export default RealTimeAudioVisualizer;
