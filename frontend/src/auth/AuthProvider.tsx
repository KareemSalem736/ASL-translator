import React, { createContext, useContext, useEffect, useState } from "react";
import {verifyAccessToken} from "./authApi.ts";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Attempt to verify access token.
                await verifyAccessToken();
                setIsAuthenticated(true);
            } catch {
                console.error("Token is not validated.")
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const contextValue = React.useMemo(
        () => ({
            isAuthenticated: isAuthenticated,
            isLoading: isLoading,
            setIsAuthenticated,
        }),
        [isAuthenticated, isLoading]
    )

    return (
        <AuthContext.Provider value={contextValue}>
            {isLoading ? null : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context;
}