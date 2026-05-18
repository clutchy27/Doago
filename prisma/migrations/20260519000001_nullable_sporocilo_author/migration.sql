-- Make avtorId nullable to support system messages (avtorId = NULL)
ALTER TABLE "Sporocilo" ALTER COLUMN "avtorId" DROP NOT NULL;
