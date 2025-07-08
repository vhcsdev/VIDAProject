import React, { useState } from 'react'
import FormInput from './FormInput'
import Toast from './Toast'
import { validateEmail, validatePassword } from '../utils/validation'
import '../styles/LoginScreen.css'

const LoginScreen = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const showToast = (message, type = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = {}
    
    // Validate email
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message
      showToast(emailValidation.message)
    }
    
    // Validate password
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message
      showToast(passwordValidation.message)
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      // Simulate login logic
      const isSuccess = Math.random() > 0.3 // 70% success rate for demo
      
      if (isSuccess) {
        onNavigate('success', { 
          type: 'login', 
          message: 'Login successful! Welcome back.',
          email: formData.email
        })
      } else {
        onNavigate('error', { 
          type: 'login', 
          message: 'Invalid credentials. Please check your email and password.',
          action: 'Try Again'
        })
      }
    }
  }

  return (
    <main className="login-screen">
      <div className="login-container">
        <header className="login-header">
          <button 
            className="back-btn"
            onClick={() => onNavigate('welcome')}
          >
            ← Back
          </button>
          <h1>Login</h1>
          <p>Sign in to your account</p>
        </header>

        <section className="login-form-section">
          <form className="login-form" onSubmit={handleSubmit}>
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />
            
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="Enter your password"
              required
            />
            
            <button type="submit" className="btn btn-primary btn-full">
              Login
            </button>
          </form>
        </section>

        <footer className="login-footer">
          <p>
            Don't have an account?{' '}
            <button 
              className="link-btn"
              onClick={() => onNavigate('register')}
            >
              Register here
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
    </main>
  )
}

export default LoginScreen
