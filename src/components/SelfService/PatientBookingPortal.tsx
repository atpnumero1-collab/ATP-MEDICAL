import React, { useState, useMemo } from 'react';
import { Doctor, Appointment, Patient, ClinicConfig, AppointmentType } from '../../types';
import { normalizeDayStr, getDayInfo } from '../Appointments/AppointmentsModule';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Stethoscope, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Share2, 
  FileText, 
  ChevronRight,
  ShieldCheck,
  CalendarCheck2,
  CalendarPlus,
  ArrowLeft
} from 'lucide-react';

interface PatientBookingPortalProps {
  doctors: Doctor[];
  appointments: Appointment[];
  patients: Patient[];
  config: ClinicConfig;
  onBookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<string>;
  onRegisterPatient?: (patient: Patient) => void;
}

export const PatientBookingPortal: React.FC<PatientBookingPortalProps> = ({
  doctors,
  appointments,
  patients,
  config,
  onBookAppointment,
  onRegisterPatient
}) => {
  // Wizard steps: 1 = Doctor, 2 = Date & Time, 3 = Patient Data, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected state
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('TODAS');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Patient form fields
  const [patientDniType, setPatientDniType] = useState<'V' | 'E'>('V');
  const [patientDniNumber, setPatientDniNumber] = useState<string>('');
  const [patientFullName, setPatientFullName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('Primera Consulta');
  const [reason, setReason] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookedAppointmentId, setBookedAppointmentId] = useState<string>('');
  const [bookedTicketCode, setBookedTicketCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Get selected doctor
  const selectedDoctor = useMemo(() => {
    return doctors.find(d => d.id === selectedDoctorId) || null;
  }, [doctors, selectedDoctorId]);

  // Unique specialties
  const specialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach(d => {
      if (d.specialty) set.add(d.specialty);
    });
    return Array.from(set).sort();
  }, [doctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    if (selectedSpecialty === 'TODAS') return doctors;
    return doctors.filter(d => d.specialty === selectedSpecialty);
  }, [doctors, selectedSpecialty]);

  // Helper to test if a date matches the doctor's scheduleDays
  const isDateAllowedForDoctor = (dateStr: string, doctor: Doctor): boolean => {
    if (!dateStr || !doctor) return false;
    const { dayName } = getDayInfo(dateStr);
    const dayNorm = normalizeDayStr(dayName);
    const docDaysNorm = normalizeDayStr(doctor.scheduleDays);

    if (docDaysNorm.includes('DE LUNES A VIERNES') || docDaysNorm.includes('LUNES A VIERNES')) {
      return ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'].includes(dayNorm);
    }
    if (docDaysNorm.includes('TODOS LOS DIAS')) {
      return true;
    }
    return docDaysNorm.includes(dayNorm);
  };

  // Generate next 4 available dates for the selected doctor
  const suggestedDates = useMemo(() => {
    if (!selectedDoctor) return [];
    const dates: { dateStr: string; label: string }[] = [];
    const today = new Date();
    
    // Look up to 30 days ahead
    for (let i = 0; i < 30 && dates.length < 5; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() + i);
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      if (isDateAllowedForDoctor(dateStr, selectedDoctor)) {
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const label = `${dayNames[checkDate.getDay()]} ${checkDate.getDate()} de ${monthNames[checkDate.getMonth()]}`;
        dates.push({ dateStr, label: i === 0 ? `Hoy (${label})` : i === 1 ? `Mañana (${label})` : label });
      }
    }
    return dates;
  }, [selectedDoctor]);

  // Generate 30-min time slots for selected doctor and date
  const timeSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];

    const startH = parseInt(selectedDoctor.shiftStart?.split(':')[0] || '8', 10);
    const startM = parseInt(selectedDoctor.shiftStart?.split(':')[1] || '0', 10);
    const endH = parseInt(selectedDoctor.shiftEnd?.split(':')[0] || '12', 10);
    const endM = parseInt(selectedDoctor.shiftEnd?.split(':')[1] || '0', 10);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    // Existing booked appointments for this doctor on this date
    const bookedTimes = appointments
      .filter(a => a.doctorId === selectedDoctor.id && a.date === selectedDate && a.status !== 'cancelada')
      .map(a => a.time);

    const slots: { time: string; isBooked: boolean; displayTime: string }[] = [];
    for (let current = startTotal; current < endTotal; current += 30) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      // Format 12-hour display
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const displayTime = `${h12}:${String(m).padStart(2, '0')} ${period}`;

      slots.push({
        time: timeStr,
        isBooked: bookedTimes.includes(timeStr),
        displayTime
      });
    }

    return slots;
  }, [selectedDoctor, selectedDate, appointments]);

  // Handle DNI autofill if patient already exists in database
  const handleDniBlur = () => {
    if (!patientDniNumber.trim()) return;
    const fullDni = `${patientDniType}-${patientDniNumber.trim()}`;
    const found = patients.find(p => p.dni.replace(/[\.\s]/g, '').toLowerCase() === fullDni.replace(/[\.\s]/g, '').toLowerCase());
    if (found) {
      if (!patientFullName) setPatientFullName(found.fullName);
      if (!patientPhone) setPatientPhone(found.phone);
      if (!patientEmail && found.email) setPatientEmail(found.email);
    }
  };

  // Submit appointment
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedDoctor) {
      setErrorMessage('Por favor seleccione un médico especialista.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      setErrorMessage('Por favor seleccione fecha y hora para su cita.');
      return;
    }
    if (!patientFullName.trim() || !patientDniNumber.trim() || !patientPhone.trim()) {
      setErrorMessage('Por favor complete su Cédula, Nombre completo y Teléfono de contacto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDni = `${patientDniType}-${patientDniNumber.trim()}`;
      const patientId = `pat-${Date.now()}`;
      const ticketCode = `ATP-AG${Math.floor(1000 + Math.random() * 9000)}`;

      // Save/link patient
      if (onRegisterPatient) {
        const existingPatient = patients.find(p => p.dni.replace(/[\.\s]/g, '') === fullDni.replace(/[\.\s]/g, ''));
        if (!existingPatient) {
          onRegisterPatient({
            id: patientId,
            dni: fullDni,
            fullName: patientFullName.trim(),
            birthDate: '',
            gender: 'Otro',
            phone: patientPhone.trim(),
            email: patientEmail.trim(),
            address: 'Caracas, Venezuela',
            insurance: 'Particular',
            allergies: [],
            chronicConditions: [],
            emergencyContact: { name: '', phone: '', relation: '' },
            notes: 'Registrado vía portal de autogestión WhatsApp',
            createdAt: new Date().toISOString()
          });
        }
      }

      const newAppointment: Omit<Appointment, 'id' | 'createdAt'> = {
        patientId,
        patientName: patientFullName.trim(),
        patientDni: fullDni,
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim(),
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: selectedDate,
        time: selectedTime,
        durationMinutes: 30,
        type: appointmentType,
        status: 'confirmada',
        reason: reason.trim() || 'Consulta médica autogestionada por el paciente vía Web/WhatsApp',
        notes: `Cita autogestionada vía enlace de WhatsApp. Código: ${ticketCode}`,
        source: 'autogestionada',
        isSelfManaged: true
      };

      const generatedId = await onBookAppointment(newAppointment);
      setBookedAppointmentId(generatedId);
      setBookedTicketCode(ticketCode);
      setStep(4);
    } catch (err: any) {
      console.error('Error booking self-managed appointment:', err);
      setErrorMessage('Hubo un inconveniente al guardar su cita. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp share link for the patient voucher
  const handleShareVoucherWhatsApp = () => {
    if (!selectedDoctor) return;
    const text = encodeURIComponent(
      `*COMPROBANTE DE CITA MÉDICA - ATP MEDICAL*\n` +
      `Código: *${bookedTicketCode}*\n` +
      `Paciente: *${patientFullName}* (${patientDniType}-${patientDniNumber})\n` +
      `Especialista: *${selectedDoctor.name}*\n` +
      `Especialidad: *${selectedDoctor.specialty}*\n` +
      `Consultorio: *${selectedDoctor.room}*\n` +
      `Fecha: *${selectedDate}*\n` +
      `Hora: *${selectedTime}*\n` +
      `Ubicación: *Piso 1, Oficina 5, C.C. Parque Humboldt, Caracas*\n` +
      `Teléfono: *${config.phone}*\n\n` +
      `_Por favor presentarse 15 minutos antes de su hora pautada._`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Google Calendar Link
  const handleAddToGoogleCalendar = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    const [year, month, day] = selectedDate.split('-');
    const [hours, minutes] = selectedTime.split(':');
    const start = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
    const end = new Date(start.getTime() + 30 * 60000);

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatCalDate = (d: Date) => 
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const title = encodeURIComponent(`Cita Médica ATP Medical: ${selectedDoctor.specialty} (${selectedDoctor.name})`);
    const details = encodeURIComponent(
      `Cita Médica en ATP Medical Caracas\n` +
      `Especialista: ${selectedDoctor.name} (${selectedDoctor.specialty})\n` +
      `Consultorio: ${selectedDoctor.room}\n` +
      `Paciente: ${patientFullName}\n` +
      `Código de Cita: ${bookedTicketCode}\n` +
      `Teléfono: ${config.phone}`
    );
    const location = encodeURIComponent(`${config.address}`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatCalDate(start)}/${formatCalDate(end)}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100 text-slate-800 flex flex-col antialiased">
      
      {/* Top Patient Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm"
              style={{ backgroundColor: config.primaryColor }}
            >
              ATP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  {config.clinicName}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  Autogestión en Línea
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {config.branchName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href={`https://wa.me/584143651970?text=${encodeURIComponent('Hola ATP Medical, tengo una consulta sobre mi cita médica.')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ayuda WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Wizard Progress Bar */}
        <div className="max-w-3xl mx-auto px-4 pb-2.5 pt-1">
          <div className="grid grid-cols-3 gap-2 text-xs font-medium text-center">
            <button
              onClick={() => step > 1 && setStep(1)}
              disabled={step === 4}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                step === 1 
                  ? 'bg-sky-600 text-white font-bold shadow-xs' 
                  : step > 1 
                  ? 'bg-slate-200 text-slate-700' 
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/15 inline-flex items-center justify-center text-[10px]">1</span>
              <span>Médico</span>
            </button>

            <button
              onClick={() => selectedDoctor && step > 2 && setStep(2)}
              disabled={!selectedDoctor || step === 4}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                step === 2 
                  ? 'bg-sky-600 text-white font-bold shadow-xs' 
                  : step > 2 
                  ? 'bg-slate-200 text-slate-700' 
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/15 inline-flex items-center justify-center text-[10px]">2</span>
              <span>Fecha y Turno</span>
            </button>

            <button
              disabled={!selectedDate || !selectedTime || step === 4}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                step === 3 
                  ? 'bg-sky-600 text-white font-bold shadow-xs' 
                  : step === 4 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/15 inline-flex items-center justify-center text-[10px]">3</span>
              <span>Confirmación</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto px-4 py-6 flex-1">
        
        {/* Banner with Doctor Notice */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-sky-100 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <h2 className="font-bold text-slate-900 text-sm">
              Agenda tu cita médica oficial en ATP Medical
            </h2>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              Elige tu especialista, selecciona uno de los días asignados en su cronograma oficial y reserva tu cupo en tiempo real.
            </p>
          </div>
        </div>

        {/* STEP 1: Select Specialty and Doctor */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Specialty Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Filtrar por Especialidad
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSpecialty('TODAS')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedSpecialty === 'TODAS'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todas las Especialidades ({doctors.length})
                </button>
                {specialties.map(spec => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedSpecialty === spec
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span>Especialistas Disponibles ({filteredDoctors.length})</span>
                <span>Seleccione un médico para ver turnos</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredDoctors.map(doc => {
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        setSelectedDate('');
                        setSelectedTime('');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/30 shadow-md'
                          : 'border-slate-200/80 bg-white hover:border-sky-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                            {doc.specialty}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {doc.room}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm mt-2 flex items-center gap-1.5">
                          <Stethoscope className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>{doc.name}</span>
                        </h3>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 space-y-1 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{doc.scheduleDays}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.scheduleHours}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Especialista Seleccionado</span>
                          </>
                        ) : (
                          <>
                            <span>Elegir Horario</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next button */}
            {selectedDoctor && (
              <div className="sticky bottom-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
                >
                  <span>Continuar con {selectedDoctor.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Date and Time */}
        {step === 2 && selectedDoctor && (
          <div className="space-y-5">
            {/* Selected Doctor Summary */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedDoctor.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedDoctor.specialty} · {selectedDoctor.room}
                  </p>
                  <p className="text-[11px] text-sky-700 font-semibold mt-0.5">
                    Días: {selectedDoctor.scheduleDays} ({selectedDoctor.scheduleHours})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-sky-600 hover:underline font-semibold"
              >
                Cambiar
              </button>
            </div>

            {/* Date Selection */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Seleccione la Fecha de Atención
                </h3>
              </div>

              {/* Quick Suggestions based on doctor days */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  Próximas fechas disponibles según cronograma del doctor:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedDates.map(item => (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(item.dateStr);
                        setSelectedTime('');
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        selectedDate === item.dateStr
                          ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-sky-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarCheck2 className="w-4 h-4 text-sky-600" />
                        <span>{item.label}</span>
                      </div>
                      {selectedDate === item.dateStr && (
                        <Check className="w-4 h-4 text-sky-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Date Picker */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                  O elija otra fecha en el calendario:
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedDate(val);
                    setSelectedTime('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />

                {selectedDate && !isDateAllowedForDoctor(selectedDate, selectedDoctor) && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Día no laborable para este especialista: </span>
                      <span>{selectedDoctor.name} atiende únicamente los días <b>{selectedDoctor.scheduleDays}</b>. Por favor elija un día correspondiente.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && isDateAllowedForDoctor(selectedDate, selectedDoctor) && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      2. Seleccione el Turno / Hora
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Duración: 30 minutos
                  </span>
                </div>

                {timeSlots.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No hay turnos disponibles para esta fecha.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={slot.isBooked}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                          slot.isBooked
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            : selectedTime === slot.time
                            ? 'bg-sky-600 border-sky-600 text-white shadow-sm ring-2 ring-sky-600/30'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-sky-400 hover:bg-sky-50/50'
                        }`}
                      >
                        <span>{slot.displayTime}</span>
                        <span className="text-[10px] font-normal opacity-80">
                          {slot.isBooked ? 'Ocupado' : 'Disponible'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>

              <button
                type="button"
                disabled={!selectedDate || !selectedTime || !isDateAllowedForDoctor(selectedDate, selectedDoctor)}
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <span>Continuar a Datos del Paciente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Patient Form & Confirmation */}
        {step === 3 && selectedDoctor && (
          <form onSubmit={handleConfirmBooking} className="space-y-5">
            {/* Appointment Preview Pill */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                  Resumen de la Cita Médica
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {selectedDoctor.specialty} con {selectedDoctor.name}
                </p>
                <p className="text-slate-600">
                  📅 <b>{selectedDate}</b> a las ⏰ <b>{selectedTime}</b> ({selectedDoctor.room})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-sky-700 hover:underline self-start sm:self-center"
              >
                Cambiar Fecha/Hora
              </button>
            </div>

            {/* Patient Form Fields */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Datos del Paciente
                </h3>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* DNI / Cédula */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cédula de Identidad *
                </label>
                <div className="flex gap-2">
                  <select
                    value={patientDniType}
                    onChange={(e) => setPatientDniType(e.target.value as 'V' | 'E')}
                    className="w-20 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="V">V-</option>
                    <option value="E">E-</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 18324908"
                    value={patientDniNumber}
                    onChange={(e) => setPatientDniNumber(e.target.value)}
                    onBlur={handleDniBlur}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Si ya está registrado en ATP Medical, se cargarán sus datos automáticamente al escribir la cédula.
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre y Apellido Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carmen Elena Pérez Rivas"
                  value={patientFullName}
                  onChange={(e) => setPatientFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Teléfono Celular / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+58 414-1234567"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="paciente@correo.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Appointment Type */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tipo de Cita
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Primera Consulta', 'Control / Seguimiento', 'Examen / Procedimiento'] as AppointmentType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAppointmentType(type)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        appointmentType === type
                          ? 'border-sky-500 bg-sky-50 text-sky-900'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / Symptoms */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Motivo de la Consulta / Síntomas Principales
                </label>
                <textarea
                  rows={2}
                  placeholder="Describa brevemente el motivo de su visita o chequeo..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Identification notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Esta cita quedará registrada con identificador <b>«Cita Autogestionada»</b> y se reflejará en vivo en recepción de ATP Medical.
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
              >
                Volver
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>Guardando Cita en la Base de Datos...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirmar y Reservar Mi Cita Médica</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Success & Digital Voucher */}
        {step === 4 && selectedDoctor && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-1">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                ¡Tu Cita Médica ha sido Reservada con Éxito!
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Tu cita está registrada en tiempo real en el sistema de ATP Medical Caracas.
              </p>
            </div>

            {/* Digital Voucher Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
              <div 
                className="p-5 text-white flex items-center justify-between"
                style={{ backgroundColor: config.primaryColor }}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-sky-200">
                    Comprobante Digital Oficial
                  </span>
                  <h3 className="text-lg font-black tracking-tight">
                    ATP MEDICAL CARACAS
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {config.branchName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-200 block">
                    Código de Cita
                  </span>
                  <span className="text-base font-mono font-black text-emerald-300">
                    {bookedTicketCode}
                  </span>
                </div>
              </div>

              {/* Voucher Body */}
              <div className="p-6 space-y-4 text-xs">
                {/* Badge Autogestionada */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-emerald-800">
                      Cita Autogestionada vía Web / WhatsApp
                    </span>
                  </div>
                  <span className="bg-sky-50 text-sky-800 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
                    {appointmentType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Paciente
                    </span>
                    <p className="font-bold text-slate-900 text-sm">
                      {patientFullName}
                    </p>
                    <p className="text-slate-600 font-mono">
                      Cédula: {patientDniType}-{patientDniNumber}
                    </p>
                    <p className="text-slate-600">
                      Tlf: {patientPhone}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Especialista & Ubicación
                    </span>
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedDoctor.name}
                    </p>
                    <p className="text-sky-700 font-semibold">
                      {selectedDoctor.specialty}
                    </p>
                    <p className="text-slate-600">
                      {selectedDoctor.room}
                    </p>
                  </div>
                </div>

                {/* Date and Time Highlight */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-5 h-5 text-sky-600" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Fecha Pautada
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {selectedDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Hora Pautada
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {selectedTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clinic Directions */}
                <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-100 flex items-start gap-2.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Lugar de Atención:
                    </span>
                    <span>{config.address}</span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Presentarse 15 minutos antes en la recepción del piso 1 para la toma de signos vitales y asignación de turno.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleShareVoucherWhatsApp}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Guardar Comprobante en mi WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToGoogleCalendar}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-white text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <CalendarPlus className="w-4 h-4 text-sky-600" />
                  <span>Añadir a Google Calendar</span>
                </button>
              </div>
            </div>

            {/* Book Another Appointment */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctorId('');
                  setSelectedDate('');
                  setSelectedTime('');
                  setPatientFullName('');
                  setPatientDniNumber('');
                  setPatientPhone('');
                  setReason('');
                  setStep(1);
                }}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                + Agendar otra cita médica
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-xs text-slate-500 text-center">
        <p className="font-semibold text-slate-700">
          {config.clinicName} · {config.slogan}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {config.address} · Atención telefónica: {config.phone}
        </p>
      </footer>

    </div>
  );
};
