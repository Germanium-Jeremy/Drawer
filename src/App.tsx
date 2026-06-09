import './App.css'
import SideMenu from './components/SideMenu'
import MainWindow from './components/MainWindow'
import AuthDialog from './components/AuthDialog'
import SignupDialog from './components/SignupDialog'
import FileSelectionDialog from './components/FileSeletion'
import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'

export default function App() {
    const [showLogin, setShowLogin] = useState(false)
    const [showRegister, setShowRegister] = useState(false)
    const [showFileSelect, setShowFileSelect] = useState(false)
    const { user } = useAuth()

    const handleFileDisplay = () => {
        if (!user) {
            handleLoginDisplay()
        } else {
            setShowFileSelect(!showFileSelect)
        }
    }

    const handleLoginDisplay = () => {
        setShowLogin(!showLogin)
    }
    
    const handleRegisterDisplay = () => {
        setShowRegister(!showRegister)
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <SideMenu handleFileShow={handleFileDisplay} />
            <MainWindow handleLoginShow={handleLoginDisplay} handleRegisterShow={handleRegisterDisplay} />
            {!user && showLogin && <AuthDialog handleHide={handleLoginDisplay} />}
            {!user && showRegister && <SignupDialog handleHide={handleRegisterDisplay} />}
            {user && showFileSelect && <FileSelectionDialog handleHide={handleFileDisplay} />}
        </div>
    )
}