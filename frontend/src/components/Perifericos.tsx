import { useState, useEffect } from 'react';
import { Keyboard, Plus, X, Search, Loader2, History } from 'lucide-react';

export function Perifericos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [equipSelecionado, setEquipSelecionado] = useState<any>(null);
  
  const [patrimonio, setPatrimonio] = useState('');
  const [tipo, setTipo] = useState('Headset');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [fornecedor, setFornecedor] = useState('EMC');
  
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [historicoCompleto, setHistoricoCompleto] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const carregar = async () => {
    const res = await fetch('http://localhost:3001/api/equipamentos/PERIFERICO');
    setEquipamentos(await res.json());
  };

  useEffect(() => { carregar(); }, []);

  // FLUXO REAL DA API EMC (Autenticação + Busca)
  const handleAutoFill = async () => {
    if (!patrimonio) return alert("Digite o patrimônio primeiro!");
    setIsSyncing(true);
    
    try {
      // 1. Gerar Token de Acesso
      const urlToken = `https://integracao.api.emc.com.br/v1/token?cnpj_cpf=10461302000110&chave_api=872a7ea95dd9478e913f194ae493ac9b`;
      const authRes = await fetch(urlToken, { method: 'POST' });
      
      if (!authRes.ok) throw new Error("Falha na autenticação da EMC");
      const authData = await authRes.json();
      const tokenBearer = authData.token;

      // 2. Buscar Dados do Equipamento usando o Token
      const urlEquipamento = `https://integracao.api.emc.com.br/v1/equipamento/${patrimonio}`;
      const resposta = await fetch(urlEquipamento, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenBearer}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!resposta.ok) throw new Error("Equipamento não encontrado");
      
      const dados = await resposta.json();
      setModelo(dados.modelo || dados.description || '');
      setNumeroSerie(dados.numeroSerie || dados.serial || '');
      setFornecedor('EMC');
      
    } catch (error) {
      console.error(error);
      alert("Falha ao buscar na EMC.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSalvar = async () => {
    if (!modelo) return alert("Preencha o modelo!");
    setIsLoading(true);
    await fetch('http://localhost:3001/api/equipamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria: 'PERIFERICO', patrimonio, modelo: `${tipo} - ${modelo}`, fornecedor, numeroSerie })
    });
    setPatrimonio(''); setModelo(''); setNumeroSerie('');
    setIsModalOpen(false);
    carregar();
    setIsLoading(false);
  };

  const abrirHistorico = async (item: any) => { 
    setEquipSelecionado(item);
    setIsHistoryModalOpen(true); 
    setHistoricoCompleto([]); 
    try {
      const res = await fetch(`http://localhost:3001/api/historico/equipamento/${item.id}`);
      const data = await res.json();
      setHistoricoCompleto(Array.isArray(data) ? data : []);
    } catch (error) {
      setHistoricoCompleto([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
      <div className="flex justify-between items-end">
        <div><h3 className="text-2xl font-semibold text-zinc-100">Periféricos</h3></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-solides-purple hover:bg-solides-purple/80 text-white px-5 py-2.5 rounded-xl font-medium flex gap-2"><Plus size={18} /> Novo Acessório</button>
      </div>

      <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-solides-border"><h4 className="text-lg font-semibold text-zinc-200 flex items-center gap-2"><Keyboard size={20} className="text-zinc-400" /> Acessórios Cadastrados</h4></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-black/20 text-zinc-500 text-xs uppercase"><th className="px-6 py-4">Descrição</th><th className="px-6 py-4">Patrimônio</th><th className="px-6 py-4">Nº Série</th><th className="px-6 py-4">Fornecedor</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Usuário</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
            <tbody className="text-sm">
              {equipamentos.map((item) => (
                <tr key={item.id} className="border-b border-solides-border/50 hover:bg-white/5">
                  <td className="px-6 py-4 text-zinc-300 font-medium">{item.modelo}</td>
                  <td className="px-6 py-4 text-zinc-200"><span className="bg-white/5 px-2 py-1 rounded font-mono text-xs">{item.patrimonio || 'S/N'}</span></td>
                  <td className="px-6 py-4 text-zinc-400 text-xs font-mono">{item.numeroSerie || 'S/N'}</td>
                  <td className="px-6 py-4 text-zinc-400">{item.fornecedor}</td>
                  <td className="px-6 py-4"><span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">{item.status.replace('_', ' ')}</span></td>
                  <td className="px-6 py-4 text-zinc-400">{item.colaborador?.nome || 'NO BACKUP'}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => abrirHistorico(item)} className="text-solides-yellow hover:text-white"><History size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex justify-between">Adicionar Periférico <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button></h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1"><label className="block text-sm text-zinc-400 mb-1">Patrimônio (Opcional)</label><input type="text" value={patrimonio} onChange={e => setPatrimonio(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
                <div className="flex items-end"><button onClick={handleAutoFill} className="bg-white/5 text-solides-yellow px-4 py-2 rounded-lg text-sm flex gap-2">{isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar EMC</button></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-zinc-400 mb-1">Tipo</label><select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2"><option>Headset</option><option>Teclado</option><option>Mouse</option><option>Combo</option></select></div>
                <div><label className="block text-sm text-zinc-400 mb-1">Fornecedor</label><select value={fornecedor} onChange={e => setFornecedor(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2"><option>EMC</option><option>Sólides</option></select></div>
              </div>
              <div><label className="block text-sm text-zinc-400 mb-1">Modelo Específico</label><input type="text" value={modelo} onChange={e => setModelo(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
              <div><label className="block text-sm text-zinc-400 mb-1">Nº Série</label><input type="text" value={numeroSerie} onChange={e => setNumeroSerie(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
              <button onClick={handleSalvar} disabled={isLoading} className="w-full bg-solides-purple text-white py-2 rounded-lg mt-4 flex justify-center">{isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      {isHistoryModalOpen && equipSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-2xl overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-solides-border bg-[#030303]"><div><h3 className="text-xl font-semibold text-zinc-100">Histórico: {equipSelecionado.modelo}</h3></div><button onClick={() => setIsHistoryModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button></div>
             <div className="p-6 bg-[#0A0A0A] max-h-[60vh] overflow-y-auto space-y-4">
               {historicoCompleto.length === 0 ? (
                  <p className="text-zinc-500 text-center py-6">Nenhuma movimentação encontrada.</p>
               ) : (
                  historicoCompleto.map((hist) => (
                    <div key={hist.id} className="flex items-center gap-4 p-4 border border-zinc-700 bg-[#030303] rounded-xl">
                      <div>
                        <h4 className="text-zinc-200">Usuário: {hist.colaborador?.nome || 'Estoque/Backup'}</h4>
                        <p className="text-zinc-400 text-xs mt-1">Ação: <strong className={hist.tipo === 'DEVOLUCAO' ? 'text-solides-yellow' : 'text-emerald-400'}>{hist.tipo}</strong> | Data: {hist.createdAt ? new Date(hist.createdAt).toLocaleDateString('pt-BR') : '-'}</p>
                        <p className="text-zinc-500 text-xs mt-1 italic">"{hist.observacao}"</p>
                      </div>
                    </div>
                  ))
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}