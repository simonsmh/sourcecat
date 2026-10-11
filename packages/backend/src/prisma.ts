import { PrismaClient } from "@sourcecat/db";
import { getDBConnectionString } from "@sourcecat/shared";

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: getDBConnectionString(),
        },
    },
});
