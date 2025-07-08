export const validateEmail = (email) => {
  if (!email) {
    return {
      isValid: false,
      message: 'Email is required. Please enter your email address.'
    }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Invalid email format. Please use format: example@domain.com'
    }
  }
  
  return { isValid: true }
}

export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required. Please enter your password.'
    }
  }
  
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long.'
    }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter.'
    }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter.'
    }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number.'
    }
  }
  
  return { isValid: true }
}

export const validateName = (name, fieldName) => {
  if (!name) {
    return {
      isValid: false,
      message: `${fieldName} is required. Please enter your ${fieldName.toLowerCase()}.`
    }
  }
  
  if (name.length < 2) {
    return {
      isValid: false,
      message: `${fieldName} must be at least 2 characters long.`
    }
  }
  
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return {
      isValid: false,
      message: `${fieldName} can only contain letters and spaces.`
    }
  }
  
  return { isValid: true }
}

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return {
      isValid: false,
      message: 'Please confirm your password.'
    }
  }
  
  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Passwords do not match. Please make sure both passwords are identical.'
    }
  }
  
  return { isValid: true }
}
