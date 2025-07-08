import React from 'react'
import '../styles/WelcomeScreen.css'

const WelcomeScreen = ({ onNavigate }) => {
  return (
    <main className="welcome-screen">
      <div className="welcome-container">
        <header className="welcome-header">
          <div className="logo">
            <h1>MyApp</h1>
            <p>Welcome to our platform</p>
          </div>
        </header>
        
        <section className="welcome-actions">
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('login')}
          >
            Login
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('register')}
          >
            Register
          </button>
        </section>
      </div>
    </main>
  )
}

export default WelcomeScreen
