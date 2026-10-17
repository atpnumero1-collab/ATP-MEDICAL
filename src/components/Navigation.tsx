import React from 'react';
import { 
  Calendar, 
  UserCheck, 
  Users, 
  Stethoscope, 
  Tv, 
  BarChart3, 
  Palette, 
  PlusCircle,
  Bell
} from 'lucide-react';
import { ClinicConfig } from '../types';

export type ActiveModule = 
  | 'tickets'
  | 'waitingRoom'
  | 'appointments' 
  | 'patients' 
  | 'doctors' 
  | 'reports' 
  | 'settings';

interface NavigationProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  config: ClinicConfig;
  onQuickIntake: () => void;
  onQuickAppointment: () => void;
  pendingIntakesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeModule,
  setActiveModule,
  config,
  onQuickIntake,
  onQuickAppointment,
  pendingIntakesCount
}) => {
  const navItems = [
    { id: 'tickets' as const, label: 'Creación de tickets', icon: PlusCircle },
    { id: 'waitingRoom' as const, label: 'Pacientes en sala', icon: Tv, badge: pendingIntakesCount },
    { id: 'appointments' as const, label: 'Citas y Agendamiento', icon: Calendar },
    { id: 'patients' as const, label: 'Directorio Pacientes', icon: Users },
    { id: 'doctors' as const, label: 'Médicos & Box', icon: Stethoscope },
    { id: 'reports' as const, label: 'Métricas', icon: BarChart3 },
    { id: 'settings' as const, label: 'Ajuste Colores', icon: Palette },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Bar following 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          
          {/* Zone 1: Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center shadow-xs cursor-pointer"
              onClick={() => setActiveModule('appointments')}
              title="ATP MEDICAL"
            >
              <img 
                src="/src/assets/images/atp_medical_badge_1792268353732.jpg" 
                alt="ATP MEDICAL" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div 
              className="cursor-pointer"
              onClick={() => setActiveModule('appointments')}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  {config.clinicName}
                </span>
                <span 
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: config.accentColor }}
                />
              </div>
              <p className="text-xs text-slate-500 whitespace-nowrap leading-none hidden sm:block">
                {config.branchName}
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  style={isActive ? { backgroundColor: config.primaryColor } : {}}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span 
                      className="px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white ml-0.5"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Quick Admission */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onQuickAppointment}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
              title="Agendar nueva cita médica"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Nueva Cita</span>
            </button>
            <button
              onClick={onQuickIntake}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-md shadow-xs hover:opacity-95 active:scale-98 transition-all whitespace-nowrap shrink-0"
              style={{ backgroundColor: config.accentColor }}
              title="Registrar ingreso / admisión inmediata con triaje"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ingreso Paciente</span>
            </button>
          </div>

        </div>

        {/* Mobile/Tablet Secondary Nav Row */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                style={isActive ? { backgroundColor: config.primaryColor } : {}}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="text-[10px] font-bold bg-white/30 text-white rounded px-1">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
