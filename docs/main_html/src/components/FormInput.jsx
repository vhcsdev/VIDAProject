import React from 'react'
import '../styles/FormInput.css'

const FormInput = ({ 
  label, 
  type, 
  name, 
  value, 
  onChange, 
  error, 
  placeholder, 
  required 
}) => {
  return (
    <div className="form-input">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`form-field ${error ? 'error' : ''}`}
        required={required}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

export default FormInput
