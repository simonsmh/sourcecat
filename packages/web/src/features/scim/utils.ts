import { __unsafePrisma } from "@/prisma";
import { hasEntitlement } from "@/lib/entitlements";
import { Org } from "@sourcecat/db";

export const isScimEnabled = async (org: Org): Promise<boolean> => {
    if (!await hasEntitlement('scim')) {
        return false;
    }
    return org?.isScimEnabled ?? false;
};
