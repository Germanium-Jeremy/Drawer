import { FaFile, FaTrash } from "react-icons/fa"
import { FaX } from "react-icons/fa6"
import { useFile } from "../contexts/FileContext"

const FileSelectionDialog = () => {
    const { files, openFile, deleteFile, closeFileSelect, createFile } = useFile()

    const handleFileOpen = (fileId: number) => {
        openFile(fileId)
    }

    const handleFileDelete = (fileId: number) => {
        if (confirm("Are you sure you want to delete this file?")) {
            deleteFile(fileId)
        }
    }

    const handleNewFile = () => {
        const name = prompt("Enter file name:")
        if (name && name.trim()) {
            createFile(name.trim())
            closeFileSelect()
        }
    }

    return (
        <>
            <div className="bg-black w-full h-full fixed opacity-40 top-0 bottom-0 right-0 left-0" onClick={closeFileSelect} />

            <div className="fixed px-8 py-4 bg-white rounded-xl mx-auto min-w-100">
                <FaX className="text-4xl bg-amber-500 p-1 h-6 w-6 rounded-full absolute top-2 right-2 cursor-pointer" onClick={closeFileSelect} />
                <h1 className="text-2xl text-center font-bold bg-linear-to-r from-amber-500 to-gray-500 bg-clip-text text-transparent my-8">Drawer Files</h1>

                {files.length <= 0 && (
                    <div className="flex flex-col gap-5 justify-center items-center">
                        <img src="/favicon.svg" alt="No files" className="h-20 w-20 rounded-full border border-amber-500" />
                        <h1 className="text-lg font-semibold text-center">Seems like you haven't saved any file</h1>
                    </div>
                )}

                {files.map((file) => (
                    <div className={`px-4 py-1 flex justify-between align-middle`} key={file.fileId}>
                        <p className="text-lg text-gray-800">{file.fileName}</p>
                        <div className="flex justify-around align-middle gap-3">
                            <FaFile className="text-gray-800 hover:text-amber-500 cursor-pointer" onClick={() => handleFileOpen(file.fileId)} />
                            <FaTrash className="text-gray-800 hover:text-amber-500 cursor-pointer" onClick={() => handleFileDelete(file.fileId)} />
                        </div>
                    </div>
                ))}

                <div className="flex flex-col mt-5">
                    <button onClick={handleNewFile}
                        className='bg-amber-500 hover:bg-white text-white hover:border-2 hover:border-amber-500 hover:text-amber-500 px-4 py-2 rounded-md font-semibold'
                    >
                        + New File
                    </button>
                </div>
            </div>
        </>
    )
}

export default FileSelectionDialog
