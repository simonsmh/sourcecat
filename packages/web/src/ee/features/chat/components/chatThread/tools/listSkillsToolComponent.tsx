'use client';

import { useTranslations } from "@/i18n/I18nProvider";

import { Separator } from '@/components/ui/separator';
import { ListSkillsMetadata, ToolResult } from '@/features/tools';

export const ListSkillsToolComponent = ({ metadata }: ToolResult<ListSkillsMetadata>) => {
    const t = useTranslations("chat");
    const label = `${metadata.count} ${t("tools.skillWord", { count: metadata.count })}`;

    return (
        <div className="flex items-center gap-2 select-none cursor-default text-sm text-muted-foreground">
            <span className="flex-shrink-0">{t("tools.listedSkills")}</span>
            <span className="flex-1" />
            <span className="text-xs flex-shrink-0">{label}</span>
            <Separator orientation="vertical" className="h-3 flex-shrink-0" />
        </div>
    );
};
