"use client";

import { CircleCheck, CircleX, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import type { OffersResponse } from "@sourcecat/shared/client";

interface FeatureLinkProps {
    text: string;
    href: string;
}

function FeatureLink({ text, href }: FeatureLinkProps) {
    return (
        <TableCell>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 whitespace-nowrap"
            >
                {text}
                <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
        </TableCell>
    );
}

interface SupportIconProps {
    supported: boolean;
}

function SupportIcon({ supported }: SupportIconProps) {
    const Icon = supported ? CircleCheck : CircleX;
    return (
        <TableCell>
            <Icon className={
                cn("h-4 w-4 text-primary text-gray-100 rounded-full", {
                    "bg-blue-500": supported,
                    "bg-gray-500": !supported
                })}
            />
        </TableCell>
    );
}

export type BillingInterval = "year" | "month";

function formatPrice(unitAmount: number, currency: string, interval: BillingInterval): string {
    const options = { minimumFractionDigits: 0 };
    if (interval === "year") {
        return `${formatCurrency(Math.round(unitAmount / 12), currency, options)} per user/month, annually`;
    }
    return `${formatCurrency(unitAmount, currency, options)} per user/month`;
}

interface PlanComparisonTableProps {
    offers: OffersResponse;
    billingInterval: BillingInterval;
    onBillingIntervalChange: (interval: BillingInterval) => void;
}

export function PlanComparisonTable({
    offers,
    billingInterval,
    onBillingIntervalChange,
}: PlanComparisonTableProps) {
    const proPrice = formatPrice(
        billingInterval === "year" ? offers.pricing.annual.unitAmount : offers.pricing.monthly.unitAmount,
        billingInterval === "year" ? offers.pricing.annual.currency : offers.pricing.monthly.currency,
        billingInterval,
    );

    return (
        <Table
            wrapperClassName="mx-auto"
            className="[&_th:not(:last-child)]:border-r [&_td:not(:last-child)]:border-r [&_td]:py-2"
        >
            <TableHeader>
                <TableRow>
                    <TableHead />
                    <TableHead className="w-52 align-top">
                        <div className="text-lg text-primary">Free</div>
                        <div className="text-xs text-muted-foreground font-normal mt-0.5">Free for everyone</div>
                    </TableHead>
                    <TableHead className="w-52 align-top">
                        <span className="text-lg text-primary">Pro</span>
                        <div className="text-xs text-muted-foreground font-normal mt-0.5">{proPrice}</div>
                        <div className="flex items-center my-1">
                            <Switch
                                checked={billingInterval === "year"}
                                onCheckedChange={(checked) => onBillingIntervalChange(checked ? "year" : "month")}
                                className="scale-75 origin-left"
                            />
                            <span className="text-xs font-normal">
                                Annual billing
                            </span>
                        </div>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <FeatureLink text="Code search" href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/features/search/code-search.mdx" />
                    <SupportIcon supported />
                    <SupportIcon supported />
                </TableRow>
                <TableRow>
                    <FeatureLink text="Code browsing" href="https://www.sourcecat.dev/changelog/file-explorer" />
                    <SupportIcon supported />
                    <SupportIcon supported />
                </TableRow>
                <TableRow>
                    <FeatureLink text="Ask Sourcecat" href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/features/ask/ask-sourcecat.mdx" />
                    <SupportIcon supported={false} />
                    <SupportIcon supported />
                </TableRow>
                <TableRow>
                    <FeatureLink text="MCP server" href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/features/mcp-server.mdx" />
                    <SupportIcon supported={false} />
                    <SupportIcon supported />
                </TableRow>
                <TableRow>
                    <FeatureLink text="Code navigation" href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/features/code-navigation.mdx" />
                    <SupportIcon supported={false} />
                    <SupportIcon supported />
                </TableRow>
                <TableRow>
                    <FeatureLink text="SSO & OAuth" href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/configuration/idp.mdx" />
                    <SupportIcon supported={false} />
                    <SupportIcon supported />
                </TableRow>
                <TableRow>
                    <FeatureLink text="Permission syncing" href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/features/permission-syncing.mdx" />
                    <SupportIcon supported={false} />
                    <SupportIcon supported />
                </TableRow>
                <TableRow>
                    <FeatureLink text="Audit logs" href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/configuration/audit-logs.mdx" />
                    <SupportIcon supported={false} />
                    <SupportIcon supported />
                </TableRow>
            </TableBody>
        </Table>
    );
}
