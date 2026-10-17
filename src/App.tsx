/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Appointment, 
  PatientIntake, 
  Patient, 
  Doctor, 
  ClinicConfig, 
  AppointmentStatus,
  IntakeStatus,
  DoctorStatus,
  PaymentMethod
} from './types';
import { 
  loadStoredData, 
  saveToStorage, 
  resetAllToInitial 
} from './utils/storage';
import { Navigation, ActiveModule } from './components/Navigation';
import { TicketCreationModule } from './components/Tickets/TicketCreationModule';
import { PacientesEnSalaModule } from './components/WaitingRoom/PacientesEnSalaModule';
import { AppointmentsModule } from './components/Appointments/AppointmentsModule';
import { PatientsModule } from './components/Patients/PatientsModule';
import { DoctorsModule } from './components/Doctors/DoctorsModule';
import { ReportsModule } from './components/Reports/ReportsModule';
import { SettingsModule } from './components/Settings/SettingsModule';
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  ShieldCheck,
  Building2,
  Mail,
  Phone
} from 'lucide-react';

export default function App() {
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [activeModule, setActiveModule] = useState<ActiveModule>('tickets');

  // Main state
  const [config, setConfig] = useState<ClinicConfig>(() => loadStoredData().config);
  const [doctors, setDoctors] = useState<Doctor[]>(() => loadStoredData().doctors);
  const [patients, setPatients] = useState<Patient[]>(() => loadStoredData().patients);
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadStoredData().appointments);
  const [intakes, setIntakes] = useState<PatientIntake[]>(() => loadStoredData().intakes);

  // Cross-module preselection state
  const [preselectedPatientId, setPreselectedPatientId] = useState<string>('');
  const [preselectedAppointmentId, setPreselectedAppointmentId] = useState<string>('');
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--color-accent', config.accentColor);
    document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
    saveToStorage('CONFIG', config);
  }, [config]);

  // Save changes to storage
  useEffect(() => {
    if (initialLoaded) {
      saveToStorage('DOCTORS', doctors);
    }
  }, [doctors, initialLoaded]);

  useEffect(() => {
    if (initialLoaded) {
      saveToStorage('PATIENTS', patients);
    }
  }, [patients, initialLoaded]);

  useEffect(() => {
    if (initialLoaded) {
      saveToStorage('APPOINTMENTS', appointments);
    }
  }, [appointments, initialLoaded]);

  useEffect(() => {
    if (initialLoaded) {
      saveToStorage('INTAKES', intakes);
    }
  }, [intakes, initialLoaded]);

  useEffect(() => {
    setInitialLoaded(true);
  }, []);

  // Handlers for Appointments
  const handleAddAppointment = (newApt: Omit<Appointment, 'id' | 'createdAt'>) => {
    const created: Appointment = {
      ...newApt,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [created, ...prev]);
  };

  const handleUpdateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  // Direct pass from Appointment to Ticket
  const handlePassToIntake = (appointment: Appointment) => {
    // Find or link patient
    setPreselectedPatientId(appointment.patientId);
    setPreselectedAppointmentId(appointment.id);
    
    // Mark appointment as 'en_espera'
    handleUpdateAppointmentStatus(appointment.id, 'en_espera');

    // Switch to tickets module
    setActiveModule('tickets');
  };

  // Handlers for Intakes
  const handleAddIntake = (newIntake: PatientIntake) => {
    setIntakes(prev => [newIntake, ...prev]);
    // If it was linked to an appointment, update appointment status to in clinic
    if (newIntake.appointmentId) {
      handleUpdateAppointmentStatus(newIntake.appointmentId, 'en_espera');
    }
  };

  const handleUpdateIntakeStatus = (id: string, status: IntakeStatus, paymentMethod?: PaymentMethod) => {
    setIntakes(prev => prev.map(i => {
      if (i.id === id) {
        const updated: PatientIntake = { ...i, status };
        if (paymentMethod) {
          updated.paymentMethod = paymentMethod;
          updated.paymentConfirmedAt = new Date().toISOString();
        }
        if (status === 'atendido') {
          updated.attendedAt = new Date().toISOString();
        }
        return updated;
      }
      return i;
    }));

    // If marked 'en_atencion' or 'en_consulta', also update doctor status
    const item = intakes.find(i => i.id === id);
    if (item && (status === 'en_atencion' || status === 'en_consulta')) {
      setDoctors(prev => prev.map(d => d.id === item.doctorId ? { ...d, status: 'en_consulta', activePatientName: item.patientName } : d));
      if (item.appointmentId) {
        handleUpdateAppointmentStatus(item.appointmentId, 'en_consulta');
      }
    } else if (item && status === 'atendido') {
      setDoctors(prev => prev.map(d => d.id === item.doctorId ? { ...d, status: 'disponible', activePatientName: undefined } : d));
      if (item.appointmentId) {
        handleUpdateAppointmentStatus(item.appointmentId, 'completada');
      }
    }
  };

  // Handlers for Patients
  const handleAddPatient = (patient: Patient) => {
    setPatients(prev => [patient, ...prev]);
  };

  const handleUpdatePatient = (patient: Patient) => {
    setPatients(prev => prev.map(p => p.id === patient.id ? patient : p));
  };

  const handleSelectPatientForAppointment = (patient: Patient) => {
    setActiveModule('appointments');
    setIsNewAppointmentModalOpen(true);
  };

  const handleSelectPatientForIntake = (patient: Patient) => {
    setPreselectedPatientId(patient.id);
    setPreselectedAppointmentId('');
    setActiveModule('tickets');
  };

  // Handlers for Doctors
  const handleUpdateDoctorStatus = (doctorId: string, status: DoctorStatus) => {
    setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, status } : d));
  };

  const handleAddDoctor = (doctor: Doctor) => {
    setDoctors(prev => [...prev, doctor]);
  };

  // Reset demo
  const handleResetData = () => {
    const loaded = loadStoredData();
    setConfig(loaded.config);
    setDoctors(loaded.doctors);
    setPatients(loaded.patients);
    setAppointments(loaded.appointments);
    setIntakes(loaded.intakes);
  };

  const pendingIntakesCount = intakes.filter(i => i.status === 'en_espera' || i.status === 'pendiente_pago' || i.status === 'llamado').length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col antialiased">
      
      {/* Navigation Top Bar */}
      <Navigation
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        config={config}
        onQuickIntake={() => {
          setActiveModule('tickets');
        }}
        onQuickAppointment={() => {
          setActiveModule('appointments');
          setIsNewAppointmentModalOpen(true);
        }}
        pendingIntakesCount={pendingIntakesCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Module 1: Creación de tickets */}
        {activeModule === 'tickets' && (
          <TicketCreationModule
            patients={patients}
            doctors={doctors}
            intakes={intakes}
            config={config}
            onAddIntake={handleAddIntake}
            onAddPatient={handleAddPatient}
            onNavigateToWaitingRoom={() => setActiveModule('waitingRoom')}
          />
        )}

        {/* Module 2: Pacientes en sala */}
        {activeModule === 'waitingRoom' && (
          <PacientesEnSalaModule
            intakes={intakes}
            doctors={doctors}
            config={config}
            onUpdateIntakeStatus={handleUpdateIntakeStatus}
            onNavigateToNewTicket={() => setActiveModule('tickets')}
          />
        )}

        {/* Module 3: Citas & Agenda */}
        {activeModule === 'appointments' && (
          <AppointmentsModule
            appointments={appointments}
            doctors={doctors}
            patients={patients}
            config={config}
            onAddAppointment={handleAddAppointment}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onPassToIntake={handlePassToIntake}
            isOpenNewModal={isNewAppointmentModalOpen}
            setIsOpenNewModal={setIsNewAppointmentModalOpen}
          />
        )}

        {activeModule === 'patients' && (
          <PatientsModule
            patients={patients}
            appointments={appointments}
            intakes={intakes}
            config={config}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onSelectPatientForAppointment={handleSelectPatientForAppointment}
            onSelectPatientForIntake={handleSelectPatientForIntake}
          />
        )}

        {activeModule === 'doctors' && (
          <DoctorsModule
            doctors={doctors}
            appointments={appointments}
            intakes={intakes}
            config={config}
            onUpdateDoctorStatus={handleUpdateDoctorStatus}
            onAddDoctor={handleAddDoctor}
          />
        )}

        {activeModule === 'reports' && (
          <ReportsModule
            appointments={appointments}
            intakes={intakes}
            patients={patients}
            doctors={doctors}
            config={config}
          />
        )}

        {activeModule === 'settings' && (
          <SettingsModule
            config={config}
            onUpdateConfig={setConfig}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-center sm:text-left">
            <span className="font-bold text-slate-900">{config.clinicName}</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="text-slate-600 font-medium">{config.address}</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="font-mono font-bold text-slate-900">{config.phone}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>{config.email}</span>
            <span>·</span>
            <span>Sistema Clínico de Gestión</span>
            <span>·</span>
            <button 
              onClick={() => setActiveModule('settings')}
              className="text-sky-600 hover:underline font-medium"
            >
              Ajustar Colores
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
