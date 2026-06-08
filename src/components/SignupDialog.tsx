import { useState } from "react"
import { FaX } from "react-icons/fa6"
import { useAuth } from "../contexts/AuthContext"

const SignupDialog = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { register, closeRegister } = useAuth()

    const handleRegister = async () => {
        // Mock registration — replace with real API call later
        register('mock_token_' + Date.now(), {
            userId: Date.now(),
            username: username || 'User',
            email
        })
    }

    return (
        <>
            <div className="bg-black w-full h-full fixed opacity-40 top-0 bottom-0 right-0 left-0" onClick={closeRegister} />

            <div className="fixed px-8 py-4 bg-white rounded-xl mx-auto min-w-100">
                <FaX className="text-4xl bg-amber-500 p-1 h-6 w-6 rounded-full absolute top-2 right-2 cursor-pointer" onClick={closeRegister} />
                <h1 className="text-2xl text-center font-bold bg-linear-to-r from-amber-500 to-gray-500 bg-clip-text text-transparent my-8">Drawer Register</h1>

                <div className="flex flex-col mt-4 gap-1">
                    <label htmlFor="register-username" className="font-semibold text-gray-800">Username</label>
                    <input id="register-username" type="text" placeholder="Enter your Username" value={username} onChange={(e) => setUsername(e.target.value)}
                        className={`w-full px-3 py-1 focus:outline-none resize-none rounded-md shadow-md h-full border-2 border-gray-300 focus-within:border-amber-500`} 
                    />
                </div>

                <div className="flex flex-col mt-4 gap-1">
                    <label htmlFor="register-email" className="font-semibold text-gray-800">Email</label>
                    <input id="register-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-3 py-1 focus:outline-none resize-none rounded-md shadow-md h-full border-2 border-gray-300 focus-within:border-amber-500`} 
                    />
                </div>
                
                <div className="flex flex-col mt-4 gap-1">
                    <label htmlFor="register-password" className="font-semibold text-gray-800">Password</label>
                    <input id="register-password" type="password" placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-3 py-1 focus:outline-none resize-none rounded-md shadow-md h-full border-2 border-gray-300 focus-within:border-amber-500`} 
                    />
                </div>

                <div className="flex flex-col my-5 gap-1">
                    <button onClick={handleRegister}
                        className='bg-amber-500 hover:bg-white text-white hover:border-2 hover:border-amber-500 hover:text-amber-500 px-4 py-2 rounded-md font-semibold'
                    >
                        Register
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

export default SignupDialog
