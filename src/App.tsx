import './App.css'
import SideMenu from './components/SideMenu'
import MainWindow from './components/MainWindow'
import AuthDialog from './components/AuthDialog'
import SignupDialog from './components/SignupDialog'
import FileSelectionDialog from './components/FileSeletion'
import { useAuth } from './contexts/AuthContext'
import { useFile } from './contexts/FileContext'

export default function App() {
    const { user, showLogin, showRegister } = useAuth()
    const { showFileSelect } = useFile()

    return (
        <div className="flex items-center justify-center h-screen">
            <SideMenu />
            <MainWindow />
            {!user && showLogin && <AuthDialog />}
            {!user && showRegister && <SignupDialog />}
            {user && showFileSelect && <FileSelectionDialog />}
        </div>
    )
}