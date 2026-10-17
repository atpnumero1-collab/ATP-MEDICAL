import React, { useState, useMemo } from 'react';
import { 
  Appointment, 
  Doctor, 
  Patient, 
  AppointmentStatus, 
  AppointmentType, 
  ClinicConfig 
} from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Search, 
  Plus, 
  ArrowRight, 
  X, 
  MessageSquare, 
  Copy, 
  Check, 
  AlertCircle,
  AlertTriangle,
  Phone,
  FileText,
  Stethoscope,
  Building,
  CheckCircle2,
  CalendarCheck,
  LayoutGrid,
  List,
  Sparkles,
  Users,
  ShieldAlert
} from 'lucide-react';
import { getTodayDateString } from '../../data/initialData';

// --- UTILITIES FOR STRICT SCHEDULE RESTRICTIONS ---

/**
 * Normaliza nombres de días quitando acentos y espacios
 */
export const normalizeDayStr = (str: string): string => {
  return (str || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Obtiene el día de la semana para una fecha YYYY-MM-DD
 */
export const getDayInfo = (dateStr: string) => {
  if (!dateStr) return { dayIndex: -1, dayName: '', dayNormalized: '' };
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayIndex = date.getDay(); // 0: Domingo, 1: Lunes, 2: Martes, 3: Miércoles, 4: Jueves, 5: Viernes, 6: Sábado
  const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const normalized = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  return {
    dayIndex,
    dayName: days[dayIndex] || '',
    dayNormalized: normalized[dayIndex] || ''
  };
};

/**
 * Evalúa si la fecha elegida cumple ESTRICTAMENTE con los días de atención del médico
 */
export const evaluateDoctorDayMatch = (doctor: Doctor | null, dateStr: string) => {
  if (!doctor || !dateStr) {
    return {
      isValid: false,
      isDaySelected: false,
      dayName: '',
      message: 'Seleccione un especialista y una fecha de consulta.'
    };
  }

  const { dayIndex, dayName, dayNormalized } = getDayInfo(dateStr);
  const docDaysNormalized = normalizeDayStr(doctor.scheduleDays);

  // Caso: DE LUNES A VIERNES
  if (docDaysNormalized.includes('DE LUNES A VIERNES')) {
    const isWeekday = dayIndex >= 1 && dayIndex <= 5;
    return {
      isValid: isWeekday,
      isDaySelected: true,
      dayName,
      message: isWeekday
        ? `✓ Día autorizado: ${doctor.name} atiende de Lunes a Viernes (${dayName}).`
        : `⛔ DÍA NO PERMITIDO: ${doctor.name} atiende únicamente de Lunes a Viernes. La fecha seleccionada cae en ${dayName}. No es posible agendar fuera de los días establecidos.`
    };
  }

  // Caso: Día(s) específico(s) (LUNES, MARTES, MIÉRCOLES, JUEVES, VIERNES, SÁBADO)
  const isMatch = docDaysNormalized.includes(dayNormalized);
  return {
    isValid: isMatch,
    isDaySelected: true,
    dayName,
    message: isMatch
      ? `✓ Día autorizado: Coincide exactamente con el día oficial de consulta (${doctor.scheduleDays}).`
      : `⛔ DÍA NO PERMITIDO: ${doctor.name} atiende únicamente los días ${doctor.scheduleDays}. La fecha seleccionada cae en ${dayName}. No es posible agendar fuera de los días establecidos.`
  };
};

/**
 * Obtiene límites exactos en minutos para la jornada del doctor
 */
export const getDoctorShiftTimes = (doctor: Doctor) => {
  let startMinutes = 8 * 60; // 08:00
  let endMinutes = 12 * 60; // 12:00
  let startStr = doctor.shiftStart || '08:00';
  let endStr = doctor.shiftEnd || '12:00';

  const hoursStr = (doctor.scheduleHours || '').toUpperCase();
  if (hoursStr.includes('01:00') || hoursStr.includes('1:00')) {
    if (!hoursStr.includes('8:00')) {
      // Turno Tarde exclusivo: 13:00 a 17:00
      startMinutes = 13 * 60;
      endMinutes = 17 * 60;
      startStr = '13:00';
      endStr = '17:00';
    }
  } else if (hoursStr.includes('8:00') && (hoursStr.includes('05:00') || hoursStr.includes('5:00') || hoursStr.includes('17:00'))) {
    // Jornada completa: 08:00 a 17:00
    startMinutes = 8 * 60;
    endMinutes = 17 * 60;
    startStr = '08:00';
    endStr = '17:00';
  } else if (hoursStr.includes('8:00') && (hoursStr.includes('12:00') || hoursStr.includes('12:00 PM'))) {
    // Turno Mañana exclusivo: 08:00 a 12:00
    startMinutes = 8 * 60;
    endMinutes = 12 * 60;
    startStr = '08:00';
    endStr = '12:00';
  }

  return {
    startMinutes,
    endMinutes,
    startStr,
    endStr
  };
};

/**
 * Evalúa si la hora seleccionada cumple ESTRICTAMENTE con los horarios de atención del médico
 */
export const evaluateDoctorTimeMatch = (
  doctor: Doctor | null, 
  timeStr: string, 
  durationMinutes: number
) => {
  if (!doctor || !timeStr) {
    return {
      isValid: false,
      message: 'Indique una hora válida para la cita.'
    };
  }

  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) {
    return {
      isValid: false,
      message: 'Formato de hora inválido.'
    };
  }

  const aptStartMin = h * 60 + m;
  const aptEndMin = aptStartMin + (durationMinutes || 30);
  const { startMinutes, endMinutes, startStr, endStr } = getDoctorShiftTimes(doctor);

  if (aptStartMin < startMinutes) {
    return {
      isValid: false,
      message: `⛔ HORARIO NO PERMITIDO: La hora elegida (${timeStr}) es previa al inicio de atención (${startStr}). El horario establecido para ${doctor.name} es ${doctor.scheduleHours}.`
    };
  }

  if (aptEndMin > endMinutes) {
    const endH = Math.floor(aptEndMin / 60);
    const endM = aptEndMin % 60;
    const endFormatted = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    return {
      isValid: false,
      message: `⛔ HORARIO NO PERMITIDO: La cita finaliza a las ${endFormatted}, excediendo el límite de la jornada (${endStr}). El horario establecido para ${doctor.name} es ${doctor.scheduleHours}.`
    };
  }

  return {
    isValid: true,
    message: `✓ Horario autorizado: Dentro del bloque oficial de atención (${doctor.scheduleHours}).`
  };
};

/**
 * Genera las próximas N fechas válidas correspondientes a los días del médico
 */
export const getUpcomingValidDates = (doctor: Doctor | null, count: number = 4) => {
  if (!doctor) return [];
  const results: { dateStr: string; label: string; dayName: string }[] = [];
  const docDaysNormalized = normalizeDayStr(doctor.scheduleDays);
  
  const today = new Date();
  for (let offset = 0; offset <= 45 && results.length < count; offset++) {
    const d = new Date();
    d.setDate(today.getDate() + offset);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yr}-${mo}-${da}`;

    const { dayIndex, dayName, dayNormalized } = getDayInfo(dateStr);
    
    let isMatch = false;
    if (docDaysNormalized.includes('DE LUNES A VIERNES')) {
      isMatch = dayIndex >= 1 && dayIndex <= 5;
    } else {
      isMatch = docDaysNormalized.includes(dayNormalized);
    }

    if (isMatch) {
      const shortDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const label = `${shortDays[dayIndex]} ${da} ${monthNames[d.getMonth()]}`;
      results.push({ dateStr, label, dayName });
    }
  }
  return results;
};

interface AppointmentsModuleProps {
  appointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  config: ClinicConfig;
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onPassToIntake: (appointment: Appointment) => void;
  isOpenNewModal: boolean;
  setIsOpenNewModal: (open: boolean) => void;
}

export const AppointmentsModule: React.FC<AppointmentsModuleProps> = ({
  appointments,
  doctors,
  patients,
  config,
  onAddAppointment,
  onUpdateStatus,
  onPassToIntake,
  isOpenNewModal,
  setIsOpenNewModal
}) => {
  // Main view tab: 'agenda' | 'doctors-schedule' | 'weekly-grid'
  const [activeTab, setActiveTab] = useState<'agenda' | 'doctors-schedule' | 'weekly-grid'>('agenda');

  // Filters for Agenda view
  const [selectedDateFilter, setSelectedDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'all'>('today');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter for Doctors schedule view
  const [filterDay, setFilterDay] = useState<string>('ALL');

  // Notification modal state
  const [reminderAppointment, setReminderAppointment] = useState<Appointment | null>(null);
  const [copiedReminder, setCopiedReminder] = useState(false);

  // New appointment form state
  const [newPatientMode, setNewPatientMode] = useState<'existing' | 'quick'>('existing');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [quickPatientName, setQuickPatientName] = useState('');
  const [quickPatientDni, setQuickPatientDni] = useState('');
  const [quickPatientPhone, setQuickPatientPhone] = useState('');
  const [quickPatientEmail, setQuickPatientEmail] = useState('');
  const [formDoctorId, setFormDoctorId] = useState('');
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formTime, setFormTime] = useState('08:30');
  const [formDuration, setFormDuration] = useState(30);
  const [formType, setFormType] = useState<AppointmentType>('Primera Consulta');
  const [formReason, setFormReason] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const todayStr = getTodayDateString();
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const weekEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }, []);

  const specialties = useMemo(() => {
    const set = new Set(doctors.map(d => d.specialty));
    return Array.from(set);
  }, [doctors]);

  // Selected doctor object for the form
  const selectedDocObj = useMemo(() => {
    return doctors.find(d => d.id === formDoctorId) || null;
  }, [doctors, formDoctorId]);

  // STRICT DAY VALIDATION
  const dayValidation = useMemo(() => {
    return evaluateDoctorDayMatch(selectedDocObj, formDate);
  }, [selectedDocObj, formDate]);

  // STRICT TIME VALIDATION
  const timeValidation = useMemo(() => {
    return evaluateDoctorTimeMatch(selectedDocObj, formTime, formDuration);
  }, [selectedDocObj, formTime, formDuration]);

  // Overall strict rule satisfaction
  const isFormScheduleValid = Boolean(selectedDocObj && dayValidation.isValid && timeValidation.isValid);

  // Next upcoming valid dates for the selected doctor
  const upcomingDates = useMemo(() => {
    return getUpcomingValidDates(selectedDocObj, 4);
  }, [selectedDocObj]);

  // Generate suggested time slots strictly inside the doctor's shift
  const suggestedSlots = useMemo(() => {
    if (!selectedDocObj) return [];
    const { startMinutes, endMinutes } = getDoctorShiftTimes(selectedDocObj);
    const slots: string[] = [];
    for (let m = startMinutes; m + formDuration <= endMinutes; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    }
    return slots;
  }, [selectedDocObj, formDuration]);

  // Check which slots are already booked for this doctor on formDate
  const bookedSlots = useMemo(() => {
    if (!selectedDocObj || !formDate) return new Set<string>();
    const booked = appointments
      .filter(a => a.doctorId === selectedDocObj.id && a.date === formDate && a.status !== 'cancelada')
      .map(a => a.time);
    return new Set(booked);
  }, [appointments, selectedDocObj, formDate]);

  // Quick helper to jump to the next matching day for a doctor
  const setNextMatchingDate = (targetDayName: string) => {
    const dayMap: Record<string, number> = {
      'DOMINGO': 0,
      'LUNES': 1,
      'MARTES': 2,
      'MIÉRCOLES': 3,
      'MIERCOLES': 3,
      'JUEVES': 4,
      'VIERNES': 5,
      'SÁBADO': 6,
      'SABADO': 6
    };

    let targetIndex = 1;
    const upper = normalizeDayStr(targetDayName);
    if (upper.includes('DE LUNES A VIERNES')) {
      const cur = new Date().getDay();
      targetIndex = (cur >= 1 && cur <= 5) ? cur : 1;
    } else {
      for (const [k, v] of Object.entries(dayMap)) {
        if (upper.includes(normalizeDayStr(k))) {
          targetIndex = v;
          break;
        }
      }
    }

    const today = new Date();
    const currentDay = today.getDay();
    let diff = targetIndex - currentDay;
    if (diff < 0) diff += 7;
    if (diff === 0 && upper.includes('DE LUNES A VIERNES') && (currentDay < 1 || currentDay > 5)) {
      diff = (1 - currentDay + 7) % 7;
    }

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + diff);

    const yr = nextDate.getFullYear();
    const mo = String(nextDate.getMonth() + 1).padStart(2, '0');
    const da = String(nextDate.getDate()).padStart(2, '0');
    setFormDate(`${yr}-${mo}-${da}`);
  };

  // Open modal with pre-selected doctor and auto-configured valid schedule
  const handleOpenModalForDoctor = (doc: Doctor, preferredDay?: string) => {
    setFormDoctorId(doc.id);
    setNextMatchingDate(preferredDay || doc.scheduleDays);
    
    // Set first available slot inside shift
    const shiftInfo = getDoctorShiftTimes(doc);
    setFormTime(shiftInfo.startStr);
    
    setFormError('');
    setIsOpenNewModal(true);
  };

  // When doctor changes in dropdown, initialize with valid date and valid slot
  const handleDoctorChange = (docId: string) => {
    setFormDoctorId(docId);
    setFormError('');
    const doc = doctors.find(d => d.id === docId);
    if (doc) {
      setNextMatchingDate(doc.scheduleDays);
      const shiftInfo = getDoctorShiftTimes(doc);
      setFormTime(shiftInfo.startStr);
    }
  };

  // Filtered appointments for Agenda
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // Date filter
      if (selectedDateFilter === 'today' && apt.date !== todayStr) return false;
      if (selectedDateFilter === 'tomorrow' && apt.date !== tomorrowStr) return false;
      if (selectedDateFilter === 'week' && (apt.date < todayStr || apt.date > weekEndStr)) return false;

      // Specialty
      if (selectedSpecialty !== 'all' && apt.specialty !== selectedSpecialty) return false;

      // Doctor
      if (selectedDoctor !== 'all' && apt.doctorId !== selectedDoctor) return false;

      // Status
      if (selectedStatus !== 'all' && apt.status !== selectedStatus) return false;

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = apt.patientName.toLowerCase().includes(query);
        const matchesDni = apt.patientDni.toLowerCase().includes(query);
        const matchesDoc = apt.doctorName.toLowerCase().includes(query);
        const matchesReason = apt.reason.toLowerCase().includes(query);
        if (!matchesName && !matchesDni && !matchesDoc && !matchesReason) return false;
      }

      return true;
    }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [appointments, selectedDateFilter, selectedSpecialty, selectedDoctor, selectedStatus, searchQuery, todayStr, tomorrowStr, weekEndStr]);

  // Filtered doctors for the directory cartelera
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      if (filterDay === 'ALL') return true;
      const days = normalizeDayStr(doc.scheduleDays || '');
      const filterNormalized = normalizeDayStr(filterDay);
      if (days.includes('DE LUNES A VIERNES') && ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'].includes(filterNormalized)) {
        return true;
      }
      return days.includes(filterNormalized);
    });
  }, [doctors, filterDay]);

  // Statistics
  const stats = useMemo(() => {
    const todayList = appointments.filter(a => a.date === todayStr);
    return {
      totalToday: todayList.length,
      confirmed: todayList.filter(a => a.status === 'confirmada').length,
      inClinic: todayList.filter(a => a.status === 'en_espera' || a.status === 'en_consulta').length,
      completed: todayList.filter(a => a.status === 'completada').length,
      pending: todayList.filter(a => a.status === 'pendiente').length,
      totalDoctors: doctors.length
    };
  }, [appointments, doctors, todayStr]);

  // Handle create appointment with STRICT validation
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    let pName = '';
    let pDni = '';
    let pPhone = '';
    let pId = '';

    if (newPatientMode === 'existing') {
      const found = patients.find(p => p.id === selectedPatientId);
      if (!found) {
        setFormError('Por favor seleccione un paciente registrado de la lista.');
        return;
      }
      pName = found.fullName;
      pDni = found.dni;
      pPhone = found.phone;
      pId = found.id;
    } else {
      if (!quickPatientName.trim() || !quickPatientDni.trim()) {
        setFormError('Ingrese al menos Nombre y Cédula de Identidad del paciente.');
        return;
      }
      pName = quickPatientName.trim();
      pDni = quickPatientDni.trim().startsWith('V-') ? quickPatientDni.trim() : `V-${quickPatientDni.trim()}`;
      pPhone = quickPatientPhone.trim() || '+58 414-3651970';
      pId = `pat-${Date.now()}`;
    }

    const doc = doctors.find(d => d.id === formDoctorId);
    if (!doc) {
      setFormError('Por favor seleccione un médico especialista.');
      return;
    }

    // STRICT RULE: No agendar citas fuera de los días establecidos
    const evalDay = evaluateDoctorDayMatch(doc, formDate);
    if (!evalDay.isValid) {
      setFormError(`⛔ REGLA ESTRICTA: No es posible agendar citas fuera de los días establecidos. ${evalDay.message}`);
      return;
    }

    // STRICT RULE: No agendar citas fuera de los horarios establecidos
    const evalTime = evaluateDoctorTimeMatch(doc, formTime, formDuration);
    if (!evalTime.isValid) {
      setFormError(`⛔ REGLA ESTRICTA: No es posible agendar citas fuera de los horarios establecidos. ${evalTime.message}`);
      return;
    }

    // Collision check for the doctor on date & time
    const collision = appointments.find(
      a => a.doctorId === doc.id && a.date === formDate && a.time === formTime && a.status !== 'cancelada'
    );
    if (collision) {
      setFormError(`El especialista ${doc.name} ya tiene una cita ocupada a las ${formTime} (${collision.patientName}). Por favor seleccione otro horario disponible.`);
      return;
    }

    onAddAppointment({
      patientId: pId,
      patientName: pName,
      patientDni: pDni,
      patientPhone: pPhone,
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      date: formDate,
      time: formTime,
      durationMinutes: Number(formDuration),
      type: formType,
      status: 'confirmada',
      reason: formReason.trim() || 'Consulta médica de especialidad',
      notes: formNotes.trim() || undefined
    });

    setIsOpenNewModal(false);
    // Reset form
    setSelectedPatientId('');
    setQuickPatientName('');
    setQuickPatientDni('');
    setQuickPatientPhone('');
    setQuickPatientEmail('');
    setFormReason('');
    setFormNotes('');
  };

  const getReminderMessage = (apt: Appointment) => {
    return `Estimado/a ${apt.patientName}, le recordamos su cita en ${config.clinicName} el día ${apt.date} a las ${apt.time} hrs con ${apt.doctorName} (${apt.specialty}). Dirección: ${config.address}. Teléfono: ${config.phone}. Por favor presentarse 15 minutos antes para su recepción y asignación de ticket.`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2200);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Clinic Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span 
              className="w-2.5 h-6 rounded-full inline-block"
              style={{ backgroundColor: config.accentColor }}
            />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Citas y Agendamiento
            </h1>
            <span 
              className="text-xs font-semibold px-2.5 py-0.5 rounded-md text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              {config.clinicName} Caracas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Programación de consultas con validación estricta de días y horarios de atención en C.C. Parque Humboldt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (doctors.length > 0 && !formDoctorId) {
                handleDoctorChange(doctors[0].id);
              }
              setIsOpenNewModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95 transition-all"
            style={{ backgroundColor: config.accentColor }}
          >
            <Plus className="w-4 h-4" />
            <span>+ Agendar Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Citas Hoy</span>
          <div className="text-2xl font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
            {stats.totalToday}
          </div>
          <span className="text-[11px] text-slate-400">Total en agenda</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Confirmadas</span>
          <div className="text-2xl font-bold text-sky-600 mt-0.5 font-mono tabular-nums">
            {stats.confirmed}
          </div>
          <span className="text-[11px] text-slate-400">Listas para ingreso</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">En Sala / Box</span>
          <div className="text-2xl font-bold text-emerald-600 mt-0.5 font-mono tabular-nums">
            {stats.inClinic}
          </div>
          <span className="text-[11px] text-slate-400">En atención física</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Atendidas</span>
          <div className="text-2xl font-bold text-slate-700 mt-0.5 font-mono tabular-nums">
            {stats.completed}
          </div>
          <span className="text-[11px] text-slate-400">Completadas hoy</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-500 font-medium">Especialistas</span>
          <div className="text-2xl font-bold text-indigo-600 mt-0.5 font-mono tabular-nums">
            {stats.totalDoctors}
          </div>
          <span className="text-[11px] text-slate-400">Cuerpo médico ATP</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'agenda'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <List className="w-4 h-4 text-sky-600" />
          <span>Agenda de Citas</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
            {appointments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('doctors-schedule')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'doctors-schedule'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-sky-600" />
          <span>Cartelera de Especialistas & Horarios</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
            11
          </span>
        </button>

        <button
          onClick={() => setActiveTab('weekly-grid')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'weekly-grid'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-sky-600" />
          <span>Cronograma Semanal</span>
        </button>
      </div>

      {/* VIEW 1: AGENDA DE CITAS */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              
              {/* Search */}
              <div className="relative md:col-span-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar paciente, C.I., médico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50/50"
                />
              </div>

              {/* Date Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setSelectedDateFilter('today')}
                  className={`flex-1 py-1 px-2 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                    selectedDateFilter === 'today' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setSelectedDateFilter('tomorrow')}
                  className={`flex-1 py-1 px-2 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                    selectedDateFilter === 'tomorrow' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mañana
                </button>
                <button
                  onClick={() => setSelectedDateFilter('week')}
                  className={`flex-1 py-1 px-2 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                    selectedDateFilter === 'week' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7 Días
                </button>
                <button
                  onClick={() => setSelectedDateFilter('all')}
                  className={`flex-1 py-1 px-2 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                    selectedDateFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas
                </button>
              </div>

              {/* Specialty Filter */}
              <div>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50/50 text-slate-700"
                >
                  <option value="all">Todas las Especialidades</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50/50 text-slate-700"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="pendiente">Pendiente Confirmación</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="en_espera">En Sala de Espera</option>
                  <option value="en_consulta">En Consulta</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

            </div>
          </div>

          {/* Appointments List / Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Citas Médicas Programadas ({filteredAppointments.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                {selectedDateFilter === 'today' ? `Día de hoy: ${todayStr}` : 'Mostrando resultados según filtro'}
              </span>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-slate-800">No se encontraron citas médicas</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  No hay citas que coincidan con la búsqueda o filtros aplicados.
                </p>
                <button
                  onClick={() => setIsOpenNewModal(true)}
                  className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white rounded-md inline-flex items-center gap-1.5 shadow-xs"
                  style={{ backgroundColor: config.accentColor }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Programar Cita Médica</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAppointments.map(apt => {
                  const statusColors: Record<AppointmentStatus, { text: string; bg: string }> = {
                    pendiente: { text: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
                    confirmada: { text: 'text-sky-800', bg: 'bg-sky-50 border-sky-200' },
                    en_espera: { text: 'text-purple-800', bg: 'bg-purple-50 border-purple-200' },
                    en_consulta: { text: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
                    completada: { text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' },
                    cancelada: { text: 'text-red-700', bg: 'bg-red-50 border-red-200' }
                  };

                  const statusLabels: Record<AppointmentStatus, string> = {
                    pendiente: 'Pendiente Confirmación',
                    confirmada: 'Confirmada',
                    en_espera: 'En Sala de Espera',
                    en_consulta: 'En Consulta con Médico',
                    completada: 'Atención Completada',
                    cancelada: 'Cancelada'
                  };

                  const doc = doctors.find(d => d.id === apt.doctorId);

                  return (
                    <div 
                      key={apt.id} 
                      className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Time & Patient Details */}
                      <div className="flex items-start gap-4">
                        <div className="w-20 shrink-0 text-center py-2 px-1 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="text-base font-bold text-slate-900 font-mono tabular-nums leading-none">
                            {apt.time}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 font-medium">
                            {apt.durationMinutes} min
                          </div>
                          <div className="text-[10px] text-sky-700 font-mono mt-0.5 font-semibold">
                            {apt.date}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">
                              {apt.patientName}
                            </span>
                            <span className="text-xs text-slate-600 font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded">
                              C.I. {apt.patientDni}
                            </span>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusColors[apt.status].bg} ${statusColors[apt.status].text}`}>
                              {statusLabels[apt.status]}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                              {apt.doctorName}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-sky-700">{apt.specialty}</span>
                            {doc && (
                              <>
                                <span>·</span>
                                <span className="bg-sky-50 text-sky-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-sky-200">
                                  {doc.scheduleDays} · {doc.scheduleHours}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 flex items-center gap-2 pt-0.5">
                            <span className="text-slate-400 font-medium">Motivo:</span>
                            <span>{apt.reason}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-400">Tel:</span>
                            <span className="font-mono text-slate-700">{apt.patientPhone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                        
                        {/* Pasar a Ingreso / Ticket para Sala de Espera */}
                        {apt.status !== 'completada' && apt.status !== 'cancelada' && apt.status !== 'en_consulta' && (
                          <button
                            onClick={() => onPassToIntake(apt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md shadow-xs hover:opacity-95 transition-all"
                            style={{ backgroundColor: config.accentColor }}
                            title="Generar ticket de atención y enviar a Pacientes en Sala (Pendiente de Pago)"
                          >
                            <span>Generar Ticket & Sala</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* WhatsApp / SMS Reminder */}
                        <button
                          onClick={() => setReminderAppointment(apt)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md border border-slate-200 transition-colors"
                          title="Ver y copiar recordatorio para WhatsApp / Mensaje"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Status Select */}
                        <select
                          value={apt.status}
                          onChange={(e) => onUpdateStatus(apt.id, e.target.value as AppointmentStatus)}
                          className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 text-slate-700 font-medium"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="en_espera">En Sala de Espera</option>
                          <option value="en_consulta">En Consulta</option>
                          <option value="completada">Completada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CARTELERA OFICIAL DE ESPECIALISTAS & HORARIOS */}
      {activeTab === 'doctors-schedule' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                  <span>Listado Oficial de Médicos Especialistas</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Especialidad médica, días y horarios de consulta en ATP Medical Caracas.
                </p>
              </div>

              {/* Day filter pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'].map((day) => (
                  <button
                    key={day}
                    onClick={() => setFilterDay(day)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      filterDay === day
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day === 'ALL' ? 'Todos' : day}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {filteredDoctors.map(doc => {
                const docApts = appointments.filter(a => a.doctorId === doc.id);

                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span 
                            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block text-white mb-1.5"
                            style={{ backgroundColor: config.primaryColor }}
                          >
                            {doc.specialty}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">
                            {doc.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          {doc.room}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="w-4 h-4 text-sky-600 shrink-0" />
                          <span className="text-slate-600 font-medium">Día:</span>
                          <span className="font-bold text-slate-900">{doc.scheduleDays}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-slate-600 font-medium">Horario:</span>
                          <span className="font-bold text-slate-900 font-mono">{doc.scheduleHours}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-slate-500 font-mono text-[11px]">{doc.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {docApts.length} {docApts.length === 1 ? 'cita programada' : 'citas programadas'}
                      </span>
                      <button
                        onClick={() => handleOpenModalForDoctor(doc)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95 transition-all"
                        style={{ backgroundColor: config.accentColor }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agendar Cita</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CRONOGRAMA SEMANAL (LUNES A SÁBADO) */}
      {activeTab === 'weekly-grid' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-sky-600" />
                <span>Cronograma Semanal de Especialidades & Médicos</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribución operativa de lunes a sábado en ATP Medical (C.C. Parque Humboldt, Caracas).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                { day: 'LUNES', short: 'Lun' },
                { day: 'MARTES', short: 'Mar' },
                { day: 'MIÉRCOLES', short: 'Mié' },
                { day: 'JUEVES', short: 'Jue' },
                { day: 'VIERNES', short: 'Vie' },
                { day: 'SÁBADO', short: 'Sáb' }
              ].map(({ day }) => {
                const dayNormalized = normalizeDayStr(day);
                const dayDoctors = doctors.filter(doc => {
                  const schedule = normalizeDayStr(doc.scheduleDays || '');
                  if (schedule.includes('DE LUNES A VIERNES')) return true;
                  return schedule.includes(dayNormalized);
                });

                return (
                  <div 
                    key={day}
                    className="bg-slate-50/70 rounded-xl border border-slate-200 p-3 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-xs text-slate-900 tracking-wide">
                          {day}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full">
                          {dayDoctors.length} {dayDoctors.length === 1 ? 'médico' : 'médicos'}
                        </span>
                      </div>

                      <div className="space-y-2.5 mt-3">
                        {dayDoctors.map(doc => (
                          <div 
                            key={doc.id}
                            className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-1.5"
                          >
                            <span className="text-[10px] font-bold text-sky-700 block truncate">
                              {doc.specialty}
                            </span>
                            <div className="text-xs font-bold text-slate-900 leading-snug">
                              {doc.name}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono font-medium">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{doc.scheduleHours}</span>
                            </div>
                            <button
                              onClick={() => handleOpenModalForDoctor(doc, day)}
                              className="w-full mt-1.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 transition-colors flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Agendar para este {day.toLowerCase()}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROGRAMAR NUEVA CITA MÉDICA CON CONTROL ESTRICTO */}
      {isOpenNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Programar Nueva Cita Médica</h3>
                  <p className="text-[11px] text-slate-500">ATP Medical Caracas — Cumplimiento estricto de días y horarios</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setFormError('');
                  setIsOpenNewModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              
              {/* Form Global Error Alert */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">
                    {formError}
                  </div>
                </div>
              )}

              {/* Paciente Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-semibold">Datos del Paciente *</label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setNewPatientMode('existing')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        newPatientMode === 'existing' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Registrado
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPatientMode('quick')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        newPatientMode === 'quick' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Nuevo Paciente
                    </button>
                  </div>
                </div>

                {newPatientMode === 'existing' ? (
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800 font-medium"
                  >
                    <option value="">Seleccione un paciente registrado...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} — C.I: {p.dni} ({p.phone})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-slate-600 font-medium">Nombres y Apellidos *</label>
                      <input 
                        type="text" 
                        value={quickPatientName} 
                        onChange={(e) => setQuickPatientName(e.target.value)}
                        placeholder="Ej. Martín José Valenzuela" 
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-slate-800 mt-0.5" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium">Cédula de Identidad *</label>
                      <input 
                        type="text" 
                        value={quickPatientDni} 
                        onChange={(e) => setQuickPatientDni(e.target.value)}
                        placeholder="Ej. V-18.456.789" 
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-slate-800 mt-0.5 font-mono" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium">Teléfono de Contacto *</label>
                      <input 
                        type="text" 
                        value={quickPatientPhone} 
                        onChange={(e) => setQuickPatientPhone(e.target.value)}
                        placeholder="+58 414-3651970" 
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-slate-800 mt-0.5 font-mono" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Médico Especialista */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Médico Especialista & Especialidad *
                </label>
                <select
                  value={formDoctorId}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800 font-medium"
                >
                  <option value="">Seleccione al especialista...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty} ({d.scheduleDays}: {d.scheduleHours})
                    </option>
                  ))}
                </select>
              </div>

              {/* Informative card of selected doctor's schedule */}
              {selectedDocObj && (
                <div className="bg-sky-50/80 border border-sky-200 p-3 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-950">
                    <span>{selectedDocObj.name} · {selectedDocObj.specialty}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-white rounded border border-sky-200">
                      {selectedDocObj.room}
                    </span>
                  </div>
                  <div className="text-[11px] text-sky-900 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                      <span>Días oficiales: <strong>{selectedDocObj.scheduleDays}</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Horario oficial: <strong>{selectedDocObj.scheduleHours}</strong></span>
                    </span>
                  </div>
                </div>
              )}

              {/* FECHA DE CONSULTA Y VALIDACIÓN ESTRICTA DE DÍAS */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-semibold">
                    1. Fecha de Consulta *
                  </label>
                  {selectedDocObj && (
                    <button
                      type="button"
                      onClick={() => setNextMatchingDate(selectedDocObj.scheduleDays)}
                      className="text-[11px] text-sky-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Fijar próximo {selectedDocObj.scheduleDays.toLowerCase()}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value);
                      setFormError('');
                    }}
                    required
                    className={`flex-1 px-3 py-2 border rounded-lg font-medium transition-colors ${
                      dayValidation.isValid 
                        ? 'border-slate-200 bg-slate-50/50 text-slate-800' 
                        : 'border-red-400 bg-red-50/30 text-red-900 focus:ring-red-400'
                    }`}
                  />
                  <div className={`px-3 py-2 rounded-lg font-bold text-xs ${
                    dayValidation.isValid 
                      ? 'bg-slate-100 text-slate-700' 
                      : 'bg-red-100 text-red-800 font-semibold'
                  }`}>
                    {dayValidation.dayName || 'Día'}
                  </div>
                </div>

                {/* Quick upcoming dates selection buttons */}
                {selectedDocObj && upcomingDates.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Fechas válidas próximas para {selectedDocObj.name}:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {upcomingDates.map(({ dateStr, label }) => {
                        const isSelected = formDate === dateStr;
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => {
                              setFormDate(dateStr);
                              setFormError('');
                            }}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                              isSelected 
                                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs' 
                                : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Day match feedback banner */}
                {selectedDocObj && (
                  <div className={`p-2.5 rounded-lg text-[11px] font-medium flex items-start gap-2 ${
                    dayValidation.isValid 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {dayValidation.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span>{dayValidation.message}</span>
                      {!dayValidation.isValid && upcomingDates[0] && (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setFormDate(upcomingDates[0].dateStr);
                              setFormError('');
                            }}
                            className="font-bold underline text-red-900 hover:text-red-950 inline-flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Haga clic aquí para cambiar a la fecha válida más próxima ({upcomingDates[0].label})
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* HORA DE CONSULTA Y VALIDACIÓN ESTRICTA DE HORARIOS */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-slate-700 font-semibold">
                    2. Hora de Consulta (Horario Establecido: {selectedDocObj?.scheduleHours || '—'}) *
                  </label>
                  <span className="text-[11px] text-slate-400">Bloques autorizados</span>
                </div>

                {/* Quick time slot buttons strictly within doctor's shift */}
                {suggestedSlots.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Bloques horarios de {selectedDocObj?.name}:
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {suggestedSlots.map(slot => {
                        const isOccupied = bookedSlots.has(slot);
                        const isSelected = formTime === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => {
                              setFormTime(slot);
                              setFormError('');
                            }}
                            className={`py-1.5 px-2 text-xs font-mono font-semibold rounded-md border text-center transition-all ${
                              isSelected
                                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                                : isOccupied
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                            }`}
                          >
                            {slot}
                            {isOccupied && <span className="block text-[8px] no-underline">Ocupado</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-600 font-medium">Hora Manual</label>
                    <input 
                      type="time"
                      value={formTime}
                      onChange={(e) => {
                        setFormTime(e.target.value);
                        setFormError('');
                      }}
                      required
                      className={`w-full px-2.5 py-1.5 border rounded-lg font-mono font-medium ${
                        timeValidation.isValid 
                          ? 'border-slate-200 bg-slate-50/50 text-slate-800' 
                          : 'border-red-400 bg-red-50/30 text-red-900 focus:ring-red-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-medium">Duración de Consulta</label>
                    <select
                      value={formDuration}
                      onChange={(e) => {
                        setFormDuration(Number(e.target.value));
                        setFormError('');
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800 font-medium"
                    >
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos (Estándar)</option>
                      <option value={45}>45 minutos</option>
                      <option value={60}>60 minutos (Procedimiento)</option>
                    </select>
                  </div>
                </div>

                {/* Time validation feedback banner */}
                {selectedDocObj && (
                  <div className={`p-2.5 rounded-lg text-[11px] font-medium flex items-start gap-2 ${
                    timeValidation.isValid 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {timeValidation.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      {timeValidation.message}
                    </div>
                  </div>
                )}
              </div>

              {/* Tipo de Cita */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tipo de Consulta</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as AppointmentType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800 font-medium"
                >
                  <option value="Primera Consulta">Primera Consulta</option>
                  <option value="Control / Seguimiento">Control / Seguimiento</option>
                  <option value="Urgencia / Prioridad">Urgencia / Prioridad</option>
                  <option value="Examen / Procedimiento">Examen / Procedimiento</option>
                </select>
              </div>

              {/* Motivo de Consulta */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Motivo Principal de Consulta</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={2}
                  placeholder="Ej. Chequeo preventivo, dolor articular, revisión de ecografía..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50/50 text-slate-800"
                />
              </div>

              {/* Status Verification Pill */}
              <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                isFormScheduleValid 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2">
                  {isFormScheduleValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="font-semibold">
                    {isFormScheduleValid 
                      ? 'Parámetros válidos: Días y horario reglamentarios verificados.' 
                      : 'Parámetros no válidos: No es posible agendar fuera de días y horarios establecidos.'}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsOpenNewModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isFormScheduleValid}
                  className={`px-4 py-2 rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition-all ${
                    isFormScheduleValid
                      ? 'text-white hover:opacity-95 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75'
                  }`}
                  style={isFormScheduleValid ? { backgroundColor: config.accentColor } : undefined}
                  title={!isFormScheduleValid ? 'No es posible agendar fuera de los días y horarios establecidos' : undefined}
                >
                  {isFormScheduleValid ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar y Confirmar Cita</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span>Bloqueado: Día u Horario Fuera de Rango</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Recordatorio WhatsApp / Mensaje */}
      {reminderAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Recordatorio para el Paciente</h3>
              </div>
              <button onClick={() => setReminderAppointment(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] leading-relaxed text-slate-800">
              {getReminderMessage(reminderAppointment)}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <a
                href={`https://wa.me/${reminderAppointment.patientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getReminderMessage(reminderAppointment))}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <span>Abrir en WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => copyToClipboard(getReminderMessage(reminderAppointment))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-1.5"
              >
                {copiedReminder ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReminder ? 'Copiado' : 'Copiar Texto'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
