'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import useCaptureEvent from '@/hooks/useCaptureEvent';
import { cn, getShortenedNumberDisplayString } from '@/lib/utils';
import isEqual from "fast-deep-equal/react";
import { useStickToBottom } from 'use-stick-to-bottom';
import { Brain, ChevronDown, ChevronRight, Clock, InfoIcon, Loader2, ScanSearchIcon, ShieldQuestion, Wrench, Zap } from 'lucide-react';
import { memo, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { usePrevious } from '@uidotdev/usehooks';
import { useTranslations } from "@/i18n/I18nProvider";
import { SBChatMessageMetadata, SBChatMessagePart, StepTokenUsageEntry } from '@/features/chat/types';
import { SearchScopeIcon } from '@/features/chat/components/searchScopeIcon';
import { MarkdownRenderer } from './markdownRenderer';
import { FindSymbolDefinitionsToolComponent } from './tools/findSymbolDefinitionsToolComponent';
import { FindSymbolReferencesToolComponent } from './tools/findSymbolReferencesToolComponent';
import { GlobToolComponent } from './tools/globToolComponent';
import { GrepToolComponent } from './tools/grepToolComponent';
import { GetDiffToolComponent } from './tools/getDiffToolComponent';
import { ListBranchesToolComponent } from './tools/listBranchesToolComponent';
import { ListCommitsToolComponent } from './tools/listCommitsToolComponent';
import { ListReposToolComponent } from './tools/listReposToolComponent';
import { ListTreeToolComponent } from './tools/listTreeToolComponent';
import { ReadFileToolComponent } from './tools/readFileToolComponent';
import { ToolOutputGuard } from './tools/toolOutputGuard';
import { McpToolComponent } from './tools/mcpToolComponent';
import { ToolSearchToolComponent } from './tools/toolSearchToolComponent';
import { LoadSkillToolComponent } from './tools/loadSkillToolComponent';
import { CreateSkillToolComponent } from './tools/createSkillToolComponent';
import { UpdateSkillToolComponent } from './tools/updateSkillToolComponent';
import { ListSkillsToolComponent } from './tools/listSkillsToolComponent';


// A UI-visible step: the parts of one LLM invocation, tagged with the
// invocation's position in the turn. The stepIndex indexes directly into
// `metadata.stepTokenUsage`, whose entries are recorded 1:1 with the turn's
// steps in order (across approval-continuation phases).
export interface ThinkingStep {
    stepIndex: number;
    parts: SBChatMessagePart[];
}

interface DetailsCardProps {
    chatId: string;
    isExpanded: boolean;
    onExpandedChanged: (isExpanded: boolean) => void;
    isThinking: boolean;
    isTurnInProgress: boolean;
    isNetworkActive: boolean;
    isAwaitingToolApproval: boolean;
    thinkingSteps: ThinkingStep[];
    // Index of the step that produced the answer. That step is filtered out
    // of `thinkingSteps`, so its usage is rendered as a dedicated final row.
    answerStepIndex?: number;
    metadata?: SBChatMessageMetadata;
}

type ChatTranslator = ReturnType<typeof useTranslations<"chat">>;

const DetailsCardComponent = ({
    chatId,
    isExpanded,
    onExpandedChanged,
    isThinking,
    isTurnInProgress,
    isNetworkActive,
    isAwaitingToolApproval,
    metadata,
    thinkingSteps,
    answerStepIndex,
}: DetailsCardProps) => {
    const t = useTranslations("chat");
    const captureEvent = useCaptureEvent();

    const toolCallCount = useMemo(() => thinkingSteps.flatMap(({ parts }) => parts).filter(part =>
        part.type.startsWith('tool-') ||
        (part.type === 'dynamic-tool' && part.toolName.startsWith('mcp_'))
    ).length, [thinkingSteps]);

    // Lookup of estimated output tokens by tool call id, used to badge
    // individual tool calls in the thinking steps.
    const toolTokenUsageMap = useMemo(() => new Map(
        (metadata?.stepTokenUsage ?? []).flatMap(({ tools }) =>
            tools.map(({ toolCallId, estimatedOutputTokens }) => [toolCallId, estimatedOutputTokens] as const)
        )
    ), [metadata?.stepTokenUsage]);

    const cacheReadTokens = metadata?.totalCacheReadTokens ?? 0;
    const inputTokens = metadata?.totalInputTokens ?? 0;
    const cachedInputPercent = inputTokens > 0
        ? Math.round((cacheReadTokens / inputTokens) * 100)
        : 0;

    // Context-window usage gauge. "In use" is the input the model saw on its
    // most recent step — i.e. the full accumulated prompt occupying the window
    // right now — not the cumulative totalInputTokens.
    const stepTokenUsage = metadata?.stepTokenUsage;
    const currentContextTokens = stepTokenUsage && stepTokenUsage.length > 0
        ? stepTokenUsage[stepTokenUsage.length - 1].inputTokens
        : undefined;
    const contextWindow = metadata?.contextWindow;
    const contextUsagePercent = currentContextTokens !== undefined && contextWindow !== undefined && contextWindow > 0
        ? Math.min(100, Math.round((currentContextTokens / contextWindow) * 100))
        : undefined;

    const handleExpandedChanged = useCallback((next: boolean) => {
        captureEvent('wa_chat_details_card_toggled', { chatId, isExpanded: next });
        onExpandedChanged(next);
    }, [chatId, captureEvent, onExpandedChanged]);

    return (
        <Card className="mb-4">
            <Collapsible open={isExpanded} onOpenChange={handleExpandedChanged}>
                <CollapsibleTrigger asChild>
                    <CardContent
                        className={cn("p-3 cursor-pointer hover:bg-muted", {
                            "rounded-lg": !isExpanded,
                            "rounded-t-lg": isExpanded,
                        })}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-4">

                                <p className="flex items-center font-semibold text-muted-foreground text-sm">
                                    {isThinking ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-1 flex-shrink-0" />
                                            {t("thread.thinking")}
                                        </>
                                    ) : isAwaitingToolApproval ? (
                                        <>
                                            <ShieldQuestion className="w-4 h-4 mr-1 flex-shrink-0" />
                                            {t("thread.awaitingPermission")}
                                        </>
                                    ) : (
                                        <>
                                            <InfoIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                                            {t("thread.details")}
                                        </>
                                    )}
                                </p>
                                {!isTurnInProgress && (
                                    <>
                                        <Separator orientation="vertical" className="h-4" />
                                        {(metadata?.selectedSearchScopes && metadata.selectedSearchScopes.length > 0) && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center text-xs cursor-help">
                                                        <ScanSearchIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        {t("thread.searchScopes", { count: metadata.selectedSearchScopes.length })}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <div className="max-w-xs">
                                                        <div className="space-y-2">
                                                            {metadata.selectedSearchScopes.map((item) => (
                                                                <div key={item.value} className="flex items-center gap-2 text-xs">
                                                                    <SearchScopeIcon searchScope={item} className="h-3 w-3" />
                                                                    <span>{item.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                        {metadata?.modelName && (
                                            <div className="flex items-center text-xs">
                                                <Brain className="w-3 h-3 mr-1 flex-shrink-0" />
                                                {metadata?.modelName}
                                            </div>
                                        )}
                                        {metadata?.totalTokens && (
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center cursor-help">
                                                            <Zap className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            {getShortenedNumberDisplayString(metadata.totalTokens, 0)} {t("thread.tokens")}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <div className="space-y-1 text-xs">
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-muted-foreground">{t("thread.tokensInput")}</span>
                                                                <span>{metadata.totalInputTokens?.toLocaleString() ?? '—'}</span>
                                                            </div>
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-muted-foreground">{t("thread.tokensOutput")}</span>
                                                                <span>{metadata.totalOutputTokens?.toLocaleString() ?? '—'}</span>
                                                            </div>
                                                            <div className="flex justify-between gap-4 border-t border-border pt-1">
                                                                <span className="text-muted-foreground">{t("thread.tokensTotal")}</span>
                                                                <span>{metadata.totalTokens.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                                {cachedInputPercent > 0 && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="text-muted-foreground cursor-help">{t("thread.cachedPercent", { percent: cachedInputPercent })}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom">
                                                            <div className="max-w-xs text-xs">
                                                                {t("thread.cachedTooltip", { cached: cacheReadTokens.toLocaleString(), total: inputTokens.toLocaleString() })}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        )}
                                        {contextUsagePercent !== undefined && currentContextTokens !== undefined && contextWindow !== undefined && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="cursor-help">
                                                        <ContextWindowGauge
                                                            total={contextWindow}
                                                            percent={contextUsagePercent}
                                                        />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <div className="max-w-xs text-xs">
                                                        {t("thread.contextTooltip", { current: currentContextTokens.toLocaleString(), window: contextWindow.toLocaleString(), percent: contextUsagePercent })}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                        {metadata?.totalResponseTimeMs && (
                                            <div className="flex items-center text-xs">
                                                <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                                {t("thread.seconds", { seconds: Math.round(metadata.totalResponseTimeMs / 1000) })}
                                            </div>
                                        )}
                                        {toolCallCount > 0 && (
                                            <div className="flex items-center text-xs">
                                                <Wrench className="w-3 h-3 mr-1 flex-shrink-0" />
                                                {t("thread.toolCalls", { count: toolCallCount })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                        </div>
                    </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="mt-2 p-0">
                        <ThinkingSteps
                            thinkingSteps={thinkingSteps}
                            isNetworkActive={isNetworkActive}
                            isThinking={isThinking}
                            toolTokenUsageMap={toolTokenUsageMap}
                            stepTokenUsage={metadata?.stepTokenUsage}
                            answerStepIndex={answerStepIndex}
                        />
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}

export const DetailsCard = memo(DetailsCardComponent, isEqual);


const ThinkingSteps = ({ thinkingSteps, isNetworkActive, isThinking, toolTokenUsageMap, stepTokenUsage, answerStepIndex }: { thinkingSteps: ThinkingStep[], isNetworkActive: boolean, isThinking: boolean, toolTokenUsageMap?: Map<string, number>, stepTokenUsage?: StepTokenUsageEntry[], answerStepIndex?: number }) => {
    const t = useTranslations("chat");
    const { scrollRef, contentRef, scrollToBottom } = useStickToBottom();
    const [shouldStick, setShouldStick] = useState(isThinking);
    const prevIsThinking = usePrevious(isThinking);

    useEffect(() => {
        if (prevIsThinking && !isThinking) {
            scrollToBottom();
            setShouldStick(false);
        } else if (!prevIsThinking && isThinking) {
            setShouldStick(true);
        }
    }, [isThinking, prevIsThinking, scrollToBottom]);

    // The answer step is normally filtered out of `thinkingSteps` (its only
    // part is the answer text), so its usage gets a dedicated row. If the
    // step is still visible (e.g. it also contained narration), the index
    // join below already covers it — skip the extra row.
    const answerUsage = answerStepIndex !== undefined && !thinkingSteps.some(({ stepIndex }) => stepIndex === answerStepIndex)
        ? stepTokenUsage?.[answerStepIndex]
        : undefined;

    return (
        <div ref={scrollRef} className="max-h-[350px] overflow-y-auto px-6 py-2">
            <div ref={shouldStick ? contentRef : undefined}>
                {thinkingSteps.length === 0 ? (
                    isNetworkActive ? (
                        <Skeleton className="h-24 w-full" />
                    ) : (
                        <p className="text-sm text-muted-foreground">{t("thread.noThinkingSteps")}</p>
                    )
                ) : (
                    <>
                        {thinkingSteps.map(({ stepIndex, parts }) => {
                            // A step's usage is simply the entry at its position
                            // in the turn's step sequence. Out-of-range lookups
                            // (e.g. an aborted turn whose last step never
                            // finished) return undefined and render no usage line.
                            const stepUsage = stepTokenUsage?.[stepIndex];

                            // Inline the step's usage alongside the step's first part
                            // when that part is narration text, so the cost reads as a
                            // property of the step, not of the tool calls below it.
                            // Steps that open directly with a tool call get the usage
                            // on its own line instead — tool rows already carry their
                            // own right-aligned info.
                            const [firstPart, ...restParts] = parts;
                            const isFirstPartNarration = firstPart.type === 'text' || firstPart.type === 'reasoning';

                            return (
                                <div key={stepIndex}>
                                    {stepUsage && !isFirstPartNarration && (
                                        <div className="flex justify-end mb-2">
                                            <StepTokenUsage usage={stepUsage} />
                                        </div>
                                    )}
                                    <div className="flex items-start gap-4">
                                        <div className="mb-2 flex-1 min-w-0">
                                            <StepPartRenderer
                                                part={firstPart}
                                                toolTokenUsageMap={toolTokenUsageMap}
                                            />
                                        </div>
                                        {stepUsage && isFirstPartNarration && <StepTokenUsage usage={stepUsage} />}
                                    </div>
                                    {restParts.map((part, index) => (
                                        <div key={index} className="mb-2">
                                            <StepPartRenderer
                                                part={part}
                                                toolTokenUsageMap={toolTokenUsageMap}
                                            />
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                        {answerUsage && (
                            <div className="flex justify-end mb-2">
                                <StepTokenUsage usage={answerUsage} label="answer" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}


// The provider-reported input/output token pair of a single agent step,
// rendered at the end of the step's group of parts.
const StepTokenUsage = ({ usage, label = 'step' }: { usage: StepTokenUsageEntry, label?: string }) => {
    const t = useTranslations("chat");
    if (usage.inputTokens === undefined && usage.outputTokens === undefined) {
        return null;
    }

    const cachedPercent = usage.inputTokens && usage.cacheReadTokens
        ? Math.round((usage.cacheReadTokens / usage.inputTokens) * 100)
        : 0;

    const compactParts = [
        ...(usage.inputTokens !== undefined ? [t("thread.tokensIn", { value: getShortenedNumberDisplayString(usage.inputTokens, 0) })] : []),
        ...(usage.outputTokens !== undefined ? [t("thread.tokensOut", { value: getShortenedNumberDisplayString(usage.outputTokens, 0) })] : []),
    ];

    return (
        <div className="flex-shrink-0 mt-0.5">
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground cursor-help whitespace-nowrap">
                        {label === 'answer' ? t("thread.answerLabel") : t("thread.stepLabel")} · {compactParts.join(' · ')}
                    </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">{t("thread.tokensInput")}</span>
                            <span>{usage.inputTokens?.toLocaleString() ?? '—'}{cachedPercent > 0 ? ` ${t("thread.cachedPercent", { percent: cachedPercent })}` : ''}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">{t("thread.tokensOutput")}</span>
                            <span>{usage.outputTokens?.toLocaleString() ?? '—'}</span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}


const CONTEXT_USAGE_YELLOW_PERCENT = 50;
const CONTEXT_USAGE_RED_PERCENT = 80;

const getContextUsageColorClass = (percent: number): string => {
    if (percent >= CONTEXT_USAGE_RED_PERCENT) {
        return "text-red-500";
    }
    if (percent >= CONTEXT_USAGE_YELLOW_PERCENT) {
        return "text-yellow-500";
    }
    return "text-[#6cb38f]";
};

const ContextWindowGauge = ({ total, percent }: { total: number, percent: number }) => {
    const t = useTranslations("chat");
    const size = 14;
    const strokeWidth = 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - Math.min(100, percent) / 100);
    const colorClass = getContextUsageColorClass(percent);

    return (
        <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
                {/* Neutral gray track. */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-zinc-500"
                />
                {/* Progress arc. */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className={cn("transition-all duration-300", colorClass)}
                />
            </svg>
            <span className={cn("font-semibold", colorClass)}>{percent}%</span>
            <span className="text-muted-foreground">{t("thread.contextOf", { total: getShortenedNumberDisplayString(total, 0).toUpperCase() })}</span>
        </div>
    );
}

type GuardedToolType =
    | 'tool-read_file'
    | 'tool-grep'
    | 'tool-glob'
    | 'tool-find_symbol_definitions'
    | 'tool-find_symbol_references'
    | 'tool-list_repos'
    | 'tool-list_branches'
    | 'tool-list_commits'
    | 'tool-get_diff'
    | 'tool-list_tree'
    | 'tool-create_skill'
    | 'tool-update_skill'
    | 'tool-list_skills';

type GuardedToolPart = Extract<SBChatMessagePart, { type: GuardedToolType }>;

// The builtin tools that render through ToolOutputGuard, which differ only in
// their loading text and output component. The `satisfies` mapped type checks
// each entry's `render` against its own tool's output shape.
const getToolGuardConfig = (t: ChatTranslator) => ({
    'tool-read_file': { loadingText: t("thread.loadingReadingFile"), render: (output) => <ReadFileToolComponent {...output} /> },
    'tool-grep': { loadingText: t("thread.loadingSearching"), render: (output) => <GrepToolComponent {...output} /> },
    'tool-glob': { loadingText: t("thread.loadingSearchingFiles"), render: (output) => <GlobToolComponent {...output} /> },
    'tool-find_symbol_definitions': { loadingText: t("thread.loadingResolvingDefinitions"), render: (output) => <FindSymbolDefinitionsToolComponent {...output} /> },
    'tool-find_symbol_references': { loadingText: t("thread.loadingResolvingReferences"), render: (output) => <FindSymbolReferencesToolComponent {...output} /> },
    'tool-list_repos': { loadingText: t("thread.loadingListingRepositories"), render: (output) => <ListReposToolComponent {...output} /> },
    'tool-list_branches': { loadingText: t("thread.loadingListingBranches"), render: (output) => <ListBranchesToolComponent {...output} /> },
    'tool-list_commits': { loadingText: t("thread.loadingListingCommits"), render: (output) => <ListCommitsToolComponent {...output} /> },
    'tool-get_diff': { loadingText: t("thread.loadingComparingRevisions"), render: (output) => <GetDiffToolComponent {...output} /> },
    'tool-list_tree': { loadingText: t("thread.loadingListingTree"), render: (output) => <ListTreeToolComponent {...output} /> },
    'tool-create_skill': { loadingText: t("thread.loadingCreatingSkill"), render: (output) => <CreateSkillToolComponent {...output} /> },
    'tool-update_skill': { loadingText: t("thread.loadingUpdatingSkill"), render: (output) => <UpdateSkillToolComponent {...output} /> },
    'tool-list_skills': { loadingText: t("thread.loadingListingSkills"), render: (output) => <ListSkillsToolComponent {...output} /> },
}) satisfies {
    [K in GuardedToolType]: {
        loadingText: string;
        render: (output: Extract<GuardedToolPart, { type: K, state: 'output-available' }>['output']) => ReactNode;
    }
};

export const StepPartRenderer = ({ part, toolTokenUsageMap }: { part: SBChatMessagePart, toolTokenUsageMap?: Map<string, number> }) => {
    const t = useTranslations("chat");
    const estimatedOutputTokens = 'toolCallId' in part ? toolTokenUsageMap?.get(part.toolCallId) : undefined;

    switch (part.type) {
        case 'reasoning':
        case 'text':
            return (
                <MarkdownRenderer
                    content={part.text}
                    className="text-sm prose-p:m-0 prose-code:text-xs"
                />
            )
        case 'tool-read_file':
        case 'tool-grep':
        case 'tool-glob':
        case 'tool-find_symbol_definitions':
        case 'tool-find_symbol_references':
        case 'tool-list_repos':
        case 'tool-list_branches':
        case 'tool-list_commits':
        case 'tool-get_diff':
        case 'tool-list_tree':
        case 'tool-create_skill':
        case 'tool-update_skill':
        case 'tool-list_skills': {
            const { loadingText, render } = getToolGuardConfig(t)[part.type];
            return (
                <ToolOutputGuard
                    part={part}
                    estimatedOutputTokens={estimatedOutputTokens}
                    loadingText={loadingText}
                >
                    {/* The table lookup erases the per-tool correlation between
                        `render` and `output` (TypeScript can't track it across
                        a union), so re-assert it here. Each entry's `render` is
                        checked against its own tool's output by the table's
                        `satisfies` type. */}
                    {(output) => (render as (o: typeof output) => ReactNode)(output)}
                </ToolOutputGuard>
            );
        }
        case 'tool-tool_request_activation':
            if (part.state === 'output-error') {
                return <span className="text-sm text-destructive">{t("thread.toolActivationFailed", { error: part.errorText })}</span>;
            }
            if (part.state !== 'output-available') {
                return <span className="text-sm text-muted-foreground animate-pulse">{t("thread.activatingTool")}</span>;
            }
            return <ToolSearchToolComponent query={part.input.tool_to_activate_name} results={part.output.results ?? []} estimatedOutputTokens={estimatedOutputTokens} />;
        case 'tool-load_skill':
            if (part.state === 'output-error') {
                return <span className="text-sm text-destructive">{t("thread.loadingSkillFailed", { error: part.errorText })}</span>;
            }
            if (part.state !== 'output-available') {
                return <span className="text-sm text-muted-foreground animate-pulse">{t("thread.loadingSkill")}</span>;
            }
            return <LoadSkillToolComponent input={part.input} output={part.output} />;
        case 'dynamic-tool':
            if (part.toolName.startsWith('mcp_')) {
                return <McpToolComponent part={part} estimatedOutputTokens={estimatedOutputTokens} />;
            }
            return null;
        case 'data-source':
        case 'data-command':
        case 'data-mcp-server':
        case 'data-mcp-tool':
        case 'data-mcp-failed-server':
        case 'data-mcp-auth-required':
        case 'data-attachment':
        case 'file':
        case 'source-document':
        case 'source-url':
        case 'step-start':
            return null;
        default:
            // Guarantees this switch-case to be exhaustive
            part satisfies never;
            return null;
    }
}
