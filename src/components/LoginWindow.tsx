import React, { useState } from 'react';
import { AppUser, ClinicConfig } from '../types';
import { OfficialAtpLogo } from './OfficialLogo';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Stethoscope,
  Building2,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { INITIAL_USERS } from '../data/initialData';

interface LoginWindowProps {
  users: AppUser[];
  config: ClinicConfig;
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginWindow: React.FC<LoginWindowProps> = ({
  users,
  config,
  onLoginSuccess
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizeText = (val: string) =>
    val
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = normalizeText(usernameInput);
    const cleanPassword = passwordInput.trim();

    if (!cleanUser || !cleanPassword) {
      setErrorMessage('Por favor ingrese su usuario y contraseña.');
      return;
    }

    // Match by username, full name, or id
    const matchedUser = users.find((u) => {
      const uName = normalizeText(u.name);
      const uLogin = normalizeText(u.username);
      const uLoginDotsReplaced = uLogin.replace(/\./g, ' ');
      return (
        uLogin === cleanUser ||
        uName === cleanUser ||
        uLoginDotsReplaced === cleanUser ||
        u.id.toLowerCase() === cleanUser
      );
    });

    if (!matchedUser) {
      setErrorMessage('Usuario no encontrado. Verifique el nombre o usuario ingresado.');
      return;
    }

    const defaultMatch = INITIAL_USERS.find((d) => d.id === matchedUser.id);
    const expectedPassword = (matchedUser.password || defaultMatch?.password || '').trim();

    if (cleanPassword !== expectedPassword) {
      setErrorMessage('Contraseña incorrecta. Verifique su clave de acceso e intente nuevamente.');
      return;
    }

    onLoginSuccess(matchedUser);
  };

  const handleSelectQuickUser = (u: AppUser) => {
    setUsernameInput(u.username);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#151E3A] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Subtle Decorative Institutional Background Accents */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#395AFF]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#7DDACB]/15 blur-3xl" />

      {/* Top Institutional Bar */}
      <header className="w-full border-b border-[#1F2952] bg-[#151E3A]/90 backdrop-blur-xs z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#7DDACB] shrink-0" />
            <span className="font-bold text-white">{config.clinicName || 'ATP Medical'}</span>
            <span className="hidden sm:inline text-white/50">·</span>
            <span className="hidden sm:inline text-[#7DDACB] font-medium">
              C.C. Parque Humboldt, Caracas
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7DDACB]">
            <ShieldCheck className="w-4 h-4" />
            <span>Acceso Clínico Autorizado</span>
          </div>
        </div>
      </header>

      {/* Main Centered Login Window Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-[#7DDACB] overflow-hidden">
          {/* Card Header with Official ATP Logo */}
          <div className="bg-[#151E3A] px-6 py-6 text-center border-b-4 border-[#7DDACB] relative">
            <div className="w-48 h-16 mx-auto px-3 py-1.5 rounded-2xl bg-[#F4F4F4] border-2 border-[#7DDACB] flex items-center justify-center shadow-md mb-3">
              <OfficialAtpLogo className="w-full h-full" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1F2952] border border-[#7DDACB]/40 text-[#7DDACB] text-[10px] font-extrabold uppercase tracking-widest">
              <KeyRound className="w-3 h-3" />
              Ventana de Acceso al Sistema
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white mt-2">
              Iniciar Sesión Clínica
            </h1>
            <p className="text-xs text-white/75 mt-0.5">
              Ingrese su usuario y contraseña para acceder a sus módulos
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Quick User Selector Pills */}
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1F2952]/75 mb-1.5">
                Perfiles registrados (clic para autocompletar usuario):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {users.map((u) => {
                  const isSelected =
                    normalizeText(usernameInput) === normalizeText(u.username) ||
                    normalizeText(usernameInput) === normalizeText(u.name);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectQuickUser(u)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#151E3A] text-[#7DDACB] border-[#151E3A] shadow-xs'
                          : 'bg-[#F4F4F4] text-[#151E3A] border-slate-200 hover:border-[#395AFF]'
                      }`}
                    >
                      {u.role === 'admin' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#7DDACB] shrink-0" />
                      ) : (
                        <Stethoscope className="w-3.5 h-3.5 text-[#395AFF] shrink-0" />
                      )}
                      <span>{u.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-xs font-black text-[#151E3A] mb-1.5">
                Usuario o Nombre *
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-[#1F2952]/60 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ej: ivo.hernandez, carlos.flores o medico.1"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-[#F4F4F4] focus:bg-white text-[#151E3A] font-bold text-xs focus:outline-hidden focus:border-[#395AFF] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-black text-[#151E3A] mb-1.5">
                Contraseña (Clave de Acceso) *
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#1F2952]/60 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ingrese su contraseña..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-200 bg-[#F4F4F4] focus:bg-white text-[#151E3A] font-mono font-bold text-xs focus:outline-hidden focus:border-[#395AFF] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-slate-400 hover:text-[#151E3A] p-1 cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Login Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-[#395AFF] hover:brightness-110 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#7DDACB]" />
              <span>Ingresar al Sistema Clínico</span>
            </button>
          </form>

          {/* Card Footer */}
          <div className="bg-[#F4F4F4] px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-[#1F2952]">
            <span className="font-bold">Salud y Bienestar · ATP Medical</span>
            <span className="font-mono text-[10px] text-[#1F2952]/75">Acceso Protegido</span>
          </div>
        </div>
      </main>

      {/* Bottom Institutional Bar */}
      <footer className="w-full py-3 text-center text-[11px] text-white/60 border-t border-[#1F2952] z-10">
        ATP Medical Gestión Clínica · Centro Comercial Parque Humboldt, Caracas
      </footer>
    </div>
  );
};
