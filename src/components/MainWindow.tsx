import { AiOutlineMinus } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { useAuth } from "../contexts/AuthContext"
import { useFile } from "../contexts/FileContext"
import DrawArea from "./DrawArea"
import { useDraw } from "../contexts/DrawContext"
import { useState } from "react"
import ExportDialog from "./ExportDialog"

const MainWindow = () => {
    const { user, openLogin, openRegister, logout } = useAuth()
    const { currentFile, updateFileName, saveCurrentFile, isDirty, readOnly, shareCurrentFile, forkSharedFile } = useFile()
    const { commands } = useDraw()
    const [showExport, setShowExport] = useState(false)

    const handleUseAI = () => {
        if (!user) {
            openLogin()
        }
    }

    const handleSave = () => {
        if (currentFile && isDirty) {
            saveCurrentFile(commands)
        }
    }

    return (
        <div className="w-full bg-gray-100 h-full flex flex-col">
                <header className="bg-amber-500 text-white p-4 flex justify-between items-center gap-4">
                    <input
                        type="text"
                        placeholder="Enter file name..."
                        className={`bg-amber-500 text-white text-lg font-bold focus:outline-none w-auto ${readOnly ? 'opacity-80' : ''}`}
                        value={currentFile?.fileName || ''}
                        onChange={(e) => updateFileName(e.target.value)}
                        disabled={readOnly}
                    />

                    {!user ? (
                        <div className="flex justify-center items-center gap-4">    
                            <button onClick={openLogin}
                                className="bg-white text-amber-500 hover:bg-amber-200 hover:text-gray-800 px-4 py-2 rounded-md font-semibold"
                            >
                                Login
                            </button>
                            <button onClick={openRegister}
                                className="bg-white text-amber-500 hover:bg-amber-200 hover:text-gray-800 px-4 py-2 rounded-md font-semibold"
                            >
                                Register
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center gap-4">
                            {readOnly ? (
                                <button 
                                    onClick={forkSharedFile}
                                    className="bg-white text-amber-500 hover:bg-amber-200 hover:text-gray-800 px-4 py-2 rounded-md font-semibold transition-colors"
                                >
                                    Fork
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={handleSave}
                                        disabled={!isDirty}
                                        className={`bg-white px-4 py-2 rounded-md font-semibold transition-colors ${isDirty ? 'text-amber-500 hover:bg-amber-200 hover:text-gray-800' : 'text-gray-400 cursor-not-allowed opacity-70'}`}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={shareCurrentFile}
                                        disabled={!currentFile || currentFile.isShared}
                                        className={`bg-white px-4 py-2 rounded-md font-semibold transition-colors ${(!currentFile || currentFile.isShared) ? 'text-gray-400 cursor-not-allowed opacity-70' : 'text-amber-500 hover:bg-amber-200 hover:text-gray-800'}`}
                                    >
                                        {currentFile?.isShared ? 'Shared' : 'Share'}
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={() => commands?.trim().length > 0 && setShowExport(true)}
                                disabled={!commands || commands.trim().length === 0}
                                className={`bg-white px-4 py-2 rounded-md font-semibold transition-colors ${commands?.trim().length > 0 ? 'text-amber-500 hover:bg-amber-200 hover:text-gray-800' : 'text-gray-400 cursor-not-allowed opacity-70'}`}
                            >
                                Export
                            </button>
                            <button onClick={logout} className="bg-white text-amber-500 hover:bg-amber-200 hover:text-gray-800 px-4 py-2 rounded-md font-semibold">Logout</button>
                        </div>
                    )}
                </header>

                <DrawArea />

                <footer className='flex justify-between items-center px-8 py-2'>
                    <button 
                        className='bg-amber-500 hover:bg-white text-white hover:border-2 hover:border-amber-500 hover:text-amber-500 px-4 py-2 rounded-md font-semibold'
                        onClick={handleUseAI}
                    >
                        Use AI to debug
                    </button>

                    <div className="flex justify-center items-center gap-8 bg-white w-auto px-4 py-1 rounded-2xl">
                        <AiOutlineMinus className="text-gray-600 hover:text-black font-bold" />
                        <FaPlus className="text-gray-600 hover:text-black" />
                    </div>
                </footer>

                {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
            </div>
    )
}

export default MainWindow
