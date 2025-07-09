import React, { useState } from 'react'
import FormInput from './FormInput'
import Toast from './Toast'
import { validateEmail, validatePassword } from '../utils/validation'
import { authService } from '../services/api'
import '../styles/LoginScreen.css'

const LoginScreen = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSubmit = async (e) => {
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
      setIsLoading(true)
      try {
        // Login with API
        const loginData = {
          username: formData.email, // Backend expects username (can be email)
          password: formData.password
        }
        
        const response = await authService.login(loginData)
        
        onNavigate('success', { 
          type: 'login', 
          message: 'Login realizado com sucesso! Bem-vindo de volta.',
          email: formData.email
        })
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Login falhou. Verifique suas credenciais.'
        onNavigate('error', { 
          type: 'login', 
          message: errorMessage,
          action: 'Tentar Novamente'
        })
      } finally {
        setIsLoading(false)
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
            ← Voltar
          </button>
          <h1>Login</h1>
          <p>Entre na sua conta</p>
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
              placeholder="Digite seu email"
              required
            />
            
            <FormInput
              label="Senha"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="Digite sua senha"
              required
            />
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </section>

        <footer className="login-footer">
          <p>
            Não tem uma conta?{' '}
            <button 
              className="link-btn"
              onClick={() => onNavigate('register')}
            >
              Registre-se aqui
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
