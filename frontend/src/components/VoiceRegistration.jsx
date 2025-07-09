import React, { useState } from 'react'
import VoiceRecorder from './VoiceRecorder'
import Toast from './Toast'
import { voiceService } from '../services/api'
import '../styles/VoiceRegistration.css'

const VoiceRegistration = ({ userEmail, onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [recordings, setRecordings] = useState([null, null, null])
  const [isUploading, setIsUploading] = useState(false)
  const [toast, setToast] = useState(null)

  const totalSteps = 3

  const showToast = (message, type = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const handleRecordingComplete = (audioBlob) => {
    if (audioBlob) {
      const newRecordings = [...recordings]
      newRecordings[currentStep - 1] = audioBlob
      setRecordings(newRecordings)
    }
  }

  const nextStep = () => {
    if (recordings[currentStep - 1]) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        submitAllRecordings()
      }
    } else {
      showToast('Complete a gravação antes de prosseguir')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitAllRecordings = async () => {
    if (recordings.every(recording => recording !== null)) {
      setIsUploading(true)
      
      try {
        let successCount = 0
        
        for (let i = 0; i < recordings.length; i++) {
          const audioFile = new File([recordings[i]], `voice_sample_${i + 1}.webm`, {
            type: 'audio/webm;codecs=opus'
          })
          
          try {
            await voiceService.createVoiceProfile(userEmail, audioFile)
            successCount++
            showToast(`Amostra de voz ${i + 1} enviada com sucesso`, 'success')
          } catch (error) {
            console.error(`Erro ao enviar amostra ${i + 1}:`, error)
            showToast(`Falha ao enviar amostra de voz ${i + 1}`, 'error')
          }
        }
        
        if (successCount === recordings.length) {
          showToast('Todas as amostras de voz registradas com sucesso!', 'success')
          setTimeout(() => {
            if (onComplete) onComplete()
          }, 2000)
        } else {
          showToast(`Apenas ${successCount} de ${recordings.length} amostras foram enviadas. Tente novamente.`, 'warning')
        }
        
      } catch (error) {
        console.error('Error during voice registration:', error)
        showToast('Falha ao registrar amostras de voz. Tente novamente.', 'error')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const getStepMessage = (step) => {
    const messages = [
      "Grave sua primeira amostra de voz",
      "Grave sua segunda amostra de voz", 
      "Grave sua terceira e última amostra de voz"
    ]
    return messages[step - 1]
  }

  const getStepInstruction = (step) => {
    const instructions = [
      "Por favor, diga: 'Olá, esta é minha voz para autenticação VIDA'",
      "Por favor, diga: 'Meu nome é [seu nome] e estou registrando minha voz'",
      "Por favor, diga: 'A autenticação de voz VIDA é segura e confiável'"
    ]
    return instructions[step - 1]
  }

  return (
    <div className="voice-registration">
      <div className="registration-container">
        <header className="registration-header">
          <button 
            className="back-btn"
            onClick={onBack}
            disabled={isUploading}
          >
            ← Voltar
          </button>
          <h1>Registro de Voz</h1>
          <p>Configure seu perfil de voz para autenticação segura</p>
        </header>

        <div className="progress-indicator">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="step-info">
            Passo {currentStep} de {totalSteps}
          </div>
        </div>

        <div className="registration-content">
          <div className="step-info-card">
            <h2>{getStepMessage(currentStep)}</h2>
            <p className="step-instruction">{getStepInstruction(currentStep)}</p>
            
            <div className="completed-steps">
              {recordings.map((recording, index) => (
                <div 
                  key={index}
                  className={`step-indicator ${recording ? 'completed' : ''} ${index + 1 === currentStep ? 'current' : ''}`}
                >
                  <div className="step-number">{index + 1}</div>
                  <div className="step-status">
                    {recording ? '✓' : index + 1 === currentStep ? '🎤' : '○'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <VoiceRecorder
            key={currentStep}
            onRecordingComplete={handleRecordingComplete}
            maxDuration={5}
            disabled={isUploading}
          />

          <div className="registration-actions">
            {currentStep > 1 && (
              <button 
                className="btn btn-secondary"
                onClick={prevStep}
                disabled={isUploading}
              >
                Anterior
              </button>
            )}
            
            <button 
              className="btn btn-primary"
              onClick={nextStep}
              disabled={!recordings[currentStep - 1] || isUploading}
            >
              {isUploading 
                ? 'Enviando...' 
                : currentStep === totalSteps 
                  ? 'Concluir Registro' 
                  : 'Próximo Passo'
              }
            </button>
          </div>
        </div>
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

export default VoiceRegistration
