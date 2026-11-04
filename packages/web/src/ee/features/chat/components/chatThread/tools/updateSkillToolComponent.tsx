'use client';

import { useTranslations } from "@/i18n/I18nProvider";

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ToolResult, UpdateSkillMetadata } from '@/features/tools';

export const UpdateSkillToolComponent = ({ metadata }: ToolResult<UpdateSkillMetadata>) => {
    const t = useTranslations("chat");
    return (
        <div className="flex items-center gap-2 select-none text-sm text-muted-foreground">
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <span className="flex-shrink-0">{metadata.scope === 'shared' ? t("tools.updatedSharedSkill") : t("tools.updatedSkill")}</span>
            <Link
                href={metadata.url}
                className="truncate text-foreground font-medium hover:underline"
                title={metadata.name}
            >
                {metadata.name}
            </Link>
            <span className="font-mono text-xs text-muted-foreground/70 flex-shrink-0">/{metadata.slug}</span>
            <span className="flex-1" />
        </div>
    );
};
