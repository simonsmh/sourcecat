'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAvatar } from "@/components/userAvatar";
import { HomeView, useHomeView } from "@/hooks/useHomeView";
import { useKeymapType } from "@/hooks/useKeymapType";
import { useTranslations } from "@/i18n/I18nProvider";
import { KeymapType } from "@/lib/types";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { BasicSettingsCard, SettingsCard, SettingsCardGroup } from "../components/settingsCard";

interface GeneralPageProps {
    userName?: string;
    userEmail?: string;
    userImage?: string;
    defaultHomeView: HomeView;
}

export function GeneralPage({
    userName,
    userEmail,
    userImage,
    defaultHomeView,
}: GeneralPageProps) {
    const { theme: _theme, setTheme } = useTheme();
    const [homeView, setHomeView] = useHomeView(defaultHomeView);
    const [keymapType, setKeymapType] = useKeymapType();
    const t = useTranslations("settings");
    const tNav = useTranslations("nav");
    const tSidebar = useTranslations("sidebar");

    const theme = useMemo(() => {
        return _theme ?? "light";
    }, [_theme]);

    const themeOptions = [
        { value: "light", label: tSidebar("themeLight") },
        { value: "dark", label: tSidebar("themeDark") },
        { value: "system", label: tSidebar("themeSystem") },
    ] as const;

    const homeViewOptions = [
        { value: "search", label: tNav("codeSearch") },
        { value: "ask", label: tNav("ask") },
    ] as const;

    const keymapOptions = [
        { value: "default", label: tSidebar("keymapStandard") },
        { value: "vim", label: tSidebar("keymapVim") },
    ] as const;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-medium">{t("general")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("manageProfileAndPreferences")}
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-muted-foreground">{t("profile")}</h4>
                <SettingsCard>
                    <div className="flex items-center gap-4">
                        <UserAvatar
                            email={userEmail}
                            imageUrl={userImage}
                            className="h-12 w-12"
                        />
                        <div className="flex flex-col">
                            <span className="font-medium">{userName ?? tSidebar("user")}</span>
                            {userEmail && (
                                <span className="text-sm text-muted-foreground">{userEmail}</span>
                            )}
                        </div>
                    </div>
                </SettingsCard>
            </div>

            <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-muted-foreground">{t("preferences")}</h4>
                <SettingsCardGroup>
                    <BasicSettingsCard name={t("defaultHomeView")} description={t("defaultHomeViewDescription")}>
                        <Select value={homeView} onValueChange={(value) => setHomeView(value as HomeView)}>
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {homeViewOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </BasicSettingsCard>
                    <BasicSettingsCard name={t("appearance")} description={t("appearanceDescription")}>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {themeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </BasicSettingsCard>
                    <BasicSettingsCard name={tSidebar("editorKeymap")} description={t("editorKeymapDescription")}>
                        <Select value={keymapType} onValueChange={(value) => setKeymapType(value as KeymapType)}>
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {keymapOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </BasicSettingsCard>
                </SettingsCardGroup>
            </div>
        </div>
    );
}
