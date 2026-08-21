import { useState } from 'react';
import { LayoutDashboard, MonitorSmartphone, Users, Search, Bell, LogOut, ChevronRight, Smartphone, Archive, Keyboard, MonitorUp, Settings, Handshake } from 'lucide-react';

// Importando os nossos componentes
import { Dashboard } from './components/Dashboard';
import { Computadores } from './components/Computadores';
import { Colaboradores } from './components/Colaboradores';
import { Emprestimos } from './components/Emprestimos';
import { Celulares } from './components/Celulares';
import { Telas } from './components/Telas';
import { Perifericos } from './components/Perifericos';
import { Backups } from './components/Backups';


function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'equipamentos', label: 'Computadores', icon: MonitorSmartphone },
    { id: 'telas', label: 'Monitores', icon: MonitorUp },
    { id: 'perifericos', label: 'Periféricos', icon: Keyboard },
    { id: 'celulares', label: 'Celulares', icon: Smartphone },
    { id: 'backups', label: 'Backups EMC', icon: Archive },
    { id: 'emprestimos', label: 'Empréstimos', icon: Handshake },
    { id: 'colaboradores', label: 'Colaboradores', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-solides-black text-white font-sans selection:bg-solides-purple selection:text-white">
      
      {/* MENU LATERAL */}
      <aside className="w-72 bg-solides-black border-r border-solides-border flex flex-col relative z-10">
        <div className="h-24 flex items-center px-8 border-b border-solides-border">
          <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-2.5 h-7 bg-solides-purple rounded-sm"></div>
            sólides
            <span className="text-zinc-500 font-normal text-lg ml-1 mt-0.5">inventário</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-4">Menu Principal</p>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <button 
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-solides-purple/20 to-transparent text-white' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={20} className={`transition-colors duration-300 ${isActive ? 'text-solides-purple' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-solides-purple animate-fade-in" />}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-solides-border">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-solides-darkPurple border border-solides-purple/30 flex items-center justify-center text-sm font-bold text-solides-yellow">
              LF
            </div>
            <div className="flex flex-col text-left flex-1">
              <span className="text-sm font-semibold text-zinc-200">Lucas Ferreira</span>
              <span className="text-xs text-zinc-500">Administrador</span>
            </div>
            <LogOut size={18} className="text-zinc-600 hover:text-solides-purple transition-colors" />
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 flex flex-col bg-[#030303] relative overflow-hidden">
        
        <header className="h-24 flex items-center justify-between px-10 border-b border-solides-border bg-solides-black/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold capitalize animate-fade-in text-zinc-100">
              {activeMenu.replace('_', ' ')}
            </h2>
            <span className="flex h-1.5 w-1.5 rounded-full bg-solides-yellow shadow-[0_0_8px_rgba(255,192,0,0.8)]"></span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search size={18} className="text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-solides-purple transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar em todo o sistema..." 
                className="bg-solides-panel border border-solides-border text-sm rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:border-solides-purple/50 focus:ring-1 focus:ring-solides-purple/50 w-80 transition-all text-white placeholder:text-zinc-600"
              />
            </div>
            <button className="relative text-zinc-400 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-solides-purple rounded-full border-2 border-solides-black"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-10">
          
          {/* Lógica de Troca de Telas (Apenas isso, apague o resto abaixo!) */}
          {activeMenu === 'dashboard' && <Dashboard />}
          {activeMenu === 'equipamentos' && <Computadores />}
          {activeMenu === 'colaboradores' && <Colaboradores />}
          {activeMenu === 'emprestimos' && <Emprestimos />}
          {activeMenu === 'celulares' && <Celulares />}
          {activeMenu === 'telas' && <Telas />}
          {activeMenu === 'perifericos' && <Perifericos />}
          {activeMenu === 'backups' && <Backups />}

        </div>
      </main>

    </div>
  );
}

export default App;