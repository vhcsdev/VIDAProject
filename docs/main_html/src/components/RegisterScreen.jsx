import React, { useState } from 'react'
import FormInput from './FormInput'
import Toast from './Toast'
import { validateEmail, validatePassword, validateName, validateConfirmPassword } from '../utils/validation'
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
    
    // Validate first name
    const firstNameValidation = validateName(formData.firstName, 'First name')
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.message
      showToast(firstNameValidation.message)
    }
    
    // Validate last name
    const lastNameValidation = validateName(formData.lastName, 'Last name')
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
      // Simulate registration logic
      const isSuccess = Math.random() > 0.2 // 80% success rate for demo
      
      if (isSuccess) {
        onNavigate('success', { 
          type: 'register', 
          message: 'Registration successful! Welcome to MyApp.',
          name: `${formData.firstName} ${formData.lastName}`
        })
      } else {
        onNavigate('error', { 
          type: 'register', 
          message: 'Registration failed. Email might already be in use.',
          action: 'Try Again'
        })
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
            ← Back
          </button>
          <h1>Register</h1>
          <p>Create your new account</p>
        </header>

        <section className="register-form-section">
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="name-row">
              <FormInput
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                placeholder="First name"
                required
              />
              
              <FormInput
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                placeholder="Last name"
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
              placeholder="Create a password"
              required
            />
            
            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
            />
            
            <button type="submit" className="btn btn-primary btn-full">
              Register
            </button>
          </form>
        </section>

        <footer className="register-footer">
          <p>
            Already have an account?{' '}
            <button 
              className="link-btn"
              onClick={() => onNavigate('login')}
            >
              Login here
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
