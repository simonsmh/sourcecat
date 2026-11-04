'use client';

import { useTranslations } from "@/i18n/I18nProvider";

import { ListTreeMetadata, ToolResult } from "@/features/tools";
import { RepoBadge } from "./repoBadge";
import { Separator } from "@/components/ui/separator";
import { getBrowsePath } from "@/app/(app)/browse/hooks/utils";
import { FolderIcon } from "lucide-react";
import Link from "next/link";

export const ListTreeToolComponent = ({ metadata }: ToolResult<ListTreeMetadata>) => {
    const t = useTranslations("chat");
    return (
        <div className="flex items-center gap-2 select-none cursor-default text-sm text-muted-foreground">
            <span className="flex-shrink-0">{t("tools.listed")}</span>
            <Link
                href={getBrowsePath({
                    repoName: metadata.repo,
                    revisionName: metadata.ref,
                    path: metadata.path,
                    pathType: 'tree',
                })}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs bg-muted hover:bg-accent px-1.5 py-0.5 rounded truncate text-foreground font-medium transition-colors min-w-0"
            >
                <FolderIcon className="h-3 w-3 flex-shrink-0" />
                {metadata.path || '/'}
            </Link>
            <span className="flex-shrink-0">{t("tools.in")}</span>
            <RepoBadge repo={metadata.repoInfo} />
            <span className="flex-shrink-0 ml-auto text-xs">
                {metadata.totalReturned} {t("tools.entryWord", { count: metadata.totalReturned })}{metadata.truncated ? t("tools.truncatedSuffix") : ''}
            </span>
            <Separator orientation="vertical" className="h-3 flex-shrink-0" />
        </div>
    );
};
