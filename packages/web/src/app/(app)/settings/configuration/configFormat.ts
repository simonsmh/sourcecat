import { applyEdits, format, parse, printParseErrorCode, type ParseError } from "jsonc-parser";

export interface JsonSyntaxError {
    message: string;
    line: number;
    column: number;
}

const getLineAndColumn = (content: string, offset: number): { line: number; column: number } => {
    const upToOffset = content.slice(0, offset);
    const line = upToOffset.split("\n").length;
    const column = offset - upToOffset.lastIndexOf("\n");
    return { line, column };
};

// Mirrors the backend loader's acceptance rules: comments are allowed (the
// loader strips them before JSON.parse), trailing commas are not.
export const findJsonSyntaxError = (content: string): JsonSyntaxError | null => {
    if (content.trim().length === 0) {
        return { message: "JSON content is empty", line: 1, column: 1 };
    }

    const errors: ParseError[] = [];
    parse(content, errors, { allowTrailingComma: false, disallowComments: false });
    const firstError = errors[0];
    if (!firstError) {
        return null;
    }

    const { line, column } = getLineAndColumn(content, firstError.offset);
    return {
        message: printParseErrorCode(firstError.error),
        line,
        column,
    };
};

// Formats with two-space indentation while preserving comments. Returns null
// when the content has syntax errors: reformatting broken JSON would produce
// misleading results, so the caller surfaces the syntax error instead.
export const formatConfigContent = (content: string): string | null => {
    if (findJsonSyntaxError(content) !== null) {
        return null;
    }

    const edits = format(content, undefined, {
        tabSize: 2,
        insertSpaces: true,
        eol: "\n",
        insertFinalNewline: true,
    });
    return applyEdits(content, edits);
};
