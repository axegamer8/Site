-- CreateTable
CREATE TABLE "colaboradores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "empresa" TEXT,
    "centroCusto" TEXT,
    "area" TEXT,
    "statusUsuario" TEXT NOT NULL DEFAULT 'ATIVO',
    "dataDesligamento" TIMESTAMP(3),

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamentos" (
    "id" TEXT NOT NULL,
    "patrimonio" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "modelo" TEXT,
    "valor" DOUBLE PRECISION,
    "numeroSerie" TEXT,
    "osEMC" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',

    CONSTRAINT "equipamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes" (
    "id" TEXT NOT NULL,
    "dataEntrega" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataDevolucao" TIMESTAMP(3),
    "statusDevolucao" TEXT,
    "observacao" TEXT,
    "colaboradorId" TEXT NOT NULL,
    "equipamentoId" TEXT NOT NULL,

    CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_email_key" ON "colaboradores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "equipamentos_patrimonio_key" ON "equipamentos"("patrimonio");

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
