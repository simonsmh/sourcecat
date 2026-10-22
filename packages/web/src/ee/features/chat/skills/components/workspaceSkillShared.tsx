'use client';

import type { ReactNode } from "react";
import { Building2Icon, CheckCircle2Icon, FolderGit2Icon } from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n/I18nProvider";


export function SkillCommandBadge({ slug }: { slug: string }) {
    return (
        <span className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            /{slug}
        </span>
    );
}

function SkillStatusBadge({
    children,
    tooltip,
    className,
}: {
    children: ReactNode;
    tooltip?: string;
    className?: string;
}) {
    const badge = (
        <span
            className={cn(
                "inline-flex h-5 shrink-0 items-center gap-1 rounded border px-1.5 text-[11px] font-medium leading-none",
                className ?? "border-border bg-background text-muted-foreground",
            )}
            tabIndex={tooltip ? 0 : undefined}
        >
            {children}
        </span>
    );

    if (!tooltip) {
        return badge;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
}

export function AutoEnrolledSkillBadge() {
    const t = useTranslations("settings");
    return (
        <SkillStatusBadge
            tooltip={t("skillsPage.shared.autoTooltip")}
            className="border-sky-500/40 bg-sky-500/15 text-sky-700 dark:border-sky-500/50 dark:bg-sky-950/60 dark:text-sky-400"
        >
            <CheckCircle2Icon className="h-3 w-3" />
            {t("skillsPage.shared.auto")}
        </SkillStatusBadge>
    );
}

export function SyncedSkillBadge() {
    const t = useTranslations("settings");
    return (
        <SkillStatusBadge
            tooltip={t("skillsPage.shared.syncedTooltip")}
            className="border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-950/60 dark:text-emerald-400"
        >
            <FolderGit2Icon className="h-3 w-3" />
            {t("skillsPage.shared.synced")}
        </SkillStatusBadge>
    );
}

export function WorkspaceSkillsEmptyState({
    description,
}: {
    description?: string;
}) {
    const t = useTranslations("settings");
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                    <Building2Icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                    {t("skillsPage.shared.noSharedYet")}
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                    {description ?? t("skillsPage.shared.sharedEmptyDescription")}
                </p>
            </CardContent>
        </Card>
    );
}

export function DeleteWorkspaceSkillDialog({
    skill,
    isDeleting,
    disabled = false,
    onOpenChange,
    onConfirm,
}: {
    skill: { name: string; slug: string } | null;
    isDeleting: boolean;
    disabled?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const isActionDisabled = isDeleting || disabled;

    return (
        <AlertDialog open={skill !== null} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("skillsPage.shared.deleteSharedTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("skillsPage.shared.deleteSharedDescription", { name: skill?.name ?? "", slug: skill?.slug ?? "" })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isActionDisabled}>{tCommon("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isActionDisabled}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? t("skillsPage.dialogs.deleting") : tCommon("delete")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
