import { Patient, Doctor, Appointment, PatientIntake, ClinicConfig } from '../types';

export const COLOR_PRESETS = [
  {
    id: 'atp-vivos',
    name: 'ATP Colores Vivos (Oficial Caracas)',
    primary: '#0B5ED7',
    accent: '#00A3FF',
    secondary: '#00C48C',
    description: 'Identidad viva y luminosa de ATP Medical Caracas: Azul Rey Vibrante, Cian Eléctrico y Verde Vital.'
  },
  {
    id: 'atp-zafiro',
    name: 'ATP Zafiro & Cian Neón',
    primary: '#0047AB',
    accent: '#00D2FF',
    secondary: '#10B981',
    description: 'Colores de alta intensidad y contraste para clínicas dinámicas.'
  },
  {
    id: 'atp-emerald',
    name: 'ATP Bio-Salud & Esmeralda Radiante',
    primary: '#059669',
    accent: '#06B6D4',
    secondary: '#3B82F6',
    description: 'Enfoque en medicina preventiva, bienestar y rehabilitación celular.'
  },
  {
    id: 'atp-energy',
    name: 'ATP Energía Pura & Índigo',
    primary: '#4F46E5',
    accent: '#06B6D4',
    secondary: '#10B981',
    description: 'Aspecto tecnológico y moderno con tonos energéticos de máxima nitidez.'
  }
];

export const INITIAL_CONFIG: ClinicConfig = {
  clinicName: 'ATP MEDICAL',
  branchName: 'C.C. Parque Humboldt, Caracas',
  slogan: 'La energía que impulsa tu bienestar',
  phone: '+58 414-3651970',
  email: 'atpnumero1@gmail.com',
  address: 'Piso 1, Oficina 5, Centro Comercial Parque Humboldt, Caracas 1080, Miranda',
  primaryColor: '#0B5ED7',
  accentColor: '#00A3FF',
  secondaryColor: '#00C48C',
  enableAudioChime: true,
  activePresetId: 'atp-vivos'
};

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dra. Maria J. Gonzalez',
    specialty: 'MEDICINA GENERAL',
    scheduleDays: 'LUNES',
    scheduleHours: '8:00 AM A 12:00 PM',
    room: 'Consultorio 1',
    phone: '+58 414-3651970',
    email: 'dra.gonzalez@atpmedical.com',
    status: 'disponible',
    shiftStart: '08:00',
    shiftEnd: '12:00'
  },
  {
    id: 'doc-2',
    name: 'Dr. Luis Guzmán',
    specialty: 'MEDICINA GENERAL',
    scheduleDays: 'MARTES',
    scheduleHours: '8:00 AM A 12:00 PM',
    room: 'Consultorio 1',
    phone: '+58 414-3651970',
    email: 'dr.guzman@atpmedical.com',
    status: 'disponible',
    shiftStart: '08:00',
    shiftEnd: '12:00'
  },
  {
    id: 'doc-3',
    name: 'Dr. Ivo Hernández',
    specialty: 'MEDICINA INTERNA',
    scheduleDays: 'MIÉRCOLES',
    scheduleHours: '8:00 AM A 12:00 PM',
    room: 'Consultorio 2',
    phone: '+58 414-3651970',
    email: 'dr.hernandez@atpmedical.com',
    status: 'disponible',
    shiftStart: '08:00',
    shiftEnd: '12:00'
  },
  {
    id: 'doc-4',
    name: 'Dra. Alejandra Diaz',
    specialty: 'CIRUGIA GENERAL',
    scheduleDays: 'JUEVES',
    scheduleHours: '8:00 AM A 12:00 PM',
    room: 'Consultorio 3',
    phone: '+58 414-3651970',
    email: 'dra.diaz@atpmedical.com',
    status: 'disponible',
    shiftStart: '08:00',
    shiftEnd: '12:00'
  },
  {
    id: 'doc-5',
    name: 'Dra. Maria Gazzaneo',
    specialty: 'GASTROENTEROLOGIA (+Ecografia)',
    scheduleDays: 'SABADO',
    scheduleHours: '8:00 AM A 12:00 PM',
    room: 'Consultorio 2',
    phone: '+58 414-3651970',
    email: 'dra.gazzaneo@atpmedical.com',
    status: 'disponible',
    shiftStart: '08:00',
    shiftEnd: '12:00'
  },
  {
    id: 'doc-6',
    name: 'Licdo. Kevin Mejia',
    specialty: 'PSICOLOGÍA',
    scheduleDays: 'JUEVES',
    scheduleHours: '8:00 AM A 12:00 PM',
    room: 'Consultorio 4',
    phone: '+58 414-3651970',
    email: 'lic.mejia@atpmedical.com',
    status: 'disponible',
    shiftStart: '08:00',
    shiftEnd: '12:00'
  },
  {
    id: 'doc-7',
    name: 'Dr. Valerio Dennis',
    specialty: 'PEDIATRIA',
    scheduleDays: 'DE LUNES A VIERNES',
    scheduleHours: '8:00 AM A 05:00 PM',
    room: 'Consultorio 5',
    phone: '+58 414-3651970',
    email: 'dr.valerio@atpmedical.com',
    status: 'disponible',
    shiftStart: '08:00',
    shiftEnd: '17:00'
  },
  {
    id: 'doc-8',
    name: 'Dr. Luis Salazar',
    specialty: 'TRAUMATOLOGÍA',
    scheduleDays: 'VIERNES',
    scheduleHours: '01:00 PM A 05:00 PM',
    room: 'Consultorio 3',
    phone: '+58 414-3651970',
    email: 'dr.salazar@atpmedical.com',
    status: 'disponible',
    shiftStart: '13:00',
    shiftEnd: '17:00'
  },
  {
    id: 'doc-9',
    name: 'Dr. Luis Balbi',
    specialty: 'NEUMONOLOGÍA (+Espirometría)',
    scheduleDays: 'SABADO',
    scheduleHours: '8:00 AM A 05:00 PM',
    room: 'Consultorio 1',
    phone: '+58 414-3651970',
    email: 'dr.balbi@atpmedical.com',
    status: 'disponible',
    shiftStart: '08:00',
    shiftEnd: '17:00'
  },
  {
    id: 'doc-10',
    name: 'Dra. Paola Contreras',
    specialty: 'GASTROENTEROLOGIA',
    scheduleDays: 'LUNES',
    scheduleHours: '01:00 PM A 05:00 PM',
    room: 'Consultorio 2',
    phone: '+58 414-3651970',
    email: 'dra.contreras@atpmedical.com',
    status: 'disponible',
    shiftStart: '13:00',
    shiftEnd: '17:00'
  },
  {
    id: 'doc-11',
    name: 'Dra. Gabriela Borges',
    specialty: 'DERMATOLOGÍA',
    scheduleDays: 'VIERNES',
    scheduleHours: '01:00 PM A 05:00 PM',
    room: 'Consultorio 4',
    phone: '+58 414-3651970',
    email: 'dra.borges@atpmedical.com',
    status: 'disponible',
    shiftStart: '13:00',
    shiftEnd: '17:00'
  }
];

