import React, { useState, useRef, useEffect } from 'react'
import '../styles/VoiceRecorder.css'

const VoiceRecorder = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const audioRef = useRef(null)
  const isRecordingRef = useRef(false)

  // Update recording ref
  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording, audioBlob])

  // Cleanup audio URL when component unmounts or audioBlob changes
  useEffect(() => {
    if (audioBlob) {
      // Always revoke previous URL first
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(null)
    }
  }, [audioBlob])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        // Reset to beginning if audio has ended
        audioRef.current.currentTime = 0
        audioRef.current.play()
          .then(() => setIsPlaying(true))        .catch(error => {
          console.error('Erro ao reproduzir áudio:', error)
          setIsPlaying(false)
        })
      }
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    // Reset audio to beginning for next play
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const startRecording = async () => {
    try {
      setPermissionDenied(false)
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      streamRef.current = stream
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      const chunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })
        setAudioBlob(audioBlob)
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob)
        }
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }
      
      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      isRecordingRef.current = true
      
    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      setPermissionDenied(true)
    }
  }

  const stopRecording = () => {
    // Stop MediaRecorder if it's recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    // Update states
    setIsRecording(false)
    isRecordingRef.current = false
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
    if (onRecordingComplete) {
      onRecordingComplete(null)
    }
  }

  return (
    <div className="voice-recorder">
      <div className="recorder-visual">
        <div className={`microphone-icon ${isRecording ? 'recording' : ''}`}>
          🎤
        </div>
      </div>
      
      <div className="recorder-controls">
        {!isRecording && !audioBlob && (
          <button 
            className="btn btn-primary record-btn"
            onClick={startRecording}
            disabled={disabled}
          >
            Iniciar Gravação
          </button>
        )}
        
        {isRecording && (
          <button 
            className="btn btn-danger stop-btn"
            onClick={stopRecording}
          >
            Parar Gravação
          </button>
        )}
        
        {audioBlob && (
          <div className="recording-actions">
            <div className="audio-waveform">
              <audio 
                key={audioUrl} // Force re-creation when audioUrl changes
                ref={audioRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onError={(e) => {
                  console.error('Erro de áudio:', e)
                  setIsPlaying(false)
                }}
                style={{ display: 'none' }}
              />
              <div className="waveform-container">
                <div className="waveform-bars">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`bar ${isPlaying ? 'playing' : ''}`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <button 
                  className="play-button"
                  onClick={togglePlayback}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
              </div>
            </div>
            <button 
              className="btn btn-secondary reset-btn"
              onClick={resetRecording}
            >
              Gravar Novamente
            </button>
            <div className="recording-success">
              ✓ Gravação Concluída
            </div>
          </div>
        )}
      </div>
      
      {permissionDenied && (
        <div className="permission-error">
          <p>⚠️ Permissão do microfone negada</p>
          <p>Por favor, habilite o acesso ao microfone para gravar amostras de voz</p>
        </div>
      )}
      
      <div className="recording-info">
        <p>🎯 Fale claramente e pressione parar quando terminar</p>
        <p>💡 Tente dizer: "Olá, esta é minha voz para autenticação VIDA"</p>
      </div>
    </div>
  )
}

export default VoiceRecorder
