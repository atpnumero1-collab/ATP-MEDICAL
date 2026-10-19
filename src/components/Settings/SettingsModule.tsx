import React, { useState } from 'react';
import { ClinicConfig } from '../../types';
import { COLOR_PRESETS } from '../../data/initialData';
import { chimePlayer } from '../../utils/audioChime';
import { resetAllToInitial, exportFullBackup } from '../../utils/storage';
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
  MapPin
} from 'lucide-react';

interface SettingsModuleProps {
  config: ClinicConfig;
  onUpdateConfig: (newConfig: ClinicConfig) => void;
  onResetData: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  config,
  onUpdateConfig,
  onResetData
}) => {
  const [localConfig, setLocalConfig] = useState<ClinicConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    if (window.confirm('¿Está seguro de reiniciar los datos a la configuración inicial de ATP Medical? Se restablecerán citas y pacientes demo.')) {
      resetAllToInitial();
      onResetData();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header - Vanguard Settings & Brand Identity */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Ajuste de Colores & Identidad Institucional
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                ATP MEDICAL CARACAS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Personalización de la paleta cromática clínica, datos de contacto de la sede y sonido de turnero asistencial.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>¡Configuración y colores actualizados!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Brand Colors and Presets */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Preset Palettes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette className="w-4 h-4 text-sky-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Paletas Oficiales ATP MEDICAL</h2>
                <p className="text-[11px] text-slate-500">
                  Seleccione una de las paletas clínicas calibradas para máxima legibilidad médica.
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
