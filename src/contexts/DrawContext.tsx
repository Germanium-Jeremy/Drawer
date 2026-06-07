import React, { createContext, useContext, useState, useRef } from "react";
import { toast } from "sonner";

interface DrawContextType {
    commands: string
    diagramLoading: boolean
    handleSetCommands: (newCommands: string) => void
}

const DrawContext = createContext<DrawContextType | null>(null)

export function DrawProvider({ children }: { children: React.ReactNode }) {
    const [commands, setCommands] = useState('')
    const [diagramLoading, setDiagramLoading] = useState(false)
    const timeoutRef = useRef<number | null>(null)

    const handleGenerateDiagram = async () => {
        setDiagramLoading(true)

        const canvas = document.getElementById('diagram-canvas')
        if (canvas) canvas.innerHTML = '<p>Generating diagram...</p>'

        setDiagramLoading(false)
    }

    const handleSetCommands = (newCommands: string) => {
        setCommands(newCommands)

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = window.setTimeout(async () => {
            if (newCommands.trim() !== '') {
                await handleGenerateDiagram()
                toast.success("Commands updated! Generating diagram...")
            }
        }, 3000)
    }

    return (
        <DrawContext.Provider value={{
            commands, diagramLoading, handleSetCommands
        }}>
            {children}
        </DrawContext.Provider>
    )
}

export function useDraw() {
    const context = useContext(DrawContext)
    if (!context) throw new Error("useDraw must be used inside DrawProvider ")
    return context
}