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
import {
  getPublicPortalUrl,
  buildPortalInviteMessage,
  buildWhatsAppUrl,
  formatPhoneForWhatsApp,
  sendWhatsAppMessageInApp
} from './utils/whatsapp';
import { testConnection, sendEmailViaGmailApi } from './firebase/firebase';
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
import { HomeWelcomeModule } from './components/Home/HomeWelcomeModule';
import { OfficialAtpLogo } from './components/OfficialLogo';
import { downloadMedicalRecordPdf } from './utils/pdfGenerator';
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
  const [activeModule, setActiveModule] = useState<ActiveModule>('home');

  // Check if patient accessed via public self-service portal link (?portal=autogestion)
  const isDirectPatientUrl = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('portal') === 'autogestion' || 
    window.location.search.includes('autogestion') ||
    window.location.hash.includes('autogestion')
  );

  // Check if patient accessed a shared Medical Report PDF link (?informe=<id>)
  const sharedReportId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('informe')
    : null;

  // Staff preview mode for testing portal from within admin
  const [isStaffPortalPreview, setIsStaffPortalPreview] = useState(false);

  // Modal for sharing portal link internally via WhatsApp or Email
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFullMessage, setCopiedFullMessage] = useState(false);
  const [shareRecipientPhone, setShareRecipientPhone] = useState('');
  const [shareRecipientEmail, setShareRecipientEmail] = useState('');
  const [shareRecipientName, setShareRecipientName] = useState('');
  const [shareChannel, setShareChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isSendingShareInternal, setIsSendingShareInternal] = useState(false);
  const [shareInternalSuccess, setShareInternalSuccess] = useState<string | null>(null);
  const [shareInternalError, setShareInternalError] = useState<string | null>(null);

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

  // URL for self-service portal (automatically resolves ais-dev- to ais-pre- and preserves Vercel domains)
  const publicPortalUrl = getPublicPortalUrl();

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

  // Live formatted WhatsApp invite message
  const portalInviteMessage = buildPortalInviteMessage(config, publicPortalUrl, shareRecipientName);
  const directWhatsAppUrl = buildWhatsAppUrl(portalInviteMessage, shareRecipientPhone);

  // Copy portal link helper
  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(publicPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Copy full WhatsApp message helper
  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(portalInviteMessage);
    setCopiedFullMessage(true);
    setTimeout(() => setCopiedFullMessage(false), 2500);
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

  // IF SHARED MEDICAL REPORT PDF LINK (?informe=<id>) IS ACTIVE
  if (sharedReportId) {
    const sharedRecord = medicalRecords.find(r => r.id === sharedReportId);
    return (
      <div className="min-h-screen bg-[#151E3A] text-[#151E3A] p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border-2 border-[#7DDACB] overflow-hidden">
          <div className="bg-[#151E3A] p-5 text-white border-b-4 border-[#7DDACB] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-36 h-12 px-2.5 py-1 rounded-xl bg-[#F4F4F4] border border-[#7DDACB] flex items-center justify-center shrink-0">
                <OfficialAtpLogo className="w-full h-full" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7DDACB] block">
                  Documento Clínico Oficial · PDF
                </span>
                <h1 className="text-base sm:text-lg font-black text-white">
                  Informe Médico Electrónico
                </h1>
              </div>
            </div>
            {sharedRecord && (
              <button
                type="button"
                onClick={() => downloadMedicalRecordPdf(sharedRecord, config)}
                className="px-4 py-2.5 rounded-xl bg-[#7DDACB] hover:brightness-105 text-[#151E3A] font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
              >
                <span>⬇ Descargar PDF</span>
              </button>
            )}
          </div>

          {!sharedRecord ? (
            <div className="p-8 text-center space-y-2 text-xs text-[#1F2952]">
              <p className="font-bold text-sm text-[#151E3A]">Cargando Informe Médico Oficial...</p>
              <p>Conectando con el expediente electrónico de ATP Medical.</p>
            </div>
          ) : (
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-[#F4F4F4] p-4 rounded-xl border-l-4 border-[#395AFF] grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#1F2952] block">Folio</span>
                  <span className="font-mono font-extrabold text-[#395AFF] text-sm">{sharedRecord.recordNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#1F2952] block">Paciente</span>
                  <span className="font-extrabold text-[#151E3A] text-sm">{sharedRecord.patientName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#1F2952] block">Cédula</span>
                  <span className="font-mono font-bold text-[#151E3A]">{sharedRecord.patientDni}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#1F2952] block">Fecha</span>
                  <span className="font-mono font-bold text-[#151E3A]">{sharedRecord.date} {sharedRecord.time}</span>
                </div>
              </div>

              <div className="bg-[#1F2952] text-white p-3.5 rounded-xl border-l-4 border-[#7DDACB] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#7DDACB] uppercase font-bold block">Especialista Tratante</span>
                  <span className="font-black text-sm">{sharedRecord.doctorName}</span>
                </div>
                <span className="font-extrabold text-[#7DDACB] uppercase">{sharedRecord.specialty}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-extrabold text-[#151E3A] uppercase text-[11px] block">Motivo de Consulta:</span>
                  <p className="text-[#1F2952] mt-0.5">{sharedRecord.chiefComplaint}</p>
                </div>

                <div className="bg-[#F4F4F4] p-3.5 rounded-xl border-l-4 border-[#7DDACB]">
                  <span className="font-extrabold text-[#1F2952] uppercase text-[11px] block">Diagnóstico Clínico:</span>
                  <p className="font-black text-[#151E3A] text-sm mt-0.5">{sharedRecord.diagnosis}</p>
                </div>

                {sharedRecord.treatmentPlan && (
                  <div>
                    <span className="font-extrabold text-[#151E3A] uppercase text-[11px] block">Plan de Tratamiento & Indicaciones:</span>
                    <p className="text-[#1F2952] whitespace-pre-line mt-0.5">{sharedRecord.treatmentPlan}</p>
                  </div>
                )}

                {sharedRecord.prescriptions && (
                  <div className="bg-[#F4F4F4] p-3.5 rounded-xl border-l-4 border-[#395AFF] font-mono">
                    <span className="font-sans font-extrabold text-[#1F2952] uppercase text-[10px] block mb-1">Récipe / Medicamentos:</span>
                    <p className="text-[#151E3A] whitespace-pre-line">{sharedRecord.prescriptions}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => downloadMedicalRecordPdf(sharedRecord, config)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#395AFF] hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>📥 Descargar Informe Médico en PDF ({sharedRecord.patientName}- {sharedRecord.date}.pdf)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const pendingIntakesCount = intakes.filter(i => i.status === 'en_espera' || i.status === 'pendiente_pago' || i.status === 'llamado').length;

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-[#151E3A] flex flex-col antialiased">
      
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

      {/* Main Content Viewport - Responsive across all device sizes */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 transition-all duration-200">
        {/* Module 0: Pantalla de Bienvenida / Inicio con Carrete de Instagram @atpmedical_ve */}
        {activeModule === 'home' && (
          <HomeWelcomeModule
            config={config}
            doctors={doctors}
            appointments={appointments}
            intakes={intakes}
            patients={patients}
            medicalRecords={medicalRecords}
            onNavigateTo={setActiveModule}
            onQuickIntake={() => setActiveModule('tickets')}
            onQuickAppointment={() => {
              setActiveModule('appointments');
              setIsNewAppointmentModalOpen(true);
            }}
            onSharePortalLink={() => setIsShareModalOpen(true)}
          />
        )}

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
            onUpdateConfig={handleUpdateConfig}
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

      {/* Modal: Share Self-Service Link Internally (WhatsApp & Correo Electrónico) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#151E3A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#1F2952]/20 overflow-hidden my-auto">
            <div 
              className="p-4 sm:p-5 bg-[#151E3A] border-b-2 border-[#7DDACB] text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Share2 className="w-5 h-5 text-[#7DDACB]" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    Envío Interno de Enlace de Autogestión (WhatsApp & Correo)
                  </h3>
                  <p className="text-[11px] text-[#7DDACB]">
                    Envíe el portal oficial desde adentro de la app sin abrir pestañas externas
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsShareModalOpen(false);
                  setShareInternalSuccess(null);
                  setShareInternalError(null);
                }}
                className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Channel Tabs */}
            <div className="grid grid-cols-2 bg-[#F4F4F4] p-1.5 border-b border-slate-200 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShareChannel('whatsapp');
                  setShareInternalSuccess(null);
                  setShareInternalError(null);
                }}
                className={`py-2 px-3 rounded-xl font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                  shareChannel === 'whatsapp'
                    ? 'bg-[#151E3A] text-[#7DDACB] shadow-xs'
                    : 'text-[#151E3A] hover:bg-white/60'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp Interno</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShareChannel('email');
                  setShareInternalSuccess(null);
                  setShareInternalError(null);
                }}
                className={`py-2 px-3 rounded-xl font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                  shareChannel === 'email'
                    ? 'bg-[#395AFF] text-white shadow-xs'
                    : 'text-[#151E3A] hover:bg-white/60'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Correo Gmail Interno</span>
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {shareInternalSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{shareInternalSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShareInternalSuccess(null)}
                    className="text-emerald-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              )}

              {shareInternalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
                  {shareInternalError}
                </div>
              )}

              {/* Direct Recipient Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/90">
                {shareChannel === 'whatsapp' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Teléfono WhatsApp del Paciente *
                    </label>
                    <input
                      type="tel"
                      value={shareRecipientPhone}
                      onChange={(e) => setShareRecipientPhone(e.target.value)}
                      placeholder="Ej: 0414-1234567"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {shareRecipientPhone.trim()
                        ? `Envío interno directo a: +${formatPhoneForWhatsApp(shareRecipientPhone)}`
                        : 'Ingrese el número del paciente'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Correo Electrónico del Paciente *
                    </label>
                    <input
                      type="email"
                      value={shareRecipientEmail}
                      onChange={(e) => setShareRecipientEmail(e.target.value)}
                      placeholder="paciente@correo.com"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#395AFF]"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Se enviará desde la cuenta Gmail asociada ({config.connectedGmailAccount || config.email})
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre del Paciente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={shareRecipientName}
                    onChange={(e) => setShareRecipientName(e.target.value)}
                    placeholder="Ej: María Pérez"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Personaliza el saludo del mensaje automáticamente
                  </span>
                </div>
              </div>

              {/* URL Box */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Enlace Oficial del Portal de Pacientes:
                </label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-blue-700 font-semibold truncate select-all">
                    {publicPortalUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPortalLink}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Enlace Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Message Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Vista Previa del Mensaje a Enviar:</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyFullMessage}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedFullMessage ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>¡Mensaje copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar mensaje completo</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-emerald-200 text-slate-800 whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-44 overflow-y-auto shadow-inner">
                  {portalInviteMessage}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-100">
                {shareChannel === 'whatsapp' ? (
                  <button
                    type="button"
                    disabled={isSendingShareInternal}
                    onClick={async () => {
                      setShareInternalError(null);
                      setShareInternalSuccess(null);
                      setIsSendingShareInternal(true);
                      try {
                        const res = await sendWhatsAppMessageInApp({
                          recipientPhone: shareRecipientPhone,
                          messageText: portalInviteMessage,
                          config
                        });
                        setShareInternalSuccess(
                          `¡Enlace enviado internamente por WhatsApp a +${res.normalizedPhone} (${res.messageId})!`
                        );
                      } catch (err: any) {
                        setShareInternalError(err?.message || 'Error al enviar por WhatsApp.');
                      } finally {
                        setIsSendingShareInternal(false);
                      }
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#7DDACB] hover:brightness-105 text-[#151E3A] font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Phone className="w-4 h-4" />
                    <span>
                      {isSendingShareInternal
                        ? 'Enviando internamente...'
                        : 'Enviar WhatsApp Internamente (Sin salir de la App)'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSendingShareInternal}
                    onClick={async () => {
                      if (!shareRecipientEmail.trim()) {
                        setShareInternalError('Por favor ingrese el correo electrónico del paciente.');
                        return;
                      }
                      setShareInternalError(null);
                      setShareInternalSuccess(null);
                      setIsSendingShareInternal(true);
                      try {
                        const res = await sendEmailViaGmailApi({
                          to: shareRecipientEmail.trim(),
                          subject: `Portal de Citas Médicas en Línea | ${config.clinicName}`,
                          bodyText: portalInviteMessage.replace(/\*/g, ''),
                          fromName: config.clinicName,
                          loginHint: config.connectedGmailAccount || config.email || 'atpnumero1@gmail.com'
                        });
                        setShareInternalSuccess(
                          `¡Correo enviado internamente desde ${res.senderEmail} a ${shareRecipientEmail.trim()}!`
                        );
                      } catch (err: any) {
                        setShareInternalError(err?.message || 'Error al enviar el correo.');
                      } finally {
                        setIsSendingShareInternal(false);
                      }
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#395AFF] hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4 text-[#7DDACB]" />
                    <span>
                      {isSendingShareInternal
                        ? 'Enviando correo internamente...'
                        : 'Enviar Correo Internamente (Sin salir de la App)'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsShareModalOpen(false);
                    setIsStaffPortalPreview(true);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Probar Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer (#151E3A with #7DDACB & #395AFF accents + Official Siglas) */}
      <footer className="mt-auto border-t-2 border-[#7DDACB] bg-[#151E3A] py-5 text-xs text-[#F4F4F4]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 text-center sm:text-left">
            <div className="w-36 h-11 px-2.5 py-1 rounded-lg overflow-hidden border border-[#7DDACB] bg-[#F4F4F4] flex items-center justify-center shrink-0 shadow-xs">
              <OfficialAtpLogo className="w-full h-full" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-[#F4F4F4]/90 font-medium">{config.address}</span>
              <span className="hidden sm:inline text-[#7DDACB]">·</span>
              <span className="font-mono font-bold text-[#7DDACB]">{config.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[#F4F4F4]/80 text-[11px] font-medium">
            <span>{config.email}</span>
            <span className="text-[#7DDACB]">·</span>
            <button 
              onClick={() => setActiveModule('settings')}
              className="text-[#7DDACB] hover:text-white font-bold hover:underline cursor-pointer"
            >
              Identidad & Colores Oficiales
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
