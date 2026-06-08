import React, { createContext, useContext, useEffect, useState } from "react";
import type { File } from "../types/types";
import { useAuth } from "./AuthContext";

interface FileContextType {
    files: File[];
    currentFile: File | null;
    showFileSelect: boolean;
    createFile: (fileName: string, content?: string) => File;
    deleteFile: (fileId: number) => void;
    openFile: (fileId: number) => void;
    saveCurrentFile: (content: string) => void;
    updateFileName: (fileName: string) => void;
    openFileSelect: () => void;
    closeFileSelect: () => void;
}

const FileContext = createContext<FileContextType | null>(null)

function getStorageKey(userId: number) {
    return `files_user_${userId}`
}

function loadFiles(userId: number): File[] {
    try {
        const stored = localStorage.getItem(getStorageKey(userId))
        if (stored) {
            return JSON.parse(stored) as File[]
        }
    } catch {
        // corrupted data, start fresh
    }
    return []
}

function persistFiles(userId: number, files: File[]) {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(files))
}

export function FileProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [files, setFiles] = useState<File[]>([])
    const [currentFile, setCurrentFile] = useState<File | null>(null)
    const [showFileSelect, setShowFileSelect] = useState(false)

    // Load files when user changes (login/logout)
    useEffect(() => {
        if (user) {
            setFiles(loadFiles(user.userId))
        } else {
            setFiles([])
            setCurrentFile(null)
        }
    }, [user])

    function createFile(fileName: string, content: string = ''): File {
        const newFile: File = {
            fileId: Date.now(),
            fileName,
            content,
            createdAt: new Date(),
        }
        const updated = [...files, newFile]
        setFiles(updated)
        setCurrentFile(newFile)
        if (user) persistFiles(user.userId, updated)
        return newFile
    }

    function deleteFile(fileId: number) {
        const updated = files.filter(f => f.fileId !== fileId)
        setFiles(updated)
        if (currentFile?.fileId === fileId) {
            setCurrentFile(null)
        }
        if (user) persistFiles(user.userId, updated)
    }

    function openFile(fileId: number) {
        const file = files.find(f => f.fileId === fileId) || null
        setCurrentFile(file)
        setShowFileSelect(false)
    }

    function saveCurrentFile(content: string) {
        if (!currentFile) return
        const updatedFile = { ...currentFile, content }
        const updated = files.map(f => f.fileId === currentFile.fileId ? updatedFile : f)
        setFiles(updated)
        setCurrentFile(updatedFile)
        if (user) persistFiles(user.userId, updated)
    }

    function updateFileName(fileName: string) {
        if (!currentFile) return
        const updatedFile = { ...currentFile, fileName }
        const updated = files.map(f => f.fileId === currentFile.fileId ? updatedFile : f)
        setFiles(updated)
        setCurrentFile(updatedFile)
        if (user) persistFiles(user.userId, updated)
    }

    function openFileSelect() {
        setShowFileSelect(true)
    }

    function closeFileSelect() {
        setShowFileSelect(false)
    }

    return (
        <FileContext.Provider value={{
            files, currentFile, showFileSelect,
            createFile, deleteFile, openFile,
            saveCurrentFile, updateFileName,
            openFileSelect, closeFileSelect
        }}>
            {children}
        </FileContext.Provider>
    )
}

export function useFile() {
    const context = useContext(FileContext)
    if (!context) throw new Error("useFile must be used inside FileProvider ")
    return context
}