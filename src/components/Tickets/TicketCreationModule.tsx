import React, { useState, useMemo } from 'react';
import { 
  Patient, 
  Doctor, 
  PatientIntake, 
  ClinicConfig, 
  TriagePriority 
} from '../../types';
import { 
  Ticket, 
  User, 
  IdCard, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Stethoscope, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Search, 
  X, 
  ArrowRight,
  FileText,
  PlusCircle
} from 'lucide-react';
import { chimePlayer } from '../../utils/audioChime';

interface TicketCreationModuleProps {
  patients: Patient[];
  doctors: Doctor[];
  intakes: PatientIntake[];
  config: ClinicConfig;
  onAddIntake: (intake: PatientIntake) => void;
  onAddPatient: (patient: Patient) => void;
  onNavigateToWaitingRoom: () => void;
}

export const TicketCreationModule: React.FC<TicketCreationModuleProps> = ({
  patients,
  doctors,
  intakes,
  config,
  onAddIntake,
  onAddPatient,
  onNavigateToWaitingRoom
}) => {
  // Form State
  const [dni, setDni] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('Medicina General & Familiar');
  const [doctorId, setDoctorId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<TriagePriority>(4);

  // Success ticket modal
  const [issuedTicket, setIssuedTicket] = useState<PatientIntake | null>(null);

  // Existing patient match hint
  const matchedPatient = useMemo(() => {
    if (!dni.trim() || dni.length < 3) return null;
    return patients.find(p => p.dni.toLowerCase().replace(/[^a-z0-9]/g, '') === dni.toLowerCase().replace(/[^a-z0-9]/g, ''));
  }, [dni, patients]);

  // Next ticket calculation
  const nextTicketNumber = useMemo(() => {
    const nextSeq = 101 + intakes.length;
    return `T-${nextSeq}`;
  }, [intakes.length]);

  // Available specialties from doctors
  const specialties = useMemo(() => {
    const list = Array.from(new Set(doctors.map(d => d.specialty)));
    if (!list.includes('Medicina General & Familiar')) list.unshift('Medicina General & Familiar');
    return list;
  }, [doctors]);

  // Doctors for the selected specialty
  const availableDoctorsForSpecialty = useMemo(() => {
    return doctors.filter(d => d.specialty === specialty);
  }, [doctors, specialty]);

  // Auto-fill form when matched patient is clicked
  const handleAutoFill = (p: Patient) => {
    setDni(p.dni);
    setFullName(p.fullName);
    setAddress(p.address || '');
    setPhone(p.phone || '');
    setEmail(p.email || '');

    if (p.birthDate) {
      const diff = Date.now() - new Date(p.birthDate).getTime();
      const ageDate = new Date(diff);
      setAge(Math.abs(ageDate.getUTCFullYear() - 1970));
    }
  };

  // Submit Ticket Creation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim() || !fullName.trim() || age === '') return;

    // Check if patient exists or create them
    let patientObj = patients.find(p => p.dni === dni.trim());
    if (!patientObj) {
      const birthYear = new Date().getFullYear() - Number(age);
      const newPat: Patient = {
        id: `pat-${Date.now()}`,
        dni: dni.trim(),
        fullName: fullName.trim(),
        birthDate: `${birthYear}-01-01`,
        gender: 'Otro',
        phone: phone.trim() || 'No informado',
        email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@paciente.cl`,
        address: address.trim() || 'Dirección registrada en emisión de ticket',
        insurance: 'Particular',
        allergies: ['Ninguna conocida'],
        chronicConditions: [],
        emergencyContact: {
          name: 'Contacto Primario',
          phone: phone.trim() || 'No informado',
          relation: 'Familiar'
        },
        createdAt: new Date().toISOString()
      };
      onAddPatient(newPat);
      patientObj = newPat;
    }

    // Determine assigned doctor & room
    const assignedDoc = doctors.find(d => d.id === doctorId) || availableDoctorsForSpecialty[0] || doctors[0];

    const newTicket: PatientIntake = {
      id: `intake-${Date.now()}`,
      ticketNumber: nextTicketNumber,
      patientId: patientObj.id,
      patientName: fullName.trim(),
      patientDni: dni.trim(),
      patientAge: Number(age),
      patientAddress: address.trim() || 'No informada',
      patientPhone: phone.trim() || 'No informado',
      patientEmail: email.trim() || 'No informado',
      admissionTime: new Date().toISOString(),
      priorityLevel,
      vitals: {
        systolic: 120,
        diastolic: 80,
        heartRate: 75,
        respRate: 16,
        temperature: 36.5,
        spo2: 98
      },
      chiefComplaint: chiefComplaint.trim() || `Atención ambulatoria en ${specialty}`,
      doctorId: assignedDoc.id,
      doctorName: assignedDoc.name,
      specialty: assignedDoc.specialty,
      room: assignedDoc.room,
      status: 'pendiente_pago', // Default inicial: Pendiente por pago
      consentSigned: true
    };

    onAddIntake(newTicket);
    setIssuedTicket(newTicket);

    // Reset Form
    setDni('');
    setFullName('');
    setAge('');
    setAddress('');
    setPhone('');
    setEmail('');
    setChiefComplaint('');
  };

  // Recent tickets created today
  const recentTickets = useMemo(() => {
    return [...intakes].sort((a, b) => new Date(b.admissionTime).getTime() - new Date(a.admissionTime).getTime()).slice(0, 5);
  }, [intakes]);

  return (
    <div className="space-y-6">
      
      {/* Module Title Header - Cutting-Edge Medical Vanguard Aesthetic */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Creación de Tickets
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                Admisión Asistencial
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registro inmediato de admisión, triaje de signos vitales y asignación de turno con trazabilidad clínica en tiempo real.
            </p>
          </div>
        </div>

        {/* Live Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Siguiente Ticket</span>
            <span className="text-lg font-black font-mono tracking-wider text-slate-900 leading-none">
              {nextTicketNumber}
            </span>
          </div>

          <button
            onClick={onNavigateToWaitingRoom}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <span>Ver Pacientes en Sala</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Cols: Ticket Generation Form */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Formulario de Emisión de Ticket de Atención
              </h2>
            </div>
            <span className="text-xs text-slate-400">Datos requeridos de admisión</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Auto-fill notification if matched */}
            {matchedPatient && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-between gap-3 text-sky-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    Paciente registrado encontrado: <strong>{matchedPatient.fullName}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAutoFill(matchedPatient)}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded text-[11px] shadow-xs"
                >
                  Autocompletar Datos
                </button>
              </div>
            )}

            {/* Row 1: Cédula & Nombres */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Cédula de Identidad *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Ej. 14.892.415-K o DNI"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/70 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Nombres y Apellidos Completos *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. María Elena González Ramos"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/70 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Row 2: Edad, Teléfono y Correo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Edad (Años) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="125"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ej. 42"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/70 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+58 414-3651970"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/70 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paciente@correo.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/70 text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Row 3: Dirección */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Dirección Residencial *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Urb. Santa Fe Norte, Torre A, Caracas"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/70 text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Row 4: Especialidad por la cual asiste & Médico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Especialidad por la cual asiste *
                </label>
                <select
                  value={specialty}
                  onChange={(e) => {
                    setSpecialty(e.target.value);
                    setDoctorId(''); // reset doctor to allow reselection
                  }}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/70 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Médico / Consultorio Asignado
                </label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/70 text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Asignar automáticamente al primer disponible</option>
                  {availableDoctorsForSpecialty.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.room} · {d.scheduleDays})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 5: Motivo de Consulta */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Motivo de Consulta o Síntomas Reportados
              </label>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={2}
                placeholder="Ej. Chequeo semestral, dolor agudo, solicitud de exámenes, control post-operatorio..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/70 text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Se emitirá el ticket <strong className="font-mono text-slate-700">{nextTicketNumber}</strong> y pasará a Pacientes en Sala.
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-2"
                style={{ backgroundColor: config.accentColor }}
              >
                <Ticket className="w-4 h-4" />
                <span>Generar Ticket & Enviar a Sala de Espera</span>
              </button>
            </div>

          </form>

        </div>

        {/* Right 4 Cols: Summary & Recent Tickets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Ticket Badge Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
                ATP MEDICAL RECEPTION
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date().toLocaleDateString('es-ES')}
              </span>
            </div>

            <div className="py-2">
              <span className="text-xs text-slate-400">Ticket en Generación:</span>
              <div className="text-4xl font-black font-mono text-white tracking-wider mt-0.5">
                {nextTicketNumber}
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
              Al emitir el ticket, el paciente quedará registrado con su número de turno y podrá ser llamado inmediatamente a consultorio desde el módulo de <strong>Pacientes en Sala</strong>.
            </p>
          </div>

          {/* Recent Tickets List */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Últimos Tickets Emitidos Hoy</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">{intakes.length} totales</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {recentTickets.map(item => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.ticketNumber}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800 truncate max-w-[140px]">
                        {item.patientName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.specialty}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    item.status === 'en_espera' ? 'bg-amber-100 text-amber-800' :
                    item.status === 'llamado' ? 'bg-cyan-100 text-cyan-800' :
                    item.status === 'en_consulta' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status === 'en_espera' ? 'En Sala' :
                     item.status === 'llamado' ? 'Llamado' :
                     item.status === 'en_consulta' ? 'En Box' : 'Atendido'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: Ticket Emitido Exitosamente con Vista Imprimible */}
      {issuedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-sm w-full overflow-hidden">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Ticket Emitido</span>
              </div>
              <button 
                onClick={() => setIssuedTicket(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Ticket Slip */}
            <div className="p-6 space-y-4 text-xs font-mono printable-area">
              
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h2 className="text-base font-black tracking-tight text-slate-900 font-sans">
                  {config.clinicName}
                </h2>
                <p className="text-[11px] text-slate-500 font-sans">{config.branchName}</p>
                <div className="mt-3 text-3xl font-black tracking-widest text-slate-900 bg-slate-100 py-2 rounded-lg border border-slate-200">
                  {issuedTicket.ticketNumber}
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  {new Date(issuedTicket.admissionTime).toLocaleString('es-ES')}
                </p>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">PACIENTE:</span>
                  <span className="font-bold text-slate-900 text-right">{issuedTicket.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CÉDULA / DNI:</span>
                  <span className="font-bold">{issuedTicket.patientDni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">EDAD:</span>
                  <span>{issuedTicket.patientAge} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TELÉFONO:</span>
                  <span>{issuedTicket.patientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CORREO:</span>
                  <span className="truncate max-w-[180px]">{issuedTicket.patientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DIRECCIÓN:</span>
                  <span className="truncate max-w-[180px]">{issuedTicket.patientAddress}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">ESPECIALIDAD:</span>
                  <span className="font-bold text-sky-700">{issuedTicket.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CONSULTORIO:</span>
                  <span className="font-bold">{issuedTicket.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MÉDICO:</span>
                  <span>{issuedTicket.doctorName}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-dashed border-slate-300 font-sans">
                <p>Por favor tome asiento en la sala de espera.</p>
                <p className="mt-0.5">Su número de ticket aparecerá en pantalla cuando sea llamado.</p>
              </div>

            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 no-print">
              <button
                onClick={() => {
                  setIssuedTicket(null);
                  onNavigateToWaitingRoom();
                }}
                className="px-3 py-1.5 text-xs text-sky-700 hover:bg-sky-50 rounded-md font-semibold"
              >
                Ir a Pacientes en Sala
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-xs hover:opacity-95"
                style={{ backgroundColor: config.primaryColor }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
