import { Patient, Doctor, Appointment, PatientIntake, ClinicConfig } from '../types';

export const COLOR_PRESETS = [
  {
    id: 'atp-venezuela',
    name: 'ATP Medical Venezuela (Oficial Caracas)',
    primary: '#002B49',
    accent: '#009FE3',
    secondary: '#00C49F',
    description: 'Identidad corporativa oficial de ATP Medical Caracas (Parque Humboldt): Azul Marino Profundo, Cian Energía ATP y Menta Vital.'
  },
  {
    id: 'atp-deep',
    name: 'ATP Deep Royal & Sky Blue',
    primary: '#0F1E36',
    accent: '#0284C7',
    secondary: '#10B981',
    description: 'Contraste sobrio de alta gama para centros quirúrgicos y ambulatorios.'
  },
  {
    id: 'atp-emerald',
    name: 'ATP Bio-Salud & Esmeralda',
    primary: '#064E3B',
    accent: '#0D9488',
    secondary: '#0284C7',
    description: 'Enfoque en medicina preventiva, bienestar y rehabilitación celular.'
  },
  {
    id: 'atp-midnight',
    name: 'ATP Midnight Slate & Bright Teal',
    primary: '#1E293B',
    accent: '#06B6D4',
    secondary: '#10B981',
    description: 'Aspecto tecnológico minimalista para clínicas digitales de última generación.'
  }
];

export const INITIAL_CONFIG: ClinicConfig = {
  clinicName: 'ATP MEDICAL',
  branchName: 'C.C. Parque Humboldt, Caracas',
  slogan: 'La energía que impulsa tu bienestar',
  phone: '+58 414-3651970',
  email: 'atpnumero1@gmail.com',
  address: 'Piso 1, Oficina 5, Centro Comercial Parque Humboldt, Caracas 1080, Miranda',
  primaryColor: '#002B49',
  accentColor: '#009FE3',
  secondaryColor: '#00C49F',
  enableAudioChime: true,
  activePresetId: 'atp-venezuela'
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

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    dni: 'V-14.892.415',
    fullName: 'Elena Gómez Suárez',
    birthDate: '1978-04-12',
    gender: 'Femenino',
    phone: '+58 414-9412876',
    email: 'elena.gomez@gmail.com',
    address: 'Urb. Santa Fe Norte, Torre A, Caracas',
    insurance: 'Seguros Caracas',
    bloodGroup: 'A+',
    allergies: ['Penicilina', 'Sulfas'],
    chronicConditions: ['Hipertensión Arterial Primaria'],
    emergencyContact: {
      name: 'Jorge Gómez',
      phone: '+58 412-8234112',
      relation: 'Hermano'
    },
    notes: 'Requiere monitoreo regular de presión arterial y electrocardiograma semestral.',
    createdAt: '2025-11-10T10:00:00Z'
  },
  {
    id: 'pat-2',
    dni: 'V-18.324.908',
    fullName: 'Lucas Benítez Díaz',
    birthDate: '2016-08-23',
    gender: 'Masculino',
    phone: '+58 412-8765432',
    email: 'familia.benitez@outlook.com',
    address: 'Colinas de Bello Monte, Av. Principal, Caracas',
    insurance: 'Mercantil Seguros',
    bloodGroup: 'O+',
    allergies: ['Ninguna conocida'],
    chronicConditions: ['Rinitis alérgica estacional'],
    emergencyContact: {
      name: 'Mariana Díaz',
      phone: '+58 412-8765432',
      relation: 'Madre'
    },
    notes: 'Calendario de vacunación completo. Consulta pediátrica de control.',
    createdAt: '2026-01-14T08:30:00Z'
  },
  {
    id: 'pat-3',
    dni: 'V-12.450.311',
    fullName: 'Mateo Valenzuela Rivas',
    birthDate: '1970-11-05',
    gender: 'Masculino',
    phone: '+58 424-7654321',
    email: 'mateo.valenzuela@gmail.com',
    address: 'Chacao, Casco Central, Av. Mohedano, Caracas',
    insurance: 'Mapfre Venezuela',
    bloodGroup: 'O-',
    allergies: ['Aspirina / AINEs'],
    chronicConditions: ['Dislipidemia', 'Sobrepeso Grado I'],
    emergencyContact: {
      name: 'Carla Rivas',
      phone: '+58 414-7112334',
      relation: 'Cónyuge'
    },
    notes: 'Paciente deportista aficionado, consulta por traumatología en rodilla derecha.',
    createdAt: '2026-02-02T14:20:00Z'
  },
  {
    id: 'pat-4',
    dni: 'V-16.782.119',
    fullName: 'Camila Rojas Navarrete',
    birthDate: '1989-06-30',
    gender: 'Femenino',
    phone: '+58 416-6543210',
    email: 'camila.rojas@gmail.com',
    address: 'Urb. El Cafetal, Av. San Luis, Caracas',
    insurance: 'Particular',
    bloodGroup: 'B+',
    allergies: ['Ninguna'],
    chronicConditions: ['Gastritis erosiva leve'],
    emergencyContact: {
      name: 'Esteban Navarrete',
      phone: '+58 424-6445221',
      relation: 'Padre'
    },
    notes: 'Control con gastroenterología y revisión de ecografía abdominal.',
    createdAt: '2026-03-05T09:15:00Z'
  },
  {
    id: 'pat-5',
    dni: 'V-19.980.455',
    fullName: 'Ignacio Tapia Cordero',
    birthDate: '2001-02-18',
    gender: 'Masculino',
    phone: '+58 414-5432109',
    email: 'ignacio.tapia@gmail.com',
    address: 'La Castellana, 2da Transversal, Caracas',
    insurance: 'Banesco Seguros',
    bloodGroup: 'A-',
    allergies: ['Látex'],
    chronicConditions: ['Asma bronquial leve'],
    emergencyContact: {
      name: 'Patricia Cordero',
      phone: '+58 412-5334119',
      relation: 'Madre'
    },
    notes: 'Portador de inhalador Salbutamol SOS. Valoración neumonológica.',
    createdAt: '2026-03-12T11:45:00Z'
  },
  {
    id: 'pat-6',
    dni: 'V-10.231.874',
    fullName: 'Rosa María Carrasco Silva',
    birthDate: '1958-09-14',
    gender: 'Femenino',
    phone: '+58 412-4321098',
    email: 'rosamaria.carrasco@gmail.com',
    address: 'C.C. Parque Humboldt, Av. Río Caura, Caracas',
    insurance: 'Seguros Pirámide',
    bloodGroup: 'O+',
    allergies: ['Yodo de contraste'],
    chronicConditions: ['Diabetes Mellitus Tipo 2', 'Artrosis'],
    emergencyContact: {
      name: 'Loreto Carrasco',
      phone: '+58 414-4112998',
      relation: 'Hija'
    },
    notes: 'Tratamiento con Metformina 850mg. Consulta de Medicina Interna.',
    createdAt: '2026-03-20T16:00:00Z'
  }
];

