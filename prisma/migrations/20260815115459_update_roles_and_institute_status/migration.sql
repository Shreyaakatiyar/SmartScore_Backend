/*
  Convert the existing ADMIN role to PLATFORM_ADMIN
  before replacing the UserRole enum.
*/

CREATE TYPE "UserRole_new" AS ENUM (
    'STUDENT',
    'TEACHER',
    'INVIGILATOR',
    'INSTITUTION_ADMIN',
    'PLATFORM_ADMIN'
);

ALTER TABLE "User"
ALTER COLUMN "role" TYPE TEXT
USING (
    CASE
        WHEN "role"::text = 'ADMIN' THEN 'PLATFORM_ADMIN'
        ELSE "role"::text
    END
);

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole_new"
USING ("role"::text::"UserRole_new");

ALTER TABLE "Invitation"
ALTER COLUMN "role" TYPE TEXT
USING (
    CASE
        WHEN "role"::text = 'ADMIN' THEN 'PLATFORM_ADMIN'
        ELSE "role"::text
    END
);

ALTER TABLE "Invitation"
ALTER COLUMN "role" TYPE "UserRole_new"
USING ("role"::text::"UserRole_new");

ALTER TYPE "UserRole" RENAME TO "UserRole_old";

ALTER TYPE "UserRole_new" RENAME TO "UserRole";

DROP TYPE "public"."UserRole_old";

CREATE TYPE "InstituteStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'SUSPENDED',
    'DEACTIVATED'
);

ALTER TABLE "Institute"
ADD COLUMN "status" "InstituteStatus"
NOT NULL DEFAULT 'PENDING';