export const validateEmail = (email) => {
  if (!email) {
    return {
      isValid: false,
      message: 'Email é obrigatório. Por favor, digite seu endereço de email.'
    }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Formato de email inválido. Use o formato: exemplo@dominio.com'
    }
  }
  
  return { isValid: true }
}

export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: 'Senha é obrigatória. Por favor, digite sua senha.'
    }
  }
  
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'A senha deve ter pelo menos 8 caracteres.'
    }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra minúscula.'
    }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra maiúscula.'
    }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos um número.'
    }
  }
  
  return { isValid: true }
}

export const validateName = (name, fieldName) => {
  if (!name) {
    return {
      isValid: false,
      message: `${fieldName} é obrigatório. Por favor, digite seu ${fieldName.toLowerCase()}.`
    }
  }
  
  if (name.length < 2) {
    return {
      isValid: false,
      message: `${fieldName} deve ter pelo menos 2 caracteres.`
    }
  }
  
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
    return {
      isValid: false,
      message: `${fieldName} pode conter apenas letras e espaços.`
    }
  }
  
  return { isValid: true }
}

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return {
      isValid: false,
      message: 'Por favor, confirme sua senha.'
    }
  }
  
  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'As senhas não coincidem. Certifique-se de que ambas as senhas sejam idênticas.'
    }
  }
  
  return { isValid: true }
}
