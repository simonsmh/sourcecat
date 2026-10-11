"use client";

/**
 * 侧栏语言切换器：放在用户菜单的「外观」分组里（登录/访客共用）。
 * 切换后写 cookie（一年有效期）并刷新路由，服务端按新语言重新渲染。
 */
import { useRouter } from "next/navigation";
import { LanguagesIcon } from "lucide-react";
import {
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { isLocale, localeCookieName, localeNames, locales } from "./config";
import { useLocale, useTranslations } from "./I18nProvider";

export function LanguageSwitcher() {
    const locale = useLocale();
    const t = useTranslations("sidebar");
    const router = useRouter();

    const onValueChange = (next: string) => {
        if (!isLocale(next) || next === locale) {
            return;
        }
        document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000; SameSite=Lax`;
        router.refresh();
    };

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <LanguagesIcon className="h-4 w-4 mr-2" />
                <span>{t("language")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={locale} onValueChange={onValueChange}>
                        {locales.map((l) => (
                            <DropdownMenuRadioItem key={l} value={l}>
                                {localeNames[l]}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
}
