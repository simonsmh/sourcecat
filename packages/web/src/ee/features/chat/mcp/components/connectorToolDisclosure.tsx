'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ServerToolsEntry, ToolMetadataErrorReason, ToolSummary } from '@/ee/features/chat/mcp/types';
import { ToolHintBadges, ToolPermissionBadge } from '@/ee/features/chat/mcp/mcpToolPermissionDisplay';
import { useTranslations } from '@/i18n/I18nProvider';
import { ChevronDownIcon, RefreshCwIcon, WrenchIcon } from 'lucide-react';

type SettingsTranslator = ReturnType<typeof useTranslations<'settings'>>;

function getErrorLabel(reason: ToolMetadataErrorReason, t: SettingsTranslator) {
    switch (reason) {
        case 'timeout':
            return t('askPage.toolDisclosure.toolsTimedOut');
        case 'auth_failed':
            return t('askPage.toolDisclosure.reconnectToSeeTools');
        case 'unsupported':
            return t('askPage.toolDisclosure.toolsUnsupported');
        case 'connection_failed':
        case 'unknown':
            return t('askPage.toolDisclosure.toolsUnavailable');
    }
}

function getToolCountLabel(entry: Extract<ServerToolsEntry, { status: 'available' }>, t: SettingsTranslator) {
    const countLabel = `${entry.tools.length}${entry.truncated ? '+' : ''}`;
    const nounCount = entry.truncated ? 2 : entry.tools.length;
    return t('askPage.toolDisclosure.countLabel', { countLabel, count: nounCount });
}

interface ConnectorToolTriggerProps {
    isConnected: boolean;
    isAuthExpired?: boolean;
    isAskAgentAvailable?: boolean;
    isStatusUnavailable?: boolean;
    toolEntry?: ServerToolsEntry;
    isLoading?: boolean;
    isToolsQueryError?: boolean;
    isOpen?: boolean;
    controlsId?: string;
    onOpenChange?: (open: boolean) => void;
    onRetry?: () => void;
}

export function ConnectorToolTrigger({
    isConnected,
    isAuthExpired = false,
    isAskAgentAvailable = true,
    isStatusUnavailable = false,
    toolEntry,
    isLoading = false,
    isToolsQueryError = false,
    isOpen = false,
    controlsId,
    onOpenChange,
    onRetry,
}: ConnectorToolTriggerProps) {
    const t = useTranslations('settings');
    const tCommon = useTranslations('common');
    const availableEntry = toolEntry?.status === 'available' ? toolEntry : undefined;
    const errorEntry = toolEntry?.status === 'error' ? toolEntry : undefined;
    const canExpand = !!availableEntry;

    if (canExpand) {
        return (
            <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={controlsId}
                onClick={() => onOpenChange?.(!isOpen)}
                className="inline-flex items-center gap-1 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <WrenchIcon className="h-3 w-3" />
                {getToolCountLabel(availableEntry, t)}
                <ChevronDownIcon className={cn("h-3 w-3 transition-transform", isOpen ? "rotate-180" : "rotate-0")} />
            </button>
        );
    }

    let label = t('askPage.toolDisclosure.toolsUnavailable');
    let canRetry = false;

    if (!isAskAgentAvailable || isStatusUnavailable) {
        label = t('askPage.toolDisclosure.toolsUnavailable');
    } else if (!isConnected && isAuthExpired) {
        label = t('askPage.toolDisclosure.reconnectToSeeTools');
    } else if (!isConnected) {
        label = t('askPage.toolDisclosure.connectToSeeTools');
    } else if (isLoading) {
        label = t('askPage.toolDisclosure.loadingTools');
    } else if (errorEntry) {
        label = getErrorLabel(errorEntry.reason, t);
        canRetry = true;
    } else if (isToolsQueryError) {
        label = t('askPage.toolDisclosure.toolsUnavailable');
        canRetry = true;
    }

    return (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
            <WrenchIcon className="h-3 w-3" />
            {label}
            {canRetry && onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="ml-1 inline-flex items-center gap-0.5 rounded-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <RefreshCwIcon className="h-3 w-3" />
                    {tCommon('retry')}
                </button>
            )}
        </span>
    );
}

function ToolDetail({ tool }: { tool: ToolSummary }) {
    const displayName = tool.title ?? tool.name;

    return (
        <div className="rounded-md border bg-muted/30 p-2">
            <div className="flex flex-wrap items-center gap-1.5">
                <span className="break-all text-xs font-medium text-foreground">{displayName}</span>
                {tool.title && tool.title !== tool.name && (
                    <span className="break-all font-mono text-[10px] text-muted-foreground">{tool.name}</span>
                )}
                <ToolPermissionBadge permission={tool.permission} />
                <ToolHintBadges annotations={tool.annotations} />
            </div>
            {tool.description && (
                <p className="mt-1 break-words text-xs text-muted-foreground">{tool.description}</p>
            )}
        </div>
    );
}

interface ConnectorToolListProps {
    toolEntry?: ServerToolsEntry;
    isOpen?: boolean;
    id?: string;
}

export function ConnectorToolList({ toolEntry, isOpen = true, id }: ConnectorToolListProps) {
    const t = useTranslations('settings');
    const [selectedTool, setSelectedTool] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedTool(null);
        }
    }, [isOpen]);

    if (!isOpen || toolEntry?.status !== 'available') {
        return null;
    }

    const activeTool = toolEntry.tools.find((t) => t.name === selectedTool);

    return (
        <div id={id} className="mt-3 border-t pt-3">
            {toolEntry.tools.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t('askPage.toolDisclosure.noToolsExposed')}</p>
            ) : (
                <div className="space-y-2">
                    <div className="flex max-h-48 flex-wrap gap-1 overflow-y-auto pr-1">
                        {toolEntry.tools.map((tool) => {
                            const displayName = tool.title ?? tool.name;
                            const isSelected = selectedTool === tool.name;

                            return (
                                <button
                                    key={tool.name}
                                    type="button"
                                    onClick={() => setSelectedTool(isSelected ? null : tool.name)}
                                    className={cn(
                                        "rounded-md border border-border px-2 py-0.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        isSelected
                                            ? "bg-accent text-foreground"
                                            : "bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground"
                                    )}
                                >
                                    {displayName}
                                </button>
                            );
                        })}
                    </div>
                    {activeTool && (
                        <ToolDetail tool={activeTool} />
                    )}
                </div>
            )}
        </div>
    );
}
