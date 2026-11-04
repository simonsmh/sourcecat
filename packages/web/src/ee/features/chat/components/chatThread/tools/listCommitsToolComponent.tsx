'use client';

import { useTranslations } from "@/i18n/I18nProvider";

import { ListCommitsMetadata, ToolResult } from "@/features/tools";
import { RepoBadge } from "./repoBadge";
import { Separator } from "@/components/ui/separator";

export const ListCommitsToolComponent = ({ metadata }: ToolResult<ListCommitsMetadata>) => {
    const t = useTranslations("chat");
    const count = metadata.commits.length;
    const label = `${count} ${t("tools.commitWord", { count })}`;

    return (
        <div className="flex items-center gap-2 select-none cursor-default text-sm text-muted-foreground">
            <span className="flex-shrink-0">{t("tools.listedCommitsIn")}</span>
            <RepoBadge repo={metadata.repoInfo} />
            <span className="flex-1" />
            <span className="text-xs flex-shrink-0">{label}</span>
            <Separator orientation="vertical" className="h-3 flex-shrink-0" />
        </div>
    );
};
