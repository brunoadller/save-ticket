-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBRO');

-- CreateEnum
CREATE TYPE "Polo" AS ENUM ('PELOTAS_I', 'PELOTAS_II', 'PELOTAS_III');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('ANDAMENTO', 'CONCLUIDO', 'EXPIRADO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBRO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "polo" "Polo" NOT NULL,
    "nomeAluno" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "ra" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "situacaoAtual" TEXT NOT NULL,
    "justificativa" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'ANDAMENTO',
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPrazo" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "tickets_userId_idx" ON "tickets"("userId");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
