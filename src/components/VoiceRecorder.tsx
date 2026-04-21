import React, { useEffect, useRef, useState } from 'react';

type VoiceRecorderProps = {
  eventId: number;
};

export default function VoiceRecorder({ eventId }: VoiceRecorderProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

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
      setListening(false);
      setStatus('Stopped listening.');
    };

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
    if (!rec) {
      setStatus('SpeechRecognition not available.');
      return;
    }
    try {
      rec.start();
      setListening(true);
      setStatus('Listening...');
    } catch (err) {
      console.error('Failed to start recognition', err);
      setStatus('Failed to start recognition.');
    }
  };

  const stopListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
      setListening(false);
      setStatus('Stopped (click Summarize to save).');
    } catch (err) {
      console.error('Failed to stop recognition', err);
      setStatus('Failed to stop recognition.');
    }
  };

  const saveSummary = async () => {
    setStatus('Summarizing and saving...');
    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ eventId, transcript })
      });

      const body = await res.json();
      if (!res.ok) {
        setStatus('Save failed: ' + (body.error || res.statusText));
        return;
      }

      setStatus('Saved summary.');
    } catch (err) {
      console.error(err);
      setStatus('Network or server error while saving.');
    }
  };

  return (
    <div className="voice-recorder">
      <div style={{ marginBottom: 8 }}>
        <button onClick={startListening} disabled={listening}>Start</button>
        <button onClick={stopListening} disabled={!listening}>Stop</button>
        <button onClick={saveSummary} disabled={!transcript}>Summarize & Save</button>
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
        />
      </div>
    </div>
  );
}