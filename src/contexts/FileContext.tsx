import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { File } from "../types/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import api from "../lib/axios";

// Shape of a file as returned by the backend
interface ApiFile {
    _id: string;
    fileName: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

function toFile(f: ApiFile): File {
    return {
        fileId: f._id,
        fileName: f.fileName,
        content: f.content,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt),
    };
}

interface FileContextType {
    files: File[];
    currentFile: File | null;
    showFileSelect: boolean;
    isDirty: boolean;
    filesLoading: boolean;
    createFile: (fileName: string, content?: string) => Promise<File | null>;
    deleteFile: (fileId: string) => Promise<void>;
    openFile: (fileId: string) => Promise<File | null>;
    saveCurrentFile: (content: string) => Promise<void>;
    updateFileName: (fileName: string) => void;
    notifyContentChange: (content: string) => void;
    openFileSelect: () => void;
    closeFileSelect: () => void;
}

const FileContext = createContext<FileContextType | null>(null);

export function FileProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [files, setFiles] = useState<File[]>([]);
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [showFileSelect, setShowFileSelect] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [filesLoading, setFilesLoading] = useState(false);

    // Snapshot of the last-saved state used to compute isDirty
    const savedSnapshot = useRef<{ fileName: string; content: string } | null>(null);

    // Fetch files when user logs in; clear state on logout
    useEffect(() => {
        if (user) {
            fetchFiles();
        } else {
            setFiles([]);
            setCurrentFile(null);
            setIsDirty(false);
            savedSnapshot.current = null;
        }
    }, [user]);

    async function fetchFiles() {
        setFilesLoading(true);
        try {
            const res = await api.get<ApiFile[]>('/files');
            setFiles(res.data.map(toFile));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load files');
        } finally {
            setFilesLoading(false);
        }
    }

    function markSnapshot(file: File) {
        savedSnapshot.current = { fileName: file.fileName, content: file.content };
        setIsDirty(false);
    }

    async function createFile(fileName: string, content: string = ''): Promise<File | null> {
        try {
            const res = await api.post<ApiFile>('/files', { fileName, content });
            const newFile = toFile(res.data);
            setFiles(prev => [newFile, ...prev]);
            setCurrentFile(newFile);
            markSnapshot(newFile);
            toast.success(`File "${fileName}" created!`);
            return newFile;
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create file');
            return null;
        }
    }

    async function openFile(fileId: string): Promise<File | null> {
        try {
            const res = await api.get<ApiFile>(`/files/${fileId}`);
            const file = toFile(res.data);
            setCurrentFile(file);
            markSnapshot(file);
            setShowFileSelect(false);
            return file;
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to open file');
            return null;
        }
    }

    async function saveCurrentFile(content: string): Promise<void> {
        if (!currentFile) return;

        const fileName = currentFile.fileName.trim() || 'Untitled';
        try {
            const res = await api.put<ApiFile>(`/files/${currentFile.fileId}`, {
                fileName,
                content,
            });
            const updated = toFile(res.data);
            setCurrentFile(updated);
            setFiles(prev => prev.map(f => f.fileId === updated.fileId ? updated : f));
            markSnapshot(updated);
            toast.success('File saved!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save file');
        }
    }

    async function deleteFile(fileId: string): Promise<void> {
        try {
            await api.delete(`/files/${fileId}`);
            setFiles(prev => prev.filter(f => f.fileId !== fileId));
            if (currentFile?.fileId === fileId) {
                setCurrentFile(null);
                setIsDirty(false);
                savedSnapshot.current = null;
            }
            toast.success('File deleted!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete file');
        }
    }

    // Local-only update — marks file dirty so Save becomes enabled
    function updateFileName(fileName: string) {
        if (!currentFile) return;
        const updated = { ...currentFile, fileName };
        setCurrentFile(updated);
        const snap = savedSnapshot.current;
        setIsDirty(snap ? (fileName !== snap.fileName || updated.content !== snap.content) : true);
    }

    // Called by SideMenu editor when content changes — keeps isDirty in sync
    // without touching the API. Actual persistence happens on Save.
    function notifyContentChange(content: string) {
        const snap = savedSnapshot.current;
        if (!snap) return;
        setIsDirty(content !== snap.content || (currentFile?.fileName ?? '') !== snap.fileName);
    }

    function openFileSelect() { setShowFileSelect(true); }
    function closeFileSelect() { setShowFileSelect(false); }

    return (
        <FileContext.Provider value={{
            files, currentFile, showFileSelect, isDirty, filesLoading,
            createFile, deleteFile, openFile,
            saveCurrentFile, updateFileName, notifyContentChange,
            openFileSelect, closeFileSelect,
        }}>
            {children}
        </FileContext.Provider>
    );
}

export function useFile() {
    const context = useContext(FileContext);
    if (!context) throw new Error("useFile must be used inside FileProvider");
    return context;
}