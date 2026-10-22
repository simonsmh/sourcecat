"use client";

import { getConnectionSyncCounts } from "@/app/api/(client)/client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/I18nProvider";
import type { ConnectionSyncCounts } from "@/features/connections/connectionSyncCounts.server";
import { unwrapServiceError } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { usePrevious } from "@uidotdev/usehooks";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BannerShell } from "./bannerShell";
import type { BannerProps } from "./types";

const POLL_INTERVAL_MS = 5_000;

interface ConnectionFirstSyncBannerProps extends BannerProps {
    initialCounts: ConnectionSyncCounts;
}

export function ConnectionFirstSyncBanner({
    id,
    dismissible,
    initialCounts,
}: ConnectionFirstSyncBannerProps) {
    const router = useRouter();
    const t = useTranslations("banners");
    const { data: counts, isError, isPending } = useQuery({
        queryKey: ["connection-sync-counts"],
        queryFn: () => unwrapServiceError(getConnectionSyncCounts()),
        refetchInterval: (query) =>
            query.state.data?.firstTimeSyncingCount
                ? POLL_INTERVAL_MS
                : false,
        initialData: initialCounts,
    });
    const previousCount = usePrevious(counts.firstTimeSyncingCount);

    useEffect(() => {
        if (
            previousCount !== undefined
            && previousCount > 0
            && counts.firstTimeSyncingCount === 0
        ) {
            router.refresh();
        }
    }, [counts.firstTimeSyncingCount, previousCount, router]);

    if (isError || isPending || counts.firstTimeSyncingCount === 0) {
        return null;
    }

    const firstTimeSyncingCount = counts.firstTimeSyncingCount;

    return (
        <BannerShell
            id={id}
            dismissible={dismissible}
            icon={<Loader2 className="mt-0.5 h-4 w-4 animate-spin" />}
            title={t("connectionFirstSyncTitle", { count: firstTimeSyncingCount })}
            description={t("connectionFirstSyncDescription", { count: firstTimeSyncingCount })}
            action={(
                <Button asChild size="sm" variant="outline">
                    <Link href="/settings/connections?sortBy=syncedAt&sortOrder=desc">
                        {t("viewConnections")}
                    </Link>
                </Button>
            )}
        />
    );
}
