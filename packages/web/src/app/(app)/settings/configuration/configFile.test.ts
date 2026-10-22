import { describe, expect, test } from "vitest";
import { MAX_CONFIG_CONTENT_BYTES, validateConfigContent } from "./configFile";

describe("validateConfigContent", () => {
    test("accepts an empty config", () => {
        expect(validateConfigContent("{}")).toEqual({ success: true });
    });

    test("accepts a config with connections and settings", () => {
        const content = JSON.stringify({
            connections: {
                "my-github": {
                    type: "github",
                    token: { env: "GITHUB_TOKEN" },
                },
            },
            settings: {
                maxConnectionSyncJobConcurrency: 2,
            },
        });
        expect(validateConfigContent(content)).toEqual({ success: true });
    });

    test("accepts JSONC comments like the backend loader does", () => {
        const content = `{
            // a hand-written comment
            "connections": {}
        }`;
        expect(validateConfigContent(content)).toEqual({ success: true });
    });

    test("rejects malformed JSON", () => {
        const result = validateConfigContent("{ not json");
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain("Invalid JSON");
        }
    });

    test("rejects content that violates the config schema", () => {
        const result = validateConfigContent(JSON.stringify({ settings: "not-an-object" }));
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain("Invalid config");
        }
    });

    test("rejects content over the size limit", () => {
        const content = `{"connections":{}}${" ".repeat(MAX_CONFIG_CONTENT_BYTES)}`;
        const result = validateConfigContent(content);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain("too large");
        }
    });
});