export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1',
    patientName: 'Elena Gómez Suárez',
    patientDni: 'V-14.892.415',
    patientPhone: '+58 414-9412876',
    doctorId: 'doc-1',
    doctorName: 'Dra. Maria J. Gonzalez',
    specialty: 'MEDICINA GENERAL',
    date: getTodayDateString(),
    time: '08:30',
    durationMinutes: 30,
    type: 'Control / Seguimiento',
    status: 'en_consulta',
    reason: 'Control de presión arterial y chequeo general preventivo.',
    notes: 'Trae exámenes de laboratorio de rutina.',
    createdAt: '2026-10-10T08:00:00Z'
  },
  {
    id: 'apt-2',
    patientId: 'pat-2',
    patientName: 'Lucas Benítez Díaz',
    patientDni: 'V-18.324.908',
    patientPhone: '+58 412-8765432',
    doctorId: 'doc-7',
    doctorName: 'Dr. Valerio Dennis',
    specialty: 'PEDIATRIA',
    date: getTodayDateString(),
    time: '09:30',
    durationMinutes: 30,
    type: 'Primera Consulta',
    status: 'en_consulta',
    reason: 'Evaluación pediátrica integral de crecimiento y desarrollo.',
    notes: 'Acompañado por su madre Mariana Díaz.',
    createdAt: '2026-10-12T09:10:00Z'
  },
  {
    id: 'apt-3',
    patientId: 'pat-3',
    patientName: 'Mateo Valenzuela Rivas',
    patientDni: 'V-12.450.311',
    patientPhone: '+58 424-7654321',
    doctorId: 'doc-8',
    doctorName: 'Dr. Luis Salazar',
    specialty: 'TRAUMATOLOGÍA',
    date: getTodayDateString(),
    time: '13:30',
    durationMinutes: 30,
    type: 'Urgencia / Prioridad',
    status: 'en_espera',
    reason: 'Gonalgia aguda derecha e inflamación tras esfuerzo físico.',
    notes: 'Posible esguince o lesión ligamentosa en rodilla.',
    createdAt: '2026-10-14T11:00:00Z'
  },
  {
    id: 'apt-4',
    patientId: 'pat-4',
    patientName: 'Camila Rojas Navarrete',
    patientDni: 'V-16.782.119',
    patientPhone: '+58 416-6543210',
    doctorId: 'doc-10',
    doctorName: 'Dra. Paola Contreras',
    specialty: 'GASTROENTEROLOGIA',
    date: getTodayDateString(),
    time: '14:00',
    durationMinutes: 30,
    type: 'Control / Seguimiento',
    status: 'confirmada',
    reason: 'Evaluación de reflujo gastroesofágico y molestias epigástricas.',
    createdAt: '2026-10-15T15:20:00Z'
  },
  {
    id: 'apt-5',
    patientId: 'pat-5',
    patientName: 'Ignacio Tapia Cordero',
    patientDni: 'V-19.980.455',
    patientPhone: '+58 414-5432109',
    doctorId: 'doc-9',
    doctorName: 'Dr. Luis Balbi',
    specialty: 'NEUMONOLOGÍA (+Espirometría)',
    date: getTodayDateString(),
    time: '10:00',
    durationMinutes: 45,
    type: 'Primera Consulta',
    status: 'confirmada',
    reason: 'Espirometría de control y evaluación pulmonar anual.',
    createdAt: '2026-10-16T12:00:00Z'
  },
  {
    id: 'apt-6',
    patientId: 'pat-6',
    patientName: 'Rosa María Carrasco Silva',
    patientDni: 'V-10.231.874',
    patientPhone: '+58 412-4321098',
    doctorId: 'doc-3',
    doctorName: 'Dr. Ivo Hernández',
    specialty: 'MEDICINA INTERNA',
    date: getTodayDateString(),
    time: '11:00',
    durationMinutes: 30,
    type: 'Control / Seguimiento',
    status: 'pendiente',
    reason: 'Control metabólico y revisión de tratamiento de Medicina Interna.',
    createdAt: '2026-10-16T17:40:00Z'
  }
];

