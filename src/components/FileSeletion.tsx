import { FaFile, FaTrash } from "react-icons/fa"
import { FaX } from "react-icons/fa6"
import { useFile } from "../contexts/FileContext"
import { useDraw } from "../contexts/DrawContext"

const FileSelectionDialog = () => {
    const { files, openFile, deleteFile, closeFileSelect, createFile, filesLoading } = useFile()
    const { handleSetCommands, handleGenerateDiagram } = useDraw()

    const handleFileOpen = async (fileId: string) => {
        const file = await openFile(fileId)
        // If the file has content, load it into the editor and compile
        if (file && file.content) {
            handleSetCommands(file.content)
            handleGenerateDiagram()
        } else if (file) {
            handleSetCommands('')
        }
    }

    const handleFileDelete = (fileId: string) => {
        if (confirm("Are you sure you want to delete this file?")) {
            deleteFile(fileId)
        }
    }

    const handleNewFile = async () => {
        const name = prompt("Enter file name:")
        if (name && name.trim()) {
            await createFile(name.trim())
            closeFileSelect()
        }
    }

    return (
        <>
            <div className="bg-black w-full h-full fixed opacity-40 top-0 bottom-0 right-0 left-0 z-40" onClick={closeFileSelect} />

            <div className="fixed px-8 py-4 bg-white rounded-xl mx-auto min-w-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-h-[70vh] flex flex-col">
                <FaX className="text-4xl bg-amber-500 p-1 h-6 w-6 rounded-full absolute top-2 right-2 cursor-pointer" onClick={closeFileSelect} />
                <h1 className="text-2xl text-center font-bold bg-linear-to-r from-amber-500 to-gray-500 bg-clip-text text-transparent my-8">Drawer Files</h1>

                <div className="flex-1 overflow-y-auto">
                    {filesLoading ? (
                        <div className="flex justify-center py-8">
                            <span className="w-8 h-8 rounded-full border-x-2 border-amber-500 animate-spin" />
                        </div>
                    ) : files.length <= 0 ? (
                        <div className="flex flex-col gap-5 justify-center items-center py-4">
                            <img src="/favicon.svg" alt="No files" className="h-20 w-20 rounded-full border border-amber-500" />
                            <h1 className="text-lg font-semibold text-center">No saved files yet</h1>
                        </div>
                    ) : (
                        files.map((file) => (
                            <div className="px-4 py-2 flex justify-between items-center hover:bg-gray-50 rounded-md" key={file.fileId}>
                                <div>
                                    <p className="text-base text-gray-800 font-medium">{file.fileName}</p>
                                    <p className="text-xs text-gray-400">{new Date(file.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex justify-around items-center gap-3">
                                    <FaFile className="text-gray-500 hover:text-amber-500 cursor-pointer transition-colors" onClick={() => handleFileOpen(file.fileId)} />
                                    <FaTrash className="text-gray-500 hover:text-red-500 cursor-pointer transition-colors" onClick={() => handleFileDelete(file.fileId)} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col mt-5">
                    <button onClick={handleNewFile}
                        className='bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-semibold transition-colors'
                    >
                        + New File
                    </button>
                </div>
            </div>
        </>
    )
}

export default FileSelectionDialog
