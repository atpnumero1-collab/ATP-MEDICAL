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
  PaymentMethod,
  MedicalRecord
} from './types';
import { 
  loadStoredData, 
  saveToStorage, 
  resetAllToInitial 
} from './utils/storage';
import { testConnection } from './firebase/firebase';
import {
  seedInitialFirestoreData,
  subscribeDoctors,
  subscribePatients,
  subscribeAppointments,
  subscribeIntakes,
  subscribeClinicConfig,
  subscribeMedicalRecords,
  dbSaveAppointment,
  dbUpdateAppointmentStatus,
  dbSaveIntake,
  dbUpdateIntake,
  dbSavePatient,
  dbSaveDoctor,
  dbUpdateDoctorStatus,
  dbSaveConfig,
  dbSaveMedicalRecord,
  dbDeleteMedicalRecord
} from './firebase/firestoreService';
import { Navigation, ActiveModule } from './components/Navigation';
import { TicketCreationModule } from './components/Tickets/TicketCreationModule';
import { PacientesEnSalaModule } from './components/WaitingRoom/PacientesEnSalaModule';
import { AppointmentsModule } from './components/Appointments/AppointmentsModule';
import { PatientsModule } from './components/Patients/PatientsModule';
import { DoctorsModule } from './components/Doctors/DoctorsModule';
import { ReportsModule } from './components/Reports/ReportsModule';
import { SettingsModule } from './components/Settings/SettingsModule';
import { MedicalRecordsModule } from './components/MedicalRecords/MedicalRecordsModule';
import { PatientBookingPortal } from './components/SelfService/PatientBookingPortal';
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Database,
  Wifi,
  CloudCheck,
  Share2,
  Copy,
  Check,
  X,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [activeModule, setActiveModule] = useState<ActiveModule>('tickets');

  // Check if patient accessed via public self-service portal link (?portal=autogestion)
  const isDirectPatientUrl = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('portal') === 'autogestion' || 
    window.location.search.includes('autogestion') ||
    window.location.hash.includes('autogestion')
  );

  // Staff preview mode for testing portal from within admin
  const [isStaffPortalPreview, setIsStaffPortalPreview] = useState(false);

  // Modal for sharing portal link via WhatsApp
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Main state initialized with local storage cache for instant offline responsiveness
  const [config, setConfig] = useState<ClinicConfig>(() => loadStoredData().config);
  const [doctors, setDoctors] = useState<Doctor[]>(() => loadStoredData().doctors);
  const [patients, setPatients] = useState<Patient[]>(() => loadStoredData().patients);
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadStoredData().appointments);
  const [intakes, setIntakes] = useState<PatientIntake[]>(() => loadStoredData().intakes);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  // Cross-module preselection state
  const [preselectedPatientId, setPreselectedPatientId] = useState<string>('');
  const [preselectedAppointmentId, setPreselectedAppointmentId] = useState<string>('');
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);

  // URL for self-service portal
  const publicPortalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?portal=autogestion`
    : '?portal=autogestion';

  // Initialize Firebase Firestore connection & realtime subscriptions
  useEffect(() => {
    let unsubDoctors: (() => void) | undefined;
    let unsubPatients: (() => void) | undefined;
    let unsubAppointments: (() => void) | undefined;
    let unsubIntakes: (() => void) | undefined;
    let unsubConfig: (() => void) | undefined;
    let unsubMedicalRecords: (() => void) | undefined;

    const initFirebase = async () => {
      try {
        await testConnection();
        await seedInitialFirestoreData();
        setCloudSynced(true);

        unsubDoctors = subscribeDoctors((liveDoctors) => {
          if (liveDoctors && liveDoctors.length > 0) {
            setDoctors(liveDoctors);
            saveToStorage('DOCTORS', liveDoctors);
          }
        });

        unsubPatients = subscribePatients((livePatients) => {
          setPatients(livePatients || []);
          saveToStorage('PATIENTS', livePatients || []);
        });

        unsubAppointments = subscribeAppointments((liveAppointments) => {
          setAppointments(liveAppointments || []);
          saveToStorage('APPOINTMENTS', liveAppointments || []);
        });

        unsubIntakes = subscribeIntakes((liveIntakes) => {
          setIntakes(liveIntakes || []);
          saveToStorage('INTAKES', liveIntakes || []);
        });

        unsubConfig = subscribeClinicConfig((liveConfig) => {
          if (liveConfig && liveConfig.clinicName) {
            setConfig(liveConfig);
            saveToStorage('CONFIG', liveConfig);
          }
        });

        unsubMedicalRecords = subscribeMedicalRecords((liveRecords) => {
          setMedicalRecords(liveRecords || []);
        });
      } catch (err) {
        console.warn('Realtime Firebase initialization note:', err);
      } finally {
        setInitialLoaded(true);
      }
    };

    initFirebase();

    return () => {
      if (unsubDoctors) unsubDoctors();
      if (unsubPatients) unsubPatients();
      if (unsubAppointments) unsubAppointments();
      if (unsubIntakes) unsubIntakes();
      if (unsubConfig) unsubConfig();
      if (unsubMedicalRecords) unsubMedicalRecords();
    };
  }, []);

  // Update dynamic CSS variables when colors change
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--color-accent', config.accentColor);
    document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
    saveToStorage('CONFIG', config);
  }, [config]);

  // Handlers for Appointments
  const handleAddAppointment = (newApt: Omit<Appointment, 'id' | 'createdAt'>) => {
    const created: Appointment = {
      ...newApt,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [created, ...prev]);
    saveToStorage('APPOINTMENTS', [created, ...appointments]);
    dbSaveAppointment(created).catch(e => console.error(e));
  };

  const handleUpdateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    dbUpdateAppointmentStatus(id, status).catch(e => console.error(e));
  };

  // Direct pass from Appointment to Ticket
  const handlePassToIntake = (appointment: Appointment) => {
    setPreselectedPatientId(appointment.patientId);
    setPreselectedAppointmentId(appointment.id);
    handleUpdateAppointmentStatus(appointment.id, 'en_espera');
    setActiveModule('tickets');
  };

  // Handlers for Self-Managed Booking via Public Portal
  const handleBookSelfManagedAppointment = async (newApt: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> => {
    const created: Appointment = {
      ...newApt,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      source: 'autogestionada',
      isSelfManaged: true
    };
    setAppointments(prev => [created, ...prev]);
    await dbSaveAppointment(created);
    return created.id;
  };

  // Handlers for Intakes
  const handleAddIntake = (newIntake: PatientIntake) => {
    setIntakes(prev => [newIntake, ...prev]);
    saveToStorage('INTAKES', [newIntake, ...intakes]);
    dbSaveIntake(newIntake).catch(e => console.error(e));

    if (newIntake.appointmentId) {
      handleUpdateAppointmentStatus(newIntake.appointmentId, 'en_espera');
    }
  };

  const handleUpdateIntakeStatus = (id: string, status: IntakeStatus, paymentMethod?: PaymentMethod) => {
    let updatedTarget: PatientIntake | undefined;
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
        updatedTarget = updated;
        return updated;
      }
      return i;
    }));

    if (updatedTarget) {
      dbUpdateIntake(updatedTarget).catch(e => console.error(e));
    }

    const item = intakes.find(i => i.id === id);
    if (item && (status === 'en_atencion' || status === 'en_consulta')) {
      setDoctors(prev => prev.map(d => d.id === item.doctorId ? { ...d, status: 'en_consulta', activePatientName: item.patientName } : d));
      dbUpdateDoctorStatus(item.doctorId, 'en_consulta', item.patientName).catch(e => console.error(e));
      if (item.appointmentId) {
        handleUpdateAppointmentStatus(item.appointmentId, 'en_consulta');
      }
    } else if (item && status === 'atendido') {
      setDoctors(prev => prev.map(d => d.id === item.doctorId ? { ...d, status: 'disponible', activePatientName: undefined } : d));
      dbUpdateDoctorStatus(item.doctorId, 'disponible', undefined).catch(e => console.error(e));
      if (item.appointmentId) {
        handleUpdateAppointmentStatus(item.appointmentId, 'completada');
      }
    }
  };

  // Handlers for Patients
  const handleAddPatient = (patient: Patient) => {
    setPatients(prev => [patient, ...prev]);
    saveToStorage('PATIENTS', [patient, ...patients]);
    dbSavePatient(patient).catch(e => console.error(e));
  };

  const handleUpdatePatient = (patient: Patient) => {
    setPatients(prev => prev.map(p => p.id === patient.id ? patient : p));
    dbSavePatient(patient).catch(e => console.error(e));
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
    dbUpdateDoctorStatus(doctorId, status).catch(e => console.error(e));
  };

  const handleAddDoctor = (doctor: Doctor) => {
    setDoctors(prev => [...prev, doctor]);
    dbSaveDoctor(doctor).catch(e => console.error(e));
  };

  const handleUpdateConfig = (newConfig: ClinicConfig) => {
    setConfig(newConfig);
    dbSaveConfig(newConfig).catch(e => console.error(e));
  };

  // Handlers for Medical Records
  const handleSaveMedicalRecord = async (record: MedicalRecord) => {
    setMedicalRecords(prev => [record, ...prev.filter(r => r.id !== record.id)]);
    await dbSaveMedicalRecord(record);
  };

  const handleDeleteMedicalRecord = async (recordId: string) => {
    setMedicalRecords(prev => prev.filter(r => r.id !== recordId));
    await dbDeleteMedicalRecord(recordId);
  };

  // Reset data - purge test data and keep official doctors
  const handleResetData = () => {
    const loaded = loadStoredData();
    setConfig(loaded.config);
    setDoctors(loaded.doctors);
    setPatients([]);
    setAppointments([]);
    setIntakes([]);
    setMedicalRecords([]);
    saveToStorage('PATIENTS', []);
    saveToStorage('APPOINTMENTS', []);
    saveToStorage('INTAKES', []);
    seedInitialFirestoreData().catch(e => console.error(e));
  };

  // Copy portal link helper
  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(publicPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // WhatsApp share helper
  const handleShareWhatsAppDirect = () => {
    const msg = encodeURIComponent(
      `Hola, le saludamos de *${config.clinicName}* (C.C. Parque Humboldt, Caracas).\n\n` +
      `Puede consultar nuestros médicos especialistas y *autogestionar su cita médica* de forma rápida y segura desde su teléfono en el siguiente enlace oficial:\n\n` +
      `${publicPortalUrl}\n\n` +
      `_Estamos para servirle. Teléfono de contacto: ${config.phone}_`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  // IF PATIENT PORTAL IS ACTIVE (either public direct link or staff preview)
  if (isDirectPatientUrl || isStaffPortalPreview) {
    return (
      <div className="min-h-screen bg-slate-50 relative">
        {/* Only shown to staff in admin preview mode when not accessing via the direct public link */}
        {isStaffPortalPreview && !isDirectPatientUrl && (
          <aside aria-label="Vista Previa Personal" className="sticky top-0 z-50 bg-slate-900 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Vista Previa del Portal de Pacientes (Solo Personal Clínico)</span>
            </span>
            <button
              onClick={() => setIsStaffPortalPreview(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              ✕ Cerrar Vista Previa
            </button>
          </aside>
        )}

        <PatientBookingPortal
          doctors={doctors}
          appointments={appointments}
          patients={patients}
          config={config}
          onBookAppointment={handleBookSelfManagedAppointment}
          onRegisterPatient={handleAddPatient}
        />
      </div>
    );
  }

  const pendingIntakesCount = intakes.filter(i => i.status === 'en_espera' || i.status === 'pendiente_pago' || i.status === 'llamado').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-blue-50/25 text-slate-900 flex flex-col antialiased">
      
      {/* Navigation Top Bar - Sticky with Modules ALWAYS Visible */}
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
        onSharePortalLink={() => setIsShareModalOpen(true)}
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
            onOpenPatientPortal={() => setIsStaffPortalPreview(true)}
          />
        )}

        {/* Module 4: Historias Médicas */}
        {activeModule === 'medicalRecords' && (
          <MedicalRecordsModule
            patients={patients}
            doctors={doctors}
            records={medicalRecords}
            config={config}
            onSaveRecord={handleSaveMedicalRecord}
            onDeleteRecord={handleDeleteMedicalRecord}
            onAddPatient={handleAddPatient}
          />
        )}

        {/* Module 5: Pacientes */}
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

        {/* Module 6: Médicos */}
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

        {/* Module 7: Reportes */}
        {activeModule === 'reports' && (
          <ReportsModule
            appointments={appointments}
            intakes={intakes}
            patients={patients}
            doctors={doctors}
            config={config}
          />
        )}

        {/* Module 8: Configuración */}
        {activeModule === 'settings' && (
          <SettingsModule
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Modal: Share Self-Service Link for WhatsApp */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div 
              className="p-5 text-white flex items-center justify-between"
              style={{ backgroundColor: config.primaryColor }}
            >
              <div className="flex items-center gap-2.5">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">
                    Link de Autogestión de Citas para Pacientes
                  </h3>
                  <p className="text-[11px] text-slate-200">
                    Enviar a pacientes a través de WhatsApp o redes sociales
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Este enlace permite a los pacientes desplegar el portal de autogestión en cualquier teléfono o computador para reservar su cita médica en ATP Medical Caracas:
              </p>

              {/* URL Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-800 truncate select-all">
                  {publicPortalUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPortalLink}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 shrink-0 flex items-center gap-1 shadow-xs"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Features notice */}
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Beneficios del enlace:</span>
                </p>
                <ul className="list-disc list-inside text-[11px] text-emerald-800 space-y-0.5 pl-1">
                  <li>Respeta estrictamente los días y horarios oficiales de cada especialista.</li>
                  <li>Las citas se guardan directamente en Firebase en tiempo real con etiqueta <b>«Autogestionada»</b>.</li>
                  <li>Genera un comprobante digital al paciente para su WhatsApp y calendario.</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleShareWhatsAppDirect}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Compartir Directo por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsShareModalOpen(false);
                    setIsStaffPortalPreview(true);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Probar Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

          <div className="flex items-center gap-3 text-slate-500 text-[11px] font-medium">
            <span>{config.email}</span>
            <span>·</span>
            <button 
              onClick={() => setActiveModule('settings')}
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              Ajustar Colores
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
