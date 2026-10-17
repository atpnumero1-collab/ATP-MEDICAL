import React, { useState, useEffect, useMemo } from 'react';
import { PatientIntake, ClinicConfig, Doctor } from '../../types';
import { TRIAGE_CONFIG } from '../../data/initialData';
import { 
  Tv, 
  Volume2, 
  Maximize2, 
  Minimize2, 
  Clock, 
  CheckCircle, 
  User, 
  ArrowRight,
  Radio,
  Sparkles
} from 'lucide-react';
import { chimePlayer } from '../../utils/audioChime';

interface WaitingRoomModuleProps {
  intakes: PatientIntake[];
  doctors: Doctor[];
  config: ClinicConfig;
  onUpdateIntakeStatus: (id: string, status: any) => void;
}

export const WaitingRoomModule: React.FC<WaitingRoomModuleProps> = ({
  intakes,
  doctors,
  config,
  onUpdateIntakeStatus
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep clock ticking every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Find the currently called patient (most recently called)
  const currentCalled = useMemo(() => {
    return intakes
      .filter(i => i.status === 'llamado')
      .sort((a, b) => new Date(b.calledAt || b.admissionTime).getTime() - new Date(a.calledAt || a.admissionTime).getTime())[0] || null;
  }, [intakes]);

  // Patients in waiting list
  const waitingList = useMemo(() => {
    return intakes
      .filter(i => i.status === 'en_espera' || i.status === 'en_triaje')
      .sort((a, b) => {
        if (a.priorityLevel !== b.priorityLevel) return a.priorityLevel - b.priorityLevel;
        return new Date(a.admissionTime).getTime() - new Date(b.admissionTime).getTime();
      });
  }, [intakes]);

  // Patients currently inside consultation room
  const inConsultationList = useMemo(() => {
    return intakes.filter(i => i.status === 'en_consulta');
  }, [intakes]);

  // Recently attended
  const recentAttended = useMemo(() => {
    return intakes
      .filter(i => i.status === 'atendido')
      .slice(0, 5);
  }, [intakes]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const playChime = () => {
    chimePlayer.playCallingChime();
  };

  const callNextInLine = () => {
    if (waitingList.length > 0) {
      const next = waitingList[0];
      if (config.enableAudioChime) {
        chimePlayer.playCallingChime();
      }
      onUpdateIntakeStatus(next.id, 'llamado');
    }
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'p-8 bg-slate-900 text-white min-h-screen fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      
      {/* Top Bar for Waiting Room */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border ${
        isFullscreen ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">
              Turnero Digital & Sala de Espera
            </h1>
            <span 
              className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              DISPLAY PÚBLICO
            </span>
          </div>
          <p className={`text-xs mt-1 ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>
            Pantalla de visualización en vivo para monitores de recepción y llamados a consultorios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live digital clock */}
          <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm tabular-nums flex items-center gap-2 ${
            isFullscreen ? 'bg-slate-900 border-slate-700 text-sky-400' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <Clock className="w-4 h-4 text-sky-500" />
            <span>{currentTime.toLocaleTimeString('es-ES')}</span>
          </div>

          <button
            onClick={playChime}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-colors"
            title="Probar sonido del timbre de llamada médica"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Timbre Chime</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isFullscreen 
                ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Salir Pantalla Completa</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Modo Pantalla TV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Display: CURRENTLY CALLED PATIENT */}
      <div 
        className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-white/10"
        style={{
          background: `linear-gradient(135deg, ${config.primaryColor} 0%, #0F2B5C 60%, ${config.accentColor} 100%)`
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-200">
                Llamando a Consultorio en Este Momento
              </span>
            </div>

            {currentCalled ? (
              <div>
                <div className="flex items-baseline gap-4 flex-wrap">
                  <span className="text-4xl sm:text-6xl font-black font-mono tracking-widest text-white drop-shadow-sm">
                    {currentCalled.ticketNumber}
                  </span>
                  <div className="text-xl sm:text-3xl font-extrabold text-cyan-100">
                    {currentCalled.patientName}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm sm:text-base flex-wrap text-cyan-100/90">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-md font-bold text-white flex items-center gap-1.5">
                    <span>{currentCalled.room}</span>
                  </div>
                  <span>·</span>
                  <span className="font-semibold text-white">{currentCalled.doctorName}</span>
                  <span>·</span>
                  <span>{currentCalled.specialty}</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white/90">
                  Esperando próximo paciente en turno...
                </div>
                <p className="text-xs text-cyan-200 mt-1">
                  Los pacientes son llamados por orden de triaje y llegada a recepción.
                </p>
              </div>
            )}
          </div>

          {/* Quick Action Button on the Big Display */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {currentCalled ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateIntakeStatus(currentCalled.id, 'en_consulta')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Pasar a Box / En Consulta</span>
                </button>
                <button
                  onClick={playChime}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-lg backdrop-blur-md transition-all flex items-center gap-1"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Re-sonar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={callNextInLine}
                disabled={waitingList.length === 0}
                className={`px-5 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-lg shadow-md hover:bg-cyan-50 transition-all flex items-center gap-2 ${
                  waitingList.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>Llamar Siguiente ({waitingList.length})</span>
                <ArrowRight className="w-4 h-4 text-sky-600" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Two Column Grid: Waiting Queue & Active Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Waiting Queue */}
        <div className={`lg:col-span-2 rounded-xl border overflow-hidden ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            isFullscreen ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold">
                Pacientes en Espera ({waitingList.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">Ordenado por Triaje & Llegada</span>
          </div>

          {waitingList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay pacientes en sala de espera en este momento.
            </div>
          ) : (
            <div className={`divide-y ${isFullscreen ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {waitingList.map((item, index) => {
                const triageInfo = TRIAGE_CONFIG[item.priorityLevel];
                const waitMin = Math.floor((Date.now() - new Date(item.admissionTime).getTime()) / 60000);

                return (
                  <div 
                    key={item.id} 
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                      isFullscreen ? 'hover:bg-slate-700/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isFullscreen ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{index + 1}
                      </div>

                      <div className="text-center w-14 shrink-0 py-1 bg-slate-100 rounded text-slate-900 border border-slate-200">
                        <span className="font-mono font-bold text-xs">{item.ticketNumber}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{item.patientName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded text-white ${triageInfo.colorBg}`}>
                            Triaje {item.priorityLevel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Asignado: <strong className="text-slate-600">{item.room}</strong> ({item.doctorName})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-[11px]">
                        <span className="text-slate-400">Espera:</span>
                        <div className="font-mono font-bold text-slate-700 tabular-nums">
                          {waitMin} min
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (config.enableAudioChime) chimePlayer.playCallingChime();
                          onUpdateIntakeStatus(item.id, 'llamado');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white rounded bg-sky-600 hover:bg-sky-500 shadow-xs"
                      >
                        Llamar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Active Consultations & Rooms */}
        <div className={`rounded-xl border overflow-hidden space-y-4 p-4 ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold">Consultorios en Atención</h2>
            </div>

            <div className="space-y-2">
              {doctors.map(doc => {
                const isOccupied = inConsultationList.some(i => i.doctorId === doc.id);
                const activeIntake = inConsultationList.find(i => i.doctorId === doc.id);

                return (
                  <div 
                    key={doc.id}
                    className={`p-3 rounded-lg border text-xs ${
                      isOccupied 
                        ? 'border-emerald-300 bg-emerald-50/50 text-slate-800' 
                        : isFullscreen ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{doc.room}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isOccupied ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {isOccupied ? 'EN CONSULTA' : 'DISPONIBLE'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1">
                      {doc.name} · {doc.specialty}
                    </div>

                    {activeIntake && (
                      <div className="mt-2 pt-1.5 border-t border-emerald-200/70 text-[11px] flex justify-between items-center text-emerald-900 font-semibold">
                        <span>Paciente: {activeIntake.patientName}</span>
                        <span className="font-mono text-xs">{activeIntake.ticketNumber}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
