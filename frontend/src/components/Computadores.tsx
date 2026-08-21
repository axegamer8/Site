import { useState, useEffect } from 'react';
import { Laptop, Plus, X, Search, Loader2, History, Pencil } from 'lucide-react';

export function Computadores() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [equipSelecionado, setEquipSelecionado] = useState<any>(null);
  
  const [patrimonio, setPatrimonio] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [fornecedor, setFornecedor] = useState('EMC');
  const [valor, setValor] = useState('');
  const [sistemaOperacional, setSistemaOperacional] = useState('Windows 11 Pro');
  
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [historicoCompleto, setHistoricoCompleto] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const carregar = async () => {
    const res = await fetch('http://localhost:3001/api/equipamentos/COMPUTADOR');
    setEquipamentos(await res.json());
  };

  useEffect(() => { carregar(); }, []);

  const resetarFormulario = () => {
    setPatrimonio(''); setModelo(''); setNumeroSerie(''); setValor(''); setSistemaOperacional('Windows 11 Pro');
  };

  // FLUXO REAL DA API EMC (Autenticação + Busca)
  const handleAutoFill = async () => {
    if (!patrimonio) return alert("Digite o patrimônio primeiro para buscar na EMC!");
    setIsSyncing(true);
    
    try {
      // 1. Gerar Token de Acesso
      const urlToken = `https://integracao.api.emc.com.br/v1/token?cnpj_cpf=10461302000110&chave_api=872a7ea95dd9478e913f194ae493ac9b`;
      const authRes = await fetch(urlToken, { method: 'POST' });
      
      if (!authRes.ok) throw new Error("Falha na autenticação da EMC");
      const authData = await authRes.json();
      const tokenBearer = authData.token;

      // 2. Buscar Dados do Equipamento usando o Token
      // Nota: Substitua a URL abaixo se o endpoint de consulta de equipamento for diferente do padrão REST de OS.
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
      setModelo(dados.modelo || dados.description || 'Modelo Encontrado');
      setNumeroSerie(dados.numeroSerie || dados.serial || 'S/N Encontrado');
      setValor(dados.valor || '');
      setFornecedor('EMC');
      
    } catch (error) {
      console.error(error);
      alert("Falha ao buscar na EMC. Verifique o patrimônio ou se a API está online.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSalvarNovo = async () => {
    if (!modelo) return alert("Preencha o modelo!");
    setIsLoading(true);
    await fetch('http://localhost:3001/api/equipamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria: 'COMPUTADOR', patrimonio, modelo, numeroSerie, fornecedor, valor, sistemaOperacional })
    });
    resetarFormulario();
    setIsModalOpen(false);
    carregar();
    setIsLoading(false);
  };

  const abrirModalEdicao = (item: any) => {
    setEquipSelecionado(item);
    setPatrimonio(item.patrimonio || '');
    setModelo(item.modelo || '');
    setNumeroSerie(item.numeroSerie || '');
    setSistemaOperacional(item.sistemaOperacional || 'Windows 11 Pro');
    setIsEditModalOpen(true);
  };

  const handleSalvarEdicao = async () => {
    setIsLoading(true);
    await fetch(`http://localhost:3001/api/equipamentos/${equipSelecionado.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patrimonio, modelo, numeroSerie, sistemaOperacional })
    });
    setIsEditModalOpen(false);
    resetarFormulario();
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
        <div><h3 className="text-2xl font-semibold text-zinc-100">Computadores</h3></div>
        <button onClick={() => { resetarFormulario(); setIsModalOpen(true); }} className="bg-solides-purple text-white px-5 py-2.5 rounded-xl font-medium flex gap-2"><Plus size={18} /> Novo Equipamento</button>
      </div>

      <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-solides-border"><h4 className="text-lg font-semibold text-zinc-200 flex items-center gap-2"><Laptop size={20} className="text-zinc-400" /> Parque de Máquinas</h4></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-black/20 text-zinc-500 text-xs uppercase"><th className="px-6 py-4">Patrimônio</th><th className="px-6 py-4">Modelo</th><th className="px-6 py-4">Nº Série</th><th className="px-6 py-4">S.O.</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Usuário</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
            <tbody className="text-sm">
              {equipamentos.map((item) => (
                <tr key={item.id} className="border-b border-solides-border/50 hover:bg-white/5">
                  <td className="px-6 py-4 text-zinc-200"><span className="bg-white/5 px-2 py-1 rounded font-mono text-xs">{item.patrimonio || 'S/N'}</span></td>
                  <td className="px-6 py-4 text-zinc-300">{item.modelo}</td>
                  <td className="px-6 py-4 text-zinc-400 text-xs font-mono">{item.numeroSerie || 'S/N'}</td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">{item.sistemaOperacional || '-'}</td>
                  <td className="px-6 py-4"><span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">{item.status.replace('_', ' ')}</span></td>
                  <td className="px-6 py-4 text-zinc-400">{item.colaborador?.nome || 'NO BACKUP'}</td>
                  <td className="px-6 py-4 flex items-center justify-end gap-3">
                    <button onClick={() => abrirModalEdicao(item)} className="text-zinc-400 hover:text-white"><Pencil size={16} /></button>
                    <button onClick={() => abrirHistorico(item)} className="text-solides-yellow hover:text-white"><History size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Novo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-solides-border bg-[#030303]"><h3 className="text-xl font-semibold text-zinc-100">Adicionar Computador</h3><button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button></div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <div className="flex-1"><label className="block text-sm text-zinc-400 mb-1">Patrimônio</label><input type="text" value={patrimonio} onChange={e => setPatrimonio(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none" /></div>
                <div className="flex items-end"><button onClick={handleAutoFill} className="bg-white/5 hover:bg-white/10 text-solides-yellow px-4 py-2 rounded-lg text-sm flex gap-2">{isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar EMC</button></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-zinc-400 mb-1">Modelo</label><input type="text" value={modelo} onChange={e => setModelo(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none" /></div>
                <div><label className="block text-sm text-zinc-400 mb-1">Nº Série</label><input type="text" value={numeroSerie} onChange={e => setNumeroSerie(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-zinc-400 mb-1">Fornecedor</label><select value={fornecedor} onChange={e => setFornecedor(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none"><option>EMC</option><option>SÓLIDES</option></select></div>
                <div><label className="block text-sm text-zinc-400 mb-1">Valor (R$)</label><input type="text" value={valor} onChange={e => setValor(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none" /></div>
              </div>
              <div><label className="block text-sm text-zinc-400 mb-1">Sistema Operacional</label><select value={sistemaOperacional} onChange={e => setSistemaOperacional(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none"><option>Windows 11 Pro</option><option>Windows 10 Pro</option><option>macOS Sonoma</option><option>Linux Ubuntu</option></select></div>
            </div>
            <div className="p-6 border-t border-solides-border bg-[#030303] flex justify-end gap-3"><button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">Cancelar</button><button onClick={handleSalvarNovo} disabled={isLoading} className="bg-solides-purple text-white px-6 py-2 rounded-lg flex gap-2">{isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}</button></div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditModalOpen && equipSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex justify-between">Editar Computador <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button></h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-zinc-400 mb-1">Patrimônio</label><input type="text" value={patrimonio} onChange={e => setPatrimonio(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
                <div><label className="block text-sm text-zinc-400 mb-1">Modelo</label><input type="text" value={modelo} onChange={e => setModelo(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
              </div>
              <div><label className="block text-sm text-zinc-400 mb-1">Nº Série</label><input type="text" value={numeroSerie} onChange={e => setNumeroSerie(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
              <div><label className="block text-sm text-zinc-400 mb-1">Sistema Operacional</label><select value={sistemaOperacional} onChange={e => setSistemaOperacional(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2"><option>Windows 11 Pro</option><option>Windows 10 Pro</option><option>macOS Sonoma</option><option>Linux Ubuntu</option></select></div>
              <button onClick={handleSalvarEdicao} disabled={isLoading} className="w-full bg-solides-purple text-white py-2 rounded-lg mt-4 flex justify-center">{isLoading ? <Loader2 size={16} className="animate-spin"/> : 'Salvar Alterações'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      {isHistoryModalOpen && equipSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-2xl overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-solides-border bg-[#030303]"><div><h3 className="text-xl font-semibold text-zinc-100">Histórico: {equipSelecionado.patrimonio || equipSelecionado.modelo}</h3></div><button onClick={() => setIsHistoryModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button></div>
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