'use client';

import { useTranslations } from "@/i18n/I18nProvider";

import { ListReposMetadata, ToolResult } from "@/features/tools";
import { Separator } from "@/components/ui/separator";

export const ListReposToolComponent = ({ metadata }: ToolResult<ListReposMetadata>) => {
    const t = useTranslations("chat");
    const count = metadata.repos.length;
    const label = `${count}${metadata.totalCount > count ? t("tools.ofTotal", { total: metadata.totalCount }) : ''} ${t("tools.repoWord", { count })}`;

    return (
        <div className="flex items-center gap-2 select-none cursor-default text-sm text-muted-foreground">
            <span className="flex-shrink-0">{t("tools.listedRepositories")}</span>
            <span className="flex-1" />
            <span className="text-xs flex-shrink-0">{label}</span>
            <Separator orientation="vertical" className="h-3 flex-shrink-0" />
        </div>
    );
};
