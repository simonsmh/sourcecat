import React from "react"
import { Metadata } from "next"
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isServiceError } from "@/lib/utils";
import { getOrgAccountRequests } from "@/features/membership/actions";
import { ServiceErrorException } from "@/lib/serviceError";
import { OrgRole } from "@prisma/client";
import { env } from "@sourcecat/shared";
import { hasEntitlement } from "@/lib/entitlements";
import { withAuth } from "@/middleware/withAuth";
import { NavGroup } from "../@sidebar/components/settingsSidebar/nav";
import { getTranslations } from "@/i18n/server";

interface LayoutProps {
    children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("nav");
    return {
        title: t("settings"),
    };
}

export default async function SettingsLayout(
    props: LayoutProps
) {
    const {
        children
    } = props;

    const session = await auth();
    if (!session) {
        return redirect('/');
    }

    return (
        <>{children}</>
    )
}

export const getSidebarNavGroups = async () =>
    withAuth(async ({ role }) => {
        const t = await getTranslations("settings");
        let numJoinRequests: number | undefined;
        if (role === OrgRole.OWNER) {
            const requests = await getOrgAccountRequests();
            if (isServiceError(requests)) {
                throw new ServiceErrorException(requests);
            }
            numJoinRequests = requests.length;
        }

        const hasAskEntitlement = await hasEntitlement("ask");

        const groups: NavGroup[] = [
            {
                label: t("account"),
                items: [
                    {
                        title: t("general"),
                        href: `/settings/general`,
                        icon: "settings" as const,
                    },
                    ...(env.DISABLE_API_KEY_USAGE_FOR_NON_OWNER_USERS === 'false' || role === OrgRole.OWNER ? [
                        {
                            title: t("apiKeys"),
                            href: `/settings/apiKeys`,
                            icon: "key-round" as const,
                        }
                    ] : []),
                    ...(await hasEntitlement("sso") ? [
                        {
                            title: t("linkedAccounts"),
                            href: `/settings/linked-accounts`,
                            icon: "link" as const,
                        }
                    ] : []),
                    {
                        title: t("mcpServer"),
                        href: `/settings/mcp`,
                        icon: 'mcp' as const,
                        requiredEntitlement: 'mcp',
                    },
                    ...(hasAskEntitlement ? [
                        {
                            title: t("askSourcecat"),
                            href: `/settings/accountAskAgent`,
                            hrefRegex: `/settings/accountAskAgent(/.*)?$`,
                            icon: "bot" as const,
                        },
                        {
                            title: t("skills"),
                            href: `/settings/skills`,
                            hrefRegex: `/settings/skills(/.*)?$`,
                            icon: "sparkles" as const,
                        }
                    ] : []),
                ],
            },
        ];

        if (role === OrgRole.OWNER) {
            groups.push({
                label: t("workspace"),
                items: [
                    {
                        title: t("security"),
                        href: `/settings/security`,
                        icon: "shield" as const,
                    },
                    {
                        title: t("members"),
                        isNotificationDotVisible: numJoinRequests !== undefined && numJoinRequests > 0,
                        href: `/settings/members`,
                        icon: "users" as const,
                    },
                    {
                        title: t("connections"),
                        href: `/settings/connections`,
                        hrefRegex: `/settings/connections(/[^/]+)?$`,
                        icon: "plug" as const,
                    },
                    {
                        title: t("analytics"),
                        href: `/settings/analytics`,
                        icon: "chart-area" as const,
                        requiredEntitlement: 'analytics'
                    },
                    {
                        title: t("askSourcecat"),
                        href: `/settings/workspaceAskAgent`,
                        icon: "bot" as const,
                        requiredEntitlement: 'ask',
                    },
                ],
            });
        }

        return groups.filter(g => g.items.length > 0);
    });
