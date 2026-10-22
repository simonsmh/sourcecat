'use client';

import { generateScimToken, revokeScimToken } from "@/ee/features/scim/actions";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isServiceError } from "@/lib/utils";
import { Copy, Check, AlertTriangle, Loader2, KeyRound, Plus, Trash2, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/components/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { enUS, ja as jaDateLocale, ko as koDateLocale, zhCN } from "date-fns/locale";
import { useLocale, useTranslations } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";

const dateFnsLocales: Record<Locale, typeof enUS> = {
    en: enUS,
    zh: zhCN,
    ja: jaDateLocale,
    ko: koDateLocale,
};

interface ScimToken {
    name: string;
    createdAt: Date;
    lastUsedAt: Date | null;
}

interface ScimProvisioningSettingsProps {
    baseUrl: string;
    tokens: ScimToken[];
}

export function ScimProvisioningSettings({ baseUrl, tokens }: ScimProvisioningSettingsProps) {
    const { toast } = useToast();
    const router = useRouter();
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const dateFnsLocale = dateFnsLocales[useLocale()];

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newTokenName, setNewTokenName] = useState("");
    const [isCreatingToken, setIsCreatingToken] = useState(false);
    const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [baseUrlCopied, setBaseUrlCopied] = useState(false);

    const handleCopyBaseUrl = () => {
        navigator.clipboard.writeText(baseUrl)
            .then(() => {
                setBaseUrlCopied(true);
                setTimeout(() => setBaseUrlCopied(false), 2000);
            })
            .catch(() => {
                toast({ title: t("securityPage.error"), description: t("securityPage.scimTokens.copyBaseUrlFailed"), variant: "destructive" });
            });
    };

    const handleCreateToken = async () => {
        if (!newTokenName.trim()) {
            toast({ title: t("securityPage.error"), description: t("securityPage.scimTokens.tokenNameEmpty"), variant: "destructive" });
            return;
        }

        setIsCreatingToken(true);
        try {
            const result = await generateScimToken(newTokenName.trim());
            if (isServiceError(result)) {
                toast({ title: t("securityPage.error"), description: t("securityPage.scimTokens.createFailed", { message: result.message }), variant: "destructive" });
                return;
            }
            setNewlyCreatedToken(result.token);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast({ title: t("securityPage.error"), description: t("securityPage.scimTokens.createFailed", { message: `${error}` }), variant: "destructive" });
        } finally {
            setIsCreatingToken(false);
        }
    };

    const handleCopyToken = () => {
        if (!newlyCreatedToken) {
            return;
        }
        navigator.clipboard.writeText(newlyCreatedToken)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch(() => {
                toast({ title: t("securityPage.error"), description: t("securityPage.scimTokens.copyTokenFailed"), variant: "destructive" });
            });
    };

    const handleCloseDialog = () => {
        setIsCreateDialogOpen(false);
        setNewTokenName("");
        setNewlyCreatedToken(null);
        setCopySuccess(false);
    };

    const handleRevokeToken = async (name: string) => {
        try {
            const result = await revokeScimToken(name);
            if (isServiceError(result)) {
                toast({ title: t("securityPage.error"), description: t("securityPage.scimTokens.revokeFailed", { message: result.message }), variant: "destructive" });
                return;
            }
            router.refresh();
            toast({ description: t("securityPage.scimTokens.revoked") });
        } catch (error) {
            console.error(error);
            toast({ title: t("securityPage.error"), description: t("securityPage.scimTokens.revokeFailed", { message: `${error}` }), variant: "destructive" });
        }
    };

    const sortedTokens = useMemo(
        () => [...tokens].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        [tokens]
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">{t("securityPage.scimTokens.baseUrl")}</span>
                <div className="flex items-center space-x-2">
                    <div className="bg-muted p-2 rounded-md text-sm flex-1 break-all font-mono">
                        {baseUrl}
                    </div>
                    <Button size="icon" variant="outline" onClick={handleCopyBaseUrl}>
                        {baseUrlCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                            {t("securityPage.scimTokens.tokenCount", { count: tokens.length })}
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    aria-label={t("securityPage.scimTokens.tokenInfoAriaLabel")}
                                >
                                    <Info className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                {t("securityPage.scimTokens.tokenInfo")}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setNewlyCreatedToken(null);
                                    setNewTokenName("");
                                    setIsCreateDialogOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4" />
                                {t("securityPage.scimTokens.newToken")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{newlyCreatedToken ? t("securityPage.scimTokens.createdTitle") : t("securityPage.scimTokens.createTitle")}</DialogTitle>
                            </DialogHeader>

                            {newlyCreatedToken ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 p-3 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-yellow-700 dark:text-yellow-400">
                                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                        <p className="text-sm">
                                            {t("securityPage.scimTokens.createdWarning")}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <div className="bg-muted p-2 rounded-md text-sm flex-1 break-all font-mono">
                                            {newlyCreatedToken}
                                        </div>
                                        <Button size="icon" variant="outline" onClick={handleCopyToken}>
                                            {copySuccess ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <Input
                                        value={newTokenName}
                                        onChange={(e) => setNewTokenName(e.target.value)}
                                        placeholder={t("securityPage.scimTokens.namePlaceholder")}
                                        className="mb-2"
                                    />
                                </div>
                            )}

                            <DialogFooter className="sm:justify-between">
                                {newlyCreatedToken ? (
                                    <Button onClick={handleCloseDialog}>{tCommon("done")}</Button>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={handleCloseDialog}>{tCommon("cancel")}</Button>
                                        <Button onClick={handleCreateToken} disabled={isCreatingToken || !newTokenName.trim()}>
                                            {isCreatingToken && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            {tCommon("create")}
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {sortedTokens.length === 0 ? (
                    <div className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
                        {t("securityPage.scimTokens.empty")}
                    </div>
                ) : (
                    <div className="border-t border-border">
                        {sortedTokens.map((token) => (
                            <div
                                key={token.name}
                                className="group flex items-center gap-4 px-4 py-4 border-b border-border last:border-b-0"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-medium truncate">{token.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {t("securityPage.scimTokens.createdAgo", { time: formatDistanceToNow(token.createdAt, { addSuffix: true, locale: dateFnsLocale }) })}
                                        {" · "}
                                        {token.lastUsedAt
                                            ? t("securityPage.scimTokens.lastUsed", { time: formatDistanceToNow(token.lastUsedAt, { addSuffix: true, locale: dateFnsLocale }) })
                                            : t("securityPage.scimTokens.neverUsed")
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
                                            <AlertDialogTitle>{t("securityPage.scimTokens.revokeTitle")}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t("securityPage.scimTokens.revokeDescription", { name: token.name })}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleRevokeToken(token.name)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {t("securityPage.scimTokens.revoke")}
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
