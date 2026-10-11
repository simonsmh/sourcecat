"use client";

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "@/i18n/I18nProvider";

export function SettingsSidebarHeader() {
    const t = useTranslations("sidebar");
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/">
                        <ArrowLeftIcon />
                        <span>{t("backToApp")}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
