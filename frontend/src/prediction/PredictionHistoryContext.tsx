import {addPredictionHistory, getPredictionHistory, type PredictionHistoryResult} from "./predictionAPI.ts";
import {createContext, type ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {useAuth} from "../auth/AuthProvider.tsx";

interface PredictionHistoryContextType {
    history: PredictionHistoryResult[];
    isLoading: boolean;
    fetchHistory: () => Promise<void>;
    addHistoryItem: (content: string) => Promise<void>;
}

const PredictionHistoryContext = createContext<PredictionHistoryContextType | undefined>(undefined);

export const PredictionHistoryProvider =({ children }: {children: ReactNode}) => {
    const { isAuthenticated } = useAuth();
    const [history, setHistory] = useState<PredictionHistoryResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Callback to fetch user's prediction history. Updates on authentication change.
    const fetchHistory = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }

        setIsLoading(true);
        try {
            const historyResult = await getPredictionHistory();
            setHistory(historyResult || []);
        } catch (error) {
            console.error("Failed to fetch history:", error);
            setHistory([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated])

    // Add item to history
    const addHistoryItem = async (content: string) => {
        if (!isAuthenticated || !content) {
            return;
        }

        try {
            await addPredictionHistory(content);

            // Get updated history. This could be updated to prevent an additional call to
            // the backend but works for now.
            await fetchHistory();
        } catch (error) {
            console.error("Failed to add history:", error);
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetchHistory();
        } else {
            setHistory([]);
        }
    }, [isAuthenticated, fetchHistory]);

    const contextValue = { history, isLoading, fetchHistory, addHistoryItem };

    return (
        <PredictionHistoryContext.Provider value={contextValue}>
            {children}
        </PredictionHistoryContext.Provider>
    );
}

export const usePredictionHistory = () => {
    const context = useContext(PredictionHistoryContext);
    if (!context) {
        throw new Error("usePredictionHistory must be used within a PredictionHistoryProvider");
    }
    return context;
}