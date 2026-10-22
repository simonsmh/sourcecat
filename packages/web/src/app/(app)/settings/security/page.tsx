import { AnonymousAccessEnabledSettingsCard } from "./components/anonymousAccessEnabledSettingsCard";
import { InviteLinkEnabledSettingsCard } from "./components/inviteLinkEnabledSettingsCard";
import { MemberApprovalRequiredSettingsCard } from "./components/memberApprovalRequiredSettingsCard";
import { CredentialsLoginEnabledSettingsCard } from "./components/credentialsLoginEnabledSettingsCard";
import { EmailCodeLoginEnabledSettingsCard } from "./components/emailCodeLoginEnabledSettingsCard";
import { IdentityProviderSettingsCard } from "./components/identityProviderSettingsCard";
import { IdentityProviderUpsellCard } from "./components/identityProviderUpsellCard";
import { ScimProvisioningSettings } from "./components/scimProvisioningSettings";
import { ScimEnabledSettingsCard } from "./components/scimEnabledSettingsCard";
import { ScimUpsellCard } from "./components/scimUpsellCard";
import { LoginMessageSettingsCard } from "./components/loginMessageSettingsCard";
import { getScimTokens } from "@/ee/features/scim/actions";
import { UpgradeBadge } from "@/app/(app)/@sidebar/components/upgradeBadge";
import { getProviders, IdentityProvider } from "@/auth";
import { hasEntitlement, isAnonymousAccessEnabled } from "@/lib/entitlements";
import { createInviteLink, isServiceError } from "@/lib/utils";
import { authenticatedPage } from "@/middleware/authenticatedPage";
import { OrgRole } from "@sourcecat/db";
import { env, getSMTPConnectionURL, isCredentialsLoginEnabled, isEmailCodeLoginEnabled, isMemberApprovalRequired } from "@sourcecat/shared";
import { SettingsCardGroup } from "../components/settingsCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { isScimEnabled } from "@/features/scim/utils";
import { ServiceErrorException } from "@/lib/serviceError";
import { getTranslations } from "@/i18n/server";

export default authenticatedPage(async ({ org }) => {
    const anonymousAccessEnabled = await isAnonymousAccessEnabled();
    const inviteLink = createInviteLink(env.AUTH_URL, org.inviteLinkId);
    const hasSSOEntitlement = await hasEntitlement("sso");
    const identityProviders = await getConfiguredIdentityProviders();

    const hasScimEntitlement = await hasEntitlement("scim");
    const scimBaseUrl = `${env.AUTH_URL.replace(/\/$/, '')}/scim/v2`;
    const scimTokens = hasScimEntitlement ? await getScimTokens() : [];
    if (isServiceError(scimTokens)) {
        throw new ServiceErrorException(scimTokens);
    }

    const scimEnabled = await isScimEnabled(org)

    const t = await getTranslations("settings");

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-lg font-medium">{t("security")}</h2>
            <div className="space-y-6">
                <div>
                    <p className="text-md font-medium">{t("securityPage.organizationAccess")}</p>
                    <p className="text-sm text-muted-foreground">{t("securityPage.organizationAccessDescription")}{" "}
                        <a
                            href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/configuration/auth/access-settings.mdx"
                            target="_blank"
                            rel="noopener"
                            className="text-link hover:underline transition-colors"
                        >
                            {t("securityPage.learnMore")}
                        </a>
                    </p>
                </div>

                <SettingsCardGroup>
                    <InviteLinkEnabledSettingsCard
                        inviteLinkEnabled={org.inviteLinkEnabled}
                        inviteLink={inviteLink}
                        scimManaged={scimEnabled}
                    />
                    <MemberApprovalRequiredSettingsCard
                        memberApprovalRequired={isMemberApprovalRequired(org)}
                        scimManaged={scimEnabled}
                    />
                    <AnonymousAccessEnabledSettingsCard
                        anonymousAccessEnabled={anonymousAccessEnabled}
                    />
                </SettingsCardGroup>

                <p className="text-md font-medium">{t("securityPage.emailLogin")}</p>

                <SettingsCardGroup>
                    <CredentialsLoginEnabledSettingsCard
                        isCredentialsLoginEnabled={isCredentialsLoginEnabled(org)}
                    />
                    <EmailCodeLoginEnabledSettingsCard
                        isEmailCodeLoginEnabled={isEmailCodeLoginEnabled(org)}
                        isEmailServiceConfigured={!!getSMTPConnectionURL() && !!env.EMAIL_FROM_ADDRESS}
                    />
                </SettingsCardGroup>

                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-md font-medium">{t("securityPage.singleSignOn")}</p>
                        {!hasSSOEntitlement && <UpgradeBadge />}
                    </div>
                    <p className="text-sm text-muted-foreground">{t("securityPage.ssoDescription")}{" "}
                        <a
                            href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/configuration/idp.mdx"
                            target="_blank"
                            rel="noopener"
                            className="text-link hover:underline transition-colors"
                        >
                            {t("securityPage.learnMore")}
                        </a>
                    </p>
                </div>

                {!hasSSOEntitlement ? (
                    <IdentityProviderUpsellCard />
                ) : identityProviders.length > 0 ? (
                    <SettingsCardGroup>
                        {identityProviders.map((provider) => (
                            <IdentityProviderSettingsCard key={provider.id} provider={provider} />
                        ))}
                    </SettingsCardGroup>
                ) : (
                    <Alert className="items-center p-4">
                        <Info className="w-4 h-4 text-muted-foreground" />
                        <AlertDescription>
                            {t("securityPage.noIdentityProviders")}{" "}
                            <a
                                href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/configuration/idp.mdx"
                                target="_blank"
                                rel="noopener"
                                className="!text-link !no-underline hover:!underline"
                            >
                                {t("securityPage.learnMore")}
                            </a>
                        </AlertDescription>
                    </Alert>
                )}

                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-md font-medium">{t("securityPage.scimProvisioning")}</p>
                        {!hasScimEntitlement && <UpgradeBadge />}
                    </div>
                    <p className="text-sm text-muted-foreground">{t("securityPage.scimDescription")}{" "}
                        <a
                            href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/configuration/auth/scim.mdx"
                            target="_blank"
                            rel="noopener"
                            className="text-link hover:underline transition-colors"
                        >
                            {t("securityPage.learnMore")}
                        </a>
                    </p>
                </div>

                {!hasScimEntitlement ? (
                    <ScimUpsellCard />
                ) : (
                    <>
                        <SettingsCardGroup>
                            <ScimEnabledSettingsCard isScimEnabled={scimEnabled} />
                        </SettingsCardGroup>
                        {scimEnabled && (
                            <ScimProvisioningSettings baseUrl={scimBaseUrl} tokens={scimTokens} />
                        )}
                    </>
                )}

                <section aria-labelledby="login-message-heading" className="space-y-4">
                    <div>
                        <h3 id="login-message-heading" className="text-md font-medium">{t("securityPage.loginMessage")}</h3>
                        <p className="text-sm text-muted-foreground">{t("securityPage.loginMessageDescription")}</p>
                    </div>
                    <LoginMessageSettingsCard loginMessage={org.loginMessage} />
                </section>
            </div>
        </div>
    )
}, {
    minRole: OrgRole.OWNER,
    redirectTo: '/settings',
});

const getConfiguredIdentityProviders = async (): Promise<IdentityProvider[]> => {
    const providers = await getProviders();
    return providers.filter((provider) =>
        provider.purpose === "sso" && !["credentials", "nodemailer"].includes(provider.type)
    );
}
