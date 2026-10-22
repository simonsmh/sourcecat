'use server';

import { ErrorCode } from "@/lib/errorCodes";
import { ServiceError } from "@/lib/serviceError";
import { sew } from "@/middleware/sew";
import { withAuth } from "@/middleware/withAuth";
import { withMinimumOrgRole } from "@/middleware/withMinimumOrgRole";
import { OrgRole } from "@sourcecat/db";
import { env, isRemotePath } from "@sourcecat/shared";
import { readFile, writeFile } from "fs/promises";
import { StatusCodes } from "http-status-codes";
import { validateConfigContent } from "./configFile";

export interface ConfigFileState {
    content: string;
    isReadOnly: boolean;
}

const serviceError = (
    statusCode: number,
    errorCode: ErrorCode,
    message: string,
): ServiceError => ({ statusCode, errorCode, message });

export const getConfigFile = async (): Promise<ConfigFileState | ServiceError> => sew(async () =>
    withAuth(async ({ role }) =>
        withMinimumOrgRole(role, OrgRole.OWNER, async () => {
            const configPath = env.CONFIG_PATH;

            // A remote config can be displayed but never written from here.
            if (isRemotePath(configPath)) {
                try {
                    const response = await fetch(configPath);
                    if (!response.ok) {
                        return serviceError(
                            StatusCodes.BAD_GATEWAY,
                            ErrorCode.CONFIG_FILE_READ_FAILED,
                            `Failed to fetch config file from '${configPath}': ${response.statusText}`,
                        );
                    }
                    return { content: await response.text(), isReadOnly: true };
                } catch (error) {
                    return serviceError(
                        StatusCodes.BAD_GATEWAY,
                        ErrorCode.CONFIG_FILE_READ_FAILED,
                        `Failed to fetch config file from '${configPath}': ${error instanceof Error ? error.message : String(error)}`,
                    );
                }
            }

            try {
                const content = await readFile(configPath, { encoding: "utf-8" });
                return { content, isReadOnly: false };
            } catch (error) {
                return serviceError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    ErrorCode.CONFIG_FILE_READ_FAILED,
                    `Failed to read config file '${configPath}': ${error instanceof Error ? error.message : String(error)}`,
                );
            }
        })
    )
);

export const saveConfigFile = async (content: string): Promise<{ success: true } | ServiceError> => sew(async () =>
    withAuth(async ({ role }) =>
        withMinimumOrgRole(role, OrgRole.OWNER, async () => {
            const configPath = env.CONFIG_PATH;

            if (isRemotePath(configPath)) {
                return serviceError(
                    StatusCodes.BAD_REQUEST,
                    ErrorCode.CONFIG_FILE_REMOTE_PATH,
                    "The config file is loaded from a remote URL (CONFIG_PATH) and cannot be edited from the UI.",
                );
            }

            // Validate before touching the file: content that passes here is
            // guaranteed to load when the backend's config watcher picks up
            // the change and applies it.
            const validation = validateConfigContent(content);
            if (!validation.success) {
                return serviceError(
                    StatusCodes.BAD_REQUEST,
                    validation.kind === "tooLarge" ? ErrorCode.CONFIG_FILE_TOO_LARGE : ErrorCode.CONFIG_FILE_INVALID,
                    validation.error,
                );
            }

            try {
                // Write in place rather than temp-file + rename: in the
                // standard deployment the config is a single-file bind mount,
                // where renaming over the mount point fails (EBUSY) and would
                // detach the file from its host path. The content is already
                // validated, and the watcher only reads once writes settle.
                await writeFile(configPath, content, { encoding: "utf-8" });
            } catch (error) {
                return serviceError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    ErrorCode.CONFIG_FILE_WRITE_FAILED,
                    `Failed to write config file '${configPath}': ${error instanceof Error ? error.message : String(error)}`,
                );
            }

            return { success: true };
        })
    )
);
