"use client";

import { useId, useState } from "react";
import { SettingsCard } from "../../components/settingsCard";
import { setLoginMessage } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/hooks/use-toast";
import { useTranslations } from "@/i18n/I18nProvider";
import { isServiceError } from "@/lib/utils";
import { LoginMessage } from "@/features/auth/components/loginMessage";
import { LOGIN_MESSAGE_MAX_LENGTH } from "@/features/auth/constants";

export function LoginMessageSettingsCard({ loginMessage }: { loginMessage: string | null }) {
    const [draft, setDraft] = useState(loginMessage ?? "");
    const [savedMessage, setSavedMessage] = useState(loginMessage ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const id = useId();
    const { toast } = useToast();
    const t = useTranslations("settings");
    const message = draft.trim() ? draft : "";

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const result = await setLoginMessage(message || null);
            if (isServiceError(result)) {
                setError(result.message);
                return;
            }
            setSavedMessage(message);
            setDraft(message);
            toast({ description: message ? t("securityPage.loginMessageCard.saved") : t("securityPage.loginMessageCard.removed") });
        } catch {
            setError(t("securityPage.loginMessageCard.saveFailed"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SettingsCard>
            <Tabs defaultValue="write">
                <TabsList aria-label={t("securityPage.loginMessageCard.editorAriaLabel")}>
                    <TabsTrigger value="write">{t("securityPage.loginMessageCard.write")}</TabsTrigger>
                    <TabsTrigger value="preview">{t("securityPage.loginMessageCard.preview")}</TabsTrigger>
                </TabsList>
                <TabsContent value="write">
                    <label htmlFor={id} className="sr-only">{t("securityPage.loginMessage")}</label>
                    <Textarea
                        id={id}
                        aria-describedby={`${id}-hint ${id}-count`}
                        value={draft}
                        onChange={(event) => {
                            setDraft(event.target.value);
                            setError(null);
                        }}
                        disabled={isSaving}
                        maxLength={LOGIN_MESSAGE_MAX_LENGTH}
                        rows={7}
                        className="font-mono text-sm"
                        placeholder={t("securityPage.loginMessageCard.placeholder")}
                    />
                </TabsContent>
                <TabsContent value="preview" className="min-h-40">
                    {message ? <LoginMessage message={message} /> : (
                        <p className="py-6 text-sm text-muted-foreground">{t("securityPage.loginMessageCard.emptyPreview")}</p>
                    )}
                </TabsContent>
            </Tabs>
            <div className="mt-3 flex items-start justify-between gap-4 text-xs text-muted-foreground">
                <p id={`${id}-hint`}>{t("securityPage.loginMessageCard.hint")}</p>
                <span id={`${id}-count`} className="shrink-0">{draft.length.toLocaleString()} / {LOGIN_MESSAGE_MAX_LENGTH.toLocaleString()}</span>
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
            <div className="mt-4 flex justify-end">
                <LoadingButton onClick={handleSave} loading={isSaving} disabled={message === savedMessage || draft.length > LOGIN_MESSAGE_MAX_LENGTH}>
                    {t("securityPage.loginMessageCard.saveChanges")}
                </LoadingButton>
            </div>
        </SettingsCard>
    );
}
