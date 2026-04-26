import React, { useEffect, useRef, useState } from 'react';

type VoiceRecorderProps = {
  eventId: number;
};

export default function VoiceRecorder({ eventId }: VoiceRecorderProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isManuallyStopped = useRef(false);
  const isStarting = useRef(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let full = '';
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full);
    };

    recognition.onerror = (e: any) => {
      console.error('SpeechRecognition error', e);
      setStatus('Microphone error: ' + (e.error || 'unknown'));
      setListening(false);
    };

    recognition.onend = () => {
      if (isStarting.current) return;

      if (isManuallyStopped.current) {
          setListening(false);
          setStatus('Stopped listening');
          return;
      }

      try {
          recognition.start();
          setStatus('Restarting...');
      } catch (error) {
          console.warn('Restart failed: ', error);
      }
    };

    recognition.onstart = () => {
        isStarting.current = false;
        setListening(true);
        setStatus('Starting...');
    }

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  const requestMicrophone = async () => {
    try {
      // explicit permission prompt before using SpeechRecognition (some browsers require getUserMedia permission)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      setStatus('Microphone access granted.');
      return true;
    } catch (err) {
      console.error('Microphone permission denied', err);
      setStatus('Microphone permission denied.');
      return false;
    }
  };

  const startListening = async () => {
    const ok = await requestMicrophone();
    if (!ok) return;

    const rec = recognitionRef.current;
    if (!rec) return;

    isManuallyStopped.current = false;
    isStarting.current = true;

    try {
      rec.start();
      setStatus('Starting...');
    } catch (err) {
      console.error('Failed to start recognition', err);
      setStatus('Failed to start recognition.');
    }
  };

  const stopListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;

    isManuallyStopped.current = true;

    try {
      rec.stop();
    } catch (err) {
      console.error('Failed to stop recognition', err);
      setStatus('Failed to stop recognition.');
    }
  };

  // Moved summary save and notes save to the same function in notes.astro

  return (
    <div className="voice-recorder">
      <div style={{ marginBottom: 8 }}>
        <button onClick={startListening} disabled={listening}>Start</button>
        <button onClick={stopListening} disabled={!listening}>Stop</button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>Status:</strong> {status || 'Idle'}
      </div>

      <div>
        <label><strong>Transcript</strong></label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={8}
          style={{ width: '100%' }}
          readOnly={true}
          placeholder={"Auto-dictation will start here..."}
        />
      </div>
    </div>
  );
}