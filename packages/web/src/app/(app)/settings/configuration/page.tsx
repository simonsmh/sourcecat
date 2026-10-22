import { authenticatedPage } from "@/middleware/authenticatedPage";
import { OrgRole } from "@sourcecat/db";
import { isServiceError } from "@/lib/utils";
import { ServiceErrorException } from "@/lib/serviceError";
import { getConfigFile } from "./actions";
import { ConfigurationPage } from "./configurationPage";

export default authenticatedPage(async () => {
    const configFile = await getConfigFile();
    if (isServiceError(configFile)) {
        throw new ServiceErrorException(configFile);
    }

    return (
        <ConfigurationPage
            initialContent={configFile.content}
            isReadOnly={configFile.isReadOnly}
        />
    );
}, {
    minRole: OrgRole.OWNER,
    redirectTo: '/settings'
});
