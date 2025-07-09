import React from 'react'
import '../styles/SuccessScreen.css'

const SuccessScreen = ({ onNavigate, data }) => {
  const isLogin = data.type === 'login'
  
  return (
    <main className="success-screen">
      <div className="success-container">
        <div className="success-icon">
          <div className="checkmark">✓</div>
        </div>
        
        <header className="success-header">
          <h1>Sucesso!</h1>
          <p>{data.message}</p>
          {data.name && <p className="welcome-text">Bem-vindo(a), {data.name}!</p>}
          {data.email && <p className="email-text">Logado como: {data.email}</p>}
        </header>

        <section className="success-actions">
          {isLogin ? (
            <>
              <button 
                className="btn btn-primary"
                onClick={() => onNavigate('welcome')}
              >
                Ir para Dashboard
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => onNavigate('welcome')}
              >
                Configurar Perfil de Voz
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-primary"
                onClick={() => onNavigate('voice-registration', { email: data.email })}
              >
                Configurar Perfil de Voz
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => onNavigate('login')}
              >
                Pular por Agora
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default SuccessScreen
