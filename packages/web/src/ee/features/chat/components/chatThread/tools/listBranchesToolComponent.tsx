'use client';

import { useTranslations } from "@/i18n/I18nProvider";

import { Separator } from '@/components/ui/separator';
import { ListBranchesMetadata, ToolResult } from '@/features/tools';

export const ListBranchesToolComponent = ({ metadata }: ToolResult<ListBranchesMetadata>) => {
    const t = useTranslations("chat");
    const label = `${metadata.returnedCount}${metadata.totalCount > metadata.returnedCount ? t("tools.ofTotal", { total: metadata.totalCount }) : ''} ${t("tools.branchWord", { count: metadata.totalCount })}`;

    return (
        <div className="flex items-center gap-2 select-none cursor-default text-sm text-muted-foreground">
            <span className="flex-shrink-0">{t("tools.listedBranchesIn")}</span>
            <span className="truncate text-foreground font-medium" title={metadata.repo}>{metadata.repo}</span>
            <span className="flex-1" />
            <span className="text-xs flex-shrink-0">{label}</span>
            <Separator orientation="vertical" className="h-3 flex-shrink-0" />
        </div>
    );
};
