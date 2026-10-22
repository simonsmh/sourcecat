"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/hooks/use-toast";
import { isServiceError } from "@/lib/utils";
import { useTranslations } from "@/i18n/I18nProvider";
import { CheckCircle2, Info } from "lucide-react";
import { getConfigFile, saveConfigFile, validateConfigFile } from "./actions";
import { findJsonSyntaxError, formatConfigContent } from "./configFormat";

interface ConfigurationPageProps {
    initialContent: string;
    isReadOnly: boolean;
}

export function ConfigurationPage({ initialContent, isReadOnly }: ConfigurationPageProps) {
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const { toast } = useToast();

    const [content, setContent] = useState(initialContent);
    const [savedContent, setSavedContent] = useState(initialContent);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isReloading, setIsReloading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationPassed, setValidationPassed] = useState(false);

    const isDirty = content !== savedContent;

    const handleContentChange = (nextContent: string) => {
        setContent(nextContent);
        // A previous validation result no longer describes the content.
        setValidationPassed(false);
    };

    const showSyntaxError = () => {
        const syntaxError = findJsonSyntaxError(content);
        if (syntaxError) {
            setError(t("configurationPage.invalidJsonAt", {
                line: syntaxError.line,
                column: syntaxError.column,
                message: syntaxError.message,
            }));
        }
    };

    const handleValidate = async () => {
        setError(null);
        setValidationPassed(false);

        // Syntax is checked locally so the error can point at the exact
        // location; the schema check runs server-side with the same
        // validator that gates saving.
        if (findJsonSyntaxError(content)) {
            showSyntaxError();
            return;
        }

        setIsValidating(true);
        try {
            const result = await validateConfigFile(content);
            if (isServiceError(result)) {
                setError(result.message);
                return;
            }
            setValidationPassed(true);
        } finally {
            setIsValidating(false);
        }
    };

    const handleFormat = () => {
        setError(null);
        setValidationPassed(false);

        const formatted = formatConfigContent(content);
        if (formatted === null) {
            showSyntaxError();
            return;
        }
        setContent(formatted);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const result = await saveConfigFile(content);
            if (isServiceError(result)) {
                setError(result.message);
                return;
            }
            setSavedContent(content);
            toast({ description: t("configurationPage.saved") });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReload = async () => {
        setIsReloading(true);
        setError(null);
        try {
            const result = await getConfigFile();
            if (isServiceError(result)) {
                setError(result.message);
                return;
            }
            setContent(result.content);
            setSavedContent(result.content);
            setValidationPassed(false);
        } finally {
            setIsReloading(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "s") {
            event.preventDefault();
            if (!isReadOnly && isDirty && !isSaving) {
                void handleSave();
            }
            return;
        }

        // Keep Tab inside the editor instead of moving focus.
        if (event.key === "Tab") {
            event.preventDefault();
            const textarea = event.currentTarget;
            const { selectionStart, selectionEnd, value } = textarea;
            const indent = "    ";
            const nextValue = value.slice(0, selectionStart) + indent + value.slice(selectionEnd);
            handleContentChange(nextValue);
            requestAnimationFrame(() => {
                textarea.selectionStart = textarea.selectionEnd = selectionStart + indent.length;
            });
        }
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div>
                <h3 className="text-lg font-medium">{t("configurationPage.title")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("configurationPage.description")}
                </p>
            </div>

            {isReadOnly && (
                <Alert className="items-center">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <AlertDescription>{t("configurationPage.remoteReadOnly")}</AlertDescription>
                </Alert>
            )}

            <Textarea
                value={content}
                onChange={(event) => handleContentChange(event.target.value)}
                onKeyDown={handleKeyDown}
                readOnly={isReadOnly}
                disabled={isSaving}
                spellCheck={false}
                wrap="off"
                aria-label={t("configurationPage.title")}
                className="min-h-0 flex-1 resize-none overflow-auto whitespace-pre font-mono text-sm"
            />

            {error && (
                <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-700 dark:text-red-400">{error}</pre>
                </div>
            )}

            {validationPassed && !error && (
                <div role="status" className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {t("configurationPage.validationPassed")}
                </div>
            )}

            <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">
                    {isDirty && !isReadOnly ? t("configurationPage.unsavedChanges") : ""}
                </span>
                <div className="flex gap-2">
                    <LoadingButton
                        variant="outline"
                        onClick={handleValidate}
                        loading={isValidating}
                        disabled={isSaving}
                    >
                        {t("configurationPage.validate")}
                    </LoadingButton>
                    {!isReadOnly && (
                        <Button
                            variant="outline"
                            onClick={handleFormat}
                            disabled={isSaving || isValidating}
                        >
                            {t("configurationPage.format")}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleReload}
                        disabled={isReloading || isSaving}
                    >
                        {t("configurationPage.reload")}
                    </Button>
                    {!isReadOnly && (
                        <LoadingButton
                            onClick={handleSave}
                            loading={isSaving}
                            disabled={!isDirty}
                        >
                            {tCommon("save")}
                        </LoadingButton>
                    )}
                </div>
            </div>
        </div>
    );
}
