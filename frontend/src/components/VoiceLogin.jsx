import React, { useState } from 'react'
import VoiceRecorder from './VoiceRecorder'
import FormInput from './FormInput'
import Toast from './Toast'
import { voiceService } from '../services/api'
import '../styles/VoiceLogin.css'

const VoiceLogin = ({ onNavigate, onSuccess }) => {
  const [email, setEmail] = useState('')
  const [voiceBlob, setVoiceBlob] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [toast, setToast] = useState(null)
  const [step, setStep] = useState('email') // 'email' or 'voice'

  const showToast = (message, type = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    
    if (!email) {
      showToast('Digite seu endereço de email')
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showToast('Digite um endereço de email válido')
      return
    }
    
    setStep('voice')
  }

  const handleVoiceRecording = (audioBlob) => {
    setVoiceBlob(audioBlob)
  }

  const handleVoiceSubmit = async () => {
    if (!voiceBlob) {
      showToast('Grave sua voz primeiro')
      return
    }

    setIsVerifying(true)
    
    try {
      // Convert blob to file
      const audioFile = new File([voiceBlob], 'voice_login.webm', {
        type: 'audio/webm;codecs=opus'
      })
      
      // Verify voice with backend
      const result = await voiceService.verifyVoice(email, audioFile)
      
      if (result.verified) {
        showToast('Autenticação por voz realizada com sucesso!', 'success')
        setTimeout(() => {
          if (onSuccess) {
            onSuccess({
              email,
              verification: result
            })
          }
        }, 1500)
      } else {
        showToast(`Verificação de voz falhou. Confiança: ${(result.score * 100).toFixed(1)}%`)
        setVoiceBlob(null) // Reset recording
      }
      
    } catch (error) {
      console.error('Voice verification error:', error)
      const errorMessage = error.response?.data?.detail || 'Verificação de voz falhou. Tente novamente.'
      showToast(errorMessage)
      setVoiceBlob(null) // Reset recording
    } finally {
      setIsVerifying(false)
    }
  }

  const goBackToEmail = () => {
    setStep('email')
    setVoiceBlob(null)
  }

  return (
    <div className="voice-login">
      <div className="voice-login-container">
        <header className="voice-login-header">
          <button 
            className="back-btn"
            onClick={() => step === 'voice' ? goBackToEmail() : onNavigate('welcome')}
            disabled={isVerifying}
          >
            ← Voltar
          </button>
          <h1>Login por Voz</h1>
          <p>Autentique-se com sua voz</p>
        </header>

        {step === 'email' && (
          <section className="email-step">
            <div className="step-info">
              <h2>Digite Seu Email</h2>
              <p>Primeiro, digite o email associado ao seu perfil de voz</p>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="email-form">
              <FormInput
                label="Endereço de Email"
                type="email"
                name="email"
                value={email}
                onChange={(name, value) => setEmail(value)}
                placeholder="Digite seu email registrado"
                required
              />
              
              <button type="submit" className="btn btn-primary btn-full">
                Continuar para Autenticação por Voz
              </button>
            </form>
          </section>
        )}

        {step === 'voice' && (
          <section className="voice-step">
            <div className="step-info">
              <h2>Autenticação por Voz</h2>
              <p>Agora fale claramente para verificar sua identidade</p>
              <div className="user-info">
                <strong>Email:</strong> {email}
              </div>
            </div>
            
            <div className="voice-instructions">
              <div className="instruction-card">
                <span className="instruction-icon">🎯</span>
                <p>Fale claramente e naturalmente</p>
              </div>
              <div className="instruction-card">
                <span className="instruction-icon">🔊</span>
                <p>Use o mesmo tom do registro</p>
              </div>
              <div className="instruction-card">
                <span className="instruction-icon">🎤</span>
                <p>Garanta um ambiente silencioso</p>
              </div>
            </div>
            
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecording}
              maxDuration={5}
              disabled={isVerifying}
            />
            
            <div className="voice-actions">
              <button 
                className="btn btn-primary"
                onClick={handleVoiceSubmit}
                disabled={!voiceBlob || isVerifying}
              >
                {isVerifying ? 'Verificando Voz...' : 'Verificar Voz'}
              </button>
            </div>
          </section>
        )}

        <footer className="voice-login-footer">
          <p>
            Não tem um perfil de voz?{' '}
            <button 
              className="link-btn"
              onClick={() => onNavigate('register')}
              disabled={isVerifying}
            >
              Registre-se aqui
            </button>
          </p>
          <p>
            Ou use{' '}
            <button 
              className="link-btn"
              onClick={() => onNavigate('login')}
              disabled={isVerifying}
            >
              login tradicional
            </button>
          </p>
        </footer>
      </div>
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default VoiceLogin
