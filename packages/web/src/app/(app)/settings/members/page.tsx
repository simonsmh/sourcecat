import { authenticatedPage } from "@/middleware/authenticatedPage";
import { OrgRole } from "@sourcecat/db";
import { getOrgMembers, getOrgInvites, getOrgAccountRequests } from "@/features/membership/actions";
import { isServiceError } from "@/lib/utils";
import { ServiceErrorException } from "@/lib/serviceError";
import { MembersTableView } from "./membersTableView";
import { isScimEnabled } from "@/features/scim/utils";
import { hasEntitlement } from "@/lib/entitlements";
import { getTranslations } from "@/i18n/server";

export default authenticatedPage(async ({ org, user }) => {
    const t = await getTranslations("settings");
    const [members, invites, requests, scimEnabled, hasOrgManagement] = await Promise.all([
        getOrgMembers(),
        getOrgInvites(),
        getOrgAccountRequests(),
        isScimEnabled(org),
        hasEntitlement("org-management"),
    ]);

    if (isServiceError(members)) {
        throw new ServiceErrorException(members);
    }
    if (isServiceError(invites)) {
        throw new ServiceErrorException(invites);
    }
    if (isServiceError(requests)) {
        throw new ServiceErrorException(requests);
    }

    return (
        <div className="flex flex-1 min-h-0 flex-col gap-6">
            <div>
                <h3 className="text-lg font-medium">{t("membersPage.title")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("membersPage.description")}
                </p>
            </div>
            <MembersTableView
                members={members}
                invites={invites}
                requests={requests}
                currentUserId={user.id}
                hasOrgManagement={hasOrgManagement}
                scimEnabled={scimEnabled}
            />
        </div>
    );
}, {
    minRole: OrgRole.OWNER,
    redirectTo: '/settings'
})
