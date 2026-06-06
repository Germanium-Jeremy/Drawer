import React, { createContext, useContext, useState } from "react";
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

    const handleGenerateDiagram = () => {
        const canvas = document.getElementById('diagram-canvas') as HTMLCanvasElement;
        if (!canvas) return;

        setDiagramLoading(true);
        setError(null);

        try {
            // Ensure a fresh canvas for every execution
            const drawCanvas = new DrawCanvas(canvas);
            drawCanvas.clear();

            const parsed = commands.trim() === '' ? [] : parse(commands);
            const engine = new DrawEngine(drawCanvas);
            engine.run(parsed);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred during parsing or execution.");
        } finally {
            setDiagramLoading(false);
        }
    }

    const handleSetCommands = (newCommands: string) => {
        // Update the command text instantly and clear any pending auto‑run.
        setCommands(newCommands);
        setError(null)
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