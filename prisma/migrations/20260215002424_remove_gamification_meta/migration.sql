-- AlterTable: Add archetype and connectionStyle columns, drop gamificationMeta
ALTER TABLE "Person" ADD COLUMN "archetype" TEXT;
ALTER TABLE "Person" ADD COLUMN "connectionStyle" TEXT;
ALTER TABLE "Person" DROP COLUMN "gamificationMeta";
