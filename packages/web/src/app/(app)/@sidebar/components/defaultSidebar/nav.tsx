"use client";

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BookMarkedIcon, type LucideIcon, MessageCircleIcon, MessagesSquareIcon, SearchIcon, SettingsIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { HomeView } from "@/hooks/useHomeView";
import { NotificationDot } from "../../../components/notificationDot";
import { useMemo } from "react";
import Link from "next/link";
import { useEntitlements } from "@/features/entitlements/useEntitlements";
import { Entitlement } from "@sourcecat/shared";
import { UpgradeBadge } from "../upgradeBadge";
import { useTranslations } from "@/i18n/I18nProvider";

interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    key: string;
    requiresAuth?: boolean;
    requiredEntitlement?: Entitlement;
    // When true, the item is hidden entirely if the required entitlement is
    // missing, instead of being shown with an upgrade badge.
    hideIfMissingEntitlement?: boolean;
}

interface NavProps {
    isSettingsNotificationVisible?: boolean;
    isSignedIn?: boolean;
    homeView: HomeView;
}

export function Nav({
    isSettingsNotificationVisible,
    isSignedIn,
    homeView
}: NavProps) {
    const pathname = usePathname();
    const entitlements = useEntitlements();
    const t = useTranslations("nav");

    const baseItems = useMemo((): NavItem[] => {

        const searchItem: NavItem = {
            title: t("codeSearch"),
            href: "/search",
            icon: SearchIcon,
            key: "search",
        }

        const askItem: NavItem = {
            title: t("ask"),
            href: "/chat",
            icon: MessageCircleIcon,
            key: "chat",
            requiredEntitlement: "ask"
        }

        return [
            ...(homeView === "search" ? [
                searchItem,
                askItem,
            ] : [
                askItem,
                searchItem,
            ]),
            {
                title: t("chats"),
                href: "/chats",
                icon: MessagesSquareIcon,
                key: "chats",
                requiresAuth: true,
                requiredEntitlement: "ask",
                hideIfMissingEntitlement: true,
            },
            {
                title: t("repositories"),
                href: "/repos",
                icon: BookMarkedIcon,
                key: "repos"
            },
            {
                title: t("settings"),
                href: "/settings",
                icon: SettingsIcon,
                key: "settings",
                requiresAuth: true
            },
        ]


    }, [homeView, t]);

    const isActive = (href: string) => {
        if (pathname === "/") {
            return (
                (homeView === "ask" && href === "/chat") ||
                (homeView === "search" && href === "/search")
            )
        }

        if (href === "/search") {
            return pathname.startsWith("/search");
        }

        if (href === "/chat") {
            return pathname === "/chat";
        }
        return pathname.startsWith(href);
    };

    return (
        <SidebarMenu>
            {baseItems
                .filter((item) => !item.requiresAuth || isSignedIn)
                .filter((item) => !item.hideIfMissingEntitlement || !item.requiredEntitlement || entitlements.includes(item.requiredEntitlement))
                .map((item) => {
                const showNotification =
                    (item.key === "settings" && isSettingsNotificationVisible);

                const showUpgradeBadge =
                    (item.requiredEntitlement && !entitlements.includes(item.requiredEntitlement));

                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                            <Link
                                href={item.href}
                            >
                                <item.icon />
                                <span>{item.title}</span>
                                {showUpgradeBadge && <UpgradeBadge />}
                                {showNotification && <NotificationDot className="ml-1.5" />}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
