import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { FileProvider } from './contexts/FileContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <FileProvider>
        <App />
      </FileProvider>
    </AuthProvider>
  </StrictMode>,
)
