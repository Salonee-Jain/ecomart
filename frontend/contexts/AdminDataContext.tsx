"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AdminDataContextType {
    refreshTrigger: number;
    triggerRefresh: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    return (
        <AdminDataContext.Provider value={{ refreshTrigger, triggerRefresh }}>
            {children}
        </AdminDataContext.Provider>
    );
}

export function useAdminData() {
    const context = useContext(AdminDataContext);
    if (!context) {
        throw new Error("useAdminData must be used within AdminDataProvider");
    }
    return context;
}
