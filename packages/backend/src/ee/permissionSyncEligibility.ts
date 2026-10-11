import type { Prisma } from "@sourcecat/db";
import {
    PERMISSION_SYNC_SUPPORTED_CODE_HOST_TYPES,
    PERMISSION_SYNC_SUPPORTED_IDENTITY_PROVIDERS,
} from "@sourcecat/shared";

export const ACCOUNT_PERMISSION_SYNC_WHERE = {
    providerType: {
        in: [...PERMISSION_SYNC_SUPPORTED_IDENTITY_PROVIDERS],
    },
} satisfies Prisma.AccountWhereInput;

export const REPO_PERMISSION_SYNC_WHERE = {
    isPublic: false,
    external_codeHostType: {
        in: PERMISSION_SYNC_SUPPORTED_CODE_HOST_TYPES,
    },
    connections: {
        some: {
            connection: {
                enforcePermissions: true,
            },
        },
    },
} satisfies Prisma.RepoWhereInput;
