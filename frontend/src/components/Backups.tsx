import { useState, useEffect } from 'react';
import { Archive, Plus, X, Search, Loader2, MapPin, Pencil } from 'lucide-react';

export function Backups() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [equipSelecionado, setEquipSelecionado] = useState<any>(null);
  
  // Estados para Criação
  const [categoria, setCategoria] = useState('COMPUTADOR');
  const [patrimonio, setPatrimonio] = useState('');
  const [modelo, setModelo] = useState('');
  const [sede, setSede] = useState('Belo Horizonte');
  
  // Estados para Edição
  const [editColaboradorId, setEditColaboradorId] = useState('');
  const [editSede, setEditSede] = useState('');

  const [backups, setBackups] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const carregarDados = async () => {
    const resBackups = await fetch('http://localhost:3001/api/backups');
    setBackups(await resBackups.json());
    const resColabs = await fetch('http://localhost:3001/api/colaboradores');
    setColaboradores(await resColabs.json());
  };

  useEffect(() => { carregarDados(); }, []);

  const handleSalvarNovo = async () => {
    if (!modelo) return alert("Preencha o modelo!");
    setIsLoading(true);
    await fetch('http://localhost:3001/api/equipamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria, patrimonio, modelo, sede })
    });
    setPatrimonio(''); setModelo(''); setIsModalOpen(false);
    carregarDados();
    setIsLoading(false);
  };

  const abrirModalEdicao = (item: any) => {
    setEquipSelecionado(item);
    setEditSede(item.sede || 'Belo Horizonte');
    setEditColaboradorId(''); // Começa sem ninguém selecionado
    setIsEditModalOpen(true);
  };

  const handleSalvarEdicao = async () => {
    setIsLoading(true);
    await fetch(`http://localhost:3001/api/equipamentos/${equipSelecionado.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        colaboradorId: editColaboradorId || null, 
        status: editColaboradorId ? 'EM_USO' : 'DISPONIVEL',
        sede: editSede 
      })
    });
    setIsEditModalOpen(false);
    carregarDados();
    setIsLoading(false);
  };

  const handleAutoFill = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setModelo(categoria === 'TELA' ? 'Monitor Dell 24"' : 'Lenovo Thinkpad E14');
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
      <div className="flex justify-between items-end">
        <div><h3 className="text-2xl font-semibold text-zinc-100">Estoque / Backups</h3><p className="text-zinc-500 mt-1">Equipamentos disponíveis sem dono.</p></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-solides-purple text-white px-5 py-2.5 rounded-xl font-medium flex gap-2"><Plus size={18} /> Adicionar ao Estoque</button>
      </div>

      <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-solides-border flex items-center gap-2"><Archive size={20} className="text-zinc-400" /><h4 className="text-lg font-semibold text-zinc-200">Itens em Reserva</h4></div>
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-black/20 text-zinc-500 text-xs uppercase"><th className="px-6 py-4">Patrimônio</th><th className="px-6 py-4">Categoria</th><th className="px-6 py-4">Modelo</th><th className="px-6 py-4">Sede</th><th className="px-6 py-4 text-right">Ação</th></tr></thead>
          <tbody className="text-sm">
            {backups.map((item) => (
              <tr key={item.id} className="border-b border-solides-border/50 hover:bg-white/5">
                <td className="px-6 py-4 text-zinc-200"><span className="bg-white/5 px-2 py-1 rounded font-mono text-xs">{item.patrimonio || 'S/N'}</span></td>
                <td className="px-6 py-4 text-solides-purple font-semibold">{item.categoria}</td>
                <td className="px-6 py-4 text-zinc-300">{item.modelo}</td>
                <td className="px-6 py-4 flex items-center gap-1 text-zinc-400"><MapPin size={14}/> {item.sede || 'Belo Horizonte'}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => abrirModalEdicao(item)} className="text-solides-yellow hover:text-white flex items-center justify-end gap-1 w-full"><Pencil size={14} /> Editar / Atribuir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Criar Novo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex justify-between">Lançar no Estoque <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button></h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-zinc-400 mb-1">Categoria</label><select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2"><option value="COMPUTADOR">Computador</option><option value="TELA">Tela / Monitor</option><option value="PERIFERICO">Periférico</option><option value="CELULAR">Celular</option></select></div>
                <div><label className="block text-sm text-zinc-400 mb-1">Sede</label><select value={sede} onChange={e => setSede(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2"><option>Belo Horizonte</option><option>São Paulo</option><option>Maringá</option></select></div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1"><label className="block text-sm text-zinc-400 mb-1">Patrimônio (Opcional)</label><input type="text" value={patrimonio} onChange={e => setPatrimonio(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
                <div className="flex items-end"><button onClick={handleAutoFill} className="bg-white/5 text-solides-yellow px-4 py-2 rounded-lg text-sm flex gap-2">{isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar EMC</button></div>
              </div>
              <div><label className="block text-sm text-zinc-400 mb-1">Modelo / Descrição</label><input type="text" value={modelo} onChange={e => setModelo(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2" /></div>
              <button onClick={handleSalvarNovo} disabled={isLoading} className="w-full bg-solides-purple text-white py-2 rounded-lg mt-4 flex justify-center">{isLoading ? <Loader2 size={16} className="animate-spin"/> : 'Guardar no Estoque'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar/Atribuir */}
      {isEditModalOpen && equipSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-solides-panel border border-solides-border rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex justify-between">Editar {equipSelecionado.categoria} <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button></h3>
            <p className="text-sm text-zinc-400 mb-4">Editando: <strong>{equipSelecionado.modelo}</strong> ({equipSelecionado.patrimonio || 'Sem Patrimônio'})</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Alterar Sede (Localização)</label>
                <select value={editSede} onChange={e => setEditSede(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2">
                  <option>Belo Horizonte</option>
                  <option>São Paulo</option>
                  <option>Maringá</option>
                </select>
              </div>
              <div className="pt-4 border-t border-solides-border">
                <label className="block text-sm text-zinc-400 mb-1">Atribuir a um Funcionário (Opcional)</label>
                <select value={editColaboradorId} onChange={e => setEditColaboradorId(e.target.value)} className="w-full bg-[#030303] border border-solides-border text-white text-sm rounded-lg px-4 py-2">
                  <option value="">Manter no Estoque...</option>
                  {colaboradores.map(colab => (
                    <option key={colab.id} value={colab.id}>{colab.nome} ({colab.centroCusto})</option>
                  ))}
                </select>
              </div>
              <button onClick={handleSalvarEdicao} disabled={isLoading} className="w-full bg-solides-purple text-white py-2 rounded-lg mt-4 flex justify-center">{isLoading ? <Loader2 size={16} className="animate-spin"/> : 'Salvar Alterações'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}