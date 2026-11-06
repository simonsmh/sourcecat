"use client";

import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { indexRepo } from "@/features/repos/actions";
import { getCodeHostInfoForRepo, isServiceError } from "@/lib/utils";
import { EllipsisVertical, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import type { Repo } from "./reposTable";

type RepoActionsMenuProps = {
    repo: Repo;
    canSync: boolean;
    isSyncing: boolean;
    onSyncScheduled: (repoId: number, jobId: string) => void;
};

export const RepoActionsMenu = ({
    repo,
    canSync,
    isSyncing,
    onSyncScheduled,
}: RepoActionsMenuProps) => {
    const t = useTranslations("repos");
    const [isScheduling, setIsScheduling] = useState(false);
    const { toast } = useToast();
    const displayName = repo.displayName ?? repo.name;
    const codeHostInfo = getCodeHostInfoForRepo({
        codeHostType: repo.codeHostType,
        name: repo.name,
        displayName,
        externalWebUrl: repo.webUrl ?? undefined,
    });

    const syncRepo = async () => {
        setIsScheduling(true);

        try {
            const response = await indexRepo(repo.id);
            if (isServiceError(response)) {
                toast({
                    variant: "destructive",
                    title: t("actions.syncFailedTitle"),
                    description: response.message,
                });
                return;
            }

            onSyncScheduled(repo.id, response.jobId);
            toast({
                title: t("actions.syncScheduledTitle"),
                description: t("actions.syncScheduledDesc", { name: displayName }),
            });
        } catch {
            toast({
                variant: "destructive",
                title: t("actions.syncFailedTitle"),
                description: t("actions.syncFailedDesc"),
            });
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("actions.openActionsFor", { name: displayName })}
                >
                    <EllipsisVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {canSync && (
                    <DropdownMenuItem
                        className="gap-2"
                        disabled={isScheduling || isSyncing}
                        onSelect={() => void syncRepo()}
                    >
                        {isScheduling ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        {t("actions.sync")}
                    </DropdownMenuItem>
                )}
                {codeHostInfo.externalWebUrl && (
                    <DropdownMenuItem asChild className="gap-2">
                        <a
                            href={codeHostInfo.externalWebUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-4 w-4" />
                            {t("actions.openIn", { host: codeHostInfo.codeHostName })}
                        </a>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