export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_PATIENTS: Patient[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_INTAKES: PatientIntake[] = [];


export const calculateBmi = (weightKg: number, heightCm: number) => {
  if (!weightKg || !heightCm || heightCm <= 0) return { bmi: 0, category: 'Normal' as const };
  const heightM = heightCm / 100;
  const bmiVal = Number((weightKg / (heightM * heightM)).toFixed(1));
  let category: 'Bajo peso' | 'Normal' | 'Sobrepeso' | 'Obesidad I' | 'Obesidad II' | 'Obesidad III' = 'Normal';
  
  if (bmiVal < 18.5) category = 'Bajo peso';
  else if (bmiVal < 25) category = 'Normal';
  else if (bmiVal < 30) category = 'Sobrepeso';
  else if (bmiVal < 35) category = 'Obesidad I';
  else if (bmiVal < 40) category = 'Obesidad II';
  else category = 'Obesidad III';

  return { bmi: bmiVal, category };
};

export const TRIAGE_CONFIG = {
  1: {
    name: 'Nivel 1: Reanimación / Crítico',
    shortName: 'Reanimación',
    colorBg: 'bg-red-600',
    colorText: 'text-white',
    colorBorder: 'border-red-600',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    maxWait: 'Atención Inmediata (0 min)',
    description: 'Riesgo vital inminente. Compromiso severo de vía aérea, ventilatorio o hemodinámico.'
  },
  2: {
    name: 'Nivel 2: Emergencia Severa',
    shortName: 'Emergencia',
    colorBg: 'bg-orange-500',
    colorText: 'text-white',
    colorBorder: 'border-orange-500',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    maxWait: 'Hasta 10 - 15 minutos',
    description: 'Alto riesgo de deterioro rápido o dolor severo incapacitante.'
  },
  3: {
    name: 'Nivel 3: Urgencia Moderada',
    shortName: 'Urgencia',
    colorBg: 'bg-amber-500',
    colorText: 'text-slate-900',
    colorBorder: 'border-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    maxWait: 'Hasta 30 - 60 minutos',
    description: 'Condición potencialmente seria que requiere múltiples estudios diagnósticos o medicación.'
  },
  4: {
    name: 'Nivel 4: Menor / Prioridad Baja',
    shortName: 'Prioridad Menor',
    colorBg: 'bg-emerald-600',
    colorText: 'text-white',
    colorBorder: 'border-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    maxWait: 'Hasta 90 - 120 minutos',
    description: 'Condición estable, baja complejidad, cuadros subagudos o consultas médicas habituales.'
  },
  5: {
    name: 'Nivel 5: No Urgente / Administrativo',
    shortName: 'No Urgente',
    colorBg: 'bg-sky-600',
    colorText: 'text-white',
    colorBorder: 'border-sky-600',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    maxWait: 'Hasta 120 - 180 minutos',
    description: 'Problemas crónicos estables, controles de rutina, recetas o certificados.'
  }
};
