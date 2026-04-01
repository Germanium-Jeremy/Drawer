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
    isShared?: boolean;
    createdAt: string;
    updatedAt: string;
}

function toFile(f: ApiFile): File {
    return {
        fileId: f._id,
        fileName: f.fileName,
        content: f.content,
        isShared: f.isShared,
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
    readOnly: boolean;
    createFile: (fileName: string, content?: string) => Promise<File | null>;
    deleteFile: (fileId: string) => Promise<void>;
    openFile: (fileId: string) => Promise<File | null>;
    saveCurrentFile: (content: string) => Promise<void>;
    updateFileName: (fileName: string) => void;
    notifyContentChange: (content: string) => void;
    openFileSelect: () => void;
    closeFileSelect: () => void;
    loadSharedFile: (fileId: string) => Promise<File | null>;
    shareCurrentFile: () => Promise<void>;
    forkSharedFile: () => Promise<void>;
}

const FileContext = createContext<FileContextType | null>(null);

export function FileProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [files, setFiles] = useState<File[]>([]);
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [showFileSelect, setShowFileSelect] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [filesLoading, setFilesLoading] = useState(false);
    const [readOnly, setReadOnly] = useState(false);

    // Snapshot of the last-saved state used to compute isDirty
    const savedSnapshot = useRef<{ fileName: string; content: string } | null>(null);

    // Fetch files when user logs in; clear state on logout
    useEffect(() => {
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const sharedId = urlParams.get('shared');
            
            fetchFiles();
            
            if (sharedId) {
                loadSharedFile(sharedId);
            }
        } else {
            setFiles([]);
            setCurrentFile(null);
            setIsDirty(false);
            setReadOnly(false);
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
            setReadOnly(false);
            
            // Clear shared param from URL if it exists
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('shared')) {
                urlParams.delete('shared');
                window.history.replaceState({}, '', `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`);
            }

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
        if (readOnly) return;
        const snap = savedSnapshot.current;
        if (!snap) return;
        setIsDirty(content !== snap.content || (currentFile?.fileName ?? '') !== snap.fileName);
    }

    async function loadSharedFile(fileId: string): Promise<File | null> {
        try {
            const res = await api.get<ApiFile>(`/files/shared/${fileId}`);
            const file = toFile(res.data);
            setCurrentFile(file);
            setReadOnly(true);
            setIsDirty(false);
            // We use a custom event to tell the editor to load these commands,
            // or the component can call handleSetCommands via another mechanism (handled in MainWindow/App).
            window.dispatchEvent(new CustomEvent('editor:load', { detail: { content: file.content } }));
            return file;
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load shared file');
            return null;
        }
    }

    async function shareCurrentFile(): Promise<void> {
        if (!currentFile) return;
        try {
            await api.put(`/files/${currentFile.fileId}/share`);
            const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${currentFile.fileId}`;
            await navigator.clipboard.writeText(shareUrl);
            toast.success('File shared! Link copied to clipboard.');
            // Update local state to reflect it's shared
            setCurrentFile(prev => prev ? { ...prev, isShared: true } : prev);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to share file');
        }
    }

    async function forkSharedFile(): Promise<void> {
        if (!currentFile || !readOnly) return;
        try {
            const res = await api.post<ApiFile>(`/files/shared/${currentFile.fileId}/fork`);
            const newFile = toFile(res.data);
            setFiles(prev => [newFile, ...prev]);
            setCurrentFile(newFile);
            setReadOnly(false);
            markSnapshot(newFile);
            toast.success('File forked successfully!');
            
            // Clean up the URL
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.delete('shared');
            window.history.replaceState({}, '', `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fork file');
        }
    }

    function openFileSelect() { setShowFileSelect(true); }
    function closeFileSelect() { setShowFileSelect(false); }

    return (
        <FileContext.Provider value={{
            files, currentFile, showFileSelect, isDirty, filesLoading, readOnly,
            createFile, deleteFile, openFile,
            saveCurrentFile, updateFileName, notifyContentChange,
            openFileSelect, closeFileSelect,
            loadSharedFile, shareCurrentFile, forkSharedFile
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