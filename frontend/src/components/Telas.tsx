import { useState, useEffect } from 'react';
import { MonitorUp, Plus, X, Search, Loader2, History } from 'lucide-react';

export function Telas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [equipSelecionado, setEquipSelecionado] = useState<any>(null);
  
  const [patrimonio, setPatrimonio] = useState('');
  const [modelo, setModelo] = useState('');
  const [fornecedor, setFornecedor] = useState('EMC');
  const [valor, setValor] = useState('');
  
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const carregar = async () => {
    const res = await fetch('http://localhost:3001/api/equipamentos/TELA');
    setEquipamentos(await res.json());
  };

  useEffect(() => { carregar(); }, []);

  const handleSalvar = async () => {
    if (!modelo) return alert("Preencha o modelo!");
    setIsLoading(true);
    await fetch('http://localhost:3001/api/equipamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria: 'TELA', patrimonio, modelo, fornecedor, valor })
    });
    setPatrimonio(''); setModelo(''); setValor('');
    setIsModalOpen(false);
    carregar();
    setIsLoading(false);
  };

  const handleAutoFill = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setModelo('Dell 24" P2422H'); setFornecedor('EMC'); setValor('45.00');
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
      <div className="flex justify-between items-end">
        <div><h3 className="text-2xl font-semibold text-zinc-100">Telas e Monitores</h3></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-solides-purple hover:bg-solides-purple/80 text-white px-5 py-2.5 rounded-xl font-medium flex gap-2"><Plus size={18} /> Novo Monitor</button>
      </div>

      <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-solides-border flex items-center gap-2"><MonitorUp size={20} className="text-zinc-400" /><h4 className="text-lg font-semibold text-zinc-200">Monitores Cadastrados</h4></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-black/20 text-zinc-500 text-xs uppercase"><th className="px-6 py-4">Patrimônio</th><th className="px-6 py-4">Modelo</th><th className="px-6 py-4">Fornecedor</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Usuário</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
            <tbody className="text-sm">
              {equipamentos.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-zinc-500">Nenhuma tela cadastrada.</td></tr>
              ) : (
                equipamentos.map((item) => (
                  <tr key={item.id} className="border-b border-solides-border/50 hover:bg-white/5">
                    <td className="px-6 py-4 text-zinc-200"><span className="bg-white/5 px-2 py-1 rounded font-mono text-xs border border-white/10">{item.patrimonio || 'N/A'}</span></td>
                    <td className="px-6 py-4 text-zinc-300">{item.modelo}</td>
                    <td className="px-6 py-4 text-zinc-400">{item.fornecedor}</td>
                    <td className="px-6 py-4"><span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">{item.status.replace('_', ' ')}</span></td>
                    <td className="px-6 py-4 text-zinc-400">{item.colaborador?.nome || 'NO BACKUP'}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => { setEquipSelecionado(item); setIsHistoryModalOpen(true); }} className="text-solides-yellow hover:text-white flex items-center justify-end gap-1 w-full"><History size={14} /> Histórico</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex justify-between">Adicionar Monitor <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button></h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1"><label className="block text-sm text-zinc-400 mb-1">Patrimônio</label><input type="text" value={patrimonio} onChange={e => setPatrimonio(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
                <div className="flex items-end"><button onClick={handleAutoFill} className="bg-white/5 text-solides-yellow px-4 py-2 rounded-lg text-sm flex gap-2">{isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar EMC</button></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm text-zinc-400 mb-1">Modelo / Tamanho</label><input type="text" value={modelo} onChange={e => setModelo(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
                <div><label className="block text-sm text-zinc-400 mb-1">Fornecedor</label><select value={fornecedor} onChange={e => setFornecedor(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2"><option>EMC</option><option>Sólides</option></select></div>
                <div><label className="block text-sm text-zinc-400 mb-1">Valor (R$)</label><input type="text" value={valor} onChange={e => setValor(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
              </div>
              <button onClick={handleSalvar} disabled={isLoading} className="w-full bg-solides-purple text-white py-2 rounded-lg mt-4 flex justify-center">{isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Monitor'}</button>
            </div>
          </div>
        </div>
      )}

      {isHistoryModalOpen && equipSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-3xl overflow-hidden p-6 text-center">
             <h3 className="text-xl font-semibold text-zinc-100 mb-6 text-left flex justify-between">Histórico: {equipSelecionado.patrimonio || equipSelecionado.modelo} <button onClick={() => setIsHistoryModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button></h3>
             <History size={40} className="mx-auto mb-3 text-zinc-700" />
             <p className="text-zinc-500">Nenhuma movimentação registrada.</p>
          </div>
        </div>
      )}
    </div>
  );
}