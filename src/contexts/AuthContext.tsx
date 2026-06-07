import React, { createContext, useContext, useEffect, useState } from "react";
import LoadingComponent from "../components/Loading";
import type { User } from "../types/types";
import { toast } from "sonner";

interface AuthContextType {
    user: User | null;
    token: string | null;
    authLoading: boolean;
    showLogin: boolean;
    showRegister: boolean;
    login: (token: string, user: User) => void;
    register: (token: string, user: User) => void;
    logout: () => void;
    openLogin: () => void;
    closeLogin: () => void;
    openRegister: () => void;
    closeRegister: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [showLogin, setShowLogin] = useState(false)
    const [showRegister, setShowRegister] = useState(false)

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }

        setAuthLoading(false)
    }, [])

    function login(token: string, user: User) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setToken(token)
        setUser(user)
        setShowLogin(false)
        toast.success(`Welcome back, ${user.username}!`)
    }

    function register(token: string, user: User) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setToken(token)
        setUser(user)
        setShowRegister(false)
        toast.success(`Account created! Welcome, ${user.username}!`)
    }

    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    function openLogin() {
        setShowRegister(false)
        setShowLogin(true)
    }

    function closeLogin() {
        setShowLogin(false)
    }

    function openRegister() {
        setShowLogin(false)
        setShowRegister(true)
    }

    function closeRegister() {
        setShowRegister(false)
    }

    if (authLoading) {
        return LoadingComponent(true)
    }

    return (
        <AuthContext.Provider value={{
            user, token, authLoading,
            showLogin, showRegister,
            login, register, logout,
            openLogin, closeLogin, openRegister, closeRegister
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used inside AuthProvider ")
    return context
}