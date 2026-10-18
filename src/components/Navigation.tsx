import React from 'react';
import { 
  Calendar, 
  Users, 
  Stethoscope, 
  Tv, 
  BarChart3, 
  Palette, 
  PlusCircle,
  FileText,
  Share2,
  CalendarPlus
} from 'lucide-react';
import { ClinicConfig } from '../types';

export type ActiveModule = 
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
      id: 'tickets' as const, 
      label: 'Creación de Tickets', 
      shortLabel: 'Tickets',
      icon: PlusCircle,
      accentColor: '#0ea5e9' // sky-500
    },
    { 
      id: 'waitingRoom' as const, 
      label: 'Pacientes en Sala', 
      shortLabel: 'En Sala',
      icon: Tv, 
      badge: pendingIntakesCount,
      accentColor: '#f59e0b' // amber-500
    },
    { 
      id: 'appointments' as const, 
      label: 'Citas y Agenda', 
      shortLabel: 'Citas',
      icon: Calendar,
      accentColor: '#3b82f6' // blue-500
    },
    { 
      id: 'medicalRecords' as const, 
      label: 'Historias Médicas', 
      shortLabel: 'Historias',
      icon: FileText,
      accentColor: '#8b5cf6' // violet-500
    },
    { 
      id: 'patients' as const, 
      label: 'Directorio Pacientes', 
      shortLabel: 'Pacientes',
      icon: Users,
      accentColor: '#06b6d4' // cyan-500
    },
    { 
      id: 'doctors' as const, 
      label: 'Médicos & Box', 
      shortLabel: 'Médicos',
      icon: Stethoscope,
      accentColor: '#10b981' // emerald-500
    },
    { 
      id: 'reports' as const, 
      label: 'Métricas & Reportes', 
      shortLabel: 'Métricas',
      icon: BarChart3,
      accentColor: '#ec4899' // pink-500
    },
    { 
      id: 'settings' as const, 
      label: 'Ajuste de Colores', 
      shortLabel: 'Colores',
      icon: Palette,
      accentColor: '#6366f1' // indigo-500
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-md">
      {/* Upper Brand & Quick Actions Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-15 py-1">
          
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              className="w-10 h-10 rounded-xl overflow-hidden border-2 border-blue-500/30 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform bg-white"
              onClick={() => setActiveModule('appointments')}
              title="ATP MEDICAL - C.C. Parque Humboldt, Caracas"
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
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                  {config.clinicName}
                </span>
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block shadow-sm animate-pulse"
                  style={{ backgroundColor: config.accentColor || '#00A3FF' }}
                />
              </div>
              <p className="text-[11px] font-semibold text-blue-800/80 whitespace-nowrap leading-none hidden sm:block">
                {config.branchName}
              </p>
            </div>
          </div>

          {/* Quick Actions (WhatsApp Patient Link, New Appointment, Triage/Admission) */}
          <div className="flex items-center gap-2 shrink-0">
            {onSharePortalLink && (
              <button
                type="button"
                onClick={onSharePortalLink}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-95"
                title="Copiar o enviar por WhatsApp el enlace de autogestión de citas para pacientes"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Link Autogestión WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </button>
            )}

            <button
              onClick={onQuickAppointment}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
              title="Agendar nueva cita médica"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-sky-600" />
              <span>Nueva Cita</span>
            </button>

            <button
              onClick={onQuickIntake}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
              style={{ backgroundColor: config.primaryColor || '#0B5ED7' }}
              title="Registrar ingreso / admisión inmediata con triaje"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ingreso Paciente</span>
            </button>
          </div>

        </div>
      </div>

      {/* LOWER ROW: MODULES BAR - ALWAYS VISIBLE ON SCREEN! */}
      <div className="bg-gradient-to-r from-slate-100/90 via-sky-50/50 to-slate-100/90 border-t border-slate-200/90 px-2 sm:px-4 py-1.5 overflow-x-auto no-scrollbar shadow-inner">
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
                    ? 'text-white shadow-md scale-102 ring-2 ring-white/60' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/90 border border-transparent hover:border-slate-300/80 shadow-2xs'
                }`}
                style={isActive ? { backgroundColor: config.primaryColor || '#0B5ED7' } : {}}
              >
                <Icon 
                  className={`w-4 h-4 transition-transform group-hover:scale-110 shrink-0 ${
                    isActive ? 'text-white' : ''
                  }`} 
                  style={!isActive ? { color: item.accentColor } : {}}
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
                        ? 'bg-white text-blue-700' 
                        : 'bg-rose-500 text-white animate-pulse'
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
