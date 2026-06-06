import { useEffect, useRef } from "react"
import { useDraw } from "../contexts/DrawContext"
import LoadingComponent from "./Loading"
import { toast } from "sonner"

const DrawArea = () => {
    const { diagramLoading, error, handleGenerateDiagram } = useDraw()
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Trigger initial render of turtle pointer once the canvas element mounts
    useEffect(() => {
        if (canvasRef.current) {
            handleGenerateDiagram();
        }
    }, []);

    useEffect(() => {
        if (error) {
            toast.error("Syntax/Execution error: " + error);
        }
    }, [error]);

    return (
        <main className="flex-1 p-6 flex items-center justify-center bg-gray-100 relative overflow-hidden min-h-[400px]">
            <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    id="diagram-canvas"
                    width={800}
                    height={600}
                    className="block max-w-full max-h-[70vh] bg-white aspect-[4/3]"
                />

                {diagramLoading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-xs">
                        {LoadingComponent(false)}
                    </div>
                )}
            </div>
        </main>
    )
}

export default DrawArea
