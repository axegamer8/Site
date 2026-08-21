import { useState, useEffect } from 'react';
import { Users, Plus, X, History, UserCheck, Pencil, Loader2 } from 'lucide-react';

export function Colaboradores() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [colabSelecionado, setColabSelecionado] = useState<any>(null);
  
  // Dados do Colaborador
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cc, setCc] = useState('INFRA');
  const [status, setStatus] = useState('ATIVO');
  
  // Equipamentos do Colaborador (Desbloqueados para edição)
  const [notebook, setNotebook] = useState('');
  const [tela, setTela] = useState('');
  const [periferico, setPeriferico] = useState('');
  const [celular, setCelular] = useState('');
  
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [historicoCompleto, setHistoricoCompleto] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const carregarDados = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/colaboradores');
      setColaboradores(await res.json());
    } catch (error) {
      console.error("Erro ao buscar colaboradores", error);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const resetForm = () => { 
    setNome(''); setEmail(''); setCc('INFRA'); setStatus('ATIVO');
    setNotebook(''); setTela(''); setPeriferico(''); setCelular('');
  };

  const getEquip = (colab: any, categoria: string) => {
    if (!colab.equipamentos) return '';
    const equip = colab.equipamentos.find((e: any) => e.categoria === categoria);
    return equip ? (equip.patrimonio || equip.modelo) : '';
  };

  const handleSalvarNovo = async () => {
    if (!nome || !email) return alert("Preencha nome e e-mail!");
    setIsLoading(true);
    try {
      await fetch('http://localhost:3001/api/colaboradores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, centroCusto: cc, notebook, tela, periferico, celular })
      });
      resetForm();
      setIsModalOpen(false);
      carregarDados();
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  const abrirPerfil = (colab: any) => { 
    setColabSelecionado(colab); 
    setNome(colab.nome);
    setEmail(colab.email);
    setCc(colab.centroCusto || '');
    setStatus(colab.status || 'ATIVO');
    
    // Puxa as máquinas atuais e joga nas caixas de texto para edição livre!
    setNotebook(getEquip(colab, 'COMPUTADOR'));
    setTela(getEquip(colab, 'TELA'));
    setPeriferico(getEquip(colab, 'PERIFERICO'));
    setCelular(getEquip(colab, 'CELULAR'));
    
    setIsEditProfileOpen(true); 
  };

  const handleAtualizar = async () => {
    setIsLoading(true);
    try {
      await fetch(`http://localhost:3001/api/colaboradores/${colabSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, centroCusto: cc, status, notebook, tela, periferico, celular })
      });
      setIsEditProfileOpen(false);
      carregarDados();
    } catch (error) {
      alert("Erro ao atualizar colaborador.");
    } finally {
      setIsLoading(false);
    }
  };

  const abrirHistorico = async () => { 
    setIsEditProfileOpen(false);
    setIsHistoryModalOpen(true); 
    setHistoricoCompleto([]); 
    try {
      const res = await fetch(`http://localhost:3001/api/historico/colaborador/${colabSelecionado.id}`);
      const data = await res.json();
      setHistoricoCompleto(Array.isArray(data) ? data : []);
    } catch (error) {
      setHistoricoCompleto([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
      <div className="flex justify-between items-end">
        <div><h3 className="text-2xl font-semibold text-zinc-100">Gestão de Colaboradores</h3></div>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-solides-purple hover:bg-solides-purple/80 text-white px-5 py-2.5 rounded-xl font-medium flex gap-2"><Plus size={18} /> Novo Colaborador</button>
      </div>

      <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-solides-border"><h4 className="text-lg font-semibold text-zinc-200 flex items-center gap-2"><Users size={20} className="text-zinc-400" /> Funcionários e Equipamentos</h4></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-black/20 text-zinc-500 text-xs uppercase"><th className="px-6 py-4">Nome / Email</th><th className="px-6 py-4">C.C.</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-solides-purple">Notebook</th><th className="px-6 py-4 text-solides-purple">Tela</th><th className="px-6 py-4 text-solides-purple">Periférico</th><th className="px-6 py-4 text-solides-purple">Celular</th><th className="px-6 py-4"></th></tr></thead>
            <tbody className="text-sm">
              {colaboradores.map((item) => (
                <tr key={item.id} onClick={() => abrirPerfil(item)} className="border-b border-solides-border/50 hover:bg-white/5 cursor-pointer transition-colors group">
                  <td className="px-6 py-4"><p className="text-zinc-200 font-medium group-hover:text-solides-purple">{item.nome}</p><p className="text-xs text-zinc-500">{item.email}</p></td>
                  <td className="px-6 py-4 text-zinc-400">{item.centroCusto}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'ATIVO' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{item.status}</span></td>
                  <td className="px-6 py-4 text-zinc-300 font-mono text-xs">{getEquip(item, 'COMPUTADOR') || '-'}</td>
                  <td className="px-6 py-4 text-zinc-300 font-mono text-xs">{getEquip(item, 'TELA') || '-'}</td>
                  <td className="px-6 py-4 text-zinc-300 font-mono text-xs">{getEquip(item, 'PERIFERICO') || '-'}</td>
                  <td className="px-6 py-4 text-zinc-300 font-mono text-xs">{getEquip(item, 'CELULAR') || '-'}</td>
                  <td className="px-6 py-4 text-right text-solides-yellow"><Pencil size={16}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Novo Colaborador */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex justify-between">Novo Colaborador <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button></h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-solides-purple uppercase tracking-wider mb-3">1. Dados Pessoais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-xs text-zinc-400 mb-1">Nome Completo</label><input type="text" value={nome} onChange={e=>setNome(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Centro de Custo</label><input type="text" value={cc} onChange={e=>setCc(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple" /></div>
                </div>
              </div>
              <div className="pt-4 border-t border-solides-border">
                <h4 className="text-sm font-semibold text-solides-purple uppercase tracking-wider mb-3">2. Atribuir Equipamentos</h4>
                <p className="text-xs text-zinc-500 mb-4">Digite o patrimônio. Se não existir, o sistema criará automaticamente.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-zinc-400 mb-1">Notebook (Patrimônio)</label><input type="text" placeholder="Ex: 186618" value={notebook} onChange={e=>setNotebook(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Tela (Patrimônio)</label><input type="text" placeholder="Ex: 101875" value={tela} onChange={e=>setTela(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Periférico (Patrimônio/Modelo)</label><input type="text" placeholder="Ex: Jabra 20" value={periferico} onChange={e=>setPeriferico(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Celular (Patrimônio/Linha)</label><input type="text" placeholder="Ex: CEL-001" value={celular} onChange={e=>setCelular(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple" /></div>
                </div>
              </div>
            </div>
            <button onClick={handleSalvarNovo} disabled={isLoading} className="w-full mt-6 bg-solides-purple text-white py-2 rounded-lg flex justify-center">{isLoading ? <Loader2 size={16} className="animate-spin"/> : 'Salvar Colaborador'}</button>
          </div>
        </div>
      )}

      {/* Modal EDIÇÃO DE PERFIL */}
      {isEditProfileOpen && colabSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex justify-between items-center"><span className="flex items-center gap-2"><UserCheck className="text-emerald-500"/> Editar Colaborador</span> <button onClick={() => setIsEditProfileOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button></h3>
            <div className="space-y-4">
               <div><label className="block text-xs text-zinc-400 mb-1">Nome Completo</label><input type="text" value={nome} onChange={e=>setNome(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple" /></div>
               <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-xs text-zinc-400 mb-1">E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Centro de Custo</label><input type="text" value={cc} onChange={e=>setCc(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple" /></div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Status</label>
                    <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-solides-purple">
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                    </select>
                  </div>
               </div>
               
               <div className="pt-4 border-t border-solides-border">
                  <h4 className="text-sm font-semibold text-solides-purple uppercase tracking-wider mb-3">Equipamentos Atribuídos</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div><label className="block text-xs text-zinc-400 mb-1">Notebook</label><input type="text" value={notebook} onChange={e=>setNotebook(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-solides-purple font-mono text-sm rounded-lg px-3 py-2 outline-none focus:border-solides-purple" /></div>
                    <div><label className="block text-xs text-zinc-400 mb-1">Tela</label><input type="text" value={tela} onChange={e=>setTela(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-solides-purple font-mono text-sm rounded-lg px-3 py-2 outline-none focus:border-solides-purple" /></div>
                    <div><label className="block text-xs text-zinc-400 mb-1">Periférico</label><input type="text" value={periferico} onChange={e=>setPeriferico(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-solides-purple font-mono text-sm rounded-lg px-3 py-2 outline-none focus:border-solides-purple" /></div>
                    <div><label className="block text-xs text-zinc-400 mb-1">Celular</label><input type="text" value={celular} onChange={e=>setCelular(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-solides-purple font-mono text-sm rounded-lg px-3 py-2 outline-none focus:border-solides-purple" /></div>
                  </div>
               </div>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-solides-border">
              <button onClick={abrirHistorico} className="text-solides-yellow hover:text-white flex items-center gap-2 text-sm font-medium"><History size={16}/> Ver Histórico</button>
              <button onClick={handleAtualizar} disabled={isLoading} className="bg-solides-purple text-white px-6 py-2 rounded-lg flex gap-2">{isLoading ? <Loader2 size={16} className="animate-spin"/> : 'Atualizar Dados'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico Completo */}
      {isHistoryModalOpen && colabSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-2xl overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-solides-border bg-[#030303]"><div><h3 className="text-xl font-semibold text-zinc-100">Histórico de {colabSelecionado.nome}</h3></div><button onClick={() => setIsHistoryModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button></div>
             <div className="p-6 bg-[#0A0A0A] max-h-[60vh] overflow-y-auto space-y-4">
               {historicoCompleto.length === 0 ? (
                  <p className="text-zinc-500 text-center py-6">Nenhuma movimentação encontrada.</p>
               ) : (
                  historicoCompleto.map((hist) => (
                    <div key={hist.id} className="flex items-center gap-4 p-4 border border-zinc-700 bg-[#030303] rounded-xl">
                      <div>
                        <h4 className="text-zinc-200">{hist.equipamento?.modelo || 'Equipamento'} <span className="text-zinc-500 text-xs font-mono ml-2">[{hist.equipamento?.patrimonio || 'S/N'}]</span></h4>
                        <p className="text-zinc-400 text-xs mt-1">Ação: <strong className={hist.tipo === 'DEVOLUCAO' ? 'text-solides-yellow' : 'text-emerald-400'}>{hist.tipo}</strong> | Data: {hist.createdAt ? new Date(hist.createdAt).toLocaleDateString('pt-BR') : 'Data não registrada'}</p>
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