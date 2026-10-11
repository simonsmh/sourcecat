'use client';

import { Entitlement } from "@sourcecat/shared";
import { useContext } from "react";
import { PlanContext } from "./planProvider";

export const useHasEntitlement = (entitlement: Entitlement) => {
    const { entitlements } = useContext(PlanContext);
    return entitlements.includes(entitlement);
}