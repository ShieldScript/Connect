-- AlterTable: Add bio and profileImageUrl columns
ALTER TABLE "Person" ADD COLUMN "bio" TEXT;
ALTER TABLE "Person" ADD COLUMN "profileImageUrl" TEXT;
