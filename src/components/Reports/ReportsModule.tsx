import React, { useMemo } from 'react';
import { Appointment, PatientIntake, Patient, Doctor, ClinicConfig } from '../../types';
import { TRIAGE_CONFIG, getTodayDateString } from '../../data/initialData';
import { exportFullBackup } from '../../utils/storage';
import { 
  BarChart3, 
  Download, 
  Printer, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  Activity, 
  FileSpreadsheet
} from 'lucide-react';

interface ReportsModuleProps {
  appointments: Appointment[];
  intakes: PatientIntake[];
  patients: Patient[];
  doctors: Doctor[];
  config: ClinicConfig;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  appointments,
  intakes,
  patients,
  doctors,
  config
}) => {
  const todayStr = getTodayDateString();

  // Metrics calculation
  const metrics = useMemo(() => {
    const todayApts = appointments.filter(a => a.date === todayStr);
    const completedApts = todayApts.filter(a => a.status === 'completada').length;
    const inClinicApts = todayApts.filter(a => a.status === 'en_consulta' || a.status === 'en_espera').length;
    const cancelledApts = todayApts.filter(a => a.status === 'cancelada').length;
    
    // Average wait time
    let totalWaitMin = 0;
    intakes.forEach(i => {
      const wait = Math.max(5, Math.floor((Date.now() - new Date(i.admissionTime).getTime()) / 60000));
      totalWaitMin += wait;
    });
    const avgWaitMin = intakes.length > 0 ? Math.round(totalWaitMin / intakes.length) : 15;

    // Attendance rate
    const totalScheduled = todayApts.length;
    const attendedOrPresent = completedApts + inClinicApts;
    const attendanceRate = totalScheduled > 0 ? Math.round((attendedOrPresent / totalScheduled) * 100) : 100;

    return {
      todayCount: totalScheduled,
      completedApts,
      inClinicApts,
      cancelledApts,
      avgWaitMin,
      attendanceRate,
      admittedToday: intakes.length
    };
  }, [appointments, intakes, todayStr]);

  // Specialty breakdown
  const specialtyStats = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => {
      counts[a.specialty] = (counts[a.specialty] || 0) + 1;
    });
    const total = appointments.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
  }, [appointments]);

  // Triage breakdown
  const triageStats = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    intakes.forEach(i => {
      counts[i.priorityLevel] = (counts[i.priorityLevel] || 0) + 1;
    });
    const total = intakes.length || 1;
    return [1, 2, 3, 4, 5].map(lvl => ({
      level: lvl,
      info: TRIAGE_CONFIG[lvl as 1 | 2 | 3 | 4 | 5],
      count: counts[lvl] || 0,
      pct: Math.round(((counts[lvl] || 0) / total) * 100)
    }));
  }, [intakes]);

  // Export Appointments to CSV
  const exportAppointmentsCsv = () => {
    const headers = ['ID', 'Fecha', 'Hora', 'Paciente', 'DNI', 'Telefono', 'Doctor', 'Especialidad', 'Tipo', 'Estado', 'Motivo'];
    const rows = appointments.map(a => [
      a.id,
      a.date,
      a.time,
      `"${a.patientName}"`,
      a.patientDni,
      a.patientPhone,
      `"${a.doctorName}"`,
      `"${a.specialty}"`,
      `"${a.type}"`,
      a.status,
      `"${a.reason}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATP_MEDICAL_Citas_${todayStr}.csv`;
    link.click();
  };

  // Export Intakes to CSV
  const exportIntakesCsv = () => {
    const headers = ['Ticket', 'Hora Ingreso', 'Paciente', 'DNI', 'Edad', 'Doctor', 'Consultorio', 'Triaje Nivel', 'PA Sist', 'PA Diast', 'FC', 'Temp', 'SpO2', 'IMC', 'Estado', 'Motivo'];
    const rows = intakes.map(i => [
      i.ticketNumber,
      i.admissionTime,
      `"${i.patientName}"`,
      i.patientDni,
      i.patientAge,
      `"${i.doctorName}"`,
      `"${i.room}"`,
      i.priorityLevel,
      i.vitals.systolic,
      i.vitals.diastolic,
      i.vitals.heartRate,
      i.vitals.temperature,
      i.vitals.spo2,
      i.vitals.bmi || '',
      i.status,
      `"${i.chiefComplaint}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATP_MEDICAL_Ingresos_Triaje_${todayStr}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header - Vanguard Reports & Clinical Metrics */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white flex items-center justify-center shadow-md shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Reportes & Métricas Clínicas
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 font-mono">
                Analítica Asistencial
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Indicadores de flujo de pacientes, tasa de cumplimiento de citas, triaje clínico y exportación analítica.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportAppointmentsCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV Citas</span>
          </button>
          <button
            onClick={exportIntakesCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>CSV Ingresos</span>
          </button>
          <button
            onClick={exportFullBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95"
            style={{ backgroundColor: config.accentColor }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup Total (JSON)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            title="Imprimir informe"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Citas Programadas Hoy</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono tabular-nums">
            {metrics.todayCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metrics.completedApts} completadas · {metrics.inClinicApts} en curso
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Ingresos & Triajes Hoy</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono tabular-nums">
            {metrics.admittedToday}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Pacientes recibidos por enfermería
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tiempo Medio Espera</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono tabular-nums">
            ~{metrics.avgWaitMin} min
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Desde admisión hasta ingreso a box
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tasa de Asistencia</span>
            <TrendingUp className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-teal-700 mt-1 font-mono tabular-nums">
            {metrics.attendanceRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Pacientes presentados en clínica
          </div>
        </div>
      </div>

      {/* Two Column Charts: Specialties & Triage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Demand by Specialty */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Demanda por Especialidad Médica</h2>
            <span className="text-xs text-slate-400">Total: {appointments.length} citas</span>
          </div>

          <div className="space-y-3">
            {specialtyStats.map(item => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {item.count} citas ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${item.pct}%`, 
                      backgroundColor: config.accentColor 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Triage Urgency Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Distribución de Triaje (Escala Manchester)</h2>
            <span className="text-xs text-slate-400">Total: {intakes.length} ingresos</span>
          </div>

          <div className="space-y-3">
            {triageStats.map(item => (
              <div key={item.level} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.info.colorBg}`} />
                    <span className="font-semibold text-slate-800">{item.info.shortName}</span>
                  </div>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {item.count} pacientes ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.info.colorBg}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 italic pt-2">
            La prioridad clínica determina el orden preferente de llamado en el turnero digital.
          </p>
        </div>

      </div>

    </div>
  );
};
