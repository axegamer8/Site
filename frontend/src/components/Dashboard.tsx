import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Users, Archive, ArrowRightLeft, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid } from 'recharts';

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Cores padronizadas do tema
  const COLORS = {
    purple: '#7A1B6C',
    yellow: '#FFC000',
    emerald: '#10B981',
    blue: '#3B82F6',
    magenta: '#D900FF',
    zinc: '#71717A'
  };

  useEffect(() => {
    const carregarDadosReais = async () => {
      try {
        // Puxa todos os dados do banco de uma vez só!
        const [resPc, resCel, resTela, resColab] = await Promise.all([
          fetch('http://localhost:3001/api/equipamentos/COMPUTADOR'),
          fetch('http://localhost:3001/api/equipamentos/CELULAR'),
          fetch('http://localhost:3001/api/equipamentos/TELA'),
          fetch('http://localhost:3001/api/colaboradores')
        ]);

        const pcs = await resPc.json();
        const cels = await resCel.json();
        const telas = await resTela.json();
        const colabs = await resColab.json();

        const todosEquipamentos = [...pcs, ...cels, ...telas];

        // Função mágica para agrupar e contar os itens para os gráficos
        const groupBy = (arr: any[], key: string) => arr.reduce((acc, cur) => {
          const val = cur[key] || 'Não Informado';
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const formatChart = (grouped: Record<string, number>, colorList: string[]) => 
          Object.entries(grouped)
            .map(([name, value], i) => ({ name, value, qtd: value, color: colorList[i % colorList.length] }))
            .sort((a, b) => b.value - a.value); // Ordena do maior para o menor

        // Agrupamento Inteligente de Sistema Operacional
        const osGroup = pcs.reduce((acc: any, pc: any) => {
          let os = pc.sistemaOperacional || 'Não Informado';
          if (os.includes('Windows')) os = 'Windows';
          else if (os.includes('macOS') || os.includes('Mac')) os = 'MacOS';
          else if (os.includes('Linux')) os = 'Linux';
          acc[os] = (acc[os] || 0) + 1;
          return acc;
        }, {});

        // Salvando tudo calculado no estado
        setData({
          totais: {
            pcs: pcs.length,
            cels: cels.length,
            backups: todosEquipamentos.filter(e => !e.colaboradorId).length,
            colabs: colabs.length
          },
          status: formatChart(groupBy(todosEquipamentos, 'status'), [COLORS.emerald, COLORS.yellow, COLORS.purple]),
          os: formatChart(osGroup, [COLORS.blue, COLORS.yellow, COLORS.purple, COLORS.zinc]),
          fornecedorNote: formatChart(groupBy(pcs, 'fornecedor'), [COLORS.purple, COLORS.magenta, COLORS.yellow, COLORS.emerald]),
          fornecedorMonitor: formatChart(groupBy(telas, 'fornecedor'), [COLORS.purple, COLORS.magenta, COLORS.yellow, COLORS.emerald]),
          linhasCelular: formatChart(groupBy(cels, 'operadora'), [COLORS.emerald, COLORS.purple, COLORS.blue]),
          modelosNote: formatChart(groupBy(pcs, 'modelo'), [COLORS.purple]).slice(0, 5), // Top 5 Modelos
          modelosCelular: formatChart(groupBy(cels, 'modelo'), [COLORS.yellow]).slice(0, 5),
        });

      } catch (error) {
        console.error("Erro ao montar dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDadosReais();
  }, []);

  const recentesMock = [
    { id: 1, maquina: 'Aguardando Fase 6', usuario: '-', acao: 'INTEGRAÇÃO', data: 'Em breve' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A0A0A] border border-[#1E1E1E] p-3 rounded-xl shadow-xl">
          <p className="text-zinc-200 font-medium">{`${payload[0].name || payload[0].payload.name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading || !data) {
    return <div className="flex h-full items-center justify-center text-solides-purple pt-20"><Loader2 className="animate-spin" size={40} /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
      
      {/* CABEÇALHO E CARDS PRINCIPAIS */}
      <div>
        <h3 className="text-2xl font-semibold text-zinc-100">Visão Geral do Parque</h3>
        <p className="text-zinc-500 mt-1">Acompanhe os indicadores em tempo real.</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-solides-panel border border-solides-border p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-solides-purple/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-zinc-400 font-medium">Computadores</p>
            <Monitor className="text-solides-purple" size={24} />
          </div>
          <h4 className="text-3xl font-bold text-white">{data.totais.pcs}</h4>
        </div>
        
        <div className="bg-solides-panel border border-solides-border p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-solides-yellow/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-zinc-400 font-medium">Celulares</p>
            <Smartphone className="text-solides-yellow" size={24} />
          </div>
          <h4 className="text-3xl font-bold text-white">{data.totais.cels}</h4>
        </div>

        <div className="bg-solides-panel border border-solides-border p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-zinc-400 font-medium">Backups (Estoque)</p>
            <Archive className="text-zinc-400" size={24} />
          </div>
          <h4 className="text-3xl font-bold text-white">{data.totais.backups}</h4>
        </div>

        <div className="bg-solides-panel border border-solides-border p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-zinc-400 font-medium">Colaboradores</p>
            <Users className="text-emerald-500" size={24} />
          </div>
          <h4 className="text-3xl font-bold text-white">{data.totais.colabs}</h4>
        </div>
      </div>

      {/* LINHA 2: Tabela + Status Geral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-solides-panel border border-solides-border rounded-2xl shadow-lg p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
              <ArrowRightLeft size={20} className="text-solides-purple" /> Últimas Movimentações
            </h4>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-solides-border text-zinc-500 text-sm">
                  <th className="pb-3 font-medium">Equipamento</th>
                  <th className="pb-3 font-medium">Colaborador</th>
                  <th className="pb-3 font-medium">Ação</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentesMock.map((item) => (
                  <tr key={item.id} className="border-b border-solides-border/50">
                    <td className="py-3 text-zinc-200 font-medium">{item.maquina}</td>
                    <td className="py-3 text-zinc-400">{item.usuario}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-white/5 text-zinc-400">{item.acao}</span>
                    </td>
                    <td className="py-3 text-zinc-500">{item.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg p-6 flex flex-col h-80">
          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2">Status Geral</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.status} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                {data.status.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINHA 3: OS, Fornecedores e Linhas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg p-6 h-64 flex flex-col">
          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2">Sistemas Operacionais</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.os} innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                {data.os.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg p-6 h-64 flex flex-col">
          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2">Fornecedor Notebooks</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.fornecedorNote} innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                {data.fornecedorNote.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg p-6 h-64 flex flex-col">
          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2">Fornecedor Monitores</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.fornecedorMonitor} innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                {data.fornecedorMonitor.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg p-6 h-64 flex flex-col">
          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2">Linhas Celulares</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.linhasCelular} innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                {data.linhasCelular.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINHA 4: Gráficos de Barras (Modelos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg p-6 h-72 flex flex-col">
          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Top 5 Notebooks</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.modelosNote} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
              <XAxis dataKey="name" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1E1E1E' }} />
              <Bar dataKey="qtd" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-solides-panel border border-solides-border rounded-2xl shadow-lg p-6 h-72 flex flex-col">
          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Top 5 Celulares</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.modelosCelular} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
              <XAxis dataKey="name" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1E1E1E' }} />
              <Bar dataKey="qtd" fill={COLORS.yellow} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}