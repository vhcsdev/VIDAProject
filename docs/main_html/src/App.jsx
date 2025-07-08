import React, { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import LoginScreen from './components/LoginScreen'
import RegisterScreen from './components/RegisterScreen'
import SuccessScreen from './components/SuccessScreen'
import ErrorScreen from './components/ErrorScreen'
import './styles/App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [screenData, setScreenData] = useState({})

  const navigateToScreen = (screen, data = {}) => {
    setCurrentScreen(screen)
    setScreenData(data)
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={navigateToScreen} />
      case 'login':
        return <LoginScreen onNavigate={navigateToScreen} />
      case 'register':
        return <RegisterScreen onNavigate={navigateToScreen} />
      case 'success':
        return <SuccessScreen onNavigate={navigateToScreen} data={screenData} />
      case 'error':
        return <ErrorScreen onNavigate={navigateToScreen} data={screenData} />
      default:
        return <WelcomeScreen onNavigate={navigateToScreen} />
    }
  }

  return (
    <div className="app">
      {renderScreen()}
    </div>
  )
}

export default App
