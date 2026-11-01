import React, { useState } from 'react';
import { ClinicConfig, AppUser, AppModuleId, UserRole } from '../../types';
import { COLOR_PRESETS, ALL_MODULE_OPTIONS, ADMIN_DEFAULT_MODULES, MEDICO_DEFAULT_MODULES } from '../../data/initialData';
import { chimePlayer } from '../../utils/audioChime';
import { resetAllToInitial, exportFullBackup } from '../../utils/storage';
import { OfficialAtpLogo } from '../OfficialLogo';
import {
  connectGmailAccount,
  disconnectGmailAccount,
  hasActiveGmailToken,
  getConnectedGoogleEmail
} from '../../firebase/firebase';
import { 
  Palette, 
  Building2, 
  Volume2, 
  Save, 
  RotateCcw, 
  Download, 
  Check, 
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  UserPlus,
  Users,
  Trash2,
  Lock,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserManagementPanelProps {
  users: AppUser[];
  currentUser: AppUser;
  onSaveUser: (user: AppUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({
  users,
  currentUser,
  onSaveUser,
  onDeleteUser
}) => {
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('medico');
  const [newAllowedModules, setNewAllowedModules] = useState<AppModuleId[]>([...MEDICO_DEFAULT_MODULES]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [editingPasswords, setEditingPasswords] = useState<Record<string, string>>({});

  const handleRolePresetChange = (role: UserRole) => {
    setNewRole(role);
    if (role === 'admin') {
      setNewAllowedModules([...ADMIN_DEFAULT_MODULES]);
    } else {
      setNewAllowedModules([...MEDICO_DEFAULT_MODULES]);
    }
  };

  const toggleNewUserModule = (moduleId: AppModuleId) => {
    // Ajuste de colores ('settings') is strictly reserved for admins
    if (moduleId === 'settings' && newRole !== 'admin') return;
    if (moduleId === 'home') return; // Home is always enabled

    setNewAllowedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPassword.trim()) return;

    const generatedUsername =
      newUsername.trim() ||
      newName
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '.');

    const finalModules: AppModuleId[] =
      newRole === 'admin'
        ? Array.from(new Set([...newAllowedModules, 'home', 'settings']))
        : Array.from(new Set([...newAllowedModules.filter(m => m !== 'settings'), 'home']));

    const createdUser: AppUser = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      username: generatedUsername,
      password: newPassword.trim(),
      role: newRole,
      allowedModules: finalModules,
      isSystemDefault: false,
      createdAt: new Date().toISOString()
    };

    onSaveUser(createdUser);
    setNewName('');
    setNewUsername('');
    setNewPassword('');
    setNewRole('medico');
    setNewAllowedModules([...MEDICO_DEFAULT_MODULES]);
    setFeedbackMsg(`¡Usuario "${createdUser.name}" creado con su clave de acceso y módulos asignados!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSaveUserPassword = (targetUser: AppUser) => {
    const draftPwd = (editingPasswords[targetUser.id] ?? targetUser.password ?? '').trim();
    if (!draftPwd) return;
    onSaveUser({
      ...targetUser,
      password: draftPwd
    });
    setFeedbackMsg(`¡Clave de acceso actualizada para ${targetUser.name}!`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleToggleExistingUserModule = (targetUser: AppUser, moduleId: AppModuleId) => {
    if (moduleId === 'home') return; // Inicio siempre activo
    // El módulo Ajuste de Colores solo está permitido para Administradores
    if (moduleId === 'settings' && targetUser.role !== 'admin') return;

    const hasModule = targetUser.allowedModules.includes(moduleId);
    const updatedModules: AppModuleId[] = hasModule
      ? targetUser.allowedModules.filter(m => m !== moduleId)
      : [...targetUser.allowedModules, moduleId];

    onSaveUser({
      ...targetUser,
      allowedModules: updatedModules
    });
    setFeedbackMsg(`Permisos de módulos actualizados para ${targetUser.name}`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleChangeExistingUserRole = (targetUser: AppUser, nextRole: UserRole) => {
    const updatedModules: AppModuleId[] =
      nextRole === 'admin'
        ? Array.from(new Set([...targetUser.allowedModules, 'settings', 'reports']))
        : targetUser.allowedModules.filter(m => m !== 'settings');

    onSaveUser({
      ...targetUser,
      role: nextRole,
      allowedModules: updatedModules
    });
    setFeedbackMsg(`Rol actualizado para ${targetUser.name}`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-[#7DDACB] shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#151E3A] text-[#7DDACB] border border-[#7DDACB] flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[#151E3A]">
                Gestión de Usuarios, Claves y Permisos de Módulos
              </h2>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#151E3A] text-[#7DDACB]">
                EXCLUSIVO ADMINISTRADORES
              </span>
            </div>
            <p className="text-xs text-[#1F2952]/80 mt-0.5">
              Administradores autorizados: <b>Ivo Hernández</b> y <b>Carlos Flores</b>. Asigne claves de acceso y decida qué módulos verá cada usuario.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#F4F4F4] px-3 py-1.5 rounded-xl border border-[#1F2952]/15 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#395AFF]" />
          <span className="text-[#151E3A] font-bold">
            Sesión actual: <b className="text-[#395AFF]">{currentUser.name}</b>
          </span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-[#7DDACB]/25 border border-[#7DDACB] text-[#151E3A] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#151E3A] shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 cols: Create New User Form */}
        <form
          onSubmit={handleCreateUser}
          className="lg:col-span-5 bg-[#F4F4F4] p-4 rounded-xl border border-[#1F2952]/15 space-y-3.5 text-xs"
        >
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
            <UserPlus className="w-4 h-4 text-[#395AFF]" />
            <h3 className="font-black text-[#151E3A] text-sm">Crear Nuevo Usuario con Clave</h3>
          </div>

          <div>
            <label className="block font-bold text-[#151E3A] mb-1">
              Nombre y Apellido / Identificador del Usuario *
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Médico 2 o Dra. María Pérez"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-[#151E3A] font-bold text-xs focus:outline-hidden focus:ring-2 focus:ring-[#395AFF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#151E3A] mb-1">
                Usuario (Opcional)
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="ej: medico.2"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-[#151E3A] font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#151E3A] mb-1">
                Clave de Acceso (Contraseña) *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ej: medico2026"
                  className="w-full pl-3 pr-8 py-1.5 rounded-lg border border-slate-300 bg-white text-[#151E3A] font-mono font-bold text-xs focus:outline-hidden focus:ring-2 focus:ring-[#395AFF]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(v => !v)}
                  className="absolute right-2 text-slate-400 hover:text-[#151E3A] cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#151E3A] mb-1">
              Rol de Acceso *
            </label>
            <select
              value={newRole}
              onChange={(e) => handleRolePresetChange(e.target.value as UserRole)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-[#151E3A] font-bold text-xs"
            >
              <option value="medico">Médico (Sin Colores ni Métricas)</option>
              <option value="recepcion">Personal / Recepción</option>
              <option value="admin">Administrador (Acceso Total)</option>
            </select>
          </div>

          {/* Checkboxes for deciding which modules the new user will see */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-[#151E3A]">
                Módulos que verá este usuario:
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewAllowedModules([...MEDICO_DEFAULT_MODULES])}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-300 text-[#151E3A] hover:bg-slate-100 cursor-pointer"
                >
                  Perfil Médico
                </button>
                {newRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setNewAllowedModules([...ADMIN_DEFAULT_MODULES])}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#151E3A] text-[#7DDACB] cursor-pointer"
                  >
                    Todos
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white p-2.5 rounded-lg border border-slate-200 max-h-56 overflow-y-auto">
              {ALL_MODULE_OPTIONS.map(mod => {
                const isSettingsLocked = mod.id === 'settings' && newRole !== 'admin';
                const checked = isSettingsLocked ? false : newAllowedModules.includes(mod.id);

                return (
                  <label
                    key={mod.id}
                    className={`flex items-center gap-2 p-1.5 rounded-md border text-[11px] transition-colors ${
                      isSettingsLocked
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : checked
                          ? 'bg-[#7DDACB]/20 border-[#7DDACB] text-[#151E3A] font-bold cursor-pointer'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isSettingsLocked || mod.id === 'home'}
                      onChange={() => toggleNewUserModule(mod.id)}
                      className="rounded text-[#395AFF]"
                    />
                    <span className="truncate flex-1">{mod.label}</span>
                    {isSettingsLocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                  </label>
                );
              })}
            </div>
            <p className="text-[10px] text-[#1F2952]/70 mt-1">
              * El módulo «Ajuste de Colores» está reservado exclusivamente para usuarios Administradores.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#395AFF] hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#7DDACB]" />
            <span>Crear Usuario y Guardar Clave</span>
          </button>
        </form>

        {/* Right 7 cols: Active Users List, Password Editor & Module Checkboxes */}
        <div className="lg:col-span-7 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#151E3A] text-sm">
              Usuarios Registrados, Claves y Módulos ({users.length})
            </h3>
            <span className="text-[11px] text-slate-500">
              Edite claves o active/desactive módulos por usuario
            </span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {users.map(u => {
              const isProtectedAdmin = u.id === 'user-admin-ivo' || u.id === 'user-admin-carlos';
              const isPwdVisible = Boolean(visiblePasswords[u.id]);
              const currentDraftPwd = editingPasswords[u.id] ?? u.password ?? '';

              return (
                <div
                  key={u.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center ${
                          u.role === 'admin'
                            ? 'bg-[#151E3A] text-[#7DDACB] border border-[#7DDACB]'
                            : 'bg-[#395AFF]/15 text-[#395AFF]'
                        }`}
                      >
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#151E3A] text-xs">{u.name}</span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              u.role === 'admin'
                                ? 'bg-[#151E3A] text-[#7DDACB]'
                                : 'bg-[#7DDACB]/30 text-[#151E3A]'
                            }`}
                          >
                            {u.role === 'admin'
                              ? 'Administrador'
                              : u.role === 'medico'
                                ? 'Médico'
                                : 'Personal'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          @{u.username} · {u.allowedModules.length} módulos activos
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isProtectedAdmin && (
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeExistingUserRole(u, e.target.value as UserRole)}
                          className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] font-bold text-[#151E3A]"
                        >
                          <option value="medico">Rol: Médico</option>
                          <option value="recepcion">Rol: Personal</option>
                          <option value="admin">Rol: Administrador</option>
                        </select>
                      )}

                      {!u.isSystemDefault && (
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u.id)}
                          title="Eliminar usuario"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Password Editor Row for this User */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F4F4F4] px-3 py-2 rounded-lg border border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#151E3A]">
                      <KeyRound className="w-3.5 h-3.5 text-[#395AFF]" />
                      <span>Clave de acceso:</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-1 sm:flex-initial justify-end">
                      <div className="relative flex items-center">
                        <input
                          type={isPwdVisible ? 'text' : 'password'}
                          value={currentDraftPwd}
                          onChange={(e) =>
                            setEditingPasswords(prev => ({
                              ...prev,
                              [u.id]: e.target.value
                            }))
                          }
                          className="w-36 sm:w-44 pl-2.5 pr-7 py-1 rounded border border-slate-300 bg-white text-[#151E3A] font-mono font-bold text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setVisiblePasswords(prev => ({
                              ...prev,
                              [u.id]: !prev[u.id]
                            }))
                          }
                          className="absolute right-2 text-slate-400 hover:text-[#151E3A] cursor-pointer"
                          title={isPwdVisible ? 'Ocultar clave' : 'Ver clave'}
                        >
                          {isPwdVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveUserPassword(u)}
                        className="px-2.5 py-1 rounded bg-[#151E3A] hover:bg-[#395AFF] text-[#7DDACB] hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Guardar Clave
                      </button>
                    </div>
                  </div>

                  {/* Module checkboxes for this user */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {ALL_MODULE_OPTIONS.map(mod => {
                      const isLockedForNonAdmin = mod.id === 'settings' && u.role !== 'admin';
                      const isChecked = isLockedForNonAdmin
                        ? false
                        : u.allowedModules.includes(mod.id);

                      return (
                        <label
                          key={mod.id}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] select-none ${
                            isLockedForNonAdmin
                              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                              : isChecked
                                ? 'bg-[#7DDACB]/20 border-[#7DDACB] text-[#151E3A] font-bold cursor-pointer'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isLockedForNonAdmin || mod.id === 'home' || (isProtectedAdmin && mod.id === 'settings')}
                            onChange={() => handleToggleExistingUserModule(u, mod.id)}
                            className="rounded text-[#395AFF]"
                          />
                          <span className="truncate">{mod.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SettingsModuleProps {
  config: ClinicConfig;
  onUpdateConfig: (newConfig: ClinicConfig) => void;
  onResetData: () => void;
  users: AppUser[];
  currentUser: AppUser;
  onSaveUser: (user: AppUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  config,
  onUpdateConfig,
  onResetData,
  users,
  currentUser,
  onSaveUser,
  onDeleteUser
}) => {
  const [localConfig, setLocalConfig] = useState<ClinicConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [gmailAuthEmail, setGmailAuthEmail] = useState<string>(
    getConnectedGoogleEmail() || config.connectedGmailAccount || config.email || 'atpnumero1@gmail.com'
  );
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [gmailStatusMsg, setGmailStatusMsg] = useState<string | null>(null);

  const handleConnectGmail = async () => {
    setIsConnectingGmail(true);
    setGmailStatusMsg(null);
    try {
      const { email } = await connectGmailAccount(localConfig.connectedGmailAccount || localConfig.email || 'atpnumero1@gmail.com');
      setGmailAuthEmail(email);
      const updated = {
        ...localConfig,
        connectedGmailAccount: email
      };
      setLocalConfig(updated);
      onUpdateConfig(updated);
      setGmailStatusMsg(`¡Cuenta ${email} vinculada con permiso de envío interno de Gmail!`);
    } catch (err: any) {
      setGmailStatusMsg(err?.message || 'No se completó la autorización del correo.');
    } finally {
      setIsConnectingGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    await disconnectGmailAccount();
    setGmailStatusMsg('Sesión de envío directo cerrada.');
  };

  // Apply a preset
  const handleSelectPreset = (preset: typeof COLOR_PRESETS[0]) => {
    const updated = {
      ...localConfig,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      secondaryColor: preset.secondary,
      activePresetId: preset.id
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    resetAllToInitial();
    onResetData();
  };

  return (
    <div className="space-y-6">
      
      {/* Header - Official ATP Medical Brand Identity */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border-l-4 border-[#395AFF] border border-[#1F2952]/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#151E3A] border border-[#7DDACB] text-[#7DDACB] flex items-center justify-center shadow-md shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#151E3A] tracking-tight">
                Manual de Colores & Identidad MEDICAL
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1F2952] text-[#7DDACB] font-mono">
                SOLO ADMINISTRADORES (IVO HERNÁNDEZ · CARLOS FLORES)
              </span>
            </div>
            <p className="text-xs text-[#1F2952]/80 mt-1">
              Módulo exclusivo de administración: Ajuste de colores corporativos, creación de usuarios y asignación de módulos visibles.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7DDACB]/25 border border-[#7DDACB] text-[#151E3A] text-xs font-bold rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-[#151E3A]" />
            <span>¡Configuración y colores actualizados!</span>
          </div>
        )}
      </div>

      {/* User Creation & Module Visibility Management Panel for Admins */}
      <UserManagementPanel
        users={users}
        currentUser={currentUser}
        onSaveUser={onSaveUser}
        onDeleteUser={onDeleteUser}
      />

      {/* Official Logo & 5-Color Swatch Banner from PDF Documents */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1F2952]/15 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-48 h-16 px-3 py-1.5 rounded-xl overflow-hidden border-2 border-[#7DDACB] bg-[#F4F4F4] flex items-center justify-center shadow-sm shrink-0">
              <OfficialAtpLogo className="w-full h-full" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#151E3A] text-[#7DDACB] inline-block mb-1">
                LOGO OFICIAL ACTIVO
              </span>
              <h3 className="text-sm font-black text-[#151E3A]">
                Logo e Identidad Gráfica Oficial ATP MEDICAL
              </h3>
              <p className="text-xs text-[#1F2952]/80">
                Logo oficial integrado en barra principal, portal de pacientes, tickets e informes médicos en PDF.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-extrabold text-[#151E3A] uppercase tracking-wider block">
              Códigos Oficiales del Manual Corporativo
            </span>
            <span className="text-[11px] font-mono text-[#395AFF] font-bold">
              #151E3A · #1F2952 · #7DDACB · #F4F4F4 · #395AFF
            </span>
          </div>
        </div>
        <div className="grid grid-cols-5 rounded-xl overflow-hidden border border-[#1F2952]/20 h-20 shadow-xs font-mono text-xs font-extrabold">
          <div className="bg-[#151E3A] text-white flex flex-col items-center justify-end pb-2.5">
            <span>#151E3A</span>
          </div>
          <div className="bg-[#1F2952] text-white flex flex-col items-center justify-end pb-2.5">
            <span>#1F2952</span>
          </div>
          <div className="bg-[#7DDACB] text-[#151E3A] flex flex-col items-center justify-end pb-2.5">
            <span>#7DDACB</span>
          </div>
          <div className="bg-[#F4F4F4] text-[#151E3A] flex flex-col items-center justify-end pb-2.5 border-x border-[#1F2952]/10">
            <span>#F4F4F4</span>
          </div>
          <div className="bg-[#395AFF] text-white flex flex-col items-center justify-end pb-2.5">
            <span>#395AFF</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Brand Colors and Presets */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Preset Palettes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette className="w-4 h-4 text-[#395AFF]" />
              <div>
                <h2 className="text-sm font-bold text-[#151E3A]">Variantes de Aplicación Oficial</h2>
                <p className="text-[11px] text-slate-500">
                  Seleccione la distribución de los 5 colores oficiales o ajuste cada código hexadecimal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COLOR_PRESETS.map(preset => {
                const isSelected = localConfig.primaryColor === preset.primary && localConfig.accentColor === preset.accent;

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-sky-500 bg-sky-50/40 ring-2 ring-sky-500/20 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 font-bold" />}
                    </div>

                    {/* Color Swatch Bars */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <div 
                        className="h-6 flex-1 rounded flex items-center justify-center text-[10px] text-white font-mono font-bold"
                        style={{ backgroundColor: preset.primary }}
                        title="Color Primario"
                      >
                        {preset.primary}
                      </div>
                      <div 
                        className="h-6 flex-1 rounded flex items-center justify-center text-[10px] text-white font-mono font-bold"
                        style={{ backgroundColor: preset.accent }}
                        title="Color de Acento"
                      >
                        {preset.accent}
                      </div>
                      <div 
                        className="h-6 w-8 rounded flex items-center justify-center text-[10px] text-white font-mono font-bold"
                        style={{ backgroundColor: preset.secondary }}
                        title="Color Secundario"
                      />
                    </div>

                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Custom Hex Color Pickers */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 mb-2.5">
                Ajuste Manual de Valores Hexadecimales
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Color Primario (Marino)
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={localConfig.primaryColor}
                      onChange={(e) => setLocalConfig({ ...localConfig, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <input 
                      type="text" 
                      value={localConfig.primaryColor}
                      onChange={(e) => setLocalConfig({ ...localConfig, primaryColor: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded font-mono font-bold bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Color Acento (Cian ATP)
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={localConfig.accentColor}
                      onChange={(e) => setLocalConfig({ ...localConfig, accentColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <input 
                      type="text" 
                      value={localConfig.accentColor}
                      onChange={(e) => setLocalConfig({ ...localConfig, accentColor: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded font-mono font-bold bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Color Secundario (Salud)
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={localConfig.secondaryColor}
                      onChange={(e) => setLocalConfig({ ...localConfig, secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <input 
                      type="text" 
                      value={localConfig.secondaryColor}
                      onChange={(e) => setLocalConfig({ ...localConfig, secondaryColor: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded font-mono font-bold bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Live Component Preview */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Vista Previa en Tiempo Real de la Interfaz</span>
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg text-white" style={{ backgroundColor: localConfig.primaryColor }}>
                <span className="font-bold text-xs">{localConfig.clinicName} — Encabezado Principal</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/20 font-mono">Box 101</span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white rounded-md shadow-xs"
                  style={{ backgroundColor: localConfig.accentColor }}
                >
                  Botón Primario / Acento
                </button>
                <button 
                  type="button"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white rounded-md shadow-xs"
                  style={{ backgroundColor: localConfig.secondaryColor }}
                >
                  Acción Secundaria
                </button>
                <span 
                  className="text-xs font-bold"
                  style={{ color: localConfig.accentColor }}
                >
                  Enlace Clínico Destacado
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 5 Cols: Clinic Information & Audio Chime */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Clinic Details */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">Datos de la Institución</h2>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nombre de la Clínica *</label>
              <input
                type="text"
                required
                value={localConfig.clinicName}
                onChange={(e) => setLocalConfig({ ...localConfig, clinicName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nombre de la Sede / Sucursal</label>
              <input
                type="text"
                value={localConfig.branchName}
                onChange={(e) => setLocalConfig({ ...localConfig, branchName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lema o Subtítulo Institucional</label>
              <input
                type="text"
                value={localConfig.slogan}
                onChange={(e) => setLocalConfig({ ...localConfig, slogan: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico Oficial</label>
              <input
                type="email"
                value={localConfig.email}
                onChange={(e) => setLocalConfig({ ...localConfig, email: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Teléfono de Central</label>
              <input
                type="text"
                value={localConfig.phone}
                onChange={(e) => setLocalConfig({ ...localConfig, phone: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Dirección Física</label>
              <input
                type="text"
                value={localConfig.address}
                onChange={(e) => setLocalConfig({ ...localConfig, address: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
              />
            </div>

            {/* Audio Chime Setting */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 text-xs block">Timbre Sonoro de Llamada</span>
                  <span className="text-[11px] text-slate-400">Sonido de hospital al llamar a un paciente</span>
                </div>
                <input
                  type="checkbox"
                  checked={localConfig.enableAudioChime}
                  onChange={(e) => setLocalConfig({ ...localConfig, enableAudioChime: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                />
              </div>

              <button
                type="button"
                onClick={() => chimePlayer.playCallingChime()}
                className="flex items-center gap-1.5 px-3 py-1 text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Probar Chime Ahora</span>
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg text-white font-bold text-xs shadow-xs hover:opacity-95 flex items-center justify-center gap-1.5"
                style={{ backgroundColor: localConfig.primaryColor }}
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios de Configuración</span>
              </button>
            </div>

          </div>

          {/* Configuración de Envío Interno: Correo Asociado (Gmail) & WhatsApp */}
          <div className="bg-white p-5 rounded-xl border-2 border-[#7DDACB] shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#395AFF]" />
                <div>
                  <h2 className="text-sm font-black text-[#151E3A]">
                    Envío Interno de Correo & WhatsApp (Sin salir de la App)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Vincule el correo oficial de la cuenta y configure el despacho directo de informes en PDF.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#151E3A] text-[#7DDACB]">
                INTERNO
              </span>
            </div>

            {/* 1. Gmail Associated Account Configuration */}
            <div className="p-3.5 rounded-xl bg-[#151E3A] text-white space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7DDACB] block">
                    1. Cuenta de Correo Gmail Asociada
                  </span>
                  <span className="font-mono font-bold text-xs text-white">
                    {gmailAuthEmail}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    hasActiveGmailToken() || getConnectedGoogleEmail()
                      ? 'bg-[#7DDACB] text-[#151E3A]'
                      : 'bg-white/15 text-[#7DDACB]'
                  }`}
                >
                  {hasActiveGmailToken() || getConnectedGoogleEmail()
                    ? '✓ Permiso Activo'
                    : 'Listo para vincular'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-[#7DDACB] font-semibold mb-1">
                  Correo Gmail predeterminado para envío de informes PDF:
                </label>
                <input
                  type="email"
                  value={localConfig.connectedGmailAccount || localConfig.email}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      connectedGmailAccount: e.target.value,
                      email: e.target.value
                    })
                  }
                  placeholder="atpnumero1@gmail.com"
                  className="w-full px-3 py-1.5 rounded-lg bg-white text-[#151E3A] font-mono font-bold text-xs"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[#1F2952] border border-[#7DDACB]/30 text-[11px] text-[#F4F4F4]/90 leading-relaxed">
                <b className="text-[#7DDACB]">¿Qué permiso debes dar en tu correo?</b> Al pulsar{' '}
                <b>«Autorizar Correo Gmail Asociado»</b>, Google te pedirá confirmar únicamente el permiso{' '}
                <span className="underline font-semibold text-white">
                  «Enviar correos electrónicos en tu nombre»
                </span>
                . Con esto la app adjunta y envía el informe PDF desde adentro sin redirigirte a otra página.
              </div>

              {gmailStatusMsg && (
                <div className="p-2 rounded-lg bg-[#7DDACB]/20 border border-[#7DDACB] text-[#7DDACB] font-bold text-[11px]">
                  {gmailStatusMsg}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConnectGmail}
                  disabled={isConnectingGmail}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#395AFF] hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5 text-[#7DDACB]" />
                  <span>
                    {isConnectingGmail
                      ? 'Autorizando...'
                      : 'Autorizar Correo Gmail Asociado'}
                  </span>
                </button>
                {(hasActiveGmailToken() || getConnectedGoogleEmail()) && (
                  <button
                    type="button"
                    onClick={handleDisconnectGmail}
                    className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                  >
                    Desvincular
                  </button>
                )}
              </div>
            </div>

            {/* 2. WhatsApp Internal Configuration */}
            <div className="p-3.5 rounded-xl bg-[#F4F4F4] border border-[#1F2952]/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#151E3A] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#395AFF]" />
                  <span>2. Configuración de WhatsApp Interno (WhatsApp Business API)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#7DDACB] text-[#151E3A]">
                  Ventana Interna Activa
                </span>
              </div>

              <p className="text-[11px] text-[#1F2952]/85 leading-relaxed">
                La ventana de WhatsApp ahora funciona 100% dentro de la aplicación. Si además cuenta con credenciales de{' '}
                <b>Meta WhatsApp Business Cloud API</b>, ingréselas aquí para despacho directo en la nube:
              </p>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#151E3A] mb-0.5">
                    Phone Number ID (Identificador de Número WhatsApp Business)
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional: Ej. 105928374651928"
                    value={localConfig.whatsappPhoneNumberId || ''}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, whatsappPhoneNumberId: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-[#151E3A] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#151E3A] mb-0.5">
                    Token de Acceso Permanente (Meta Graph API)
                  </label>
                  <input
                    type="password"
                    placeholder="Opcional: EAAGm0PX4ZCps..."
                    value={localConfig.whatsappAccessToken || ''}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, whatsappAccessToken: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-[#151E3A] font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Backup & System Reset */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Gestión de Base de Datos & Respaldo
            </h2>
            <p className="text-slate-500 text-[11px]">
              La información está sincronizada en tiempo real con Firebase Firestore. Puede exportar un respaldo completo o limpiar datos de prueba dejando únicamente a los médicos oficiales.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={exportFullBackup}
                className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-1.5 px-3 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar Datos de Prueba</span>
              </button>
            </div>
          </div>


        </div>

      </form>

    </div>
  );
};
