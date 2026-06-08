import { AiOutlineMinus } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { useAuth } from "../contexts/AuthContext"
import { useFile } from "../contexts/FileContext"

const MainWindow = () => {
    const { user, openLogin, openRegister, logout } = useAuth()
    const { currentFile, updateFileName, saveCurrentFile } = useFile()

    const handleUseAI = () => {
        if (!user) {
            openLogin()
        }
    }

    const handleSave = () => {
        if (currentFile) {
            saveCurrentFile(currentFile.content)
        }
    }

    return (
        <div className="w-full bg-gray-100 h-full flex flex-col">
                <header className="bg-amber-500 text-white p-4 flex justify-between items-center gap-4">
                    <input
                        type="text"
                        placeholder="Enter file name..."
                        className="bg-amber-500 text-white text-lg font-bold focus:outline-none w-auto"
                        value={currentFile?.fileName || "Untitled"}
                        onChange={(e) => updateFileName(e.target.value)}
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
                            <button onClick={handleSave} className="bg-white text-amber-500 hover:bg-amber-200 hover:text-gray-800 px-4 py-2 rounded-md font-semibold">Save</button>
                            <button className="bg-white text-amber-500 hover:bg-amber-200 hover:text-gray-800 px-4 py-2 rounded-md font-semibold">Share</button>
                            <button className="bg-white text-amber-500 hover:bg-amber-200 hover:text-gray-800 px-4 py-2 rounded-md font-semibold">Export</button>
                            <button onClick={logout} className="bg-white text-amber-500 hover:bg-amber-200 hover:text-gray-800 px-4 py-2 rounded-md font-semibold">Logout</button>
                        </div>
                    )}
                </header>

                <main className="p-4 h-full">
                    <p>This is the main content area.</p>
                </main>

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
            </div>
    )
}

export default MainWindow
