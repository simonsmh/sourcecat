/**
 * Render all routes at request time rather than build time,
 * since every route depends on per-request session, entitlements,
 * and DB-backed data, none of which are available at build time.
 * @see https://nextjs.org/docs/app/guides/caching-without-cache-components#route-segment-config
 */
export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ProgressBarProvider } from "./progressBarProvider";
import { QueryClientProvider } from "./queryClientProvider";
import { PostHogProvider } from "./posthogProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { env, SOURCECAT_VERSION } from "@sourcecat/shared";
import { PlanProvider } from "@/features/entitlements/planProvider";
import { getEntitlements } from "@/lib/entitlements";
import { IdentityProvidersProvider } from "@/features/auth/identityProvidersProvider";
import { getIdentityProviderMetadata } from "@/lib/identityProviders";
import { SentryUserProvider } from "./sentryUserProvider";
import { getLocale, getMessages } from "@/i18n/server";
import { I18nProvider } from "@/i18n/I18nProvider";

export const metadata: Metadata = {
    metadataBase: env.AUTH_URL ? new URL(env.AUTH_URL) : undefined,
    // Using the title.template will allow child pages to set the title
    // while keeping a consistent suffix.
    title: {
        default: "Sourcecat",
        template: "%s | Sourcecat",
    },
    description:
        "Sourcecat is a self-hosted code understanding tool. Ask questions about your codebase and get rich Markdown answers with inline citations.",
    manifest: "/manifest.json",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const entitlements = await getEntitlements();
    const identityProviders = await getIdentityProviderMetadata();
    const locale = await getLocale();
    const messages = await getMessages(locale);

    return (
        <html
            lang={locale}
            // @see : https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
            suppressHydrationWarning
        >
            <head>
                {env.NODE_ENV === "development" && env.DEBUG_ENABLE_REACT_SCAN === 'true' && (
                    <Script
                        src="//unpkg.com/react-scan/dist/auto.global.js"
                        crossOrigin="anonymous"
                        strategy="beforeInteractive"
                    />
                )}
                {env.NODE_ENV === "development" && env.DEBUG_ENABLE_REACT_GRAB === 'true' && (
                    <Script
                        src="//unpkg.com/react-grab/dist/index.global.js"
                        crossOrigin="anonymous"
                        strategy="beforeInteractive"
                    />
                )}
                {env.NODE_ENV === "development" && env.DEBUG_ENABLE_REACT_GRAB === 'true' && (
                    <Script
                        src="//unpkg.com/@react-grab/mcp/dist/client.global.js"
                        strategy="lazyOnload"
                    />
                )}
            </head>
            <body>
                <I18nProvider locale={locale} messages={messages}>
                <Toaster />
                <SessionProvider>
                    <SentryUserProvider
                        isPiiEnabled={env.SOURCECAT_TELEMETRY_PII_COLLECTION_ENABLED === 'true'}
                    />
                    <PlanProvider entitlements={entitlements}>
                        <IdentityProvidersProvider providers={identityProviders}>
                            <PostHogProvider
                                // Fork: telemetry removed.
                                isDisabled={true}
                                isPiiEnabled={env.SOURCECAT_TELEMETRY_PII_COLLECTION_ENABLED === 'true'}
                                // @note: the posthog api key doesn't need to be kept secret,
                                // so we are safe to send it to the client.
                                posthogApiKey={env.POSTHOG_PAPIK}
                                sourcecatVersion={SOURCECAT_VERSION}
                                sourcecatInstallId={env.SOURCECAT_INSTALL_ID}
                            >
                                <ThemeProvider
                                    attribute="class"
                                    defaultTheme="system"
                                    enableSystem
                                    disableTransitionOnChange
                                >
                                    <QueryClientProvider>
                                        <TooltipProvider>
                                            <ProgressBarProvider>
                                                {children}
                                            </ProgressBarProvider>
                                        </TooltipProvider>
                                    </QueryClientProvider>
                                </ThemeProvider>
                            </PostHogProvider>
                        </IdentityProvidersProvider>
                    </PlanProvider>
                </SessionProvider>
                </I18nProvider>
            </body>
        </html>
    );
}
