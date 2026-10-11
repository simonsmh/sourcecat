'use server';

import { sew } from "@/middleware/sew";
import { withAuth } from "@/middleware/withAuth";
import { withMinimumOrgRole } from "@/middleware/withMinimumOrgRole";
import { OrgRole } from "@sourcecat/db";
import { ServiceError } from "@/lib/serviceError";
import { StatusCodes } from "http-status-codes";
import { ErrorCode } from "@/lib/errorCodes";
import type { Invoice } from "@sourcecat/shared";

// Fork: license verification removed. All license server actions are disabled.
// The license is always valid and no license server is contacted.

const licensingRemovedError = (): ServiceError => ({
    statusCode: StatusCodes.GONE,
    errorCode: ErrorCode.UNEXPECTED_ERROR,
    message: "License management has been removed in this fork. All features are enabled.",
});

export const refreshLicense = async (): Promise<{ success: boolean } | ServiceError> => sew(() =>
    withAuth(async ({ role }) =>
        withMinimumOrgRole(role, OrgRole.OWNER, async () => {
            return licensingRemovedError();
        })
    )
);

export const createPortalSession = async (): Promise<{ url: string } | ServiceError> => sew(() =>
    withAuth(async ({ role }) =>
        withMinimumOrgRole(role, OrgRole.OWNER, async () => {
            return licensingRemovedError();
        })
    )
);

export const getAllInvoices = async (): Promise<Invoice[] | ServiceError> => sew(() =>
    withAuth(async ({ role }) =>
        withMinimumOrgRole(role, OrgRole.OWNER, async () => {
            return licensingRemovedError();
        })
    )
);
