import { useEffect } from "react"
import { FaFile, FaLock } from "react-icons/fa"
import { useAuth } from "../contexts/AuthContext"
import { useFile } from "../contexts/FileContext"
import { TrancateText } from '../lib/common'
import { useDraw } from "../contexts/DrawContext"

function SideMenu() {
    const { user, openLogin } = useAuth()
    const { openFileSelect, notifyContentChange, readOnly } = useFile()
    const { commands, handleSetCommands, handleGenerateDiagram } = useDraw()

    useEffect(() => {
        const handleEditorLoad = (e: any) => {
            if (e.detail?.content !== undefined) {
                handleSetCommands(e.detail.content)
                // Automatically generate diagram when loading shared content
                setTimeout(() => handleGenerateDiagram(), 100)
            }
        }
        window.addEventListener('editor:load', handleEditorLoad)
        return () => window.removeEventListener('editor:load', handleEditorLoad)
    }, [handleSetCommands, handleGenerateDiagram])

    // Keep FileContext dirty-state in sync whenever the editor content changes
    const handleContentChange = (value: string) => {
        handleSetCommands(value)
        notifyContentChange(value)
    }

    const handleFileClick = () => {
        if (!user) {
            openLogin()
        } else {
            openFileSelect()
        }
    }

    return (
        <div className="w-100 bg-mist-300 h-full px-8 py-4 flex flex-col gap-4 border-r border-gray-800">
            <div className="flex items-center gap-4 mb-6">
                <FaFile className='text-xl text-gray-800 cursor-pointer' onClick={handleFileClick} />
                <h1 className="text-2xl font-bold bg-linear-to-r from-amber-500 to-gray-500 bg-clip-text text-transparent">Drawer</h1>
            </div>

            <div className="flex flex-col gap-4 h-full mb-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold">Paste or write your codes here.</h1>
                    {readOnly && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                            <FaLock /> Read Only
                        </span>
                    )}
                </div>
                <div className={`bg-white p-4 rounded-md shadow-md h-full border-2 border-gray-300 focus-within:border-amber-500 flex flex-col ${readOnly ? 'opacity-80 bg-gray-50' : ''}`}>
                    <textarea 
                        className="w-full flex-grow focus:outline-none resize-none bg-transparent" 
                        placeholder="Write your code here..."
                        value={commands} 
                        onChange={(e) => handleContentChange(e.target.value)}
                        disabled={readOnly}
                    ></textarea>
                    <button className="mt-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1 px-3 rounded"
                        onClick={() => handleGenerateDiagram()}
                    >Compile</button>
                </div>
            </div>

            <hr className="border-gray-800 border" />

            <div className="flex items-center gap-2">
                <img src="/favicon.svg" alt="Preview" className="w-12 h-12 rounded-full shadow-md border-2 border-amber-500 bg-white" />
                <div className="flex flex-col">
                    <h2 className='font-semibold text-lg'>{user?.username || "username"}</h2>
                    <h2>{TrancateText(user?.email || "email@example.com", 23)}</h2>
                </div>
            </div>
        </div>
    )
}

export default SideMenu
