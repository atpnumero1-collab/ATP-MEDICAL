import React, { useState, useMemo, useRef } from 'react';
import { 
  Patient, 
  Doctor, 
  ClinicConfig, 
  MedicalRecord, 
  VitalSigns 
} from '../../types';
import { calculateBmi } from '../../data/initialData';
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Share2, 
  User, 
  Calendar, 
  Clock, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2, 
  Heart, 
  Activity, 
  Pill, 
  FileCheck, 
  ChevronRight, 
  ArrowLeft,
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  ShieldAlert,
  Sparkles,
  Download
} from 'lucide-react';

interface MedicalRecordsModuleProps {
  patients: Patient[];
  doctors: Doctor[];
  records: MedicalRecord[];
  config: ClinicConfig;
  onSaveRecord: (record: MedicalRecord) => Promise<void>;
  onDeleteRecord?: (recordId: string) => Promise<void>;
  onAddPatient?: (patient: Patient) => void;
}

export const MedicalRecordsModule: React.FC<MedicalRecordsModuleProps> = ({
  patients,
  doctors,
  records,
  config,
  onSaveRecord,
  onDeleteRecord,
  onAddPatient
}) => {
  // Search query for patient (Cédula, Nombre, Apellido)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // State for modals / views
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  // New Record Form State
  const [formDoctorId, setFormDoctorId] = useState<string>(doctors[0]?.id || '');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [formComplaint, setFormComplaint] = useState('');
  const [formCurrentIllness, setFormCurrentIllness] = useState('');
  const [formPhysicalExam, setFormPhysicalExam] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formTreatmentPlan, setFormTreatmentPlan] = useState('');
  const [formPrescriptions, setFormPrescriptions] = useState('');
  const [formStudies, setFormStudies] = useState('');
  const [formFollowUp, setFormFollowUp] = useState('');
  const [formDoctorNotes, setFormDoctorNotes] = useState('');

  // Vitals State
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [respRate, setRespRate] = useState<number>(16);
  const [temperature, setTemperature] = useState<number>(36.6);
  const [spo2, setSpo2] = useState<number>(98);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(170);

  // Quick Patient registration modal state
  const [isQuickPatientModalOpen, setIsQuickPatientModalOpen] = useState(false);
  const [newDniType, setNewDniType] = useState<'V' | 'E'>('V');
  const [newDniNum, setNewDniNum] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Selected patient object
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Filtered patients by Search Query (Cédula, Nombre, Apellido)
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase().trim();
    return patients.filter(p => 
      p.fullName.toLowerCase().includes(q) ||
      p.dni.toLowerCase().replace(/[\.\s]/g, '').includes(q.replace(/[\.\s]/g, '')) ||
      (p.phone && p.phone.includes(q))
    );
  }, [patients, searchQuery]);

  // Records for currently selected patient, sorted latest first
  const patientRecords = useMemo(() => {
    if (!selectedPatientId) return [];
    return records
      .filter(r => r.patientId === selectedPatientId)
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [records, selectedPatientId]);

  // Calculated BMI
  const bmiInfo = useMemo(() => {
    return calculateBmi(weightKg, heightCm);
  }, [weightKg, heightCm]);

  // Reset form
  const resetForm = () => {
    setFormComplaint('');
    setFormCurrentIllness('');
    setFormPhysicalExam('');
    setFormDiagnosis('');
    setFormTreatmentPlan('');
    setFormPrescriptions('');
    setFormStudies('');
    setFormFollowUp('');
    setFormDoctorNotes('');
    setSystolic(120);
    setDiastolic(80);
    setHeartRate(75);
    setRespRate(16);
    setTemperature(36.6);
    setSpo2(98);
    setWeightKg(70);
    setHeightCm(170);
  };

  // Open modal to create record
  const handleOpenNewRecord = () => {
    if (!selectedPatient) return;
    resetForm();
    if (doctors.length > 0 && !formDoctorId) {
      setFormDoctorId(doctors[0].id);
    }
    setIsNewRecordModalOpen(true);
  };

  // Save new record
  const handleSaveMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const doc = doctors.find(d => d.id === formDoctorId) || doctors[0];

    const vitals: VitalSigns = {
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      heartRate: Number(heartRate),
      respRate: Number(respRate),
      temperature: Number(temperature),
      spo2: Number(spo2),
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      bmi: bmiInfo.bmi,
      bmiCategory: bmiInfo.category
    };

    const recordNumber = `HM-${new Date().getFullYear()}-${String(records.length + 1).padStart(4, '0')}`;

    const newRecord: MedicalRecord = {
      id: `mr-${Date.now()}`,
      recordNumber,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientDni: selectedPatient.dni,
      patientAge: selectedPatient.birthDate ? calculateAge(selectedPatient.birthDate) : undefined,
      patientGender: selectedPatient.gender,
      patientPhone: selectedPatient.phone,
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      room: doc.room,
      date: formDate,
      time: formTime,
      chiefComplaint: formComplaint.trim() || 'Consulta médica general',
      currentIllness: formCurrentIllness.trim(),
      vitals,
      physicalExam: formPhysicalExam.trim(),
      diagnosis: formDiagnosis.trim() || 'Evaluación médica satisfactoria',
      treatmentPlan: formTreatmentPlan.trim(),
      prescriptions: formPrescriptions.trim(),
      complementaryStudies: formStudies.trim(),
      nextFollowUpDate: formFollowUp.trim() || undefined,
      doctorNotes: formDoctorNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      await onSaveRecord(newRecord);
      setIsNewRecordModalOpen(false);
      setViewingRecord(newRecord);
      setSavedSuccessToast(true);
      setTimeout(() => setSavedSuccessToast(false), 3000);
    } catch (err) {
      console.error('Error saving medical record:', err);
    }
  };

  // Helper to calculate age from birthDate
  function calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  // Handle Quick Patient Creation
  const handleQuickRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDniNum.trim()) return;

    const fullDni = `${newDniType}-${newDniNum.trim()}`;
    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      dni: fullDni,
      fullName: newName.trim(),
      birthDate: '',
      gender: 'Otro',
      phone: newPhone.trim() || '+58 414-3651970',
      email: newEmail.trim() || '',
      address: 'Caracas, Venezuela',
      insurance: 'Particular',
      allergies: [],
      chronicConditions: [],
      emergencyContact: { name: '', phone: '', relation: '' },
      createdAt: new Date().toISOString()
    };

    if (onAddPatient) {
      onAddPatient(newPat);
    }
    setSelectedPatientId(newPat.id);
    setIsQuickPatientModalOpen(false);
    setNewName('');
    setNewDniNum('');
    setNewPhone('');
    setNewEmail('');
  };

  // Print PDF function
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 250);
  };

  // WhatsApp share of the medical report summary
  const handleShareWhatsApp = (rec: MedicalRecord) => {
    const text = encodeURIComponent(
      `*INFORME MÉDICO - ATP MEDICAL*\n` +
      `Sede: *${config.branchName}*\n` +
      `Folio: *${rec.recordNumber}*\n` +
      `Paciente: *${rec.patientName}* (C.I. ${rec.patientDni})\n` +
      `Fecha: *${rec.date} ${rec.time}*\n` +
      `Especialista: *${rec.doctorName}* (${rec.specialty})\n\n` +
      `*Diagnóstico:* ${rec.diagnosis}\n\n` +
      `*Tratamiento & Indicaciones:* ${rec.treatmentPlan || 'N/A'}\n\n` +
      (rec.prescriptions ? `*Récipe / Medicamentos:* ${rec.prescriptions}\n\n` : '') +
      (rec.nextFollowUpDate ? `*Próximo Control:* ${rec.nextFollowUpDate}\n\n` : '') +
      `_ATP Medical - ${config.address}. Contacto: ${config.phone}_`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Module Header - Vanguard Medical Records & Clinical Reports */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Historias Médicas & Informes Clínicos
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-mono">
                Expedientes Electrónicos
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gestión clínica integral por paciente, evolución diagnóstica CIE-10, prescripción e impresión oficial membretada en PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsQuickPatientModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Nuevo Paciente</span>
          </button>

          {selectedPatient && (
            <button
              type="button"
              onClick={handleOpenNewRecord}
              className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5"
              style={{ backgroundColor: config.accentColor }}
            >
              <FileText className="w-4 h-4" />
              <span>+ Crear Informe Médico</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {savedSuccessToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Informe médico guardado con éxito en la base de datos Firestore y listo para imprimir en PDF!</span>
        </div>
      )}

      {/* Layout Grid: Left Search & Patients, Right Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (4 cols): Patient Finder */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Buscar Paciente
            </label>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por cédula, nombre o apellido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span>{filteredPatients.length} pacientes encontrados</span>
              <span>Seleccione uno</span>
            </div>

            {/* Patients List */}
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto rounded-xl border border-slate-100">
              {filteredPatients.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No se encontraron pacientes.</p>
                  <button
                    onClick={() => setIsQuickPatientModalOpen(true)}
                    className="mt-2 text-sky-600 font-bold hover:underline"
                  >
                    + Registrar Paciente
                  </button>
                </div>
              ) : (
                filteredPatients.map(pat => {
                  const isSelected = selectedPatientId === pat.id;
                  const recordCount = records.filter(r => r.patientId === pat.id).length;
                  return (
                    <div
                      key={pat.id}
                      onClick={() => setSelectedPatientId(pat.id)}
                      className={`p-3 cursor-pointer transition-colors flex items-center justify-between text-xs ${
                        isSelected 
                          ? 'bg-sky-50 border-l-4 border-sky-600 text-sky-950 font-semibold' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">
                          {pat.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          C.I. {pat.dni}
                        </div>
                        {pat.phone && (
                          <div className="text-[10px] text-slate-400">
                            {pat.phone}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {recordCount} {recordCount === 1 ? 'informe' : 'informes'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Selected Patient Medical Dossier */}
        <div className="lg:col-span-8 space-y-4">
          
          {!selectedPatient ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                Seleccione un Paciente para ver su Historia Médica
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Utilice el buscador de la izquierda por cédula, nombre o apellido para abrir el expediente clínico, consultar informes anteriores o redactar una nueva consulta médica.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Patient Profile Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-xs"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {selectedPatient.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        {selectedPatient.fullName}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          Cédula: {selectedPatient.dni}
                        </span>
                        {selectedPatient.birthDate && (
                          <span>· Edad: {calculateAge(selectedPatient.birthDate)} años</span>
                        )}
                        <span>· {selectedPatient.gender}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenNewRecord}
                    className="self-start sm:self-center px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Redactar Informe</span>
                  </button>
                </div>

                {/* Patient Quick Info Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Teléfono</span>
                    <span className="font-semibold text-slate-800">{selectedPatient.phone || 'No registrado'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Correo</span>
                    <span className="font-semibold text-slate-800 truncate block">{selectedPatient.email || 'No registrado'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Grupo Sanguíneo</span>
                    <span className="font-bold text-rose-700">{selectedPatient.bloodGroup || 'Sin verificar'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Cobertura</span>
                    <span className="font-semibold text-slate-800">{selectedPatient.insurance || 'Particular'}</span>
                  </div>
                </div>

                {/* Alerts: Allergies & Chronic Conditions */}
                {(selectedPatient.allergies?.length > 0 || selectedPatient.chronicConditions?.length > 0) && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5">
                    {selectedPatient.allergies?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="font-bold text-rose-900">Alergias Conocidas:</span>
                        <div className="flex gap-1 flex-wrap">
                          {selectedPatient.allergies.map(a => (
                            <span key={a} className="bg-rose-100 text-rose-800 px-2 py-0.2 rounded font-semibold text-[11px]">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPatient.chronicConditions?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="font-bold text-amber-900">Antecedentes / Condiciones:</span>
                        <div className="flex gap-1 flex-wrap">
                          {selectedPatient.chronicConditions.map(c => (
                            <span key={c} className="bg-amber-100 text-amber-900 px-2 py-0.2 rounded font-semibold text-[11px]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* History Timeline */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Informes Médicos & Consultas ({patientRecords.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Historial cronológico ordenado
                  </span>
                </div>

                {patientRecords.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-600">Este paciente aún no tiene informes médicos registrados.</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Haga clic en "+ Crear Informe Médico" para redactar la primera consulta, examen físico, diagnóstico y récipe.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenNewRecord}
                      className="mt-2 px-3 py-1.5 rounded-lg text-white font-bold text-xs"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      Redactar Primer Informe
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientRecords.map(rec => (
                      <div 
                        key={rec.id}
                        className="p-4 rounded-xl border border-slate-200/90 hover:border-sky-300 transition-all bg-white hover:bg-slate-50/50 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                              {rec.recordNumber}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">
                              📅 {rec.date} {rec.time}
                            </span>
                            <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                              {rec.specialty}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingRecord(rec)}
                              className="px-2.5 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 flex items-center gap-1 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Ver / Imprimir PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleShareWhatsApp(rec)}
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                              title="Compartir resumen por WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Médico Tratante</span>
                            <span className="font-bold text-slate-800">{rec.doctorName}</span>
                            <span className="text-slate-500 text-[11px] block">{rec.room}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Diagnóstico Clínico</span>
                            <span className="font-bold text-slate-900">{rec.diagnosis}</span>
                          </div>
                        </div>

                        {rec.chiefComplaint && (
                          <div className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Motivo: </span>
                            <span>{rec.chiefComplaint}</span>
                          </div>
                        )}

                        {rec.treatmentPlan && (
                          <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">
                            <span className="font-bold text-slate-800 block text-[11px]">Tratamiento / Indicaciones:</span>
                            <span className="line-clamp-2">{rec.treatmentPlan}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: Create New Medical Report Form */}
      {isNewRecordModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div 
              className="p-5 text-white flex items-center justify-between"
              style={{ backgroundColor: config.primaryColor }}
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-200">
                  ATP Medical · Formulario Clínico Oficial
                </span>
                <h3 className="text-base font-bold">
                  Redactar Nuevo Informe Médico
                </h3>
                <p className="text-xs text-slate-200">
                  Paciente: {selectedPatient.fullName} · C.I. {selectedPatient.dni}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewRecordModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMedicalRecord} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Doctor, Specialty, Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Médico Especialista *
                  </label>
                  <select
                    value={formDoctorId}
                    onChange={(e) => setFormDoctorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Fecha de Atención *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Chief Complaint & Current Illness */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    1. Motivo de Consulta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Dolor abdominal en epigastrio de 3 días de evolución, náuseas y pirosis."
                    value={formComplaint}
                    onChange={(e) => setFormComplaint(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    2. Enfermedad Actual / Anamnesis
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describa el inicio cronológico, características del cuadro clínico y antecedentes relevantes de la consulta actual..."
                    value={formCurrentIllness}
                    onChange={(e) => setFormCurrentIllness(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Vital Signs Grid */}
              <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    3. Signos Vitales & Somatometría
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">T.A. Sistólica (mmHg)</label>
                    <input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">T.A. Diastólica (mmHg)</label>
                    <input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Frec. Cardíaca (lpm)</label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Frec. Respiratoria (rpm)</label>
                    <input
                      type="number"
                      value={respRate}
                      onChange={(e) => setRespRate(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Temperatura (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Sat. O2 SpO2 (%)</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Talla (cm) / IMC: {bmiInfo.bmi}</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Exam */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  4. Examen Físico Segmentario
                </label>
                <textarea
                  rows={2}
                  placeholder="Cabeza y cuello, cardiopulmonar, abdomen, osteomuscular, neurológico..."
                  value={formPhysicalExam}
                  onChange={(e) => setFormPhysicalExam(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  5. Diagnóstico Clínico (Principal y diferenciales) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1. Gastritis crónica agudizada por Helicobacter pylori. 2. Reflujo gastroesofágico."
                  value={formDiagnosis}
                  onChange={(e) => setFormDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-bold"
                />
              </div>

              {/* Treatment Plan & Prescriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    6. Plan de Tratamiento & Indicaciones
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Dieta, reposo, medidas higiénico-dietéticas, signos de alarma..."
                    value={formTreatmentPlan}
                    onChange={(e) => setFormTreatmentPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-sky-600" />
                    <span>Récipe / Medicamentos Prescritos</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="1. Esomeprazol 40mg VO OD en ayunas x 14 días. 2. Procinético..."
                    value={formPrescriptions}
                    onChange={(e) => setFormPrescriptions(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Complementary Studies & Next Follow up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    7. Estudios Complementarios Solicitados
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Endoscopia digestiva superior, Ecografía abdominal, Hematología completa."
                    value={formStudies}
                    onChange={(e) => setFormStudies(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    8. Próximo Control Sugerido
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. En 15 días con resultados de paraclínicos."
                    value={formFollowUp}
                    onChange={(e) => setFormFollowUp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                  style={{ backgroundColor: config.accentColor }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Informe & Generar PDF</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: Official Print / PDF Preview Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-4 flex flex-col max-h-[92vh]">
            
            {/* Top Toolbar (Hidden on Print) */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between no-print print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">
                  Vista Previa de Impresión Oficial (PDF Membretado)
                </span>
                <span className="font-mono text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  {viewingRecord.recordNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir en PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(viewingRecord)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Document Body (Membretado con Logo y Dirección) */}
            <div id="printable-medical-report" className="printable-area p-8 sm:p-10 space-y-6 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0">

              
              {/* Institutional Header with Logo & Official Address */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-sm shrink-0"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    ATP
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                      {config.clinicName}
                    </h1>
                    <p className="text-xs font-bold text-sky-800 uppercase tracking-wide">
                      {config.slogan}
                    </p>
                    <div className="text-[11px] text-slate-600 mt-1 space-y-0.5 leading-snug">
                      <p className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{config.address}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">Tlf: {config.phone}</span>
                        <span>·</span>
                        <span>{config.email}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    INFORME MÉDICO
                  </span>
                  <span className="font-mono font-extrabold text-sm text-slate-900 block">
                    {viewingRecord.recordNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                    Fecha: {viewingRecord.date}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    Hora: {viewingRecord.time} hrs
                  </span>
                </div>
              </div>

              {/* Patient Identification Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Paciente</span>
                  <span className="font-bold text-slate-900 text-sm block">{viewingRecord.patientName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cédula de Identidad</span>
                  <span className="font-mono font-bold text-slate-900 text-sm block">{viewingRecord.patientDni}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Edad / Sexo</span>
                  <span className="font-medium text-slate-800">
                    {viewingRecord.patientAge ? `${viewingRecord.patientAge} años` : 'N/A'} · {viewingRecord.patientGender || ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Teléfono</span>
                  <span className="font-mono text-slate-800">{viewingRecord.patientPhone || config.phone}</span>
                </div>
              </div>

              {/* Treating Specialist Banner */}
              <div className="px-4 py-2.5 rounded-lg bg-sky-50/70 border border-sky-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wide block">
                    Médico Especialista Tratante
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {viewingRecord.doctorName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sky-800 uppercase text-xs block">
                    {viewingRecord.specialty}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {viewingRecord.room || 'Consultorio ATP'}
                  </span>
                </div>
              </div>

              {/* Clinical Report Body */}
              <div className="space-y-4 text-xs leading-relaxed">
                
                {/* 1. Motivo de Consulta & Anamnesis */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
                    1. Motivo de Consulta & Enfermedad Actual
                  </h4>
                  <p className="text-slate-800 pt-0.5">
                    <b>Motivo:</b> {viewingRecord.chiefComplaint}
                  </p>
                  {viewingRecord.currentIllness && (
                    <p className="text-slate-700 pt-0.5 whitespace-pre-line">
                      {viewingRecord.currentIllness}
                    </p>
                  )}
                </div>

                {/* 2. Signos Vitales */}
                {viewingRecord.vitals && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
                      2. Signos Vitales al Momento de la Atención
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center font-mono text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">T.A.</span>
                        <span className="font-bold text-slate-800">{viewingRecord.vitals.systolic}/{viewingRecord.vitals.diastolic}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">F.C.</span>
                        <span className="font-bold text-slate-800">{viewingRecord.vitals.heartRate} lpm</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">F.R.</span>
                        <span className="font-bold text-slate-800">{viewingRecord.vitals.respRate} rpm</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">Temp.</span>
                        <span className="font-bold text-slate-800">{viewingRecord.vitals.temperature}°C</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">SpO2</span>
                        <span className="font-bold text-slate-800">{viewingRecord.vitals.spo2}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">Peso</span>
                        <span className="font-bold text-slate-800">{viewingRecord.vitals.weightKg} kg</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">Talla</span>
                        <span className="font-bold text-slate-800">{viewingRecord.vitals.heightCm} cm</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">IMC</span>
                        <span className="font-bold text-slate-800">{viewingRecord.vitals.bmi || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Examen Físico */}
                {viewingRecord.physicalExam && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
                      3. Hallazgos al Examen Físico
                    </h4>
                    <p className="text-slate-800 pt-0.5 whitespace-pre-line">
                      {viewingRecord.physicalExam}
                    </p>
                  </div>
                )}

                {/* 4. Diagnóstico Clínico */}
                <div className="space-y-1 bg-sky-50/50 p-3 rounded-xl border border-sky-200">
                  <h4 className="font-extrabold text-sky-950 uppercase text-[11px] tracking-wider">
                    4. Diagnóstico Clínico
                  </h4>
                  <p className="text-slate-900 font-bold text-sm pt-0.5">
                    {viewingRecord.diagnosis}
                  </p>
                </div>

                {/* 5. Plan Terapéutico & Récipe */}
                {(viewingRecord.treatmentPlan || viewingRecord.prescriptions) && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
                      5. Plan de Tratamiento & Récipe Médico
                    </h4>
                    {viewingRecord.treatmentPlan && (
                      <p className="text-slate-800 whitespace-pre-line">
                        {viewingRecord.treatmentPlan}
                      </p>
                    )}
                    {viewingRecord.prescriptions && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs whitespace-pre-line">
                        <span className="font-sans font-bold text-slate-900 block mb-1">Prescripciones Farmacológicas:</span>
                        {viewingRecord.prescriptions}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Paraclínicos & Seguimiento */}
                {(viewingRecord.complementaryStudies || viewingRecord.nextFollowUpDate) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    {viewingRecord.complementaryStudies && (
                      <div className="p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block text-[10px] uppercase">Estudios Solicitados:</span>
                        <span className="text-slate-700">{viewingRecord.complementaryStudies}</span>
                      </div>
                    )}
                    {viewingRecord.nextFollowUpDate && (
                      <div className="p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block text-[10px] uppercase">Próximo Control:</span>
                        <span className="text-slate-700">{viewingRecord.nextFollowUpDate}</span>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Signature & Seal Footer */}
              <div className="pt-10 flex items-end justify-between gap-6 border-t border-slate-200">
                <div className="text-[10px] text-slate-400 space-y-0.5 leading-snug">
                  <p className="font-bold text-slate-600">ATP MEDICAL CARACAS</p>
                  <p>{config.address}</p>
                  <p>Documento médico legal confidencial expedido en conformidad con la normativa sanitaria.</p>
                </div>

                <div className="text-center shrink-0 w-64 space-y-1">
                  <div className="border-b border-slate-900 h-10 w-48 mx-auto"></div>
                  <p className="font-bold text-slate-900 text-xs">
                    {viewingRecord.doctorName}
                  </p>
                  <p className="text-[11px] text-sky-800 font-semibold">
                    {viewingRecord.specialty}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Firma y Sello del Médico Especialista
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: Quick Patient Registration Modal */}
      {isQuickPatientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div 
              className="p-4 text-white flex items-center justify-between"
              style={{ backgroundColor: config.primaryColor }}
            >
              <h3 className="font-bold text-sm">
                Registrar Nuevo Paciente
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickPatientModalOpen(false)}
                className="text-white hover:bg-white/10 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickRegisterPatient} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cédula de Identidad *</label>
                <div className="flex gap-2">
                  <select
                    value={newDniType}
                    onChange={(e) => setNewDniType(e.target.value as 'V' | 'E')}
                    className="w-16 px-2 py-2 rounded-xl border border-slate-300 font-bold bg-slate-50 text-xs"
                  >
                    <option value="V">V-</option>
                    <option value="E">E-</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 14892415"
                    value={newDniNum}
                    onChange={(e) => setNewDniNum(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre y Apellido Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrés Eloy Blanco"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teléfono WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+58 414-1234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="paciente@correo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickPatientModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs"
                  style={{ backgroundColor: config.accentColor }}
                >
                  Crear Historia del Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
