export default function LoadingComponent(isFull ?: boolean) {
    if (!isFull) return <span className="w-10 h-10 rounded-full border-x-2 border-amber-500 animate-spin"></span>

    return (
        <div className="h-screen w-screen flex justify-center align-middle items-center bg-white">
            <span className="w-10 h-10 rounded-full border-x-2 border-amber-500 animate-spin"></span>
        </div>
    )
}