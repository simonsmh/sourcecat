"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { BannerShell } from "./bannerShell";
import type { BannerProps } from "./types";

interface RepositorySyncIssuesBannerProps extends BannerProps {
    failedCount: number;
    warningCount: number;
}

export function RepositorySyncIssuesBanner({
    id,
    dismissible,
    failedCount,
    warningCount,
}: RepositorySyncIssuesBannerProps) {
    const t = useTranslations("banners");
    const totalCount = failedCount + warningCount;
    const descriptions = [
        failedCount > 0
            ? t("repositoryFailedDescription", { count: failedCount })
            : null,
        warningCount > 0
            ? t("repositoryWarningDescription", { count: warningCount })
            : null,
    ].filter((description): description is string => description !== null);

    return (
        <BannerShell
            id={id}
            dismissible={dismissible}
            icon={(
                <AlertTriangle
                    className={cn(
                        "h-4 w-4 mt-0.5",
                        failedCount > 0 && "text-destructive",
                    )}
                />
            )}
            title={t("repositoryNeedsAttention", { count: totalCount })}
            description={descriptions.join(" ")}
            action={(
                <>
                    {failedCount > 0 && (
                        <Button asChild size="sm" variant="outline">
                            <Link href="/repos?status=failed">{t("viewFailed")}</Link>
                        </Button>
                    )}
                    {warningCount > 0 && (
                        <Button asChild size="sm" variant="outline">
                            <Link href="/repos?status=warning">{t("viewWarnings")}</Link>
                        </Button>
                    )}
                </>
            )}
        />
    );
}
