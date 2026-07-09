import { useState } from "react"
import { FaX } from "react-icons/fa6"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"
import api from "../lib/axios"

const AuthDialog = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, closeLogin } = useAuth()

    const handleLogin = async () => {
        try {
            const response = await api.post('/auth/login', { email, password })
            const data = response.data
            
            login(data.token, {
                userId: data.userId,
                email: data.email,
                username: data.username ?? data.email.split('@')[0],
            })
        } catch (error: any) {
            console.error('Login error:', error)
            toast.error(error.response?.data?.message || 'An error occurred during login')
        }
    }
    
    return (
        <>
            <div className="bg-black w-full h-full fixed opacity-40 top-0 bottom-0 right-0 left-0" onClick={closeLogin} />

            <div className="fixed px-8 py-4 bg-white rounded-xl mx-auto min-w-100">
                <FaX className="text-4xl bg-amber-500 p-1 h-6 w-6 rounded-full absolute top-2 right-2 cursor-pointer" onClick={closeLogin} />
                <h1 className="text-2xl text-center font-bold bg-linear-to-r from-amber-500 to-gray-500 bg-clip-text text-transparent my-8">Drawer Login</h1>

                <div className="flex flex-col mt-4 gap-1">
                    <label htmlFor="login-email" className="font-semibold text-gray-800">Email</label>
                    <input id="login-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-3 py-1 focus:outline-none resize-none rounded-md shadow-md h-full border-2 border-gray-300 focus-within:border-amber-500`} 
                    />
                </div>
                
                <div className="flex flex-col mt-4 gap-1">
                    <label htmlFor="login-password" className="font-semibold text-gray-800">Password</label>
                    <input id="login-password" type="password" placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-3 py-1 focus:outline-none resize-none rounded-md shadow-md h-full border-2 border-gray-300 focus-within:border-amber-500`} 
                    />
                </div>

                <div className="flex flex-col my-5 gap-1">
                    <button onClick={handleLogin}
                        className='bg-amber-500 hover:bg-white text-white hover:border-2 hover:border-amber-500 hover:text-amber-500 px-4 py-2 rounded-md font-semibold'
                    >
                        Login
                    </button>
                </div>

                <hr />

                <div className="flex items-center justify-around mt-5">
                    <button 
                        className='bg-amber-500 hover:bg-white text-white hover:border-2 hover:border-amber-500 hover:text-amber-500 px-4 py-2 rounded-md font-semibold'
                    >
                        Google
                    </button>
                    <button 
                        className="bg-white text-amber-500 hover:bg-amber-200 hover:text-gray-800 px-4 py-2 rounded-md font-semibold border-2 border-amber-500"
                    >
                        Github
                    </button>
                </div>
            </div>
        </>
    )
}

export default AuthDialog
