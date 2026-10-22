import { indexSchema } from "@sourcecat/schemas/v3/index.schema";
import { Ajv } from "ajv";
import stripJsonComments from "strip-json-comments";

// Sanity ceiling for the editor: real config files are orders of magnitude
// smaller, and this keeps a paste error from turning into a giant write.
export const MAX_CONFIG_CONTENT_BYTES = 1024 * 1024;

// Same validator configuration the shared `loadConfig` uses, so content that
// passes here is guaranteed to load when the backend picks up the change.
const ajv = new Ajv({
    validateFormats: false,
});

export type ConfigValidationResult =
    | { success: true }
    | { success: false; kind: "tooLarge" | "invalid"; error: string };

// JSON.parse error messages only sometimes carry a location. When a byte
// position is present, translate it into a line/column against the
// comment-stripped text — stripJsonComments preserves offsets, so the
// location matches the original content.
const describeJsonError = (content: string, message: string): string => {
    if (message.includes("line ") && message.includes("column")) {
        return message;
    }
    const positionMatch = /position (\d+)/.exec(message);
    if (!positionMatch) {
        return message;
    }
    const position = Number(positionMatch[1]);
    const upToPosition = stripJsonComments(content).slice(0, position);
    const line = upToPosition.split("\n").length;
    const column = position - upToPosition.lastIndexOf("\n");
    return `${message} (line ${line}, column ${column})`;
};

export const validateConfigContent = (content: string): ConfigValidationResult => {
    if (Buffer.byteLength(content, "utf-8") > MAX_CONFIG_CONTENT_BYTES) {
        return {
            success: false,
            kind: "tooLarge",
            error: `Config file is too large. The maximum size is ${MAX_CONFIG_CONTENT_BYTES} bytes.`,
        };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(stripJsonComments(content));
    } catch (error) {
        return {
            success: false,
            kind: "invalid",
            error: `Invalid JSON: ${describeJsonError(content, error instanceof Error ? error.message : String(error))}`,
        };
    }

    const isValid = ajv.validate(indexSchema, parsed);
    if (!isValid) {
        return {
            success: false,
            kind: "invalid",
            error: `Invalid config: ${ajv.errorsText(ajv.errors)}`,
        };
    }

    return { success: true };
};