export const INITIAL_INTAKES: PatientIntake[] = [
  {
    id: 'intake-1',
    ticketNumber: 'T-101',
    patientId: 'pat-1',
    patientName: 'Elena Gómez Suárez',
    patientDni: 'V-14.892.415',
    patientAge: 48,
    patientAddress: 'Urb. Santa Fe Norte, Torre A, Caracas',
    patientPhone: '+58 414-9412876',
    patientEmail: 'elena.gomez@gmail.com',
    appointmentId: 'apt-1',
    admissionTime: new Date(Date.now() - 35 * 60000).toISOString(),
    priorityLevel: 3,
    vitals: {
      systolic: 138,
      diastolic: 86,
      heartRate: 76,
      respRate: 16,
      temperature: 36.6,
      spo2: 98,
      weightKg: 64,
      heightCm: 162,
      bmi: 24.4,
      bmiCategory: 'Normal'
    },
    chiefComplaint: 'Control de hipertensión arterial. Chequeo preventivo.',
    doctorId: 'doc-1',
    doctorName: 'Dra. Maria J. Gonzalez',
    specialty: 'MEDICINA GENERAL',
    room: 'Consultorio 1',
    status: 'en_atencion',
    calledAt: new Date(Date.now() - 15 * 60000).toISOString(),
    consentSigned: true,
    paymentMethod: 'Punto de venta',
    notes: 'Paciente atendida en Consultorio 1.'
  },
  {
    id: 'intake-2',
    ticketNumber: 'T-102',
    patientId: 'pat-2',
    patientName: 'Lucas Benítez Díaz',
    patientDni: 'V-18.324.908',
    patientAge: 10,
    patientAddress: 'Colinas de Bello Monte, Av. Principal, Caracas',
    patientPhone: '+58 412-8765432',
    patientEmail: 'familia.benitez@outlook.com',
    appointmentId: 'apt-2',
    admissionTime: new Date(Date.now() - 25 * 60000).toISOString(),
    priorityLevel: 3,
    vitals: {
      systolic: 105,
      diastolic: 65,
      heartRate: 98,
      respRate: 20,
      temperature: 37.2,
      spo2: 98,
      weightKg: 32,
      heightCm: 136,
      bmi: 17.3,
      bmiCategory: 'Normal'
    },
    chiefComplaint: 'Evaluación pediátrica integral.',
    doctorId: 'doc-7',
    doctorName: 'Dr. Valerio Dennis',
    specialty: 'PEDIATRIA',
    room: 'Consultorio 5',
    status: 'en_atencion',
    calledAt: new Date(Date.now() - 10 * 60000).toISOString(),
    consentSigned: true,
    paymentMethod: 'Pago móvil',
    notes: 'Acompañado por su madre.'
  },
  {
    id: 'intake-3',
    ticketNumber: 'T-103',
    patientId: 'pat-3',
    patientName: 'Mateo Valenzuela Rivas',
    patientDni: 'V-12.450.311',
    patientAge: 55,
    patientAddress: 'Chacao, Casco Central, Av. Mohedano, Caracas',
    patientPhone: '+58 424-7654321',
    patientEmail: 'mateo.valenzuela@gmail.com',
    appointmentId: 'apt-3',
    admissionTime: new Date(Date.now() - 12 * 60000).toISOString(),
    priorityLevel: 3,
    vitals: {
      systolic: 130,
      diastolic: 82,
      heartRate: 74,
      respRate: 16,
      temperature: 36.7,
      spo2: 99,
      weightKg: 85,
      heightCm: 176,
      bmi: 27.4,
      bmiCategory: 'Sobrepeso'
    },
    chiefComplaint: 'Traumatismo articular en rodilla derecha con limitación funcional.',
    doctorId: 'doc-8',
    doctorName: 'Dr. Luis Salazar',
    specialty: 'TRAUMATOLOGÍA',
    room: 'Consultorio 3',
    status: 'pendiente_pago',
    consentSigned: true,
    notes: 'Ingresa a recepción de ATP Medical Parque Humboldt.'
  },
  {
    id: 'intake-4',
    ticketNumber: 'T-104',
    patientId: 'pat-4',
    patientName: 'Camila Rojas Navarrete',
    patientDni: 'V-16.782.119',
    patientAge: 37,
    patientAddress: 'Urb. El Cafetal, Av. San Luis, Caracas',
    patientPhone: '+58 416-6543210',
    patientEmail: 'camila.rojas@gmail.com',
    appointmentId: 'apt-4',
    admissionTime: new Date(Date.now() - 5 * 60000).toISOString(),
    priorityLevel: 4,
    vitals: {
      systolic: 115,
      diastolic: 75,
      heartRate: 68,
      respRate: 15,
      temperature: 36.5,
      spo2: 99,
      weightKg: 58,
      heightCm: 165,
      bmi: 21.3,
      bmiCategory: 'Normal'
    },
    chiefComplaint: 'Consulta de gastroenterología y ecografía.',
    doctorId: 'doc-10',
    doctorName: 'Dra. Paola Contreras',
    specialty: 'GASTROENTEROLOGIA',
    room: 'Consultorio 2',
    status: 'en_espera',
    paymentMethod: 'Pago móvil',
    consentSigned: true,
    notes: 'Pago verificado por recepción. En espera de atención.'
  },
  {
    id: 'intake-5',
    ticketNumber: 'T-100',
    patientId: 'pat-5',
    patientName: 'Ignacio Tapia Cordero',
    patientDni: 'V-19.980.455',
    patientAge: 25,
    patientAddress: 'La Castellana, 2da Transversal, Caracas',
    patientPhone: '+58 414-5432109',
    patientEmail: 'ignacio.tapia@gmail.com',
    appointmentId: 'apt-5',
    admissionTime: new Date(Date.now() - 65 * 60000).toISOString(),
    priorityLevel: 4,
    vitals: {
      systolic: 118,
      diastolic: 76,
      heartRate: 72,
      respRate: 16,
      temperature: 36.6,
      spo2: 99,
      weightKg: 70,
      heightCm: 178,
      bmi: 22.1,
      bmiCategory: 'Normal'
    },
    chiefComplaint: 'Espirometría y chequeo neumonológico.',
    doctorId: 'doc-9',
    doctorName: 'Dr. Luis Balbi',
    specialty: 'NEUMONOLOGÍA (+Espirometría)',
    room: 'Consultorio 1',
    status: 'atendido',
    paymentMethod: 'Punto de venta',
    attendedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    consentSigned: true,
    notes: 'Atención concluida con éxito.'
  }
];

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
