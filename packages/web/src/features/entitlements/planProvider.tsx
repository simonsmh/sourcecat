'use client';

import { createContext } from "react";
import { Entitlement } from "@sourcecat/shared";

export const PlanContext = createContext<{ entitlements: Entitlement[] }>({ entitlements: [] });

interface PlanProviderProps {
    children: React.ReactNode;
    entitlements: Entitlement[];
}

export const PlanProvider = ({ children, entitlements }: PlanProviderProps) => {
    return (
        <PlanContext.Provider
            value={{ entitlements }}
        >
            {children}
        </PlanContext.Provider>
    )
};
