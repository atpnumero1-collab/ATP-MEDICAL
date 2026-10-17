import React, { useState, useMemo } from 'react';
import { 
  Patient, 
  Doctor, 
  PatientIntake, 
  TriagePriority, 
  ClinicConfig, 
  VitalSigns,
  IntakeStatus
} from '../../types';
import { 
  TRIAGE_CONFIG, 
  calculateBmi 
} from '../../data/initialData';
import { 
  UserCheck, 
  Heart, 
  Activity, 
  Thermometer, 
  Gauge, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Plus, 
  Volume2, 
  FileCheck, 
  X, 
  Check, 
  UserPlus,
  Stethoscope
} from 'lucide-react';
import { chimePlayer } from '../../utils/audioChime';

interface IntakeModuleProps {
  intakes: PatientIntake[];
  patients: Patient[];
  doctors: Doctor[];
  config: ClinicConfig;
  onAddIntake: (intake: PatientIntake) => void;
  onUpdateIntakeStatus: (id: string, status: IntakeStatus) => void;
  onAddPatient: (patient: Patient) => void;
  preselectedPatientId?: string;
  preselectedAppointmentId?: string;
  onClearPreselection?: () => void;
}

export const IntakeModule: React.FC<IntakeModuleProps> = ({
  intakes,
  patients,
  doctors,
  config,
  onAddIntake,
  onUpdateIntakeStatus,
  onAddPatient,
  preselectedPatientId,
  preselectedAppointmentId,
  onClearPreselection
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'queue'>('form');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(preselectedPatientId || '');
  
  // Quick patient registration inside intake
  const [isQuickPatientOpen, setIsQuickPatientOpen] = useState(false);
  const [qDni, setQDni] = useState('');
  const [qName, setQName] = useState('');
  const [qBirth, setQBirth] = useState('1990-01-01');
  const [qGender, setQGender] = useState<'Masculino' | 'Femenino' | 'Otro'>('Femenino');
  const [qPhone, setQPhone] = useState('');
  const [qInsurance, setQInsurance] = useState('Particular');
  const [qAllergies, setQAllergies] = useState('');

  // Intake form state
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<TriagePriority>(3);
  const [consentSigned, setConsentSigned] = useState(true);
  const [intakeNotes, setIntakeNotes] = useState('');

  // Vital signs state
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [respRate, setRespRate] = useState<number>(16);
  const [temperature, setTemperature] = useState<number>(36.5);
  const [spo2, setSpo2] = useState<number>(98);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(170);

  // Printed slip modal state
  const [printedIntake, setPrintedIntake] = useState<PatientIntake | null>(null);

  // Filter for queue tab
  const [queueStatusFilter, setQueueStatusFilter] = useState<string>('all');
  const [queueSearch, setQueueSearch] = useState<string>('');

  // Selected patient details
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  // Selected doctor
  const selectedDoctor = useMemo(() => {
    return doctors.find(d => d.id === selectedDoctorId);
  }, [doctors, selectedDoctorId]);

  // Compute live BMI
  const bmiData = useMemo(() => {
    return calculateBmi(weightKg, heightCm);
  }, [weightKg, heightCm]);

  // Age calculation
  const calculatedAge = useMemo(() => {
    if (!selectedPatient?.birthDate) return 30;
    const diff = Date.now() - new Date(selectedPatient.birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }, [selectedPatient]);

  // Vital alerts
  const vitalAlerts = useMemo(() => {
    const alerts: string[] = [];
    if (systolic >= 140 || diastolic >= 90) alerts.push('Hipertensión detectada (PA ≥ 140/90)');
    if (systolic <= 90 || diastolic <= 60) alerts.push('Hipotensión detectada (PA ≤ 90/60)');
    if (heartRate > 100) alerts.push('Taquicardia (FC > 100 lpm)');
    if (heartRate < 50) alerts.push('Bradicardia (FC < 50 lpm)');
    if (temperature >= 38.0) alerts.push('Fiebre clínica (Temp ≥ 38.0 °C)');
    if (spo2 < 95) alerts.push('Hipoxia / Saturación baja (SpO2 < 95%)');
    return alerts;
  }, [systolic, diastolic, heartRate, temperature, spo2]);

  // Handle Quick Patient Creation
  const handleCreateQuickPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qName.trim() || !qDni.trim()) return;

    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      dni: qDni.trim(),
      fullName: qName.trim(),
      birthDate: qBirth,
      gender: qGender,
      phone: qPhone.trim() || '+56 9 0000 0000',
      email: `${qName.toLowerCase().replace(/\s+/g, '.')}@paciente.cl`,
      address: 'Registro en Recepción ATP Medical',
      insurance: qInsurance,
      bloodGroup: 'Desconocido',
      allergies: qAllergies ? qAllergies.split(',').map(s => s.trim()) : ['Ninguna informada'],
      chronicConditions: [],
      emergencyContact: {
        name: 'Acompañante / Familiar',
        phone: qPhone.trim(),
        relation: 'Contacto'
      },
      createdAt: new Date().toISOString()
    };

    onAddPatient(newPat);
    setSelectedPatientId(newPat.id);
    setIsQuickPatientOpen(false);
  };

  // Submit Intake
  const handleSubmitIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const assignedDoc = selectedDoctor || doctors[0];
    const ticketSeq = 100 + intakes.length + 1;
    const ticketStr = `T-${ticketSeq}`;

    const newIntake: PatientIntake = {
      id: `intake-${Date.now()}`,
      ticketNumber: ticketStr,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientDni: selectedPatient.dni,
      patientAge: calculatedAge,
      appointmentId: preselectedAppointmentId,
      admissionTime: new Date().toISOString(),
      priorityLevel,
      vitals: {
        systolic,
        diastolic,
        heartRate,
        respRate,
        temperature,
        spo2,
        weightKg,
        heightCm,
        bmi: bmiData.bmi,
        bmiCategory: bmiData.category
      },
      chiefComplaint: chiefComplaint.trim() || 'Ingreso clínico por recepción ambulatoria',
      doctorId: assignedDoc.id,
      doctorName: assignedDoc.name,
      specialty: assignedDoc.specialty,
      room: assignedDoc.room,
      status: 'en_espera',
      consentSigned,
      notes: intakeNotes.trim() || undefined
    };

    onAddIntake(newIntake);
    setPrintedIntake(newIntake);

    // Reset Form
    if (onClearPreselection) onClearPreselection();
    setChiefComplaint('');
    setIntakeNotes('');
    setActiveTab('queue');
  };

  // Call Patient with Audio Chime
  const handleCallPatient = (intake: PatientIntake) => {
    if (config.enableAudioChime) {
      chimePlayer.playCallingChime();
    }
    onUpdateIntakeStatus(intake.id, 'llamado');
  };

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return intakes.filter(item => {
      if (queueStatusFilter !== 'all' && item.status !== queueStatusFilter) return false;
      if (queueSearch.trim()) {
        const q = queueSearch.toLowerCase();
        const mTicket = item.ticketNumber.toLowerCase().includes(q);
        const mName = item.patientName.toLowerCase().includes(q);
        const mDni = item.patientDni.toLowerCase().includes(q);
        const mDoc = item.doctorName.toLowerCase().includes(q);
        if (!mTicket && !mName && !mDni && !mDoc) return false;
      }
      return true;
    }).sort((a, b) => {
      // Prioritize priority 1, 2 first, then admission time
      if (a.priorityLevel !== b.priorityLevel) {
        return a.priorityLevel - b.priorityLevel;
      }
      return new Date(b.admissionTime).getTime() - new Date(a.admissionTime).getTime();
    });
  }, [intakes, queueStatusFilter, queueSearch]);

  const activeWaitingCount = intakes.filter(i => i.status === 'en_espera' || i.status === 'en_triaje').length;

  return (
    <div className="space-y-6">

      {/* Module Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Ingreso de Pacientes & Admisión de Triaje</span>
            <span 
              className="text-xs font-semibold px-2.5 py-0.5 rounded-md text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              ATP MEDICAL
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Recepción formal, toma de signos vitales, escala Manchester de urgencia y pase de atención médica.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-center">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'form' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Formulario de Ingreso</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'queue' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Cola de Ingresos ({activeWaitingCount})</span>
          </button>
        </div>
      </div>

      {activeTab === 'form' ? (
        <form onSubmit={handleSubmitIntake} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Patient & Vitals */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Patient Selection */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  <h2 className="text-sm font-bold text-slate-900">1. Identificación del Paciente</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickPatientOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Registrar Paciente Nuevo</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seleccionar Paciente *
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800"
                >
                  <option value="">Buscar o seleccionar paciente registrado...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} — DNI: {p.dni} | Seguro: {p.insurance}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatient && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedPatient.fullName}
                    </span>
                    <span className="text-slate-500">
                      Edad: <strong className="text-slate-800 font-mono tabular-nums">{calculatedAge} años</strong> ({selectedPatient.gender})
                    </span>
                    <span className="text-slate-500">
                      Previsión: <strong className="text-slate-800">{selectedPatient.insurance}</strong>
                    </span>
                    <span className="text-slate-500">
                      Grupo Sanguíneo: <strong className="text-slate-800 font-mono">{selectedPatient.bloodGroup || 'No reg.'}</strong>
                    </span>
                  </div>

                  {/* High priority allergy alert */}
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 && selectedPatient.allergies[0] !== 'Ninguna' && selectedPatient.allergies[0] !== 'Ninguna conocida' && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-[11px] font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>ALERTA DE ALERGIAS: {selectedPatient.allergies.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Doctor & Room Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Médico & Especialidad Asignada *
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800"
                  >
                    <option value="">Seleccione facultativo...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.specialty} ({d.room})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Motivo de Admisión / Síntoma Principal *
                  </label>
                  <input
                    type="text"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    required
                    placeholder="Ej. Dolor abdominal agudo, control de rutina, disnea..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Vital Signs & Measurements */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">2. Signos Vitales & Biometría de Triaje</h2>
                </div>
                <span className="text-[11px] text-slate-400">Parámetros fisiológicos en tiempo real</span>
              </div>

              {/* Alerts on abnormal vitals */}
              {vitalAlerts.length > 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Advertencias Clínicas Detectadas:</span>
                  </div>
                  <ul className="text-[11px] text-amber-800 list-disc list-inside">
                    {vitalAlerts.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                
                {/* Blood Pressure */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-semibold">Presión Art. (PA)</span>
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <input 
                      type="number" 
                      value={systolic} 
                      onChange={(e) => setSystolic(Number(e.target.value))}
                      className="w-14 px-1.5 py-1 text-xs border border-slate-300 rounded bg-white font-bold text-center" 
                    />
                    <span className="text-slate-400 font-bold">/</span>
                    <input 
                      type="number" 
                      value={diastolic} 
                      onChange={(e) => setDiastolic(Number(e.target.value))}
                      className="w-14 px-1.5 py-1 text-xs border border-slate-300 rounded bg-white font-bold text-center" 
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">mmHg (Sist / Diast)</span>
                </div>

                {/* Heart Rate */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-semibold">Frec. Cardíaca</span>
                    <Activity className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <input 
                    type="number" 
                    value={heartRate} 
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono font-bold text-center" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">lpm (latidos/min)</span>
                </div>

                {/* Temperature */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-semibold">Temperatura</span>
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <input 
                    type="number" 
                    step="0.1"
                    value={temperature} 
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono font-bold text-center" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">°C (grados Celsius)</span>
                </div>

                {/* SpO2 */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-semibold">Sat. Oxígeno</span>
                    <Gauge className="w-3.5 h-3.5 text-teal-500" />
                  </div>
                  <input 
                    type="number" 
                    value={spo2} 
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono font-bold text-center" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">% SpO2</span>
                </div>

              </div>

              {/* Weight, Height, BMI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Peso (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={weightKg} 
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50/50 font-mono text-center font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Talla / Estatura (cm)</label>
                  <input 
                    type="number" 
                    value={heightCm} 
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50/50 font-mono text-center font-bold" 
                  />
                </div>
                <div className="p-2.5 bg-sky-50/70 border border-sky-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-sky-800 font-medium">IMC Calculado:</span>
                    <div className="text-base font-bold text-sky-900 font-mono tabular-nums leading-none mt-0.5">
                      {bmiData.bmi} kg/m²
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-white text-sky-800 rounded border border-sky-300">
                    {bmiData.category}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Col: Triage Manchester Scale & Submit */}
          <div className="space-y-6">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">3. Escala de Triaje Manchester</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Seleccione el nivel de prioridad clínica según el estado del paciente.
                </p>
              </div>

              {/* Priority Radio Cards */}
              <div className="space-y-2">
                {([1, 2, 3, 4, 5] as TriagePriority[]).map(level => {
                  const info = TRIAGE_CONFIG[level];
                  const isSelected = priorityLevel === level;
                  return (
                    <div
                      key={level}
                      onClick={() => setPriorityLevel(level)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? `${info.badgeClass} ring-2 ring-slate-800/10 shadow-xs` 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${info.colorBg}`} />
                          <span className="text-xs font-bold text-slate-900">
                            {info.shortName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-medium">
                          {info.maxWait}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {info.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Consent check */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-700">
                  <input 
                    type="checkbox"
                    checked={consentSigned}
                    onChange={(e) => setConsentSigned(e.target.checked)}
                    className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>
                    Consentimiento informado de admisión clínica y tratamiento inicial aceptado en recepción.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedPatient}
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs text-white shadow-xs transition-all flex items-center justify-center gap-2 ${
                  !selectedPatient 
                    ? 'opacity-50 cursor-not-allowed bg-slate-400' 
                    : 'hover:opacity-95'
                }`}
                style={selectedPatient ? { backgroundColor: config.accentColor } : {}}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Emitir Ficha de Ingreso & Asignar Turno</span>
              </button>

            </div>

          </div>

        </form>
      ) : (
        /* Queue View: Real-time Admitted Patients */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Pacientes Admitidos en Turno Hoy ({filteredQueue.length})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filtrar por ticket, paciente..."
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50"
                />
              </div>

              <select
                value={queueStatusFilter}
                onChange={(e) => setQueueStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700"
              >
                <option value="all">Todos los estados</option>
                <option value="en_espera">En Sala de Espera</option>
                <option value="llamado">Llamado a Box</option>
                <option value="en_consulta">En Consulta</option>
                <option value="atendido">Atendido / Alta</option>
              </select>
            </div>
          </div>

          {filteredQueue.length === 0 ? (
            <div className="py-12 text-center">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No hay pacientes en cola de admisión</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Utilice el formulario de ingreso para registrar y triar nuevos pacientes.
              </p>
              <button
                onClick={() => setActiveTab('form')}
                className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white rounded-md inline-flex items-center gap-1.5"
                style={{ backgroundColor: config.accentColor }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Ingreso</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredQueue.map(item => {
                const triageInfo = TRIAGE_CONFIG[item.priorityLevel];
                const minutesWaiting = Math.floor((Date.now() - new Date(item.admissionTime).getTime()) / 60000);

                return (
                  <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="flex items-start gap-3.5">
                      {/* Ticket Badge */}
                      <div className="text-center p-2.5 rounded-lg border border-slate-200 bg-slate-50 shrink-0 w-16">
                        <div className="text-sm font-black font-mono text-slate-900 tracking-wider">
                          {item.ticketNumber}
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-1 block text-white ${triageInfo.colorBg}`}>
                          Nivel {item.priorityLevel}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {item.patientName}
                          </span>
                          <span className="text-xs text-slate-500 font-mono tabular-nums">
                            DNI: {item.patientDni}
                          </span>
                          <span className="text-xs text-slate-500">
                            · {item.patientAge} años
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">{item.doctorName}</span>
                          <span>·</span>
                          <span className="text-sky-700 font-medium">{item.room}</span>
                          <span>·</span>
                          <span>{item.specialty}</span>
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-2 pt-0.5 flex-wrap">
                          <span>PA: <strong className="text-slate-700 font-mono">{item.vitals.systolic}/{item.vitals.diastolic}</strong></span>
                          <span>·</span>
                          <span>FC: <strong className="text-slate-700 font-mono">{item.vitals.heartRate} lpm</strong></span>
                          <span>·</span>
                          <span>Temp: <strong className="text-slate-700 font-mono">{item.vitals.temperature}°C</strong></span>
                          <span>·</span>
                          <span>SpO2: <strong className="text-slate-700 font-mono">{item.vitals.spo2}%</strong></span>
                          <span>·</span>
                          <span>Espera: <strong className="text-slate-700 font-mono">{minutesWaiting} min</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                      
                      {/* Audio Call Button */}
                      <button
                        onClick={() => handleCallPatient(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md shadow-xs hover:opacity-90 transition-all"
                        style={{ backgroundColor: config.primaryColor }}
                        title="Hacer sonar el chime y llamar al paciente por pantalla"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Llamar a Box</span>
                      </button>

                      {/* Print Slip Button */}
                      <button
                        onClick={() => setPrintedIntake(item)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                        title="Ver o Imprimir Pase de Ingreso"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Status Selector */}
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateIntakeStatus(item.id, e.target.value as IntakeStatus)}
                        className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700"
                      >
                        <option value="en_espera">En Sala de Espera</option>
                        <option value="llamado">Llamado</option>
                        <option value="en_consulta">En Consulta</option>
                        <option value="atendido">Atendido / Alta</option>
                        <option value="derivado">Derivado</option>
                      </select>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* MODAL: Pase de Ingreso / Slip Imprimible */}
      {printedIntake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full overflow-hidden">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Comprobante de Admisión</span>
              </div>
              <button 
                onClick={() => setPrintedIntake(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Slip Area */}
            <div className="p-6 space-y-4 text-xs font-mono printable-area">
              
              {/* Slip Header */}
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h2 className="text-base font-black tracking-tight text-slate-900 font-sans">
                  {config.clinicName}
                </h2>
                <p className="text-[11px] text-slate-500 font-sans">{config.branchName}</p>
                <p className="text-[10px] text-slate-400 font-sans">{config.phone} · {config.address}</p>
                <div className="mt-2 text-2xl font-black tracking-widest text-slate-900 bg-slate-100 py-1.5 rounded border border-slate-200">
                  {printedIntake.ticketNumber}
                </div>
              </div>

              {/* Patient and Room details */}
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">PACIENTE:</span>
                  <span className="font-bold text-slate-900">{printedIntake.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DOCUMENTO/DNI:</span>
                  <span className="font-bold">{printedIntake.patientDni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">EDAD:</span>
                  <span>{printedIntake.patientAge} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FECHA Y HORA:</span>
                  <span>{new Date(printedIntake.admissionTime).toLocaleString('es-ES')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">CONSULTORIO:</span>
                  <span className="font-bold text-sky-700">{printedIntake.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MÉDICO:</span>
                  <span className="font-bold">{printedIntake.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ESPECIALIDAD:</span>
                  <span>{printedIntake.specialty}</span>
                </div>
              </div>

              {/* Vitals Summary on Slip */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-0.5">
                  TRIAJE CLINICO — NIVEL {printedIntake.priorityLevel}
                </div>
                <div className="grid grid-cols-2 gap-1 text-slate-600">
                  <span>P.A.: {printedIntake.vitals.systolic}/{printedIntake.vitals.diastolic} mmHg</span>
                  <span>F.C.: {printedIntake.vitals.heartRate} lpm</span>
                  <span>Temp: {printedIntake.vitals.temperature} °C</span>
                  <span>SpO2: {printedIntake.vitals.spo2} %</span>
                  {printedIntake.vitals.bmi && (
                    <span>IMC: {printedIntake.vitals.bmi} ({printedIntake.vitals.bmiCategory})</span>
                  )}
                </div>
              </div>

              {/* Footer text */}
              <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-300">
                <p>Conserve este ticket hasta ser llamado por altavoz o pantalla.</p>
                <p className="mt-1">ATP MEDICAL · Atención con Excelencia y Calidez</p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 no-print">
              <button
                onClick={() => setPrintedIntake(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-xs"
                style={{ backgroundColor: config.primaryColor }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Registro Rápido de Paciente */}
      {isQuickPatientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Registrar Paciente para Admisión</h3>
              </div>
              <button onClick={() => setIsQuickPatientOpen(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickPatient} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={qName}
                  onChange={(e) => setQName(e.target.value)}
                  placeholder="Ej. Francisca Valenzuela Pérez"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">RUT / Cédula / DNI *</label>
                  <input
                    type="text"
                    required
                    value={qDni}
                    onChange={(e) => setQDni(e.target.value)}
                    placeholder="12.345.678-9"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={qBirth}
                    onChange={(e) => setQBirth(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Sexo</label>
                  <select
                    value={qGender}
                    onChange={(e) => setQGender(e.target.value as 'Masculino' | 'Femenino' | 'Otro')}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={qPhone}
                    onChange={(e) => setQPhone(e.target.value)}
                    placeholder="+56 9 ..."
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Previsión / Seguro Médico</label>
                <input
                  type="text"
                  value={qInsurance}
                  onChange={(e) => setQInsurance(e.target.value)}
                  placeholder="Ej. Particular, Fonasa, Isapre, EPS..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alergias Conocidas (separadas por coma)</label>
                <input
                  type="text"
                  value={qAllergies}
                  onChange={(e) => setQAllergies(e.target.value)}
                  placeholder="Ej. Penicilina, AINEs, Polen (o dejar vacío)"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsQuickPatientOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-white font-semibold shadow-xs"
                  style={{ backgroundColor: config.accentColor }}
                >
                  Guardar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
