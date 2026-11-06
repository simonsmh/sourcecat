"use client";

import { JobLogsDialog } from "@/app/(app)/components/jobLogsDialog";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { indexRepo } from "@/features/repos/actions";
import { cn, isServiceError } from "@/lib/utils";
import {
    ChevronDown,
    CircleX,
    Loader2,
    RotateCw,
    ScrollText,
    TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import { DisplayDate } from "../../components/DisplayDate";
import { LightweightCodeHighlighter } from "../../components/lightweightCodeHighlighter";
import type { Repo } from "./reposTable";

type SyncIssuePopoverProps = {
    repo: Repo;
    annotation: "WARNING" | "FAILED";
    canRetry: boolean;
    onRetryScheduled: (repoId: number, jobId: string) => void;
};

export const SyncIssuePopover = ({
    repo,
    annotation,
    canRetry,
    onRetryScheduled,
}: SyncIssuePopoverProps) => {
    const t = useTranslations("repos");
    const [isOpen, setIsOpen] = useState(false);
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const { toast } = useToast();
    const latestJob = repo.latestJob;
    if (!latestJob || latestJob.status !== "FAILED") {
        return null;
    }

    const isWarning = annotation === "WARNING";
    const label = isWarning ? t("issue.warning") : t("issue.failed");
    const Icon = isWarning ? TriangleAlert : CircleX;
    const repoDisplayName = repo.displayName ?? repo.name;

    const retrySync = async () => {
        setIsRetrying(true);

        try {
            const response = await indexRepo(repo.id);
            if (isServiceError(response)) {
                toast({
                    variant: "destructive",
                    title: t("issue.retryFailedTitle"),
                    description: response.message,
                });
                return;
            }

            onRetryScheduled(repo.id, response.jobId);
            toast({
                title: t("issue.syncScheduledTitle"),
                description: t("issue.syncScheduledDesc", { name: repoDisplayName }),
            });
            setIsOpen(false);
        } catch {
            toast({
                variant: "destructive",
                title: t("issue.retryFailedTitle"),
                description: t("issue.retryFailedDesc"),
            });
        } finally {
            setIsRetrying(false);
        }
    };

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                badgeVariants({
                                    variant: isWarning ? "outline" : "destructive",
                                }),
                                "shrink-0 cursor-pointer select-none gap-1 rounded-sm hover:shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                isWarning
                                    && "border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400",
                            )}
                            aria-label={isWarning ? t("issue.viewWarningDetails", { name: repoDisplayName }) : t("issue.viewFailedDetails", { name: repoDisplayName })}
                        >
                            <Icon className="h-3 w-3" />
                            {label}
                            <ChevronDown
                                className={cn(
                                    "h-3 w-3 transition-transform",
                                    isOpen && "rotate-180",
                                )}
                            />
                        </button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t("issue.viewFailureDetails")}</p>
                </TooltipContent>
            </Tooltip>
            <PopoverContent
                align="end"
                className="w-[640px] max-w-[calc(100vw-2rem)]"
            >
                <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3">
                    <Icon
                        className={cn(
                            "mt-0.5 h-4 w-4",
                            isWarning
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-destructive",
                        )}
                    />
                    <div className="min-w-0 space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                {isWarning
                                    ? t("issue.latestSyncFailed")
                                    : t("issue.repoSyncFailed")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {isWarning
                                    ? t("issue.staleDesc")
                                    : t("issue.neverSyncedDesc")}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground">
                                {t("issue.errorLabel")}
                            </p>
                            <div className="max-h-40 overflow-auto rounded-md bg-muted p-2">
                                <LightweightCodeHighlighter
                                    language="text"
                                    lineNumbers={true}
                                    renderWhitespace={false}
                                    wrapLines={false}
                                >
                                    {latestJob.errorMessage
                                        ?? t("issue.noErrorDetails")}
                                </LightweightCodeHighlighter>
                            </div>
                        </div>
                        <dl className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-4 gap-y-2 text-xs">
                            {isWarning && repo.indexedAt && (
                                <>
                                    <dt className="text-muted-foreground">
                                        {t("issue.lastSuccessfulSync")}
                                    </dt>
                                    <dd>
                                        <DisplayDate date={repo.indexedAt} />
                                    </dd>
                                </>
                            )}
                            <dt className="text-muted-foreground">{t("issue.jobId")}</dt>
                            <dd className="min-w-0 truncate">
                                <code title={latestJob.id}>{latestJob.id}</code>
                            </dd>
                        </dl>
                        {canRetry && (
                            <div className="flex justify-end gap-2 border-t pt-3">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsLogsOpen(true);
                                    }}
                                >
                                    <ScrollText className="h-4 w-4" />
                                    {t("issue.viewLogs")}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={retrySync}
                                    disabled={isRetrying}
                                >
                                    {isRetrying ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RotateCw className="h-4 w-4" />
                                    )}
                                    {isRetrying ? t("issue.retrying") : t("issue.retrySync")}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
            </Popover>
            <JobLogsDialog
                queue="repo-index"
                subject={repoDisplayName}
                jobId={latestJob.id}
                open={isLogsOpen}
                onOpenChange={setIsLogsOpen}
            />
        </>
    );
};
