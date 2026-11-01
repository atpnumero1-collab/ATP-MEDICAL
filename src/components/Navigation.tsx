import React from 'react';
import { 
  Home,
  Calendar, 
  Users, 
  Stethoscope, 
  HeartPulse, 
  BarChart3, 
  Palette, 
  PlusCircle,
  FileText,
  Share2,
  CalendarPlus
} from 'lucide-react';
import { ClinicConfig } from '../types';

export type ActiveModule = 
  | 'home'
  | 'tickets'
  | 'waitingRoom'
  | 'appointments' 
  | 'medicalRecords'
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
  onSharePortalLink?: () => void;
  pendingIntakesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeModule,
  setActiveModule,
  config,
  onQuickIntake,
  onQuickAppointment,
  onSharePortalLink,
  pendingIntakesCount
}) => {
  const navItems = [
    { 
      id: 'home' as const, 
      label: 'Inicio', 
      shortLabel: 'Inicio',
      icon: Home,
      accentColor: '#7DDACB'
    },
    { 
      id: 'tickets' as const, 
      label: 'Creación de Tickets', 
      shortLabel: 'Tickets',
      icon: PlusCircle,
      accentColor: '#7DDACB'
    },
    { 
      id: 'waitingRoom' as const, 
      label: 'Pacientes en Sala', 
      shortLabel: 'En Sala',
      icon: HeartPulse, 
      badge: pendingIntakesCount,
      accentColor: '#7DDACB'
    },
    { 
      id: 'appointments' as const, 
      label: 'Citas y Agenda', 
      shortLabel: 'Citas',
      icon: Calendar,
      accentColor: '#7DDACB'
    },
    { 
      id: 'medicalRecords' as const, 
      label: 'Historias Médicas', 
      shortLabel: 'Historias',
      icon: FileText,
      accentColor: '#7DDACB'
    },
    { 
      id: 'patients' as const, 
      label: 'Directorio Pacientes', 
      shortLabel: 'Pacientes',
      icon: Users,
      accentColor: '#7DDACB'
    },
    { 
      id: 'doctors' as const, 
      label: 'Médicos & Box', 
      shortLabel: 'Médicos',
      icon: Stethoscope,
      accentColor: '#7DDACB'
    },
    { 
      id: 'reports' as const, 
      label: 'Métricas & Reportes', 
      shortLabel: 'Métricas',
      icon: BarChart3,
      accentColor: '#7DDACB'
    },
    { 
      id: 'settings' as const, 
      label: 'Ajuste de Colores', 
      shortLabel: 'Colores',
      icon: Palette,
      accentColor: '#7DDACB'
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#151E3A] text-white border-b border-[#1F2952] shadow-lg">
      {/* Upper Brand & Quick Actions Row (#151E3A) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-15 py-1">
          
          {/* Brand Zone with Official Siglas from siglas_atp.pdf */}
          <div className="flex items-center shrink-0">
            <div 
              className="w-28 sm:w-32 h-11 rounded-xl overflow-hidden border-2 border-[#7DDACB] flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform bg-[#F4F4F4] shrink-0"
              onClick={() => setActiveModule('home')}
              title="Inicio · C.C. Parque Humboldt, Caracas"
            >
              <img 
                src="/assets/aistudio/siglas_atp.jpg" 
                alt="Logo Oficial ATP" 
                className="w-full h-full object-cover object-center scale-[1.55]"
              />
            </div>
          </div>

          {/* Quick Actions (WhatsApp Patient Link #7DDACB, New Appointment #1F2952, Admission #395AFF) */}
          <div className="flex items-center gap-2 shrink-0">
            {onSharePortalLink && (
              <button
                type="button"
                onClick={onSharePortalLink}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-[#151E3A] bg-[#7DDACB] hover:brightness-105 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer"
                title="Copiar o enviar por WhatsApp el enlace de autogestión de citas para pacientes"
              >
                <Share2 className="w-3.5 h-3.5 text-[#151E3A]" />
                <span className="hidden sm:inline">Link Autogestión WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </button>
            )}

            <button
              onClick={onQuickAppointment}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#1F2952] hover:bg-[#1F2952]/80 border border-[#7DDACB]/40 rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
              title="Agendar nueva cita médica"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#7DDACB]" />
              <span>Nueva Cita</span>
            </button>

            <button
              onClick={onQuickIntake}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#395AFF] hover:brightness-110 rounded-lg shadow-md active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              title="Registrar ingreso / admisión inmediata con triaje"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#7DDACB]" />
              <span>Ingreso Paciente</span>
            </button>
          </div>

        </div>
      </div>

      {/* LOWER ROW: MODULES BAR - ALWAYS VISIBLE ON SCREEN (#1F2952 with #395AFF active & #7DDACB accents) */}
      <div className="bg-[#1F2952] border-t border-[#7DDACB]/25 px-2 sm:px-4 py-1.5 overflow-x-auto no-scrollbar shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive 
                    ? 'bg-[#395AFF] text-white shadow-md scale-102 ring-1 ring-[#7DDACB]' 
                    : 'text-[#F4F4F4]/90 hover:text-white hover:bg-[#151E3A]/70 border border-transparent hover:border-[#7DDACB]/30'
                }`}
              >
                <Icon 
                  className={`w-4 h-4 transition-transform group-hover:scale-110 shrink-0 ${
                    isActive ? 'text-[#7DDACB]' : 'text-[#7DDACB]'
                  }`} 
                />
                
                <span className="hidden md:inline font-bold">
                  {item.label}
                </span>
                <span className="md:hidden font-bold">
                  {item.shortLabel}
                </span>

                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span 
                    className={`px-1.5 py-0.2 text-[10px] font-black rounded-full ml-1 ${
                      isActive 
                        ? 'bg-[#7DDACB] text-[#151E3A]' 
                        : 'bg-[#7DDACB] text-[#151E3A] animate-pulse'
                    }`}
                  >
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
