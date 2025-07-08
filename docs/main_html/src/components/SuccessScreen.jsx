import React from 'react'
import '../styles/SuccessScreen.css'

const SuccessScreen = ({ onNavigate, data }) => {
  return (
    <main className="success-screen">
      <div className="success-container">
        <div className="success-icon">
          <div className="checkmark">✓</div>
        </div>
        
        <header className="success-header">
          <h1>Success!</h1>
          <p>{data.message}</p>
          {data.name && <p className="welcome-text">Welcome, {data.name}!</p>}
          {data.email && <p className="email-text">Logged in as: {data.email}</p>}
        </header>

        <section className="success-actions">
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('welcome')}
          >
            Continue
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate(data.type === 'login' ? 'login' : 'register')}
          >
            Go Back
          </button>
        </section>
      </div>
    </main>
  )
}

export default SuccessScreen
