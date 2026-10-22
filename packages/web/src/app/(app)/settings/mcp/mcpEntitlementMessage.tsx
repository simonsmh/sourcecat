"use client"

import { UpsellPanel } from "@/features/billing/upsellDialog"
import { useTranslations } from "@/i18n/I18nProvider"

/**
 * Shown in place of the MCP server setup UI when the deployment is not on a plan
 * that includes the MCP server. FSL (not ee/) so it can render for free-plan
 * users as the upsell surface, reusing the shared feature-breakdown panel
 * (plan comparison + trial/upgrade) without mounting any ee/ MCP feature code.
 */
export function McpEntitlementMessage() {
    const t = useTranslations("settings")
    return (
        <div className="flex items-center justify-center min-h-[60vh] py-12 px-4">
            <UpsellPanel
                source="mcp_settings"
                returnPath="/settings/mcp"
                title={t("mcpPage.entitlement.title")}
                description={t("mcpPage.entitlement.description")}
                className="w-full max-w-2xl"
                loadingVariant="spinner"
            />
        </div>
    )
}
