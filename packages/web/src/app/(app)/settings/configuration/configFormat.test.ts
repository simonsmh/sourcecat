import { describe, expect, test } from "vitest";
import { findJsonSyntaxError, formatConfigContent } from "./configFormat";

describe("findJsonSyntaxError", () => {
    test("accepts valid JSON", () => {
        expect(findJsonSyntaxError('{"connections": {}}')).toBeNull();
    });

    test("accepts JSONC comments like the backend loader does", () => {
        const content = `{
            // a hand-written comment
            "connections": {}
        }`;
        expect(findJsonSyntaxError(content)).toBeNull();
    });

    test("rejects trailing commas like the backend loader does", () => {
        expect(findJsonSyntaxError('{"connections": {},}')).not.toBeNull();
    });

    test("rejects empty content", () => {
        expect(findJsonSyntaxError("   ")).not.toBeNull();
    });

    test("reports the line and column of the first error", () => {
        const content = ['{', '    "connections": {},', '    "settings": }', "}"].join("\n");
        const error = findJsonSyntaxError(content);
        expect(error).not.toBeNull();
        expect(error?.line).toBe(3);
        expect(error?.column).toBeGreaterThan(1);
    });
});

describe("formatConfigContent", () => {
    test("pretty-prints minified JSON with two-space indentation", () => {
        expect(formatConfigContent('{"connections":{"a":{"type":"github"}}}')).toBe(
            ['{', '  "connections": {', '    "a": {', '      "type": "github"', "    }", "  }", "}", ""].join("\n"),
        );
    });

    test("preserves comments while formatting", () => {
        const formatted = formatConfigContent('// top comment\n{"connections":{}}');
        expect(formatted).toContain("// top comment");
        expect(formatted).toContain('{\n  "connections": {}');
    });

    test("is a no-op for already formatted content", () => {
        const content = '{\n  "connections": {}\n}\n';
        expect(formatConfigContent(content)).toBe(content);
    });

    test("returns null for malformed JSON", () => {
        expect(formatConfigContent("{ not json")).toBeNull();
    });
});
