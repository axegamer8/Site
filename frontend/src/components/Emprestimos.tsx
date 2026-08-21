import { useState, useEffect } from 'react';
import { Handshake, Plus, X, Loader2 } from 'lucide-react';

export function Emprestimos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados de dados da API
  const [emprestimos, setEmprestimos] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do Formulário
  const [colaboradorId, setColaboradorId] = useState('');
  const [equipamentoId, setEquipamentoId] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [emprestadoPor, setEmprestadoPor] = useState('Lucas Ferreira');

  // Estados derivados para auto-preenchimento visual
  const [ccSelecionado, setCcSelecionado] = useState('');
  const [patrimonioSelecionado, setPatrimonioSelecionado] = useState('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');

  const carregarDados = async () => {
    try {
      const resEmps = await fetch('http://localhost:3001/api/emprestimos');
      setEmprestimos(await resEmps.json());
      
      const resColabs = await fetch('http://localhost:3001/api/colaboradores');
      setColaboradores(await resColabs.json());

      const resBackups = await fetch('http://localhost:3001/api/backups');
      setBackups(await resBackups.json());
    } catch (error) {
      console.error("Erro ao buscar dados", error);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  // Lógica de auto-preenchimento ao selecionar Colaborador
  const handleSelecionarColaborador = (id: string) => {
    setColaboradorId(id);
    const colab = colaboradores.find(c => c.id.toString() === id);
    setCcSelecionado(colab ? colab.centroCusto : '');
  };

  // Lógica de auto-preenchimento ao selecionar Equipamento
  const handleSelecionarEquipamento = (id: string) => {
    setEquipamentoId(id);
    const equip = backups.find(b => b.id.toString() === id);
    if (equip) {
      setPatrimonioSelecionado(equip.patrimonio || 'S/N');
      setFornecedorSelecionado(equip.fornecedor || 'Não informado');
    } else {
      setPatrimonioSelecionado('');
      setFornecedorSelecionado('');
    }
  };

  const handleSalvar = async () => {
    if (!colaboradorId || !equipamentoId || !dataDevolucao) return alert("Preencha Colaborador, Equipamento e Data!");
    setIsLoading(true);
    
    try {
      await fetch('http://localhost:3001/api/emprestimos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          colaboradorId, 
          equipamentoId, 
          dataDevolucao, 
          emprestadoPor 
        })
      });
      setIsModalOpen(false);
      
      // Limpar formulário
      setColaboradorId(''); setEquipamentoId(''); setDataDevolucao('');
      setCcSelecionado(''); setPatrimonioSelecionado(''); setFornecedorSelecionado('');
      
      carregarDados();
    } catch (error) {
      alert("Erro ao registrar empréstimo.");
    } finally {
      setIsLoading(false);
    }
  };

 const handleDarBaixa = async (id: number) => {
    if (!confirm("Confirmar a devolução deste equipamento para o Estoque (Backup)?")) return;
    setIsLoading(true);
    try {
      await fetch(`http://localhost:3001/api/emprestimos/${id}/baixa`, { method: 'PUT' });
      carregarDados(); // Recarrega a tabela, ele vai sumir da lista!
    } catch (error) {
      alert("Erro ao dar baixa no empréstimo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
      <div className="flex justify-between items-end">
        <div><h3 className="text-2xl font-semibold text-zinc-100">Empréstimos Temporários</h3></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-solides-purple hover:bg-solides-purple/80 text-white px-5 py-2.5 rounded-xl font-medium flex gap-2"><Plus size={18} /> Novo Empréstimo</button>
      </div>

      <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-solides-border flex justify-between items-center"><h4 className="text-lg font-semibold text-zinc-200 flex items-center gap-2"><Handshake size={20} className="text-zinc-400" /> Itens Emprestados</h4></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-black/20 text-zinc-500 text-xs uppercase"><th className="px-6 py-4">Status</th><th className="px-6 py-4">Colaborador</th><th className="px-6 py-4">Equipamento</th><th className="px-6 py-4 text-right">Ação</th></tr></thead>
            <tbody className="text-sm">
              {emprestimos.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-zinc-500">Nenhum empréstimo ativo no momento.</td></tr>
              ) : (
                emprestimos.map((item) => (
                  <tr key={item.id} className="border-b border-solides-border/50 hover:bg-white/5">
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-solides-yellow text-xs font-semibold bg-solides-yellow/10 px-2.5 py-1 rounded-full w-fit">
                        PENDENTE ({new Date(item.dataDevolucao).toLocaleDateString('pt-BR')})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-200">{item.colaborador?.nome}</td>
                    <td className="px-6 py-4 text-zinc-300">
                      {item.equipamento?.modelo} <span className="text-xs text-zinc-500 font-mono ml-2">[{item.equipamento?.patrimonio || 'S/N'}]</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDarBaixa(item.id)} className="text-solides-purple hover:text-white border border-solides-purple/30 px-3 py-1.5 rounded-lg transition-colors">Dar Baixa</button>
                    </td>
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
            <div className="flex justify-between items-center p-6 border-b border-solides-border bg-[#030303]"><h3 className="text-xl font-semibold text-zinc-100">Registrar Empréstimo</h3><button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button></div>
            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Colaborador</label>
                  <select value={colaboradorId} onChange={e => handleSelecionarColaborador(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none">
                    <option value="">Selecione...</option>
                    {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Centro de Custo</label>
                  <input type="text" readOnly value={ccSelecionado} placeholder="Auto-preenchido" className="w-full bg-[#030303] border border-solides-border text-zinc-500 text-sm rounded-lg px-4 py-2 outline-none cursor-not-allowed" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Equipamento (Estoque)</label>
                  <select value={equipamentoId} onChange={e => handleSelecionarEquipamento(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none">
                    <option value="">Selecione um item...</option>
                    {backups.map(b => <option key={b.id} value={b.id}>{b.modelo}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Patrimônio</label>
                  <input type="text" readOnly value={patrimonioSelecionado} placeholder="Auto-preenchido" className="w-full bg-[#030303] border border-solides-border text-zinc-500 text-sm rounded-lg px-4 py-2 outline-none cursor-not-allowed" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Fornecedor</label>
                  <input type="text" readOnly value={fornecedorSelecionado} placeholder="Auto-preenchido" className="w-full bg-[#030303] border border-solides-border text-zinc-500 text-sm rounded-lg px-4 py-2 outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Emprestado por</label>
                  <input type="text" value={emprestadoPor} onChange={e => setEmprestadoPor(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Data de Devolução</label>
                <input type="date" value={dataDevolucao} onChange={e => setDataDevolucao(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none [color-scheme:dark]" />
              </div>
            </div>

            <div className="p-6 border-t border-solides-border bg-[#030303] flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">Cancelar</button>
              <button onClick={handleSalvar} disabled={isLoading} className="bg-solides-purple text-white px-6 py-2 rounded-lg flex gap-2">
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}