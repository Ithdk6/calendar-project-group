import React, { useEffect, useRef, useState } from 'react';

export default function VoiceRecorder({ eventId }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Setup SpeechRecognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('no-recognition');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript + ' ';
        else interim += res[0].transcript;
      }
      // Merge interim + final with previous transcript
      setTranscript(prev => (prev + final + interim).trim());
      // Keep textarea updated for legacy page script
      if (window.updateDictation) window.updateDictation((transcript + final + interim).trim());
    };

    recognition.onerror = (ev) => {
      console.error('SpeechRecognition error:', ev);
      setStatus('error');
    };

    recognition.onend = () => {
      // If we stopped deliberately, do nothing; otherwise try to restart while listening
      if (listening && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // ignore restart issues
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
        recognitionRef.current = null;
      } catch { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestMicPermission = async () => {
    try {
      setStatus('requesting-permission');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // permission prompt appears and is handled by browser
      setStatus('permission-granted');
      return true;
    } catch (err) {
      console.error('Microphone permission denied', err);
      setStatus('permission-denied');
      return false;
    }
  };

  const startRecording = async () => {
    if (!recognitionRef.current) {
      setStatus('no-recognition');
      return;
    }

    const allowed = await requestMicPermission();
    if (!allowed) return;

    try {
      recognitionRef.current.start();
      setListening(true);
      setStatus('listening');
    } catch (err) {
      console.error('Failed to start recognition', err);
      setStatus('error');
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping recognition', err);
      }
    }
    setListening(false);
    setStatus('stopped');

    // Summarize transcript and send to server
    const summary = summarizeText(transcript || '');
    try {
      const payload = {
        commandId: crypto.randomUUID(),
        payload: {
          eventId: Number(eventId || 0),
          summary
        }
      };

      const res = await fetch('/api/save_summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!res.ok) {
        console.error('Failed to save summary', await res.text());
        setStatus('save-failed');
      } else {
        setStatus('saved');
      }
    } catch (err) {
      console.error('Error sending summary', err);
      setStatus('save-failed');
    }

    // Update the page textarea too
    if (window.updateDictation) window.updateDictation(transcript);
  };

  // naive extractive summarizer
  const summarizeText = (text) => {
    if (!text || text.trim().length === 0) return '';

    // split into sentences
    const sentences = text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [text];
    if (sentences.length <= 2) return text;

    // build frequency map
    const stopwords = new Set([
      'the','is','in','and','to','a','of','it','that','i','you','for','on','with','as','are','this','be','or','was','but','have','not'
    ]);

    const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const freq = {};
    words.forEach(w => {
      if (stopwords.has(w)) return;
      freq[w] = (freq[w] || 0) + 1;
    });

    // score sentences
    const scored = sentences.map(s => {
      const ws = (s.toLowerCase().match(/\b[a-z']+\b/g) || []);
      let score = 0;
      ws.forEach(w => { if (freq[w]) score += freq[w]; });
      return { s: s.trim(), score };
    });

    // pick top 2-3 sentences by score
    scored.sort((a,b) => b.score - a.score);
    const take = Math.max(1, Math.min(3, Math.round(sentences.length * 0.25)));
    const selected = scored.slice(0, take).sort((a,b) => text.indexOf(a.s) - text.indexOf(b.s));
    return selected.map(x => x.s).join(' ');
  };

  return (
    <div className="voice-recorder">
      <div style={{ marginBottom: 8 }}>
        <button type="button" onClick={listening ? stopRecording : startRecording}>
          {listening ? 'Stop Recording' : 'Start Meeting Recording'}
        </button>
        <span style={{ marginLeft: 12 }}>{status}</span>
      </div>

      <div>
        <h4>Live Dictation</h4>
        <textarea
          id="dictation-output"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Dictation will appear here..."
          rows={8}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <small>
          Uses browser SpeechRecognition. If your browser does not support it, recording is unavailable.
        </small>
      </div>
    </div>
  );
}