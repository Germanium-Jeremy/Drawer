import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { FileProvider } from './contexts/FileContext'
import { Toaster } from 'sonner'
import { DrawProvider } from './contexts/DrawContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <FileProvider>
        <DrawProvider>
          <App />
          <Toaster />
        </DrawProvider>
      </FileProvider>
    </AuthProvider>
  </StrictMode>,
)
