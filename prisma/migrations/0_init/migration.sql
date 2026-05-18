-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "ime" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "geslo" TEXT NOT NULL,
    "vloga" TEXT NOT NULL DEFAULT 'narocnik',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpPodatki" (
    "id" TEXT NOT NULL,
    "ime" TEXT NOT NULL,
    "priimek" TEXT NOT NULL,
    "davcnaStevilka" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "naslov" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "kategorije" TEXT NOT NULL DEFAULT '',
    "mesta" TEXT NOT NULL DEFAULT '',
    "opis" TEXT,
    "profilUrejen" BOOLEAN NOT NULL DEFAULT false,
    "skupniZasluzek" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "steviloOcen" INTEGER NOT NULL DEFAULT 0,
    "povprecnaOcena" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "SpPodatki_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Naloga" (
    "id" TEXT NOT NULL,
    "naslov" TEXT NOT NULL,
    "opis" TEXT NOT NULL,
    "cena" DOUBLE PRECISION NOT NULL,
    "kategorija" TEXT NOT NULL,
    "lokacija" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'odprta',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "narocnikId" TEXT NOT NULL,
    "izvajalecId" TEXT,
    "nujna" BOOLEAN NOT NULL DEFAULT false,
    "profesionalna" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Naloga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sporocilo" (
    "id" TEXT NOT NULL,
    "besedilo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avtorId" TEXT NOT NULL,
    "nalogaId" TEXT NOT NULL,

    CONSTRAINT "Sporocilo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Obvestilo" (
    "id" TEXT NOT NULL,
    "besedilo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nalogaId" TEXT,
    "prebrano" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Obvestilo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "zvezde" INTEGER NOT NULL,
    "komentar" TEXT,
    "nalogaId" TEXT NOT NULL,
    "narocnikId" TEXT NOT NULL,
    "izvajalecId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SpPodatki_davcnaStevilka_key" ON "SpPodatki"("davcnaStevilka");

-- CreateIndex
CREATE UNIQUE INDEX "SpPodatki_userId_key" ON "SpPodatki"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_nalogaId_key" ON "Rating"("nalogaId");

-- AddForeignKey
ALTER TABLE "SpPodatki" ADD CONSTRAINT "SpPodatki_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Naloga" ADD CONSTRAINT "Naloga_izvajalecId_fkey" FOREIGN KEY ("izvajalecId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Naloga" ADD CONSTRAINT "Naloga_narocnikId_fkey" FOREIGN KEY ("narocnikId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sporocilo" ADD CONSTRAINT "Sporocilo_avtorId_fkey" FOREIGN KEY ("avtorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sporocilo" ADD CONSTRAINT "Sporocilo_nalogaId_fkey" FOREIGN KEY ("nalogaId") REFERENCES "Naloga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Obvestilo" ADD CONSTRAINT "Obvestilo_nalogaId_fkey" FOREIGN KEY ("nalogaId") REFERENCES "Naloga"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Obvestilo" ADD CONSTRAINT "Obvestilo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_izvajalecId_fkey" FOREIGN KEY ("izvajalecId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_nalogaId_fkey" FOREIGN KEY ("nalogaId") REFERENCES "Naloga"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_narocnikId_fkey" FOREIGN KEY ("narocnikId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

