const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const connectionString = "postgresql://neondb_owner:npg_ZudtxRcM29Ob@ep-round-violet-aco3s82l-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==========================================
// ROTA DA PLANILHA EMC (Lê um arquivo local)
// ==========================================
const emcFilePath = path.join(__dirname, 'emc_cache.json');

app.post('/api/emc/sync', (req, res) => {
  fs.writeFileSync(emcFilePath, JSON.stringify(req.body, null, 2));
  res.json({ message: "Planilha sincronizada com sucesso!" });
});

app.get('/api/emc/:patrimonio', (req, res) => {
  if (!fs.existsSync(emcFilePath)) return res.status(404).json({ erro: "Planilha não importada ainda." });
  const dados = JSON.parse(fs.readFileSync(emcFilePath, 'utf-8'));
  const item = dados.find(d => String(d.patrimonio) === String(req.params.patrimonio));
  if (item) res.json(item);
  else res.status(404).json({ erro: "Equipamento não encontrado na planilha." });
});

// ==========================================
// 1. DASHBOARD E EQUIPAMENTOS
// ==========================================
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalEquipamentos = await prisma.equipamento.count();
    const emUso = await prisma.equipamento.count({ where: { status: 'EM_USO' } });
    const noBackup = await prisma.equipamento.count({ where: { colaboradorId: null } });
    const totalColaboradores = await prisma.colaborador.count();
    res.json({ totalEquipamentos, emUso, noBackup, totalColaboradores });
  } catch (error) { res.status(500).json({ erro: "Erro dashboard." }); }
});

app.get('/api/equipamentos/:categoria', async (req, res) => {
  try { res.json(await prisma.equipamento.findMany({ where: { categoria: req.params.categoria.toUpperCase() }, include: { colaborador: true } })); } 
  catch (error) { res.status(500).json({ erro: "Erro" }); }
});

app.get('/api/backups', async (req, res) => {
  try { res.json(await prisma.equipamento.findMany({ where: { colaboradorId: null } })); } 
  catch (error) { res.status(500).json({ erro: "Erro" }); }
});

app.post('/api/equipamentos', async (req, res) => {
  try {
    const dados = req.body;
    const novo = await prisma.equipamento.create({
      data: { ...dados, valor: dados.valor ? parseFloat(dados.valor) : null, status: 'DISPONIVEL' }
    });
    await prisma.movimentacao.create({ data: { tipo: 'ENTREGA', equipamentoId: novo.id, observacao: 'Cadastrado no sistema.' } });
    res.status(201).json(novo);
  } catch (error) { res.status(500).json({ erro: "Erro" }); }
});

app.put('/api/equipamentos/:id', async (req, res) => {
  try {
    const { colaboradorId, status, patrimonio, modelo, sede, numeroSerie, sistemaOperacional } = req.body;
    const atualizado = await prisma.equipamento.update({
      where: { id: parseInt(req.params.id) },
      data: { colaboradorId: colaboradorId ? parseInt(colaboradorId) : null, status: status || undefined, patrimonio, modelo, sede, numeroSerie, sistemaOperacional }
    });
    res.json(atualizado);
  } catch (error) { res.status(500).json({ erro: "Erro ao atualizar." }); }
});

// ==========================================
// 2. COLABORADORES (CRIAÇÃO E EDIÇÃO TURBINADAS)
// ==========================================
const vincularOuCriarEquip = async (patrimonio, categoria, colaboradorId) => {
  if (!patrimonio || patrimonio.trim() === '-' || patrimonio.trim() === '') return;
  
  let equip = await prisma.equipamento.findFirst({ where: { patrimonio } });
  
  if (!equip) {
    equip = await prisma.equipamento.create({
      data: { categoria, patrimonio, modelo: 'Atribuído via Colaborador', status: 'EM_USO', colaboradorId }
    });
    await prisma.movimentacao.create({ data: { tipo: 'ENTREGA', equipamentoId: equip.id, colaboradorId, observacao: 'Criado e vinculado na tela de usuário.' } });
  } else {
    await prisma.equipamento.update({
      where: { id: equip.id },
      data: { colaboradorId, status: 'EM_USO' }
    });
    await prisma.movimentacao.create({ data: { tipo: 'ENTREGA', equipamentoId: equip.id, colaboradorId, observacao: 'Vinculado na tela de usuário.' } });
  }
};

