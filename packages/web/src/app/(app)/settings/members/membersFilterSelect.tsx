"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type MemberFilter } from "./membersTable";
import { useTranslations } from "@/i18n/I18nProvider";

const FILTER_OPTIONS: { value: MemberFilter; labelKey: "filter.all" | "filter.owners" | "filter.members" | "status.active" | "status.pending" | "status.suspended" | "status.invited" | "status.requests" }[] = [
    { value: "all", labelKey: "filter.all" },
    { value: "owners", labelKey: "filter.owners" },
    { value: "members", labelKey: "filter.members" },
    { value: "active", labelKey: "status.active" },
    { value: "pending", labelKey: "status.pending" },
    { value: "suspended", labelKey: "status.suspended" },
    { value: "invited", labelKey: "status.invited" },
    { value: "requests", labelKey: "status.requests" },
];

interface MembersFilterSelectProps {
    value: MemberFilter;
    onValueChange: (value: MemberFilter) => void;
}

export const MembersFilterSelect = ({ value, onValueChange }: MembersFilterSelectProps) => {
    const t = useTranslations("settings");
    return (
        <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue as MemberFilter)}>
            <SelectTrigger className="w-fit">
                <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
                {FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {t(`membersPage.${option.labelKey}`)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
