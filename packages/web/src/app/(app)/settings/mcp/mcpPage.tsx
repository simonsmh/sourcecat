'use client';

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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/hooks/use-toast";
import { type ConnectedOauthClient, revokeMcpClient } from "@/ee/features/oauth/actions";
import { isServiceError } from "@/lib/utils";
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
import { AlertTriangle, Boxes, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CopyIconButton } from "@/app/(app)/components/copyIconButton";
import { SettingsCard, SettingsCardGroup } from "@/app/(app)/settings/components/settingsCard";
import { ClientCard } from "./clientCard";
import { MCP_CLIENTS, matchKnownClient } from "./clients";
import { UpsellDialog } from "@/features/billing/upsellDialog";

const DOCS_URL = "https://github.com/simonsmh/sourcecat/blob/main/docs/docs/features/mcp-server.mdx";

interface McpPageProps {
    mcpServerUrl: string;
    connectedClients: ConnectedOauthClient[];
    isMcpEnabled: boolean;
}

export function McpPage({
    mcpServerUrl,
    connectedClients,
    isMcpEnabled
}: McpPageProps) {
    const { toast } = useToast();
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const router = useRouter();
    const [isUpsellDialogOpen, setIsUpsellDialogOpen] = useState(false);

    const handleCopyServerUrl = () => {
        navigator.clipboard.writeText(mcpServerUrl)
            .catch(() => {
                toast({
                    title: t("mcpPage.error"),
                    description: t("mcpPage.copyUrlFailed"),
                    variant: "destructive",
                });
            });
        return true;
    };

    const handleRevokeClient = async (clientId: string, name: string) => {
        const result = await revokeMcpClient({ clientId });
        if (isServiceError(result)) {
            toast({
                title: t("mcpPage.error"),
                description: t("mcpPage.revokeFailed", { name, message: result.message }),
                variant: "destructive",
            });
            return;
        }
        router.refresh();
        toast({ description: t("mcpPage.disconnectedToast", { name }) });
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-medium">{t("mcpPage.title")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("mcpPage.description")} <Link href={DOCS_URL} target="_blank" className="text-link hover:underline">{t("mcpPage.learnMore")}</Link>
                </p>
            </div>

            {!isMcpEnabled && (
                <>
                    <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">{t("mcpPage.unavailableTitle")}</p>
                            <p className="text-sm text-muted-foreground">
                                {t("mcpPage.unavailableBefore")}{" "}
                                <button
                                    type="button"
                                    onClick={() => setIsUpsellDialogOpen(true)}
                                    className="text-link hover:underline font-medium"
                                >
                                    {t("mcpPage.upgrade")}
                                </button>.
                            </p>
                        </div>
                    </div>
                    <UpsellDialog
                        open={isUpsellDialogOpen}
                        onOpenChange={setIsUpsellDialogOpen}
                        source="mcp_settings"
                        returnPath="/settings/mcp"
                    />
                </>
            )}

            {isMcpEnabled && (
                <>
                    <SettingsCard>
                        <h4 className="text-sm font-medium mb-2">{t("mcpPage.serverUrl")}</h4>
                        <div className="flex items-center gap-2">
                            <div className="bg-muted p-2 rounded-md text-sm flex-1 break-all font-mono">
                                {mcpServerUrl}
                            </div>
                            <CopyIconButton onCopy={handleCopyServerUrl} />
                        </div>
                    </SettingsCard>

                    <div className="flex flex-col gap-2">
                        <div>
                            <h4 className="text-base font-medium">{t("mcpPage.installTitle")}</h4>
                            <p className="text-sm text-muted-foreground">
                                {t("mcpPage.installDescription")}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {MCP_CLIENTS.map((client) => (
                                <ClientCard key={client.id} client={client} serverUrl={mcpServerUrl} />
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div className="flex flex-col gap-2">
                <div>
                    <h4 className="text-base font-medium">{t("mcpPage.connectedClients")}</h4>
                    <p className="text-sm text-muted-foreground">
                        {t("mcpPage.connectedClientsDescription")}
                    </p>
                </div>

                {connectedClients.length === 0 ? (
                    <SettingsCard>
                        <div className="py-4 text-center text-sm text-muted-foreground">
                            {t("mcpPage.noClients")}
                        </div>
                    </SettingsCard>
                ) : (
                    <SettingsCardGroup>
                        {connectedClients.map((client) => (
                            <SettingsCard key={client.id}>
                                <div className="group flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                                        <ConnectedClientLogo logoUri={client.logoUri} name={client.name} />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm font-medium truncate">{client.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {t("mcpPage.connected", { distance: formatDistanceToNow(client.connectedAt, { addSuffix: true, locale: dateFnsLocales[locale] }) })}
                                            {" · "}
                                            {client.lastUsedAt
                                                ? t("mcpPage.lastUsed", { distance: formatDistanceToNow(client.lastUsedAt, { addSuffix: true, locale: dateFnsLocales[locale] }) })
                                                : t("mcpPage.neverUsed")
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
                                                <AlertDialogTitle>{t("mcpPage.disconnectTitle", { name: client.name })}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t("mcpPage.disconnectDescription", { name: client.name })}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleRevokeClient(client.id, client.name)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    {t("mcpPage.disconnect")}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </SettingsCard>
                        ))}
                    </SettingsCardGroup>
                )}
            </div>
        </div>
    );
}

function ConnectedClientLogo({ logoUri, name }: { logoUri: string | null; name: string }) {
    const t = useTranslations("settings");
    if (logoUri) {
        return (
            <Image
                src={logoUri}
                alt={t("mcpPage.logoAlt", { name })}
                width={40}
                height={40}
                unoptimized
                className="h-full w-full object-cover"
            />
        );
    }

    const known = matchKnownClient(name);
    if (known) {
        return (
            <>
                <Image
                    src={known.logoSrc}
                    alt={t("mcpPage.logoAlt", { name })}
                    width={24}
                    height={24}
                    className={`h-6 w-6 ${known.logoSrcDark ? 'block dark:hidden' : ''}`}
                />
                {known.logoSrcDark && (
                    <Image
                        src={known.logoSrcDark}
                        alt={t("mcpPage.logoAlt", { name })}
                        width={24}
                        height={24}
                        className="h-6 w-6 hidden dark:block"
                    />
                )}
            </>
        );
    }

    return <Boxes className="h-4 w-4 text-muted-foreground" />;
}
