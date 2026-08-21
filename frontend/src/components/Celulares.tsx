import { useState, useEffect } from 'react';
import { Smartphone, Plus, X, Loader2, History, User } from 'lucide-react';

export function Celulares() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [equipSelecionado, setEquipSelecionado] = useState<any>(null);
  
  // Estados do formulário
  const [patrimonio, setPatrimonio] = useState('');
  const [linha, setLinha] = useState('');
  const [imei, setImei] = useState('');
  const [modelo, setModelo] = useState('');
  const [operadora, setOperadora] = useState('Salvy');

  // Estados de dados
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const carregarCelulares = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/equipamentos/CELULAR');
      const data = await response.json();
      setEquipamentos(data);
    } catch (error) {
      console.error("Erro ao buscar celulares:", error);
    }
  };

  useEffect(() => { carregarCelulares(); }, []);

  const handleSalvar = async () => {
    if (!modelo) return alert("Preencha pelo menos o modelo!");
    setIsLoading(true);

    try {
      await fetch('http://localhost:3001/api/equipamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          categoria: 'CELULAR', 
          patrimonio, 
          linha, 
          imei, 
          modelo, 
          operadora 
        })
      });
      
      setPatrimonio(''); setLinha(''); setImei(''); setModelo('');
      setIsModalOpen(false);
      carregarCelulares();
    } catch (error) {
      alert("Erro ao salvar celular.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
      <div className="flex justify-between items-end">
        <div><h3 className="text-2xl font-semibold text-zinc-100">Celulares</h3></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-solides-purple hover:bg-solides-purple/80 text-white px-5 py-2.5 rounded-xl font-medium flex gap-2">
          <Plus size={18} /> Novo Celular
        </button>
      </div>

      <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-solides-border flex justify-between items-center"><h4 className="text-lg font-semibold text-zinc-200 flex items-center gap-2"><Smartphone size={20} className="text-zinc-400" /> Aparelhos</h4></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-black/20 text-zinc-500 text-xs uppercase"><th className="px-6 py-4">Patrimônio</th><th className="px-6 py-4">Linha</th><th className="px-6 py-4">Modelo</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Usuário</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
            <tbody className="text-sm">
              {equipamentos.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-zinc-500">Nenhum celular cadastrado.</td></tr>
              ) : (
                equipamentos.map((item) => (
                  <tr key={item.id} className="border-b border-solides-border/50 hover:bg-white/5">
                    <td className="px-6 py-4 text-zinc-200"><span className="bg-white/5 px-2 py-1 rounded font-mono text-xs border border-white/10">{item.patrimonio || 'N/A'}</span></td>
                    <td className="px-6 py-4 text-zinc-300">{item.linha || '-'}</td>
                    <td className="px-6 py-4 text-zinc-300">{item.modelo}</td>
                    <td className="px-6 py-4"><span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">{item.status.replace('_', ' ')}</span></td>
                    <td className="px-6 py-4 text-zinc-400">{item.colaborador?.nome || '-'}</td>
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
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-solides-border bg-[#030303]"><h3 className="text-xl font-semibold text-zinc-100">Adicionar Celular</h3><button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-zinc-400 mb-1">Patrimônio</label><input type="text" value={patrimonio} onChange={e => setPatrimonio(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none" /></div>
                <div><label className="block text-sm text-zinc-400 mb-1">Número da Linha</label><input type="text" value={linha} onChange={e => setLinha(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-zinc-400 mb-1">IMEI</label><input type="text" value={imei} onChange={e => setImei(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none" /></div>
                <div><label className="block text-sm text-zinc-400 mb-1">Modelo</label><input type="text" value={modelo} onChange={e => setModelo(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-zinc-400 mb-1">Operadora</label><select value={operadora} onChange={e => setOperadora(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none"><option>Salvy</option><option>Vivo</option></select></div>
              </div>
            </div>
            <div className="p-6 border-t border-solides-border bg-[#030303] flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">Cancelar</button>
              <button onClick={handleSalvar} disabled={isLoading} className="bg-solides-purple text-white px-6 py-2 rounded-lg flex items-center gap-2">{isLoading ? <Loader2 size={16} className="animate-spin"/> : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {isHistoryModalOpen && equipSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-3xl overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-solides-border bg-[#030303]"><div><h3 className="text-xl font-semibold text-zinc-100">Histórico: {equipSelecionado.modelo}</h3></div><button onClick={() => setIsHistoryModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button></div>
             <div className="p-6 bg-[#0A0A0A] space-y-4 text-center text-zinc-500 py-10">
              <History size={40} className="mx-auto mb-3 opacity-20" />
              Nenhuma movimentação registrada.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}