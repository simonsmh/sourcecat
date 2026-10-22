'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CableIcon, ExternalLink, MoreHorizontal, SearchIcon, Settings2Icon, Unplug } from "lucide-react";
import { getMcpServersWithStatus } from "@/app/api/(client)/client";
import { useToast } from "@/components/hooks/use-toast";
import { useTranslations } from "@/i18n/I18nProvider";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ConnectMcpButton } from "@/ee/features/chat/mcp/components/connectMcpButton";
import { ConnectorCard } from "@/ee/features/chat/mcp/components/connectorCard";
import { ConnectorRowInfo } from "@/ee/features/chat/mcp/components/connectorRowInfo";
import { ConnectorToolTrigger } from "@/ee/features/chat/mcp/components/connectorToolDisclosure";
import { useConnectMcp } from "@/ee/features/chat/mcp/hooks/useConnectMcp";
import { useMcpToolMetadata } from "@/ee/features/chat/mcp/hooks/useMcpToolMetadata";
import { disconnectMcpServer } from "@/ee/features/chat/mcp/actions";
import { invalidateMcpConfigurationQueries, mcpQueryKeys } from "@/ee/features/chat/mcp/queryKeys";
import { cn, isServiceError } from "@/lib/utils";
import type { McpServerWithStatus } from "@/app/api/(server)/ee/askmcp/servers/route";
import type { ServerToolsEntry } from "@/ee/features/chat/mcp/types";

type FilterTab = "all" | "connected";

function clearCallbackParams() {
    const url = new URL(window.location.href);
    url.searchParams.delete('status');
    url.searchParams.delete('server');
    url.searchParams.delete('message');
    window.history.replaceState({}, '', url.toString());
}

interface AccountAskAgentPageProps {
    callbackStatus?: string;
    callbackServer?: string;
    callbackMessage?: string;
    canManageConnectors: boolean;
}

