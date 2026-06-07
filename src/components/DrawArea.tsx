import { useEffect, useRef } from "react"
import { useDraw } from "../contexts/DrawContext"
import LoadingComponent from "./Loading"

const DrawArea = () => {
    const { diagramLoading, error, handleGenerateDiagram } = useDraw()
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Trigger initial render of turtle pointer once the canvas element mounts
    useEffect(() => {
        if (canvasRef.current) {
            handleGenerateDiagram();
        }
    }, []);

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

            {error && (
                <div className="absolute bottom-6 left-6 right-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md shadow-md transition-all duration-300">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Syntax / Execution Error</h3>
                            <p className="text-xs text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default DrawArea
