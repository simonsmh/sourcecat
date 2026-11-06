import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LightweightCodeHighlighter } from "@/app/(app)/components/lightweightCodeHighlighter";
import { useMemo } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import { SourceRange } from "@/features/search";

interface SymbolDefinitionPreviewProps {
    symbolDefinition: {
        lineContent: string;
        language: string;
        fileName: string;
        repoName: string;
        range: SourceRange;
    };
}

export const SymbolDefinitionPreview = ({
    symbolDefinition,
}: SymbolDefinitionPreviewProps) => {
    const t = useTranslations("codeNav");
    const { lineContent, language, range } = symbolDefinition;
    const highlightRanges = useMemo(() => [range], [range]);

    return (
        <div className="flex flex-col gap-2 mb-2">
            <Tooltip
                delayDuration={100}
            >
                <TooltipTrigger
                    disabled={true}
                    className="mr-auto"
                >
                    <Badge
                        variant="outline"
                        className="w-fit h-fit flex-shrink-0 select-none"
                    >
                        {t("hover.searchBased")}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    align="start"
                >
                    {t("hover.definitionTooltip")}
                </TooltipContent>
            </Tooltip>
            <LightweightCodeHighlighter
                language={language}
                highlightRanges={highlightRanges}
                lineNumbers={false}
                lineNumbersOffset={range.start.lineNumber}
                renderWhitespace={false}
            >
                {lineContent}
            </LightweightCodeHighlighter>
        </div>
    )
}