"use client"

import { UpsellPanel } from "@/features/billing/upsellDialog"
import { useTranslations } from "@/i18n/I18nProvider"

/**
 * Shown in place of the Skills management UI when the deployment is not on a plan
 * that includes Ask Sourcebot. FSL (not ee/) so it can render for free-plan users
 * as the upsell surface without mounting any ee/ skill code.
 */
export function SkillsEntitlementMessage() {
    const t = useTranslations("settings")
    return (
        <div className="flex items-center justify-center min-h-[60vh] py-12 px-4">
            <UpsellPanel
                source="chat_connectors"
                returnPath="/settings/skills"
                title={t("skillsPage.entitlement.title")}
                description={t("skillsPage.entitlement.description")}
                className="w-full max-w-2xl"
                loadingVariant="spinner"
            />
        </div>
    )
}
