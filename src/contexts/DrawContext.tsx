import React, { createContext, useContext, useState, useRef } from "react";
import { toast } from "sonner";
import { parse } from "../logic/parser";
import { DrawCanvas } from "../logic/canvas";
import { DrawEngine } from "../logic/drawEngine";

interface DrawContextType {
    commands: string
    diagramLoading: boolean
    error: string | null
    handleSetCommands: (newCommands: string) => void
    handleGenerateDiagram: () => void
}

const DrawContext = createContext<DrawContextType | null>(null)

export function DrawProvider({ children }: { children: React.ReactNode }) {
    const [commands, setCommands] = useState('')
    const [diagramLoading, setDiagramLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const timeoutRef = useRef<number | null>(null)

    const handleGenerateDiagram = () => {
        const canvas = document.getElementById('diagram-canvas') as HTMLCanvasElement;
        if (!canvas) return;

        setDiagramLoading(true)
        setError(null)

        try {
            const parsed = commands.trim() === '' ? [] : parse(commands);
            const drawCanvas = new DrawCanvas(canvas);
            const engine = new DrawEngine(drawCanvas);
            engine.run(parsed);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred during parsing or execution.");
        } finally {
            setDiagramLoading(false)
        }
    }

    const handleSetCommands = (newCommands: string) => {
        setCommands(newCommands)
        setError(null)

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = window.setTimeout(() => {
            const canvas = document.getElementById('diagram-canvas') as HTMLCanvasElement;
            if (canvas) {
                handleGenerateDiagram()
                if (newCommands.trim() !== '') {
                    toast.success("Diagram updated successfully!")
                }
            }
        }, 3000)
    }

    return (
        <DrawContext.Provider value={{
            commands, diagramLoading, error, handleSetCommands, handleGenerateDiagram
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