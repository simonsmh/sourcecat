"use client";

import Link from "next/link";
import { CircleArrowUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/I18nProvider";
import { BannerShell } from "./bannerShell";
import type { BannerProps } from "./types";

interface UpgradeAvailableBannerProps extends BannerProps {
    currentVersion: string;
    latestVersion: string;
}

export function UpgradeAvailableBanner({ id, dismissible, currentVersion, latestVersion }: UpgradeAvailableBannerProps) {
    const t = useTranslations("banners");
    const tCommon = useTranslations("common");
    return (
        <BannerShell
            id={id}
            dismissible={dismissible}
            icon={<CircleArrowUp className="h-4 w-4 mt-0.5" />}
            title={t("upgradeAvailableTitle")}
            description={t("upgradeAvailableDescription", { currentVersion, latestVersion })}
            action={
                <Button asChild size="sm" variant="outline">
                    <Link
                        href="https://github.com/simonsmh/sourcecat/releases/latest"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {tCommon("update")}
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            }
        />
    );
}