app.get('/api/colaboradores', async (req, res) => {
  try { res.json(await prisma.colaborador.findMany({ include: { equipamentos: true } })); } 
  catch (err) { res.status(500).json({ erro: "Erro" }); }
});

app.post('/api/colaboradores', async (req, res) => {
  try {
    const { nome, email, centroCusto, notebook, tela, periferico, celular } = req.body;
    
    const novo = await prisma.colaborador.create({
      data: { nome, email, centroCusto, status: 'ATIVO' }
    });

    await vincularOuCriarEquip(notebook, 'COMPUTADOR', novo.id);
    await vincularOuCriarEquip(tela, 'TELA', novo.id);
    await vincularOuCriarEquip(periferico, 'PERIFERICO', novo.id);
    await vincularOuCriarEquip(celular, 'CELULAR', novo.id);

    res.status(201).json(novo);
  } catch (err) { res.status(500).json({ erro: "Erro ao criar colaborador." }); }
});

app.put('/api/colaboradores/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, email, centroCusto, status, notebook, tela, periferico, celular } = req.body;
    
    const atualizado = await prisma.colaborador.update({
      where: { id },
      data: { nome, email, centroCusto, status }
    });

    await prisma.equipamento.updateMany({
      where: { colaboradorId: id },
      data: { colaboradorId: null, status: 'DISPONIVEL' }
    });

    await vincularOuCriarEquip(notebook, 'COMPUTADOR', id);
    await vincularOuCriarEquip(tela, 'TELA', id);
    await vincularOuCriarEquip(periferico, 'PERIFERICO', id);
    await vincularOuCriarEquip(celular, 'CELULAR', id);

    res.json(atualizado);
  } catch (error) { res.status(500).json({ erro: "Erro ao atualizar colaborador." }); }
});

// ==========================================
// 3. EMPRÉSTIMOS E HISTÓRICO
// ==========================================
app.get('/api/emprestimos', async (req, res) => {
  try { res.json(await prisma.emprestimo.findMany({ where: { devolveu: false }, include: { colaborador: true, equipamento: true } })); } 
  catch (error) { res.status(500).json({ erro: "Erro" }); }
});

app.post('/api/emprestimos', async (req, res) => {
  try {
    const { colaboradorId, equipamentoId, dataDevolucao, emprestadoPor } = req.body;
    const emp = await prisma.emprestimo.create({ data: { colaboradorId: parseInt(colaboradorId), equipamentoId: parseInt(equipamentoId), dataDevolucao: new Date(dataDevolucao), emprestadoPor } });
    await prisma.equipamento.update({ where: { id: parseInt(equipamentoId) }, data: { status: 'EM_USO' } });
    res.status(201).json(emp);
  } catch (error) { res.status(500).json({ erro: "Erro" }); }
});

app.put('/api/emprestimos/:id/baixa', async (req, res) => {
  try {
    const emp = await prisma.emprestimo.update({ where: { id: parseInt(req.params.id) }, data: { devolveu: true } });
    await prisma.equipamento.update({ where: { id: emp.equipamentoId }, data: { status: 'DISPONIVEL', colaboradorId: null } });
    await prisma.movimentacao.create({ data: { tipo: 'DEVOLUCAO', equipamentoId: emp.equipamentoId, colaboradorId: emp.colaboradorId, observacao: 'Fim do empréstimo temporário.' } });
    res.json(emp);
  } catch (error) { res.status(500).json({ erro: "Erro na baixa." }); }
});

app.get('/api/historico/colaborador/:id', async (req, res) => {
  try { res.json(await prisma.movimentacao.findMany({ where: { colaboradorId: parseInt(req.params.id) }, include: { equipamento: true }, orderBy: { createdAt: 'desc' } })); } 
  catch (error) { res.status(500).json({ erro: "Erro" }); }
});

app.get('/api/historico/equipamento/:id', async (req, res) => {
  try { res.json(await prisma.movimentacao.findMany({ where: { equipamentoId: parseInt(req.params.id) }, include: { colaborador: true }, orderBy: { createdAt: 'desc' } })); } 
  catch (error) { res.status(500).json({ erro: "Erro" }); }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});