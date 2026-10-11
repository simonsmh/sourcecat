'use server';

import { sew } from "@/middleware/sew";
import { withAuth } from "@/middleware/withAuth";
import { withMinimumOrgRole } from "@/middleware/withMinimumOrgRole";
import { OrgRole } from "@sourcebot/db";
import { ServiceError } from "@/lib/serviceError";
import { StatusCodes } from "http-status-codes";
import { ErrorCode } from "@/lib/errorCodes";
import { UpsellSource } from "@/lib/posthogEvents";

// Fork: license verification removed. All billing / license activation actions
// are disabled. The license is always valid and no license server is contacted.

const licensingRemovedError = (): ServiceError => ({
    statusCode: StatusCodes.GONE,
    errorCode: ErrorCode.UNEXPECTED_ERROR,
    message: "License management has been removed in this fork. All features are enabled.",
});

export const activateLicense = async (_activationCode: string): Promise<{ success: boolean } | ServiceError> => sew(() =>
    withAuth(async ({ role }) =>
        withMinimumOrgRole(role, OrgRole.OWNER, async () => {
            return licensingRemovedError();
        })
    )
);

export const claimActivationCode = async (_sessionId: string): Promise<{ activationCode: string } | ServiceError> => sew(() =>
    withAuth(async ({ role }) =>
        withMinimumOrgRole(role, OrgRole.OWNER, async () => {
            return licensingRemovedError();
        })
    )
);

export const createCheckoutSession = async ({
    source: _source,
    requestTrial: _requestTrial = false,
    interval: _interval = 'year',
    returnPath: _returnPath = '/settings/license',
    overrideEmail: _overrideEmail,
}: {
    source: UpsellSource;
    requestTrial?: boolean;
    interval?: 'month' | 'year';
    returnPath?: string;
    overrideEmail?: string;
}): Promise<{ url: string } | ServiceError> => sew(() =>
    withAuth(async ({ role }) =>
        withMinimumOrgRole(role, OrgRole.OWNER, async () => {
            return licensingRemovedError();
        })
    )
);

export const deactivateLicense = async (): Promise<{ success: boolean } | ServiceError> => sew(() =>
    withAuth(async ({ org, role, prisma }) =>
        withMinimumOrgRole(role, OrgRole.OWNER, async () => {
            // Local-only cleanup of any stale license row. No server is contacted.
            await prisma.license.delete({
                where: { orgId: org.id },
            }).catch(() => {
                // No license row exists; nothing to do.
            });

            return { success: true };
        })
    )
);
