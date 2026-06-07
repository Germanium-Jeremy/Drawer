// import { FaPlus } from "react-icons/fa6"
import { useDraw } from "../contexts/DrawContext"
import LoadingComponent from "./Loading"

const DrawArea = () => {
    const { diagramLoading } = useDraw()
    return (
        <main className="p-4 h-full w-full">
            <div id="diagram-canvas">
                {diagramLoading && LoadingComponent()}
            </div>
            {/* <FaPlus className="text-gray-600 hover:text-black" /> */}
        </main>
    )
}

export default DrawArea
