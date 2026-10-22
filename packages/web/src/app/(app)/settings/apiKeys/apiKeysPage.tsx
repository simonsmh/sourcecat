'use client';

import { createApiKey, deleteApiKey } from "@/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { isServiceError } from "@/lib/utils";
import { Copy, Check, AlertTriangle, Loader2, KeyRound, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/components/hooks/use-toast";
import useCaptureEvent from "@/hooks/useCaptureEvent";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { enUS, ja as jaDateLocale, ko as koDateLocale, zhCN } from "date-fns/locale";
import { useLocale, useTranslations } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";

const dateFnsLocales: Record<Locale, typeof enUS> = {
    en: enUS,
    zh: zhCN,
    ja: jaDateLocale,
    ko: koDateLocale,
};
import { useRouter } from "next/navigation";

interface ApiKey {
    name: string;
    createdAt: Date;
    lastUsedAt: Date | null;
}

interface ApiKeysPageProps {
    canCreateApiKey: boolean;
    apiKeys: ApiKey[];
}

export function ApiKeysPage({ canCreateApiKey, apiKeys }: ApiKeysPageProps) {
    const { toast } = useToast();
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const captureEvent = useCaptureEvent();
    const router = useRouter();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCreateApiKey = async () => {
        if (!newKeyName.trim()) {
            toast({
                title: t("apiKeysPage.error"),
                description: t("apiKeysPage.nameEmpty"),
                variant: "destructive",
            });
            return;
        }

        setIsCreatingKey(true);
        try {
            const result = await createApiKey(newKeyName.trim());
            if (isServiceError(result)) {
                toast({
                    title: t("apiKeysPage.error"),
                    description: t("apiKeysPage.createFailed", { message: result.message }),
                    variant: "destructive",
                });
                captureEvent('wa_api_key_creation_fail', {});
                return;
            }

            setNewlyCreatedKey(result.key);
            router.refresh();
            captureEvent('wa_api_key_created', {});
        } catch (error) {
            console.error(error);
            toast({
                title: t("apiKeysPage.error"),
                description: t("apiKeysPage.createFailed", { message: String(error) }),
                variant: "destructive",
            });
            captureEvent('wa_api_key_creation_fail', {});
        } finally {
            setIsCreatingKey(false);
        }
    };

    const handleCopyApiKey = () => {
        if (!newlyCreatedKey) {
            return;
        }

        navigator.clipboard.writeText(newlyCreatedKey)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch(() => {
                toast({
                    title: t("apiKeysPage.error"),
                    description: t("apiKeysPage.copyFailed"),
                    variant: "destructive",
                });
            });
    };

    const handleCloseDialog = () => {
        setIsCreateDialogOpen(false);
        setNewKeyName("");
        setNewlyCreatedKey(null);
        setCopySuccess(false);
    };

    const handleDeleteApiKey = async (name: string) => {
        const result = await deleteApiKey(name);
        if (isServiceError(result)) {
            toast({
                title: t("apiKeysPage.error"),
                description: t("apiKeysPage.deleteFailed", { message: result.message }),
                variant: "destructive",
            });
            return;
        }
        router.refresh();
        toast({ description: t("apiKeysPage.deleted") });
    };

    const sortedKeys = useMemo(
        () => [...apiKeys].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        [apiKeys]
    );

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3 className="text-lg font-medium">{t("apiKeysPage.title")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("apiKeysPage.description")}
                </p>
            </div>

            <div className="border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                        {t("apiKeysPage.keyCount", { count: apiKeys.length })}
                    </span>

                    <TooltipProvider>
                        <Tooltip>
                            {!canCreateApiKey && (
                                <TooltipContent>
                                    {t("apiKeysPage.creationRestricted")}
                                </TooltipContent>
                            )}
                            <TooltipTrigger asChild>
                                <span className={!canCreateApiKey ? "cursor-not-allowed" : undefined}>
                                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={!canCreateApiKey}
                                                className={!canCreateApiKey ? "pointer-events-none" : undefined}
                                                onClick={() => {
                                                    setNewlyCreatedKey(null);
                                                    setNewKeyName("");
                                                    setIsCreateDialogOpen(true);
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                                {t("apiKeysPage.newApiKey")}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>{newlyCreatedKey ? t("apiKeysPage.yourNewApiKey") : t("apiKeysPage.createApiKey")}</DialogTitle>
                                            </DialogHeader>

                                            {newlyCreatedKey ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 p-3 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-yellow-700 dark:text-yellow-400">
                                                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                                        <p className="text-sm">
                                                            {t("apiKeysPage.onlyTimeWarning")}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <div className="bg-muted p-2 rounded-md text-sm flex-1 break-all font-mono">
                                                            {newlyCreatedKey}
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={handleCopyApiKey}
                                                        >
                                                            {copySuccess ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <Input
                                                        value={newKeyName}
                                                        onChange={(e) => setNewKeyName(e.target.value)}
                                                        placeholder={t("apiKeysPage.namePlaceholder")}
                                                        className="mb-2"
                                                    />
                                                </div>
                                            )}

                                            <DialogFooter className="sm:justify-between">
                                                {newlyCreatedKey ? (
                                                    <Button onClick={handleCloseDialog}>
                                                        {tCommon("done")}
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button variant="outline" onClick={handleCloseDialog}>
                                                            {tCommon("cancel")}
                                                        </Button>
                                                        <Button
                                                            onClick={handleCreateApiKey}
                                                            disabled={isCreatingKey || !newKeyName.trim()}
                                                        >
                                                            {isCreatingKey && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                            {t("apiKeysPage.create")}
                                                        </Button>
                                                    </>
                                                )}
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </span>
                            </TooltipTrigger>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {sortedKeys.length === 0 ? (
                    <div className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
                        {t("apiKeysPage.noKeys")}
                    </div>
                ) : (
                    <div className="border-t border-border">
                        {sortedKeys.map((key) => (
                            <div
                                key={key.name}
                                className="group flex items-center gap-4 px-4 py-4 border-b border-border last:border-b-0"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-medium truncate">{key.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {t("apiKeysPage.created", { distance: formatDistanceToNow(key.createdAt, { addSuffix: true, locale: dateFnsLocales[locale] }) })}
                                        {" · "}
                                        {key.lastUsedAt
                                            ? t("apiKeysPage.lastUsed", { distance: formatDistanceToNow(key.lastUsedAt, { addSuffix: true, locale: dateFnsLocales[locale] }) })
                                            : t("apiKeysPage.neverUsed")
                                        }
                                    </span>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t("apiKeysPage.deleteTitle")}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t("apiKeysPage.deleteDescription", { name: key.name })}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeleteApiKey(key.name)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {tCommon("delete")}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
