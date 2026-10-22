"use client"

import { UpsellPanel } from "@/features/billing/upsellDialog"
import { useTranslations } from "@/i18n/I18nProvider"

/**
 * Shown in place of the per-user Ask Sourcebot connector UI when the deployment is
 * not on a plan that includes Ask Sourcebot. FSL (not ee/) so it can render for
 * free-plan users as the upsell surface, reusing the shared feature-breakdown
 * panel (plan comparison + trial/upgrade) without mounting any ee/ connector code.
 */
export function AccountAskAgentEntitlementMessage() {
    const t = useTranslations("settings")
    return (
        <div className="flex items-center justify-center min-h-[60vh] py-12 px-4">
            <UpsellPanel
                source="chat_connectors"
                returnPath="/settings/accountAskAgent"
                title={t("askPage.entitlement.accountTitle")}
                description={t("askPage.entitlement.accountDescription")}
                className="w-full max-w-2xl"
                loadingVariant="spinner"
            />
        </div>
    )
}
