-- Add expanded profile fields for proper German CV generation
-- All columns are nullable — safe to apply on existing rows without defaults

ALTER TABLE "Profile" ADD COLUMN "street"        TEXT;
ALTER TABLE "Profile" ADD COLUMN "postalCode"    TEXT;
ALTER TABLE "Profile" ADD COLUMN "summary"       TEXT;
ALTER TABLE "Profile" ADD COLUMN "workExperience" TEXT;
ALTER TABLE "Profile" ADD COLUMN "education"     TEXT;
ALTER TABLE "Profile" ADD COLUMN "skills"        TEXT;
ALTER TABLE "Profile" ADD COLUMN "languages"     TEXT;
ALTER TABLE "Profile" ADD COLUMN "certificates"  TEXT;
