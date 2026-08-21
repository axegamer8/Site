import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
// Altere apenas a forma como o prisma é instanciado:
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
});

app.use(cors());
app.use(express.json());

// ==========================================
// ROTA 1: Integração com a API da EMC
// ==========================================
app.get('/api/emc/ordem/:numeroOs', async (req, res) => {
  const { numeroOs } = req.params;
  const cnpj = process.env.CNPJ_SOLIDES;
  const apiKey = process.env.EMC_API_KEY_HOMOLOG; // Usando homologação primeiro

  try {
    // 1. Puxando o Token de Autenticação da EMC
    const tokenResponse = await fetch(`https://sandbox.api.emc.com.br/v1/token?cnpj_cpf=${cnpj}&chave_api=${apiKey}`, { 
        method: 'POST' 
    });
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) throw new Error("Falha na autenticação com a EMC");

    // 2. Buscando os dados do Equipamento pela O.S. usando o Token gerado
    const osResponse = await fetch(`https://sandbox.api.emc.com.br/v1/ordemservico/${numeroOs}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenData.token}` }
    });
    
    const osData = await osResponse.json();
    return res.json(osData);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Não foi possível buscar os dados na EMC' });
  }
});

// Inicializando o servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Back-end rodando com sucesso na porta ${PORT}`);
});