import React, { useEffect, useRef, useState } from 'react';

// Extend Window interface to include custom functions
declare global {
  interface Window {
    appendTranscriptToNotes?: (transcript: string, summary: string) => void;
  }
}

type VoiceRecorderProps = {
  eventId: string | null;
};

export default function VoiceRecorder({ eventId }: VoiceRecorderProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<string>('Idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isManuallyStopped = useRef(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('SpeechRecognition API not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setListening(true);
      setStatus('Listening...');
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: any) => {
      let full = '';
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full);
      setStatus(`Listening... (${full.length} chars)`);
    };

    recognition.onerror = (e: any) => {
      console.error('SpeechRecognition error:', e.error);
      setStatus(`Error: ${e.error || 'Unknown error'}`);
      setListening(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      if (!isManuallyStopped.current) {
        // Auto-restart if not manually stopped
        try {
          recognition.start();
        } catch (error) {
          console.warn('Failed to auto-restart:', error);
          setListening(false);
          setStatus('Stopped');
        }
      } else {
        setListening(false);
        setStatus('Stopped');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  const requestMicrophone = async (): Promise<boolean> => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      setStatus('Microphone access granted');
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setStatus('Microphone permission denied');
      return false;
    }
  };

  const startListening = async () => {
    const hasPermission = await requestMicrophone();
    if (!hasPermission) return;

    const rec = recognitionRef.current;
    if (!rec) return;

    isManuallyStopped.current = false;
    setTranscript('');

    try {
      rec.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setStatus('Failed to start');
    }
  };

  const stopListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;

    isManuallyStopped.current = true;

    try {
      rec.stop();
    } catch (err) {
      console.error('Failed to stop recognition:', err);
      setStatus('Failed to stop');
    }
  };

  const submitTranscript = async () => {
    if (!transcript.trim()) {
      alert('No transcript to submit');
      return;
    }

    if (!eventId) {
      alert('Event ID is missing');
      return;
    }

    setIsSubmitting(true);
    setStatus('Processing transcript...');

    try {
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: Number(eventId),
          transcript: transcript
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process transcript');
      }

      const data = await response.json();
      console.log('Transcript processed:', data);

      // Append to notes via parent window function
      if (window.appendTranscriptToNotes) {
        window.appendTranscriptToNotes(transcript, data.summary);
        setStatus('Transcript appended to notes');
        setTranscript('');
      } else {
        console.warn('appendTranscriptToNotes function not found on window');
        setStatus('Could not append to notes');
      }
    } catch (err: any) {
      console.error('Error submitting transcript:', err);
      setStatus(`Error: ${err.message}`);
      alert(`Failed to process transcript: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setStatus('Idle');
  };

  return (
    <div className="voice-recorder" style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
        <button 
          onClick={startListening} 
          disabled={listening || isSubmitting}
          style={{ padding: '8px 16px', cursor: listening ? 'not-allowed' : 'pointer' }}
        >
          Start Recording
        </button>
        <button 
          onClick={stopListening} 
          disabled={!listening || isSubmitting}
          style={{ padding: '8px 16px', cursor: !listening ? 'not-allowed' : 'pointer', backgroundColor: '#ff6b6b', color: 'white' }}
        >
          Stop Recording
        </button>
        <button 
          onClick={clearTranscript}
          disabled={!transcript || isSubmitting}
          style={{ padding: '8px 16px', cursor: !transcript ? 'not-allowed' : 'pointer' }}
        >
          Clear
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Status:</strong> 
        <span style={{ marginLeft: '8px', color: status.includes('Error') ? 'red' : 'green' }}>
          {status}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label><strong>Transcript ({transcript.length} characters)</strong></label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={6}
          style={{ width: '100%', padding: '8px', fontFamily: 'monospace' }}
          placeholder="Auto-dictation will appear here..."
        />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={submitTranscript}
          disabled={!transcript.trim() || isSubmitting || !eventId}
          style={{
            padding: '8px 16px',
            backgroundColor: '#13aa81',
            color: 'white',
            cursor: !transcript.trim() || isSubmitting ? 'not-allowed' : 'pointer',
            opacity: !transcript.trim() || isSubmitting ? 0.5 : 1
          }}
        >
          {isSubmitting ? 'Processing...' : 'Submit & Summarize'}
        </button>
      </div>

      {transcript && !eventId && (
        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#ffe5e5', borderRadius: '4px', color: 'red' }}>
          Event ID is missing. Cannot submit transcript.
        </div>
      )}
    </div>
  );
}