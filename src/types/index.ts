export type TriagePriority = 1 | 2 | 3 | 4 | 5;

export interface VitalSigns {
  systolic: number; // mmHg
  diastolic: number; // mmHg
  heartRate: number; // lpm
  respRate: number; // rpm
  temperature: number; // °C
  spo2: number; // %
  weightKg?: number; // kg
  heightCm?: number; // cm
  bmi?: number;
  bmiCategory?: 'Bajo peso' | 'Normal' | 'Sobrepeso' | 'Obesidad I' | 'Obesidad II' | 'Obesidad III';
}

export interface Patient {
  id: string;
  dni: string; // RUT / Cédula / DNI
  fullName: string;
  birthDate: string;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  phone: string;
  email: string;
  address: string;
  insurance: string; // Ej: Particular, Fonasa, Isapre, EPS, Sanitas, etc.
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  notes?: string;
  createdAt: string;
}

export type DoctorStatus = 'disponible' | 'en_consulta' | 'en_pausa' | 'fuera_turno';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  scheduleDays: string; // ej. "Lunes", "De Lunes a Viernes", "Sábado"
  scheduleHours: string; // ej. "8:00 AM A 12:00 PM", "01:00 PM A 05:00 PM"
  room: string; // Consultorio
  phone: string;
  email: string;
  status: DoctorStatus;
  shiftStart: string; // ej. "08:00"
  shiftEnd: string; // ej. "12:00" o "17:00"
  activePatientName?: string;
}

export type AppointmentStatus = 
  | 'pendiente' 
  | 'confirmada' 
  | 'en_espera' 
  | 'en_consulta' 
  | 'completada' 
  | 'cancelada';

export type AppointmentType = 
  | 'Primera Consulta' 
  | 'Control / Seguimiento' 
  | 'Urgencia / Prioridad' 
  | 'Examen / Procedimiento';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientDni: string;
  patientPhone: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdAt: string;
  source?: 'recepcion' | 'autogestionada' | 'whatsapp' | string;
  isSelfManaged?: boolean;
}

export type PaymentMethod = 
  | 'Pago móvil' 
  | 'Punto de venta' 
  | 'Efectivo' 
  | 'Transferencia';

export type IntakeStatus = 
  | 'pendiente_pago'      // 1. Pendiente por pago (default)
  | 'en_espera'           // 2. En espera de atención
  | 'en_atencion'         // 3. Paciente en atención
  | 'atendido'            // Paciente atendido / finalizado
  | 'en_consulta'         // Alias retrocompatible
  | 'llamado'             // Retrocompatible
  | 'en_triaje'           // Retrocompatible
  | 'cancelado';

export interface PatientIntake {
  id: string;
  ticketNumber: string; // ej. "T-102"
  patientId: string;
  patientName: string;
  patientDni: string; // Cédula de identidad
  patientAge: number; // Edad
  patientAddress?: string; // Dirección
  patientPhone?: string; // Teléfono
  patientEmail?: string; // Correo electrónico
  appointmentId?: string;
  admissionTime: string; // ISO string
  priorityLevel: TriagePriority;
  vitals: VitalSigns;
  chiefComplaint: string; // Motivo de consulta
  doctorId: string;
  doctorName: string;
  specialty: string; // Especialidad por la cual asiste
  room: string;
  status: IntakeStatus;
  paymentMethod?: PaymentMethod; // Registrado al pasar a 'en_espera'
  paymentConfirmedAt?: string;
  calledAt?: string;
  attendedAt?: string;
  consentSigned: boolean;
  notes?: string;
}

export interface ClinicConfig {
  clinicName: string;
  branchName: string;
  slogan: string;
  phone: string;
  email: string;
  address: string;
  primaryColor: string; // Default #0A2540
  accentColor: string; // Default #00A3E0
  secondaryColor: string; // Default #059669
  enableAudioChime: boolean;
  activePresetId: string;
}

export interface MedicalRecord {
  id: string;
  recordNumber: string; // Ej: "HM-2026-001"
  patientId: string;
  patientName: string;
  patientDni: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  room?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  chiefComplaint: string; // Motivo de Consulta
  currentIllness: string; // Enfermedad Actual / Anamnesis
  vitals?: VitalSigns; // Signos Vitales
  physicalExam: string; // Examen Físico
  diagnosis: string; // Diagnóstico Clínico / CIE-10
  treatmentPlan: string; // Plan de Tratamiento / Indicaciones
  prescriptions?: string; // Récipe Médico / Medicamentos
  complementaryStudies?: string; // Exámenes o Estudios Solicitados
  nextFollowUpDate?: string; // Próximo Control
  doctorNotes?: string; // Notas de evolución
  createdAt: string; // ISO String
  updatedAt?: string;
}

