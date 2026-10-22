"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { setMemberApprovalRequired } from "@/app/(app)/settings/security/actions"
import { isServiceError } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"
import { BasicSettingsCard } from "@/app/(app)/settings/components/settingsCard"
import { useTranslations } from "@/i18n/I18nProvider"
import { ManagedByScimBadge } from "@/features/membership/components/managedByScimBadge"

interface MemberApprovalRequiredSettingsCardProps {
    memberApprovalRequired: boolean
    scimManaged?: boolean
}

export const MemberApprovalRequiredSettingsCard = ({
    memberApprovalRequired,
    scimManaged = false,
}: MemberApprovalRequiredSettingsCardProps) => {
    const [enabled, setEnabled] = useState(memberApprovalRequired)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const t = useTranslations("settings")

    const handleToggle = async (checked: boolean) => {
        setIsLoading(true)
        try {
            const result = await setMemberApprovalRequired(checked)
            
            if (isServiceError(result)) {
                toast({
                    title: t("securityPage.error"),
                    description: result.message,
                    variant: "destructive",
                })
                return
            }

            setEnabled(checked)
        } catch (error) {
            console.error("Error updating member approval setting:", error)
            toast({
                title: t("securityPage.error"),
                description: t("securityPage.memberApproval.updateFailed"),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <BasicSettingsCard
            name={t("securityPage.memberApproval.name")}
            description={t("securityPage.memberApproval.description")}
            badge={scimManaged ? <ManagedByScimBadge tooltip={t("securityPage.scimManagedTooltip")} /> : undefined}
        >
            <Switch
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={isLoading || scimManaged}
            />
        </BasicSettingsCard>
    )
}