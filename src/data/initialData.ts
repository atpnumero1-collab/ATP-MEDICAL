import { Patient, Doctor, Appointment, PatientIntake, ClinicConfig } from '../types';

export const COLOR_PRESETS = [
  {
    id: 'atp-oficial-pdf',
    name: 'Identidad Oficial ATP Medical (Manual Corporativo)',
    primary: '#151E3A',
    accent: '#395AFF',
    secondary: '#7DDACB',
    description: 'Paleta oficial del documento ATP Medical: Azul Marino Profundo (#151E3A), Azul Real (#1F2952), Turquesa Clínico (#7DDACB), Gris Alabastro (#F4F4F4) y Azul Eléctrico (#395AFF).'
  },
  {
    id: 'atp-royal-blue',
    name: 'ATP Azul Real & Eléctrico (#1F2952 · #395AFF)',
    primary: '#1F2952',
    accent: '#395AFF',
    secondary: '#7DDACB',
    description: 'Variante con encabezados en Azul Real (#1F2952), acciones en Azul Eléctrico (#395AFF) y detalles en Turquesa (#7DDACB).'
  },
  {
    id: 'atp-cobalt-navy',
    name: 'ATP Azul Eléctrico Dominante (#395AFF · #151E3A)',
    primary: '#395AFF',
    accent: '#151E3A',
    secondary: '#7DDACB',
    description: 'Encabezados vibrantes en Azul Eléctrico (#395AFF) con contraste en Azul Marino (#151E3A) y Turquesa (#7DDACB).'
  },
  {
    id: 'atp-navy-mint',
    name: 'ATP Marino & Turquesa Clínico (#151E3A · #7DDACB)',
    primary: '#151E3A',
    accent: '#1F2952',
    secondary: '#395AFF',
    description: 'Combinación sobria de alta precisión médica en tonos marinos (#151E3A / #1F2952) y Azul Eléctrico (#395AFF).'
  }
];

export const INITIAL_CONFIG: ClinicConfig = {
  clinicName: 'ATP MEDICAL',
  branchName: 'C.C. Parque Humboldt, Caracas',
  slogan: 'La energía que impulsa tu bienestar',
  phone: '+58 414-3651970',
  email: 'atpnumero1@gmail.com',
  address: 'Piso 1, Oficina 5, Centro Comercial Parque Humboldt, Caracas 1080, Miranda',
  primaryColor: '#151E3A',
  accentColor: '#395AFF',
  secondaryColor: '#7DDACB',
  enableAudioChime: true,
  activePresetId: 'atp-oficial-pdf'
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
