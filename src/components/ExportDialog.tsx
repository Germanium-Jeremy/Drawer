import { useEffect, useState } from "react"
import { FaX } from "react-icons/fa6"
import LoadingComponent from "./Loading"

interface ExportDialogProps {
    onClose: () => void;
}

const ExportDialog = ({ onClose }: ExportDialogProps) => {
    const [isGenerating, setIsGenerating] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const generateImage = () => {
            const canvas = document.getElementById('diagram-canvas') as HTMLCanvasElement;
            if (canvas) {
                // Get the data URL of the canvas
                const url = canvas.toDataURL('image/png');
                
                // Simulate generation progress delay for UX
                setTimeout(() => {
                    setImageUrl(url);
                    setIsGenerating(false);
                }, 1500);
            } else {
                setIsGenerating(false);
            }
        };

        generateImage();
    }, []);

    return (
        <>
            <div className="bg-black w-full h-full fixed opacity-40 top-0 bottom-0 right-0 left-0 z-40" onClick={onClose} />

            <div className="fixed px-8 py-4 bg-white rounded-xl mx-auto min-w-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center shadow-2xl">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors p-1">
                    <FaX className="text-xl" />
                </button>
                
                <h1 className="text-2xl text-center font-bold bg-linear-to-r from-amber-500 to-gray-500 bg-clip-text text-transparent mt-2 mb-6">
                    Export to PNG
                </h1>

                {isGenerating ? (
                    <div className="flex flex-col items-center gap-6 my-8">
                        {LoadingComponent(false)}
                        <p className="font-semibold text-gray-700 animate-pulse">Generating your image...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 my-4 w-full">
                        {imageUrl ? (
                            <>
                                <div className="bg-gray-100 p-2 rounded border border-gray-200">
                                    <img src={imageUrl} alt="Diagram Preview" className="w-64 object-contain shadow-sm bg-white" />
                                </div>
                                <a 
                                    href={imageUrl} 
                                    download="diagram.png"
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md font-semibold transition-colors shadow-md w-full text-center"
                                    onClick={onClose}
                                >
                                    Download Image
                                </a>
                            </>
                        ) : (
                            <p className="text-red-500 font-semibold mb-4">Failed to generate image. Canvas not found.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default ExportDialog
