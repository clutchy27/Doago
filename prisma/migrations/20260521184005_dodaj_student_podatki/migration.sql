-- DropForeignKey
ALTER TABLE "Sporocilo" DROP CONSTRAINT "Sporocilo_avtorId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "vloga" SET DEFAULT 'navaden';

-- CreateTable
CREATE TABLE "StudentPodatki" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opis" TEXT,
    "kategorije" TEXT[],
    "mesta" TEXT[],
    "profilUrejen" BOOLEAN NOT NULL DEFAULT false,
    "steviloOcen" INTEGER NOT NULL DEFAULT 0,
    "povprecnaOcena" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "skupniZasluzek" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "StudentPodatki_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentPodatki_userId_key" ON "StudentPodatki"("userId");

-- AddForeignKey
ALTER TABLE "StudentPodatki" ADD CONSTRAINT "StudentPodatki_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sporocilo" ADD CONSTRAINT "Sporocilo_avtorId_fkey" FOREIGN KEY ("avtorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
