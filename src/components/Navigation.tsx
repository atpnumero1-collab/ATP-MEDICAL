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
  CalendarPlus,
  ShieldCheck,
  UserCog,
  KeyRound,
  LogOut
} from 'lucide-react';
import { ClinicConfig, AppUser, AppModuleId } from '../types';
import { OfficialAtpLogo } from './OfficialLogo';

export type ActiveModule = AppModuleId;

interface NavigationProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  config: ClinicConfig;
  onQuickIntake: () => void;
  onQuickAppointment: () => void;
  onSharePortalLink?: () => void;
  pendingIntakesCount: number;
  currentUser: AppUser;
  users: AppUser[];
  onSelectUser: (userId: string) => void;
  onOpenUserManagement?: () => void;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeModule,
  setActiveModule,
  config,
  onQuickIntake,
  onQuickAppointment,
  onSharePortalLink,
  pendingIntakesCount,
  currentUser,
  users,
  onSelectUser,
  onOpenUserManagement,
  onLogout
}) => {
  const allNavItems = [
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

  // Filter modules based on current user's allowedModules AND enforce that 'settings' (Ajuste de Colores) is exclusively for administrators
  const visibleNavItems = allNavItems.filter((item) => {
    if (item.id === 'settings' && currentUser.role !== 'admin') {
      return false;
    }
    return currentUser.allowedModules.includes(item.id);
  });

  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#151E3A] text-white border-b border-[#1F2952] shadow-lg">
      {/* Upper Brand, Active User Selector & Quick Actions Row (#151E3A) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-16 py-1.5 flex-wrap">
          
          {/* Brand Zone with High-Resolution Vector Official Siglas */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              className="w-32 sm:w-44 h-12 px-2.5 py-1 rounded-xl overflow-hidden border-2 border-[#7DDACB] flex items-center justify-center shadow-md cursor-pointer hover:brightness-105 transition-all bg-[#F4F4F4] shrink-0"
              onClick={() => setActiveModule('home')}
              title="Inicio · C.C. Parque Humboldt, Caracas"
            >
              <OfficialAtpLogo className="w-full h-full" />
            </div>

            {/* Active User Profile Selector & Role Badge (Protected by Password) */}
            <div className="flex items-center gap-1.5 bg-[#1F2952] border border-[#7DDACB]/40 rounded-xl px-2.5 py-1.5 shadow-sm">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                  isAdmin ? 'bg-[#7DDACB] text-[#151E3A]' : 'bg-[#395AFF] text-white'
                }`}
                title={isAdmin ? 'Usuario Administrador' : 'Usuario Médico'}
              >
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#7DDACB] leading-none flex items-center gap-1">
                  <span>{isAdmin ? 'Administrador Activo' : currentUser.role === 'medico' ? 'Perfil Médico' : 'Usuario Activo'}</span>
                  <KeyRound className="w-2.5 h-2.5 text-[#7DDACB]" />
                </span>
                <select
                  value={currentUser.id}
                  onChange={(e) => onSelectUser(e.target.value)}
                  className="bg-transparent text-white font-black text-xs focus:outline-hidden cursor-pointer pr-1 mt-0.5"
                  title="Cambiar usuario (Requiere clave de acceso)"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="bg-[#151E3A] text-white font-bold">
                      🔒 {u.name} ({u.role === 'admin' ? 'Admin' : u.role === 'medico' ? 'Médico' : 'Personal'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => onSelectUser(currentUser.id)}
                className="px-2 py-1 rounded-lg bg-[#151E3A] hover:bg-[#151E3A]/80 border border-[#7DDACB]/40 text-[#7DDACB] text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all"
                title="Cambiar usuario con clave de acceso"
              >
                <KeyRound className="w-3 h-3" />
                <span className="hidden xl:inline">Cambiar Usuario</span>
              </button>

              {isAdmin && onOpenUserManagement && (
                <button
                  type="button"
                  onClick={onOpenUserManagement}
                  className="ml-0.5 px-2 py-1 rounded-lg bg-[#395AFF] hover:brightness-110 text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all"
                  title="Crear usuarios, claves y decidir qué módulos verán (Exclusivo Administradores: Ivo Hernández y Carlos Flores)"
                >
                  <UserCog className="w-3.5 h-3.5 text-[#7DDACB]" />
                  <span className="hidden lg:inline">Usuarios y Claves</span>
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-0.5 px-2 py-1 rounded-lg bg-[#151E3A] hover:bg-rose-600/90 border border-[#7DDACB]/30 hover:border-rose-400 text-[#F4F4F4] text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all"
                  title="Cerrar sesión y volver a la ventana de acceso"
                >
                  <LogOut className="w-3 h-3 text-[#7DDACB]" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions (WhatsApp Patient Link #7DDACB, New Appointment #1F2952, Admission #395AFF) */}
          <div className="flex items-center gap-2 shrink-0">
            {onSharePortalLink && (
              <button
                type="button"
                onClick={onSharePortalLink}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-[#151E3A] bg-[#7DDACB] hover:brightness-105 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer"
                title="Enviar por WhatsApp o Correo el enlace de autogestión de citas para pacientes"
              >
                <Share2 className="w-3.5 h-3.5 text-[#151E3A]" />
                <span className="hidden sm:inline">Link Autogestión</span>
                <span className="sm:hidden">Link</span>
              </button>
            )}

            {currentUser.allowedModules.includes('appointments') && (
              <button
                onClick={onQuickAppointment}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#1F2952] hover:bg-[#1F2952]/80 border border-[#7DDACB]/40 rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                title="Agendar nueva cita médica"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-[#7DDACB]" />
                <span>Nueva Cita</span>
              </button>
            )}

            {currentUser.allowedModules.includes('tickets') && (
              <button
                onClick={onQuickIntake}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#395AFF] hover:brightness-110 rounded-lg shadow-md active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                title="Registrar ingreso / admisión inmediata con triaje"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#7DDACB]" />
                <span>Ingreso Paciente</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* LOWER ROW: MODULES BAR - FILTERED BY USER ROLE & ALLOWED MODULES (#1F2952 with #395AFF active & #7DDACB accents) */}
      <div className="bg-[#1F2952] border-t border-[#7DDACB]/25 px-2 sm:px-4 py-1.5 overflow-x-auto no-scrollbar shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-between gap-1 sm:gap-2">
          {visibleNavItems.map((item) => {
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

