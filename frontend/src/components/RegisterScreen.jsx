import React, { useState } from 'react'
import FormInput from './FormInput'
import Toast from './Toast'
import { validateEmail, validatePassword, validateName, validateConfirmPassword } from '../utils/validation'
import { userService } from '../services/api'
import '../styles/RegisterScreen.css'

const RegisterScreen = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    // Validate first name
    const firstNameValidation = validateName(formData.firstName, 'Nome')
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.message
      showToast(firstNameValidation.message)
    }
    
    // Validate last name
    const lastNameValidation = validateName(formData.lastName, 'Sobrenome')
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.message
      showToast(lastNameValidation.message)
    }
    
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
    
    // Validate confirm password
    const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword)
    if (!confirmPasswordValidation.isValid) {
      newErrors.confirmPassword = confirmPasswordValidation.message
      showToast(confirmPasswordValidation.message)
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true)
      try {
        // Register with API
        const registrationData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        }
        
        const response = await userService.createUser(registrationData)
        
        onNavigate('success', { 
          type: 'register', 
          message: 'Registro realizado com sucesso! Agora configure seu perfil de voz.',
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        })
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Registro falhou. Tente novamente.'
        onNavigate('error', { 
          type: 'register', 
          message: errorMessage,
          action: 'Tentar Novamente'
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <main className="register-screen">
      <div className="register-container">
        <header className="register-header">
          <button 
            className="back-btn"
            onClick={() => onNavigate('welcome')}
          >
            ← Voltar
          </button>
          <h1>Registro</h1>
          <p>Crie sua nova conta</p>
        </header>

        <section className="register-form-section">
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="name-row">
              <FormInput
                label="Nome"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                placeholder="Primeiro nome"
                required
              />
              
              <FormInput
                label="Sobrenome"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                placeholder="Sobrenome"
                required
              />
            </div>
            
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
              placeholder="Crie uma senha"
              required
            />
            
            <FormInput
              label="Confirmar Senha"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              placeholder="Confirme sua senha"
              required
            />
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? 'Criando Conta...' : 'Registrar'}
            </button>
          </form>
        </section>

        <footer className="register-footer">
          <p>
            Já tem uma conta?{' '}
            <button 
              className="link-btn"
              onClick={() => onNavigate('login')}
            >
              Entre aqui
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

export default RegisterScreen
