"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { BannerShell } from "./bannerShell";
import type { BannerProps } from "./types";

interface ConnectionSyncIssuesBannerProps extends BannerProps {
    count: number;
    status: "failed" | "warning";
}

export function ConnectionSyncIssuesBanner({
    id,
    dismissible,
    count,
    status,
}: ConnectionSyncIssuesBannerProps) {
    const t = useTranslations("banners");
    const isFailed = status === "failed";

    return (
        <BannerShell
            id={id}
            dismissible={dismissible}
            icon={(
                <AlertTriangle
                    className={cn(
                        "mt-0.5 h-4 w-4",
                        isFailed && "text-destructive",
                    )}
                />
            )}
            title={t("connectionNeedsAttention", { count })}
            description={isFailed
                ? t("connectionFailedDescription", { count })
                : t("connectionWarningDescription", { count })}
            action={(
                <Button asChild size="sm" variant="outline">
                    <Link href={`/settings/connections?status=${status}`}>
                        {isFailed ? t("viewFailed") : t("viewWarnings")}
                    </Link>
                </Button>
            )}
        />
    );
}