export function AccountAskAgentEmptyState({ canManageConnectors }: { canManageConnectors: boolean }) {
    const t = useTranslations("settings");
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                    <CableIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                    {canManageConnectors ? t("askPage.noConnectors") : t("askPage.account.noConnectorsAvailable")}
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                    {canManageConnectors
                        ? t("askPage.account.emptyManageDescription")
                        : t("askPage.account.emptyDescription")}
                </p>
                {canManageConnectors && (
                    <Button asChild variant="outline" className="mt-4">
                        <Link href="/settings/workspaceAskAgent">
                            <Settings2Icon className="h-4 w-4 mr-2" />
                            {t("askPage.account.openWorkspace")}
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

interface AccountConnectedConnectorCardProps {
    server: McpServerWithStatus;
    toolEntry?: ServerToolsEntry;
    isToolsLoading: boolean;
    isToolsError: boolean;
    onRetryTools: () => void;
    onReconnect: (serverId: string) => void;
    onDisconnect: (server: McpServerWithStatus) => void;
    disconnectingServerId: string | null;
}

function AccountConnectedConnectorCard({
    server,
    toolEntry,
    isToolsLoading,
    isToolsError,
    onRetryTools,
    onReconnect,
    onDisconnect,
    disconnectingServerId,
}: AccountConnectedConnectorCardProps) {
    const t = useTranslations("settings");
    return (
        <ConnectorCard
            faviconUrl={server.faviconUrl}
            name={server.name}
            serverUrl={server.serverUrl}
            isConnected={server.isConnected}
            isAuthExpired={server.isAuthExpired}
            toolEntry={server.isConnected ? toolEntry : undefined}
            isToolsLoading={isToolsLoading}
            isToolsError={isToolsError}
            onRetryTools={onRetryTools}
            statusBadge={
                <>
                    {server.isConnected && (
                        <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500/80" />
                            {t("askPage.account.connected")}
                        </span>
                    )}
                    {server.isAuthExpired && (
                        <span className="inline-flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500/80" />
                            {t("askPage.account.authorizationExpired")}
                        </span>
                    )}
                </>
            }
            actionButtons={
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onReconnect(server.id)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t("askPage.account.reconnect")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            disabled={disconnectingServerId === server.id}
                            onClick={() => onDisconnect(server)}
                        >
                            <Unplug className="h-4 w-4 mr-2" />
                            {disconnectingServerId === server.id ? t("askPage.account.disconnecting") : t("askPage.account.disconnect")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            }
        />
    );
}

function AccountSuggestedConnectorCard({ server }: { server: McpServerWithStatus }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-3 p-3">
                <ConnectorRowInfo
                    faviconUrl={server.faviconUrl}
                    name={server.name}
                    serverUrl={server.serverUrl}
                    size="sm"
                >
                    <div className="mt-0.5 flex items-center text-[11px]">
                        <ConnectorToolTrigger
                            isConnected={false}
                            isAuthExpired={false}
                        />
                    </div>
                </ConnectorRowInfo>
                <ConnectMcpButton
                    serverId={server.id}
                    isConnected={false}
                    isAuthExpired={false}
                    size="sm"
                    variant="outline"
                    className="h-8"
                />
            </CardContent>
        </Card>
    );
}

export function AccountAskAgentPage({
    callbackStatus,
    callbackServer,
    callbackMessage,
    canManageConnectors,
}: AccountAskAgentPageProps) {
    const { toast } = useToast();
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const queryClient = useQueryClient();
    const didHandleCallbackRef = useRef(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [disconnectingServerId, setDisconnectingServerId] = useState<string | null>(null);
    const [confirmDisconnectServer, setConfirmDisconnectServer] = useState<{ id: string; name: string } | null>(null);
    const { connect: reconnectMcp } = useConnectMcp();

    useEffect(() => {
        if (didHandleCallbackRef.current) {
            return;
        }
        if (callbackStatus === 'connected') {
            didHandleCallbackRef.current = true;
            toast({ description: callbackServer ? t("askPage.connectedToToast", { server: callbackServer }) : t("askPage.connectedToast") });
            clearCallbackParams();
        } else if (callbackStatus === 'error') {
            didHandleCallbackRef.current = true;
            toast({ title: t("askPage.connectionFailed"), description: callbackMessage ?? t("askPage.connectFailedFallback"), variant: "destructive" });
            clearCallbackParams();
        }
    }, [callbackStatus, callbackServer, callbackMessage, toast, t]);

    const { data: servers = [], isLoading, isError } = useQuery({
        queryKey: mcpQueryKeys.serversWithStatus,
        queryFn: async () => {
            const result = await getMcpServersWithStatus();
            if (isServiceError(result)) {
                throw new Error("Failed to load connectors");
            }
            return result;
        },
    });

    const connectedServers = useMemo(
        () => servers.filter((s) => s.isConnected || s.isAuthExpired),
        [servers],
    );

    const suggestedServers = useMemo(
        () => servers.filter((s) => !s.isConnected && !s.isAuthExpired),
        [servers],
    );

    const filteredConnected = useMemo(() => {
        const list = connectedServers;
        if (!searchQuery.trim()) {
            return list;
        }
        const q = searchQuery.toLowerCase();
        return list.filter(
            (s) => (s.name?.toLowerCase().includes(q)) || s.serverUrl.toLowerCase().includes(q),
        );
    }, [connectedServers, searchQuery]);

    const filteredSuggested = useMemo(() => {
        const list = suggestedServers;
        if (!searchQuery.trim()) {
            return list;
        }
        const q = searchQuery.toLowerCase();
        return list.filter(
            (s) => (s.name?.toLowerCase().includes(q)) || s.serverUrl.toLowerCase().includes(q),
        );
    }, [suggestedServers, searchQuery]);

    const visibleConnected = filteredConnected;
    const visibleSuggested = activeTab === "all" ? filteredSuggested : [];
    const activeConnectedServerCount = useMemo(
        () => servers.filter((s) => s.isConnected).length,
        [servers],
    );
    const {
        isToolsLoading,
        isToolsError,
        refetchTools,
        toolsByServerId,
    } = useMcpToolMetadata(true, activeConnectedServerCount);

    const handleDisconnect = async (serverId: string) => {
        setDisconnectingServerId(serverId);
        setConfirmDisconnectServer(null);
        try {
            const result = await disconnectMcpServer(serverId, 'account_settings');
            if (isServiceError(result)) {
                toast({ title: t("askPage.error"), description: t("askPage.account.disconnectFailed", { message: result.message }), variant: "destructive" });
                return;
            }
            toast({ description: t("askPage.account.disconnectedToast") });
            await invalidateMcpConfigurationQueries(queryClient);
        } catch {
            toast({ title: t("askPage.error"), description: t("askPage.account.disconnectFailedGeneric"), variant: "destructive" });
        } finally {
            setDisconnectingServerId(null);
        }
    };

    if (isError) {
        return <div>{t("askPage.account.loadError")}</div>;
    }

    if (!isLoading && servers.length === 0) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="text-lg font-medium">{t("askPage.title")}</h3>
                    <p className="text-sm text-muted-foreground max-w-lg">
                        {t("askPage.accountDescription")}
                    </p>
                </div>
                <Separator />
                <div className="space-y-3">
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">{t("askPage.connectors")}</h4>
                        <p className="text-sm text-muted-foreground max-w-lg">
                            {t("askPage.accountConnectorsDescription")}
                        </p>
                    </div>
                    <AccountAskAgentEmptyState canManageConnectors={canManageConnectors} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-medium">{t("askPage.title")}</h3>
                <p className="text-sm text-muted-foreground max-w-lg">
                    {t("askPage.accountDescription")}
                </p>
            </div>

            <Separator />

            <div className="space-y-3">
                <div>
                    <h4 className="text-sm font-semibold text-foreground">{t("askPage.connectors")}</h4>
                    <p className="text-sm text-muted-foreground max-w-lg">
                        {t("askPage.accountConnectorsDescription")}
                    </p>
                </div>

                {/* Search + filter bar */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("askPage.account.searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors",
                                activeTab === "all"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {t("askPage.account.all")}
                            <span className="ml-1.5 text-muted-foreground">{servers.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("connected")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors",
                                activeTab === "connected"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {t("askPage.account.connected")}
                            <span className="ml-1.5 text-muted-foreground">{connectedServers.length}</span>
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}>
                            <CardContent className="flex items-center gap-3 p-3">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-3 w-56" />
                                </div>
                                <Skeleton className="h-8 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    {/* Connected section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {t("askPage.account.connected")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t("askPage.account.connectorCount", { count: connectedServers.length })}
                            </p>
                        </div>

                        {visibleConnected.length === 0 ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-8">
                                    <p className="text-sm text-muted-foreground">
                                        {searchQuery.trim()
                                            ? t("askPage.account.noConnectedMatch")
                                            : t("askPage.account.noConnected")}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            visibleConnected.map((server) => (
                                <AccountConnectedConnectorCard
                                    key={server.id}
                                    server={server}
                                    toolEntry={toolsByServerId.get(server.id)}
                                    isToolsLoading={isToolsLoading}
                                    isToolsError={isToolsError}
                                    onRetryTools={() => { void refetchTools(); }}
                                    onReconnect={reconnectMcp}
                                    onDisconnect={(serverToDisconnect) => setConfirmDisconnectServer({
                                        id: serverToDisconnect.id,
                                        name: serverToDisconnect.name || serverToDisconnect.serverUrl,
                                    })}
                                    disconnectingServerId={disconnectingServerId}
                                />
                            ))
                        )}
                    </div>

                    {/* Suggested section */}
                    {activeTab === "all" && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t("askPage.account.suggested")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t("askPage.account.workspaceApproved")}
                                </p>
                            </div>

                            {visibleSuggested.length === 0 ? (
                                <Card>
                                    <CardContent className="flex items-center justify-center py-8">
                                        <p className="text-sm text-muted-foreground">
                                            {searchQuery.trim()
                                                ? t("askPage.account.noSuggestedMatch")
                                                : t("askPage.account.allConnected")}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                visibleSuggested.map((server) => (
                                    <AccountSuggestedConnectorCard key={server.id} server={server} />
                                ))
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Disconnect confirmation dialog */}
            <AlertDialog
                open={confirmDisconnectServer !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDisconnectServer(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("askPage.account.disconnectTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("askPage.account.disconnectDescription", { name: confirmDisconnectServer?.name ?? "" })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (confirmDisconnectServer) {
                                    handleDisconnect(confirmDisconnectServer.id);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t("askPage.account.disconnect")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
