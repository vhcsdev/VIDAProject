import React from 'react'
import '../styles/ErrorScreen.css'

const ErrorScreen = ({ onNavigate, data }) => {
  return (
    <main className="error-screen">
      <div className="error-container">
        <div className="error-icon">
          <div className="error-mark">✕</div>
        </div>
        
        <header className="error-header">
          <h1>Oops!</h1>
          <p>{data.message}</p>
        </header>

        <section className="error-actions">
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate(data.type === 'login' ? 'login' : 'register')}
          >
            {data.action || 'Try Again'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('welcome')}
          >
            Go Home
          </button>
        </section>
      </div>
    </main>
  )
}

export default ErrorScreen
