import React, { useState, useMemo, useRef } from 'react';
import { 
  Patient, 
  Doctor, 
  ClinicConfig, 
  MedicalRecord, 
  VitalSigns 
} from '../../types';
import { calculateBmi } from '../../data/initialData';
import {
  buildMedicalRecordWhatsAppMessage,
  buildWhatsAppUrl,
  buildWhatsAppWebUrl,
  formatPhoneForWhatsApp,
  sendWhatsAppMessageInApp
} from '../../utils/whatsapp';
import {
  downloadMedicalRecordPdf,
  sendMedicalRecordPdfViaWhatsApp,
  getMedicalRecordPdfFilename,
  getMedicalRecordPdfBase64,
  buildMedicalRecordWhatsAppPdfText,
  shareMedicalRecordPdfFileNative,
  buildMedicalRecordEmailSubject,
  buildMedicalRecordEmailBody
} from '../../utils/pdfGenerator';
import {
  sendEmailViaGmailApi,
  connectGmailAccount,
  hasActiveGmailToken,
  getConnectedGoogleEmail
} from '../../firebase/firebase';
import { OfficialAtpLogo } from '../OfficialLogo';
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Share2, 
  User, 
  Calendar, 
  Clock, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2, 
  Heart, 
  Activity, 
  Pill, 
  FileCheck, 
  ChevronRight, 
  ArrowLeft,
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  ShieldAlert,
  Sparkles,
  Download,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface MedicalRecordsModuleProps {
  patients: Patient[];
  doctors: Doctor[];
  records: MedicalRecord[];
  config: ClinicConfig;
  onSaveRecord: (record: MedicalRecord) => Promise<void>;
  onDeleteRecord?: (recordId: string) => Promise<void>;
  onAddPatient?: (patient: Patient) => void;
  onUpdateConfig?: (newConfig: ClinicConfig) => void;
}

export const MedicalRecordsModule: React.FC<MedicalRecordsModuleProps> = ({
  patients,
  doctors,
  records,
  config,
  onSaveRecord,
  onDeleteRecord,
  onAddPatient,
  onUpdateConfig
}) => {
  // Search query for patient (Cédula, Nombre, Apellido)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // State for modals / views
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);
  const [savedConfirmRecord, setSavedConfirmRecord] = useState<MedicalRecord | null>(null);

  // State for Internal WhatsApp & Email PDF Dispatch Modal (100% In-App)
  const [dispatchRecord, setDispatchRecord] = useState<MedicalRecord | null>(null);
  const [dispatchChannel, setDispatchChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [dispatchPhone, setDispatchPhone] = useState<string>('');
  const [dispatchEmail, setDispatchEmail] = useState<string>('');
  const [editableEmailSubject, setEditableEmailSubject] = useState<string>('');
  const [editableEmailBody, setEditableEmailBody] = useState<string>('');
  const [editableWhatsappText, setEditableWhatsappText] = useState<string>('');
  const [copiedDispatchText, setCopiedDispatchText] = useState(false);

  // In-App Sending & Confirmation State
  const [confirmingEmailSend, setConfirmingEmailSend] = useState(false);
  const [confirmingWhatsappSend, setConfirmingWhatsappSend] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<{
    messageId: string;
    senderEmail: string;
    recipient: string;
    filename: string;
  } | null>(null);
  const [whatsappSentSuccess, setWhatsappSentSuccess] = useState<{
    messageId: string;
    recipient: string;
    mode: 'cloud_api' | 'internal_dispatch';
    timestamp: string;
  } | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [connectedGmail, setConnectedGmail] = useState<string>(
    getConnectedGoogleEmail() || config.connectedGmailAccount || config.email || 'atpnumero1@gmail.com'
  );
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [showInternalConfigPanel, setShowInternalConfigPanel] = useState(false);
  const [waPhoneIdInput, setWaPhoneIdInput] = useState<string>(config.whatsappPhoneNumberId || '');
  const [waTokenInput, setWaTokenInput] = useState<string>(config.whatsappAccessToken || '');

  // New Record Form State
  const [formDoctorId, setFormDoctorId] = useState<string>(doctors[0]?.id || '');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [formComplaint, setFormComplaint] = useState('');
  const [formCurrentIllness, setFormCurrentIllness] = useState('');
  const [formPhysicalExam, setFormPhysicalExam] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formTreatmentPlan, setFormTreatmentPlan] = useState('');
  const [formPrescriptions, setFormPrescriptions] = useState('');
  const [formStudies, setFormStudies] = useState('');
  const [formFollowUp, setFormFollowUp] = useState('');
  const [formDoctorNotes, setFormDoctorNotes] = useState('');

  // Vitals State
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [respRate, setRespRate] = useState<number>(16);
  const [temperature, setTemperature] = useState<number>(36.6);
  const [spo2, setSpo2] = useState<number>(98);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(170);

  // Quick Patient registration modal state
  const [isQuickPatientModalOpen, setIsQuickPatientModalOpen] = useState(false);
  const [newDniType, setNewDniType] = useState<'V' | 'E'>('V');
  const [newDniNum, setNewDniNum] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Selected patient object
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Filtered patients by Search Query (Cédula, Nombre, Apellido)
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase().trim();
    return patients.filter(p => 
      p.fullName.toLowerCase().includes(q) ||
      p.dni.toLowerCase().replace(/[\.\s]/g, '').includes(q.replace(/[\.\s]/g, '')) ||
      (p.phone && p.phone.includes(q))
    );
  }, [patients, searchQuery]);

  // Records for currently selected patient, sorted latest first
  const patientRecords = useMemo(() => {
    if (!selectedPatientId) return [];
    return records
      .filter(r => r.patientId === selectedPatientId)
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [records, selectedPatientId]);

  // Calculated BMI
  const bmiInfo = useMemo(() => {
    return calculateBmi(weightKg, heightCm);
  }, [weightKg, heightCm]);

  // Reset form
  const resetForm = () => {
    setFormComplaint('');
    setFormCurrentIllness('');
    setFormPhysicalExam('');
    setFormDiagnosis('');
    setFormTreatmentPlan('');
    setFormPrescriptions('');
    setFormStudies('');
    setFormFollowUp('');
    setFormDoctorNotes('');
    setSystolic(120);
    setDiastolic(80);
    setHeartRate(75);
    setRespRate(16);
    setTemperature(36.6);
    setSpo2(98);
    setWeightKg(70);
    setHeightCm(170);
  };

  // Open modal to create record
  const handleOpenNewRecord = () => {
    if (!selectedPatient) return;
    resetForm();
    if (doctors.length > 0 && !formDoctorId) {
      setFormDoctorId(doctors[0].id);
    }
    setIsNewRecordModalOpen(true);
  };

  // Save new record
  const handleSaveMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const doc = doctors.find(d => d.id === formDoctorId) || doctors[0];

    const vitals: VitalSigns = {
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      heartRate: Number(heartRate),
      respRate: Number(respRate),
      temperature: Number(temperature),
      spo2: Number(spo2),
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      bmi: bmiInfo.bmi,
      bmiCategory: bmiInfo.category
    };

    const recordNumber = `HM-${new Date().getFullYear()}-${String(records.length + 1).padStart(4, '0')}`;

    const newRecord: MedicalRecord = {
      id: `mr-${Date.now()}`,
      recordNumber,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientDni: selectedPatient.dni,
      patientAge: selectedPatient.birthDate ? calculateAge(selectedPatient.birthDate) : undefined,
      patientGender: selectedPatient.gender,
      patientPhone: selectedPatient.phone,
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      room: doc.room,
      date: formDate,
      time: formTime,
      chiefComplaint: formComplaint.trim() || 'Consulta médica general',
      currentIllness: formCurrentIllness.trim(),
      vitals,
      physicalExam: formPhysicalExam.trim(),
      diagnosis: formDiagnosis.trim() || 'Evaluación médica satisfactoria',
      treatmentPlan: formTreatmentPlan.trim(),
      prescriptions: formPrescriptions.trim(),
      complementaryStudies: formStudies.trim(),
      nextFollowUpDate: formFollowUp.trim() || undefined,
      doctorNotes: formDoctorNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    // Close creation window immediately and show confirmation message
    setIsNewRecordModalOpen(false);
    setSavedConfirmRecord(newRecord);
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 6000);

    try {
      await onSaveRecord(newRecord);
    } catch (err) {
      console.error('Error saving medical record:', err);
    }
  };

  // Helper to calculate age from birthDate
  function calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  // Handle Quick Patient Creation
  const handleQuickRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDniNum.trim()) return;

    const fullDni = `${newDniType}-${newDniNum.trim()}`;
    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      dni: fullDni,
      fullName: newName.trim(),
      birthDate: '',
      gender: 'Otro',
      phone: newPhone.trim() || '+58 414-3651970',
      email: newEmail.trim() || '',
      address: 'Caracas, Venezuela',
      insurance: 'Particular',
      allergies: [],
      chronicConditions: [],
      emergencyContact: { name: '', phone: '', relation: '' },
      createdAt: new Date().toISOString()
    };

    if (onAddPatient) {
      onAddPatient(newPat);
    }
    setSelectedPatientId(newPat.id);
    setIsQuickPatientModalOpen(false);
    setNewName('');
    setNewDniNum('');
    setNewPhone('');
    setNewEmail('');
  };

  // Print PDF function — sets document.title to "nombre y apellido- fecha" so browser Save-as-PDF uses the exact requested filename
  const handlePrint = () => {
    setIsPrinting(true);
    const originalTitle = document.title;
    if (viewingRecord) {
      document.title = getMedicalRecordPdfFilename(viewingRecord, false);
    }
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      setTimeout(() => {
        document.title = originalTitle;
      }, 500);
    }, 250);
  };

  // Open Internal WhatsApp PDF dispatch modal & download the official PDF ("nombre y apellido- fecha.pdf")
  const handleSendPdfViaWhatsApp = (rec: MedicalRecord) => {
    const patient = patients.find(p => p.id === rec.patientId || p.dni === rec.patientDni);
    const phone = rec.patientPhone || patient?.phone || '';
    const email = patient?.email || '';
    const recordWithPhone: MedicalRecord = {
      ...rec,
      patientPhone: phone
    };
    setDispatchRecord(recordWithPhone);
    setDispatchChannel('whatsapp');
    setDispatchPhone(phone);
    setDispatchEmail(email);
    setEditableEmailSubject(buildMedicalRecordEmailSubject(recordWithPhone, config));
    setEditableEmailBody(buildMedicalRecordEmailBody(recordWithPhone, config));
    setEditableWhatsappText(buildMedicalRecordWhatsAppPdfText(recordWithPhone, config));
    setConfirmingEmailSend(false);
    setConfirmingWhatsappSend(false);
    setEmailSentSuccess(null);
    setWhatsappSentSuccess(null);
    setDispatchError(null);
    setCopiedDispatchText(false);
    // Download the PDF with format "nombre y apellido- fecha de creación del informe.pdf"
    downloadMedicalRecordPdf(recordWithPhone, config);
  };

  // Open Internal Email PDF dispatch modal & download the official PDF ("nombre y apellido- fecha.pdf")
  const handleSendPdfViaEmail = (rec: MedicalRecord) => {
    const patient = patients.find(p => p.id === rec.patientId || p.dni === rec.patientDni);
    const phone = rec.patientPhone || patient?.phone || '';
    const email = patient?.email || '';
    const recordWithPhone: MedicalRecord = {
      ...rec,
      patientPhone: phone
    };
    setDispatchRecord(recordWithPhone);
    setDispatchChannel('email');
    setDispatchPhone(phone);
    setDispatchEmail(email);
    setEditableEmailSubject(buildMedicalRecordEmailSubject(recordWithPhone, config));
    setEditableEmailBody(buildMedicalRecordEmailBody(recordWithPhone, config));
    setEditableWhatsappText(buildMedicalRecordWhatsAppPdfText(recordWithPhone, config));
    setConfirmingEmailSend(false);
    setConfirmingWhatsappSend(false);
    setEmailSentSuccess(null);
    setWhatsappSentSuccess(null);
    setDispatchError(null);
    setCopiedDispatchText(false);
    // Download the PDF with format "nombre y apellido- fecha de creación del informe.pdf"
    downloadMedicalRecordPdf(recordWithPhone, config);
  };

  // Connect / Authorize Gmail Account from inside the app
  const handleConnectGmailInModal = async () => {
    setDispatchError(null);
    setIsConnectingGmail(true);
    try {
      const hint = config.connectedGmailAccount || config.email || 'atpnumero1@gmail.com';
      const { email } = await connectGmailAccount(hint);
      setConnectedGmail(email);
      if (onUpdateConfig) {
        onUpdateConfig({
          ...config,
          connectedGmailAccount: email
        });
      }
    } catch (err: any) {
      setDispatchError(err?.message || 'No se pudo autorizar el permiso de Gmail.');
    } finally {
      setIsConnectingGmail(false);
    }
  };

  // Execute In-App Email Send via Gmail API with the PDF attached
  const handleConfirmSendEmailInApp = async () => {
    if (!dispatchRecord) return;
    if (!dispatchEmail.trim()) {
      setDispatchError('Por favor ingrese el correo electrónico del destinatario.');
      return;
    }
    setDispatchError(null);
    setIsSendingEmail(true);
    try {
      const { filename, base64Content } = getMedicalRecordPdfBase64(dispatchRecord, config);
      const hint = connectedGmail || config.connectedGmailAccount || config.email || 'atpnumero1@gmail.com';
      const result = await sendEmailViaGmailApi({
        to: dispatchEmail.trim(),
        subject: editableEmailSubject.trim() || buildMedicalRecordEmailSubject(dispatchRecord, config),
        bodyText: editableEmailBody.trim() || buildMedicalRecordEmailBody(dispatchRecord, config),
        fromName: config.clinicName || 'ATP MEDICAL',
        loginHint: hint,
        pdfAttachment: {
          filename,
          base64Content
        }
      });
      setConnectedGmail(result.senderEmail);
      setConfirmingEmailSend(false);
      setEmailSentSuccess({
        messageId: result.id,
        senderEmail: result.senderEmail,
        recipient: dispatchEmail.trim(),
        filename
      });
    } catch (err: any) {
      setDispatchError(
        err?.message || 'Error al enviar el correo internamente. Verifique la autorización de su cuenta Gmail.'
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Execute In-App WhatsApp Send without leaving the app
  const handleConfirmSendWhatsappInApp = async () => {
    if (!dispatchRecord) return;
    setDispatchError(null);
    setIsSendingWhatsapp(true);
    try {
      const updatedConfig: ClinicConfig = {
        ...config,
        whatsappPhoneNumberId: waPhoneIdInput.trim() || config.whatsappPhoneNumberId,
        whatsappAccessToken: waTokenInput.trim() || config.whatsappAccessToken
      };
      if (
        onUpdateConfig &&
        (waPhoneIdInput.trim() !== (config.whatsappPhoneNumberId || '') ||
          waTokenInput.trim() !== (config.whatsappAccessToken || ''))
      ) {
        onUpdateConfig(updatedConfig);
      }

      const result = await sendWhatsAppMessageInApp({
        recipientPhone: dispatchPhone,
        messageText: editableWhatsappText.trim() || buildMedicalRecordWhatsAppPdfText(dispatchRecord, config),
        config: updatedConfig,
        pdfFilename: getMedicalRecordPdfFilename(dispatchRecord, true)
      });

      setConfirmingWhatsappSend(false);
      setWhatsappSentSuccess({
        messageId: result.messageId,
        recipient: `+${result.normalizedPhone}`,
        mode: result.mode,
        timestamp: result.timestamp
      });
    } catch (err: any) {
      setDispatchError(err?.message || 'Error al procesar el envío interno de WhatsApp.');
    } finally {
      setIsSendingWhatsapp(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Header - Official ATP Medical Colors (#151E3A, #1F2952, #7DDACB, #F4F4F4, #395AFF) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border-l-4 border-[#395AFF] border border-[#1F2952]/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#151E3A] border border-[#7DDACB] text-[#7DDACB] flex items-center justify-center shadow-md shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#151E3A] tracking-tight">
                Historias Médicas & Informes Clínicos
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1F2952] text-[#7DDACB] font-mono">
                Expedientes Electrónicos
              </span>
            </div>
            <p className="text-xs text-[#1F2952]/80 mt-1">
              Gestión clínica integral por paciente, evolución diagnóstica CIE-10, prescripción e impresión oficial membretada en PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsQuickPatientModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-[#1F2952]/25 text-[#151E3A] hover:bg-[#F4F4F4] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#395AFF]" />
            <span>Nuevo Paciente</span>
          </button>

          {selectedPatient && (
            <button
              type="button"
              onClick={handleOpenNewRecord}
              className="px-4 py-2 rounded-xl bg-[#395AFF] hover:brightness-110 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#7DDACB]" />
              <span>+ Crear Informe Médico</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Confirmation Toast Banner */}
      {savedSuccessToast && (
        <div className="p-4 bg-[#151E3A] border-l-4 border-[#7DDACB] text-white rounded-xl text-xs font-bold flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#7DDACB] text-[#151E3A] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[#7DDACB] block font-black uppercase tracking-wider text-[11px]">
                Confirmación de Guardado
              </span>
              <span>
                ¡El informe médico se ha guardado exitosamente en la historia clínica del paciente!
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSavedSuccessToast(false)}
            className="text-[#F4F4F4] hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Layout Grid: Left Search & Patients, Right Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (4 cols): Patient Finder */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Buscar Paciente
            </label>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por cédula, nombre o apellido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span>{filteredPatients.length} pacientes encontrados</span>
              <span>Seleccione uno</span>
            </div>

            {/* Patients List */}
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto rounded-xl border border-slate-100">
              {filteredPatients.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No se encontraron pacientes.</p>
                  <button
                    onClick={() => setIsQuickPatientModalOpen(true)}
                    className="mt-2 text-sky-600 font-bold hover:underline"
                  >
                    + Registrar Paciente
                  </button>
                </div>
              ) : (
                filteredPatients.map(pat => {
                  const isSelected = selectedPatientId === pat.id;
                  const recordCount = records.filter(r => r.patientId === pat.id).length;
                  return (
                    <div
                      key={pat.id}
                      onClick={() => setSelectedPatientId(pat.id)}
                      className={`p-3 cursor-pointer transition-colors flex items-center justify-between text-xs ${
                        isSelected 
                          ? 'bg-sky-50 border-l-4 border-sky-600 text-sky-950 font-semibold' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">
                          {pat.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          C.I. {pat.dni}
                        </div>
                        {pat.phone && (
                          <div className="text-[10px] text-slate-400">
                            {pat.phone}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {recordCount} {recordCount === 1 ? 'informe' : 'informes'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Selected Patient Medical Dossier */}
        <div className="lg:col-span-8 space-y-4">
          
          {!selectedPatient ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                Seleccione un Paciente para ver su Historia Médica
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Utilice el buscador de la izquierda por cédula, nombre o apellido para abrir el expediente clínico, consultar informes anteriores o redactar una nueva consulta médica.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Patient Profile Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-xs"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {selectedPatient.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        {selectedPatient.fullName}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          Cédula: {selectedPatient.dni}
                        </span>
                        {selectedPatient.birthDate && (
                          <span>· Edad: {calculateAge(selectedPatient.birthDate)} años</span>
                        )}
                        <span>· {selectedPatient.gender}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenNewRecord}
                    className="self-start sm:self-center px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Redactar Informe</span>
                  </button>
                </div>

                {/* Patient Quick Info Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Teléfono</span>
                    <span className="font-semibold text-slate-800">{selectedPatient.phone || 'No registrado'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Correo</span>
                    <span className="font-semibold text-slate-800 truncate block">{selectedPatient.email || 'No registrado'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Grupo Sanguíneo</span>
                    <span className="font-bold text-rose-700">{selectedPatient.bloodGroup || 'Sin verificar'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Cobertura</span>
                    <span className="font-semibold text-slate-800">{selectedPatient.insurance || 'Particular'}</span>
                  </div>
                </div>

                {/* Alerts: Allergies & Chronic Conditions */}
                {(selectedPatient.allergies?.length > 0 || selectedPatient.chronicConditions?.length > 0) && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5">
                    {selectedPatient.allergies?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="font-bold text-rose-900">Alergias Conocidas:</span>
                        <div className="flex gap-1 flex-wrap">
                          {selectedPatient.allergies.map(a => (
                            <span key={a} className="bg-rose-100 text-rose-800 px-2 py-0.2 rounded font-semibold text-[11px]">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPatient.chronicConditions?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="font-bold text-amber-900">Antecedentes / Condiciones:</span>
                        <div className="flex gap-1 flex-wrap">
                          {selectedPatient.chronicConditions.map(c => (
                            <span key={c} className="bg-amber-100 text-amber-900 px-2 py-0.2 rounded font-semibold text-[11px]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* History Timeline */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Informes Médicos & Consultas ({patientRecords.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Historial cronológico ordenado
                  </span>
                </div>

                {patientRecords.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-600">Este paciente aún no tiene informes médicos registrados.</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Haga clic en "+ Crear Informe Médico" para redactar la primera consulta, examen físico, diagnóstico y récipe.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenNewRecord}
                      className="mt-2 px-3 py-1.5 rounded-lg text-white font-bold text-xs"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      Redactar Primer Informe
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientRecords.map(rec => (
                      <div 
                        key={rec.id}
                        className="p-4 rounded-xl border border-slate-200/90 hover:border-sky-300 transition-all bg-white hover:bg-slate-50/50 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                              {rec.recordNumber}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">
                              📅 {rec.date} {rec.time}
                            </span>
                            <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                              {rec.specialty}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => downloadMedicalRecordPdf(rec, config)}
                              className="px-2.5 py-1 text-xs font-bold text-[#151E3A] bg-[#F4F4F4] hover:bg-slate-200 rounded-lg border border-[#1F2952]/20 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Descargar archivo PDF oficial"
                            >
                              <Download className="w-3.5 h-3.5 text-[#395AFF]" />
                              <span>Descargar PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setViewingRecord(rec)}
                              className="px-2.5 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Ver / Imprimir</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendPdfViaWhatsApp(rec)}
                              className="px-2.5 py-1 text-xs font-extrabold text-[#151E3A] bg-[#7DDACB] hover:brightness-105 rounded-lg border border-[#151E3A]/15 transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Descargar PDF y enviar por WhatsApp al paciente"
                            >
                              <Share2 className="w-3.5 h-3.5 text-[#151E3A]" />
                              <span>Enviar PDF WhatsApp</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendPdfViaEmail(rec)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-[#395AFF] hover:brightness-110 rounded-lg border border-[#151E3A]/15 transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Descargar PDF y enviar por Correo Electrónico al paciente"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#7DDACB]" />
                              <span>Enviar por Correo</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Médico Tratante</span>
                            <span className="font-bold text-slate-800">{rec.doctorName}</span>
                            <span className="text-slate-500 text-[11px] block">{rec.room}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Diagnóstico Clínico</span>
                            <span className="font-bold text-slate-900">{rec.diagnosis}</span>
                          </div>
                        </div>

                        {rec.chiefComplaint && (
                          <div className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Motivo: </span>
                            <span>{rec.chiefComplaint}</span>
                          </div>
                        )}

                        {rec.treatmentPlan && (
                          <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">
                            <span className="font-bold text-slate-800 block text-[11px]">Tratamiento / Indicaciones:</span>
                            <span className="line-clamp-2">{rec.treatmentPlan}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: Create New Medical Report Form */}
      {isNewRecordModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div 
              className="p-5 text-white flex items-center justify-between"
              style={{ backgroundColor: config.primaryColor }}
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-200">
                  ATP Medical · Formulario Clínico Oficial
                </span>
                <h3 className="text-base font-bold">
                  Redactar Nuevo Informe Médico
                </h3>
                <p className="text-xs text-slate-200">
                  Paciente: {selectedPatient.fullName} · C.I. {selectedPatient.dni}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewRecordModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMedicalRecord} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Doctor, Specialty, Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Médico Especialista *
                  </label>
                  <select
                    value={formDoctorId}
                    onChange={(e) => setFormDoctorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Fecha de Atención *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Chief Complaint & Current Illness */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    1. Motivo de Consulta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Dolor abdominal en epigastrio de 3 días de evolución, náuseas y pirosis."
                    value={formComplaint}
                    onChange={(e) => setFormComplaint(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    2. Enfermedad Actual / Anamnesis
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describa el inicio cronológico, características del cuadro clínico y antecedentes relevantes de la consulta actual..."
                    value={formCurrentIllness}
                    onChange={(e) => setFormCurrentIllness(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Vital Signs Grid */}
              <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    3. Signos Vitales & Somatometría
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">T.A. Sistólica (mmHg)</label>
                    <input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">T.A. Diastólica (mmHg)</label>
                    <input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Frec. Cardíaca (lpm)</label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Frec. Respiratoria (rpm)</label>
                    <input
                      type="number"
                      value={respRate}
                      onChange={(e) => setRespRate(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Temperatura (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Sat. O2 SpO2 (%)</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-0.5">Talla (cm) / IMC: {bmiInfo.bmi}</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Exam */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  4. Examen Físico Segmentario
                </label>
                <textarea
                  rows={2}
                  placeholder="Cabeza y cuello, cardiopulmonar, abdomen, osteomuscular, neurológico..."
                  value={formPhysicalExam}
                  onChange={(e) => setFormPhysicalExam(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  5. Diagnóstico Clínico (Principal y diferenciales) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1. Gastritis crónica agudizada por Helicobacter pylori. 2. Reflujo gastroesofágico."
                  value={formDiagnosis}
                  onChange={(e) => setFormDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-bold"
                />
              </div>

              {/* Treatment Plan & Prescriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    6. Plan de Tratamiento & Indicaciones
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Dieta, reposo, medidas higiénico-dietéticas, signos de alarma..."
                    value={formTreatmentPlan}
                    onChange={(e) => setFormTreatmentPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-sky-600" />
                    <span>Récipe / Medicamentos Prescritos</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="1. Esomeprazol 40mg VO OD en ayunas x 14 días. 2. Procinético..."
                    value={formPrescriptions}
                    onChange={(e) => setFormPrescriptions(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Complementary Studies & Next Follow up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    7. Estudios Complementarios Solicitados
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Endoscopia digestiva superior, Ecografía abdominal, Hematología completa."
                    value={formStudies}
                    onChange={(e) => setFormStudies(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    8. Próximo Control Sugerido
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. En 15 días con resultados de paraclínicos."
                    value={formFollowUp}
                    onChange={(e) => setFormFollowUp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                  style={{ backgroundColor: config.accentColor }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Informe & Generar PDF</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: Official Print / PDF Preview Modal with Official ATP Medical Colors */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-[#151E3A]/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border-2 border-[#1F2952] overflow-hidden my-4 flex flex-col max-h-[92vh]">
            
            {/* Top Toolbar (Hidden on Print) */}
            <div className="p-3.5 bg-[#151E3A] border-b-2 border-[#7DDACB] text-white flex items-center justify-between no-print print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#7DDACB]" />
                <span className="font-bold text-xs">
                  Vista Previa de Impresión Oficial (PDF Membretado)
                </span>
                <span className="font-mono text-[10px] text-[#7DDACB] bg-[#1F2952] border border-[#7DDACB]/40 px-2 py-0.5 rounded">
                  {viewingRecord.recordNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadMedicalRecordPdf(viewingRecord, config)}
                  className="px-3 py-1.5 rounded-lg bg-[#F4F4F4] hover:bg-white text-[#151E3A] font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#395AFF]" />
                  <span>Descargar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg bg-[#395AFF] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#7DDACB]" />
                  <span>Imprimir</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendPdfViaWhatsApp(viewingRecord)}
                  className="px-3 py-1.5 rounded-lg bg-[#7DDACB] hover:brightness-105 text-[#151E3A] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Enviar informe en PDF por WhatsApp al paciente"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#151E3A]" />
                  <span>WhatsApp PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendPdfViaEmail(viewingRecord)}
                  className="px-3 py-1.5 rounded-lg bg-[#1F2952] hover:bg-[#395AFF] border border-[#7DDACB]/60 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Enviar informe en PDF por Correo Electrónico al paciente"
                >
                  <Mail className="w-3.5 h-3.5 text-[#7DDACB]" />
                  <span>Enviar Correo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="p-1 rounded-lg hover:bg-[#1F2952] text-[#F4F4F4] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Document Body (Membretado con Logo, Dirección y Colores Oficiales #151E3A, #1F2952, #7DDACB, #F4F4F4, #395AFF) */}
            <div id="printable-medical-report" className="printable-area p-8 sm:p-10 space-y-5 overflow-y-auto bg-white text-[#151E3A] font-sans print:p-6 print:m-0">
              
              {/* Top Corporate Color Bar (#151E3A, #1F2952, #7DDACB, #395AFF) */}
              <div className="h-2.5 w-full rounded-full overflow-hidden flex">
                <div className="flex-1 bg-[#151E3A]" />
                <div className="flex-1 bg-[#1F2952]" />
                <div className="flex-1 bg-[#7DDACB]" />
                <div className="flex-1 bg-[#395AFF]" />
              </div>

              {/* Institutional Header with Official Siglas & Address */}
              <div className="bg-[#151E3A] text-white p-5 rounded-xl border-b-4 border-[#7DDACB] flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-44 h-15 px-3 py-1.5 rounded-xl overflow-hidden border-2 border-[#7DDACB] flex items-center justify-center bg-[#F4F4F4] text-[#151E3A] font-black text-xl shadow-md shrink-0"
                  >
                    <OfficialAtpLogo className="w-full h-full" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#7DDACB] uppercase tracking-wide">
                      {config.slogan}
                    </p>
                    <div className="text-[11px] text-[#F4F4F4] mt-1.5 space-y-0.5 leading-snug">
                      <p className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#7DDACB] shrink-0" />
                        <span>{config.address}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#7DDACB]">Tlf: {config.phone}</span>
                        <span className="text-[#7DDACB]">·</span>
                        <span>{config.email}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 bg-[#1F2952] px-3.5 py-2.5 rounded-lg border border-[#7DDACB]/40">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#7DDACB] block">
                    INFORME MÉDICO
                  </span>
                  <span className="font-mono font-extrabold text-sm text-white block mt-0.5">
                    {viewingRecord.recordNumber}
                  </span>
                  <span className="text-[11px] text-[#F4F4F4] font-mono mt-1 block">
                    Fecha: {viewingRecord.date}
                  </span>
                  <span className="text-[11px] text-[#7DDACB] font-mono block">
                    Hora: {viewingRecord.time} hrs
                  </span>
                </div>
              </div>

              {/* Patient Identification Card (#F4F4F4 with #151E3A & #395AFF) */}
              <div className="bg-[#F4F4F4] p-4 rounded-xl border-l-4 border-[#395AFF] border border-[#1F2952]/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#1F2952] uppercase font-bold block">Paciente</span>
                  <span className="font-extrabold text-[#151E3A] text-sm block">{viewingRecord.patientName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#1F2952] uppercase font-bold block">Cédula de Identidad</span>
                  <span className="font-mono font-extrabold text-[#395AFF] text-sm block">{viewingRecord.patientDni}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#1F2952] uppercase font-bold block">Edad / Sexo</span>
                  <span className="font-bold text-[#151E3A]">
                    {viewingRecord.patientAge ? `${viewingRecord.patientAge} años` : 'N/A'} · {viewingRecord.patientGender || ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#1F2952] uppercase font-bold block">Teléfono</span>
                  <span className="font-mono font-bold text-[#151E3A]">{viewingRecord.patientPhone || config.phone}</span>
                </div>
              </div>

              {/* Treating Specialist Banner (#1F2952 with #7DDACB) */}
              <div className="px-4 py-3 rounded-xl bg-[#1F2952] text-white border-l-4 border-[#7DDACB] text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#7DDACB] font-bold uppercase tracking-wide block">
                    Médico Especialista Tratante
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {viewingRecord.doctorName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#7DDACB] uppercase text-xs block">
                    {viewingRecord.specialty}
                  </span>
                  <span className="text-[11px] text-[#F4F4F4]">
                    {viewingRecord.room || 'Consultorio ATP'}
                  </span>
                </div>
              </div>

              {/* Clinical Report Body */}
              <div className="space-y-4 text-xs leading-relaxed">
                
                {/* 1. Motivo de Consulta & Anamnesis */}
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#151E3A] uppercase text-[11px] tracking-wider border-b-2 border-[#395AFF]/30 pb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#395AFF] inline-block" />
                    <span>1. Motivo de Consulta & Enfermedad Actual</span>
                  </h4>
                  <p className="text-[#151E3A] pt-1">
                    <b>Motivo:</b> {viewingRecord.chiefComplaint}
                  </p>
                  {viewingRecord.currentIllness && (
                    <p className="text-[#1F2952] pt-0.5 whitespace-pre-line">
                      {viewingRecord.currentIllness}
                    </p>
                  )}
                </div>

                {/* 2. Signos Vitales (#F4F4F4) */}
                {viewingRecord.vitals && (
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-[#151E3A] uppercase text-[11px] tracking-wider border-b-2 border-[#395AFF]/30 pb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#395AFF] inline-block" />
                      <span>2. Signos Vitales al Momento de la Atención</span>
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-[#F4F4F4] p-2.5 rounded-lg border border-[#1F2952]/20 text-center font-mono text-[11px]">
                      <div>
                        <span className="text-[9px] text-[#1F2952] font-bold block font-sans">T.A.</span>
                        <span className="font-extrabold text-[#151E3A]">{viewingRecord.vitals.systolic}/{viewingRecord.vitals.diastolic}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#1F2952] font-bold block font-sans">F.C.</span>
                        <span className="font-extrabold text-[#151E3A]">{viewingRecord.vitals.heartRate} lpm</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#1F2952] font-bold block font-sans">F.R.</span>
                        <span className="font-extrabold text-[#151E3A]">{viewingRecord.vitals.respRate} rpm</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#1F2952] font-bold block font-sans">Temp.</span>
                        <span className="font-extrabold text-[#151E3A]">{viewingRecord.vitals.temperature}°C</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#1F2952] font-bold block font-sans">SpO2</span>
                        <span className="font-extrabold text-[#395AFF]">{viewingRecord.vitals.spo2}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#1F2952] font-bold block font-sans">Peso</span>
                        <span className="font-extrabold text-[#151E3A]">{viewingRecord.vitals.weightKg} kg</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#1F2952] font-bold block font-sans">Talla</span>
                        <span className="font-extrabold text-[#151E3A]">{viewingRecord.vitals.heightCm} cm</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#1F2952] font-bold block font-sans">IMC</span>
                        <span className="font-extrabold text-[#151E3A]">{viewingRecord.vitals.bmi || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Examen Físico */}
                {viewingRecord.physicalExam && (
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-[#151E3A] uppercase text-[11px] tracking-wider border-b-2 border-[#395AFF]/30 pb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#395AFF] inline-block" />
                      <span>3. Hallazgos al Examen Físico</span>
                    </h4>
                    <p className="text-[#151E3A] pt-0.5 whitespace-pre-line">
                      {viewingRecord.physicalExam}
                    </p>
                  </div>
                )}

                {/* 4. Diagnóstico Clínico (#F4F4F4 + #7DDACB + #151E3A) */}
                <div className="space-y-1 bg-[#F4F4F4] p-3.5 rounded-xl border-l-4 border-[#7DDACB] border border-[#1F2952]/20">
                  <h4 className="font-extrabold text-[#1F2952] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7DDACB] inline-block" />
                    <span>4. Diagnóstico Clínico</span>
                  </h4>
                  <p className="text-[#151E3A] font-black text-sm pt-0.5">
                    {viewingRecord.diagnosis}
                  </p>
                </div>

                {/* 5. Plan Terapéutico & Récipe */}
                {(viewingRecord.treatmentPlan || viewingRecord.prescriptions) && (
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[#151E3A] uppercase text-[11px] tracking-wider border-b-2 border-[#395AFF]/30 pb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#395AFF] inline-block" />
                      <span>5. Plan de Tratamiento & Récipe Médico</span>
                    </h4>
                    {viewingRecord.treatmentPlan && (
                      <p className="text-[#151E3A] whitespace-pre-line">
                        {viewingRecord.treatmentPlan}
                      </p>
                    )}
                    {viewingRecord.prescriptions && (
                      <div className="p-3.5 rounded-xl bg-[#F4F4F4] border-l-4 border-[#395AFF] border border-[#1F2952]/15 font-mono text-xs whitespace-pre-line text-[#151E3A]">
                        <span className="font-sans font-extrabold text-[#1F2952] block mb-1 uppercase text-[10px] tracking-wider">Prescripciones Farmacológicas:</span>
                        {viewingRecord.prescriptions}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Paraclínicos & Seguimiento */}
                {(viewingRecord.complementaryStudies || viewingRecord.nextFollowUpDate) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    {viewingRecord.complementaryStudies && (
                      <div className="p-3 rounded-lg bg-[#F4F4F4] border border-[#1F2952]/20">
                        <span className="font-extrabold text-[#1F2952] block text-[10px] uppercase">Estudios Solicitados:</span>
                        <span className="text-[#151E3A] font-medium">{viewingRecord.complementaryStudies}</span>
                      </div>
                    )}
                    {viewingRecord.nextFollowUpDate && (
                      <div className="p-3 rounded-lg bg-[#F4F4F4] border border-[#1F2952]/20">
                        <span className="font-extrabold text-[#395AFF] block text-[10px] uppercase">Próximo Control:</span>
                        <span className="text-[#151E3A] font-bold">{viewingRecord.nextFollowUpDate}</span>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Signature & Seal Footer (#151E3A, #1F2952, #7DDACB, #395AFF) */}
              <div className="pt-8 flex items-end justify-between gap-6 border-t-2 border-[#151E3A]">
                <div className="text-[10px] text-[#1F2952] space-y-0.5 leading-snug">
                  <p className="font-black text-[#151E3A] text-xs">ATP MEDICAL CARACAS</p>
                  <p className="font-medium">{config.address}</p>
                  <p className="text-[#1F2952]/80">Documento médico legal confidencial expedido en conformidad con la normativa sanitaria.</p>
                </div>

                <div className="text-center shrink-0 w-64 space-y-1">
                  <div className="border-b-2 border-[#151E3A] h-10 w-48 mx-auto"></div>
                  <p className="font-black text-[#151E3A] text-xs">
                    {viewingRecord.doctorName}
                  </p>
                  <p className="text-[11px] text-[#395AFF] font-extrabold uppercase">
                    {viewingRecord.specialty}
                  </p>
                  <p className="text-[10px] text-[#1F2952] font-semibold">
                    Firma y Sello del Médico Especialista
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 2.5: Save Confirmation Modal after closing the creation window */}
      {savedConfirmRecord && (
        <div className="fixed inset-0 z-50 bg-[#151E3A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-2 border-[#7DDACB] overflow-hidden animate-fadeIn">
            <div className="bg-[#151E3A] p-5 text-white border-b-4 border-[#7DDACB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7DDACB] text-[#151E3A] flex items-center justify-center font-black shadow-md shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7DDACB] block">
                    Historia Médica Actualizada
                  </span>
                  <h3 className="text-base font-black text-white">
                    ¡Informe Guardado con Éxito!
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSavedConfirmRecord(null)}
                className="text-[#F4F4F4] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-[#F4F4F4] p-3.5 rounded-xl border-l-4 border-[#395AFF] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-[#395AFF] text-sm">
                    {savedConfirmRecord.recordNumber}
                  </span>
                  <span className="text-[11px] font-semibold text-[#1F2952]">
                    {savedConfirmRecord.date} · {savedConfirmRecord.time}
                  </span>
                </div>
                <p className="font-extrabold text-[#151E3A] text-sm">
                  {savedConfirmRecord.patientName} <span className="font-mono text-xs font-normal">({savedConfirmRecord.patientDni})</span>
                </p>
                <p className="text-[#1F2952] font-semibold">
                  Especialista: {savedConfirmRecord.doctorName} ({savedConfirmRecord.specialty})
                </p>
                <p className="text-[#151E3A] pt-1">
                  <b>Diagnóstico:</b> {savedConfirmRecord.diagnosis}
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-[#151E3A]/5 border border-[#151E3A]/15 text-[11px] text-[#151E3A] flex items-center justify-between">
                  <span className="font-bold">Formato de archivo PDF:</span>
                  <span className="font-mono font-extrabold text-[#395AFF]">
                    {getMedicalRecordPdfFilename(savedConfirmRecord, true)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const rec = savedConfirmRecord;
                    setSavedConfirmRecord(null);
                    handleSendPdfViaWhatsApp(rec);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#7DDACB] hover:brightness-105 text-[#151E3A] font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#151E3A]" />
                  <span>Enviar Informe en PDF por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const rec = savedConfirmRecord;
                    setSavedConfirmRecord(null);
                    handleSendPdfViaEmail(rec);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1F2952] hover:bg-[#395AFF] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#7DDACB]" />
                  <span>Enviar Informe en PDF por Correo Electrónico</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      downloadMedicalRecordPdf(savedConfirmRecord, config);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#395AFF] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#7DDACB]" />
                    <span>Descargar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const rec = savedConfirmRecord;
                      setSavedConfirmRecord(null);
                      setViewingRecord(rec);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#F4F4F4] hover:bg-slate-200 text-[#151E3A] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#1F2952]/20 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#151E3A]" />
                    <span>Ver / Imprimir</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSavedConfirmRecord(null)}
                className="w-full py-2.5 rounded-xl bg-[#151E3A] hover:bg-[#1F2952] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Aceptar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2.8: Ventana Interna de Envío de Informe en PDF (Correo Electrónico & WhatsApp — 100% Dentro de la App) */}
      {dispatchRecord && (() => {
        const pdfFilename = getMedicalRecordPdfFilename(dispatchRecord, true);
        const cleanPhone = formatPhoneForWhatsApp(dispatchPhone);
        const isGmailReady = hasActiveGmailToken() || Boolean(getConnectedGoogleEmail());

        return (
          <div className="fixed inset-0 z-50 bg-[#151E3A]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border-2 border-[#7DDACB] overflow-hidden my-auto animate-fadeIn">
              {/* Header */}
              <div className="bg-[#151E3A] p-4 sm:p-5 text-white border-b-4 border-[#7DDACB] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7DDACB] text-[#151E3A] flex items-center justify-center font-black shadow-md shrink-0">
                    {dispatchChannel === 'whatsapp' ? (
                      <Phone className="w-5 h-5" />
                    ) : (
                      <Mail className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#7DDACB]">
                        Centro de Envío Interno ATP Medical
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#395AFF] text-white">
                        Sin salir de la App
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                      {dispatchRecord.patientName} · Informe {dispatchRecord.date}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDispatchRecord(null)}
                  className="text-[#F4F4F4] hover:text-white p-1.5 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Channel Selector Tabs (Correo Electrónico Interno / WhatsApp Interno) */}
              <div className="grid grid-cols-2 bg-[#F4F4F4] p-1.5 border-b border-slate-200 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setDispatchChannel('email');
                    setDispatchError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    dispatchChannel === 'email'
                      ? 'bg-[#395AFF] text-white shadow-sm'
                      : 'text-[#151E3A] hover:bg-white/60'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Correo Electrónico (Envío Interno)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDispatchChannel('whatsapp');
                    setDispatchError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    dispatchChannel === 'whatsapp'
                      ? 'bg-[#151E3A] text-[#7DDACB] shadow-sm'
                      : 'text-[#151E3A] hover:bg-white/60'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp (Envío Interno)</span>
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
                {/* PDF Attachment Banner */}
                <div className="p-3 rounded-xl bg-[#F4F4F4] border-l-4 border-[#7DDACB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#1F2952] block">
                      📎 Archivo PDF Oficial Generado y Adjunto Automáticamente:
                    </span>
                    <span className="font-mono font-extrabold text-[#151E3A] text-xs break-all">
                      {pdfFilename}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadMedicalRecordPdf(dispatchRecord, config)}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#395AFF] font-bold text-[11px] border border-[#1F2952]/15 flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Guardar Copia Local</span>
                  </button>
                </div>

                {/* Error Message if any */}
                {dispatchError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{dispatchError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDispatchError(null)}
                      className="text-rose-500 hover:text-rose-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}

                {dispatchChannel === 'email' ? (
                  <div className="space-y-3.5">
                    {/* Associated Gmail Account Bar & Permission Info */}
                    <div className="p-3.5 rounded-xl bg-[#151E3A] text-white border border-[#7DDACB]/40 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7DDACB] block">
                            Cuenta de Correo Asociada para Envío Interno
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-xs text-white">
                              {connectedGmail}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                isGmailReady
                                  ? 'bg-[#7DDACB] text-[#151E3A]'
                                  : 'bg-amber-400/20 text-amber-200 border border-amber-300/40'
                              }`}
                            >
                              {isGmailReady ? '✓ Permiso Gmail Activo' : 'Requiere confirmar permiso al enviar'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleConnectGmailInModal}
                          disabled={isConnectingGmail}
                          className="px-3 py-1.5 rounded-lg bg-[#395AFF] hover:brightness-110 text-white font-bold text-[11px] flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#7DDACB]" />
                          <span>
                            {isConnectingGmail
                              ? 'Autorizando...'
                              : isGmailReady
                              ? 'Cambiar / Reconectar Cuenta'
                              : 'Autorizar Permiso en mi Correo'}
                          </span>
                        </button>
                      </div>

                      <p className="text-[11px] text-[#F4F4F4]/85 leading-relaxed border-t border-white/10 pt-2">
                        <b>¿Qué permiso usa tu correo?</b> Únicamente el permiso oficial de{' '}
                        <span className="text-[#7DDACB] font-semibold">
                          «Enviar correos electrónicos en tu nombre»
                        </span>
                        . Envía el mensaje con el archivo <b>{pdfFilename}</b> adjunto directamente desde esta ventana sin abrir otra pestaña.
                      </p>
                    </div>

                    {/* Email Sent Confirmation Card inside the Modal */}
                    {emailSentSuccess ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-2 animate-fadeIn">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                              ¡Envío Interno Completado con Éxito!
                            </span>
                            <h4 className="font-black text-sm text-emerald-950">
                              Correo y PDF enviados directamente desde la aplicación
                            </h4>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-emerald-200 text-[11px] space-y-1">
                          <p>
                            <b>Remitente asociado:</b> <span className="font-mono">{emailSentSuccess.senderEmail}</span>
                          </p>
                          <p>
                            <b>Destinatario:</b> <span className="font-mono font-bold">{emailSentSuccess.recipient}</span>
                          </p>
                          <p>
                            <b>Archivo PDF adjunto:</b> <span className="font-mono text-[#395AFF] font-bold">{emailSentSuccess.filename}</span>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            ID de transmisión Gmail: <span className="font-mono">{emailSentSuccess.messageId}</span>
                          </p>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEmailSentSuccess(null)}
                            className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-900 font-bold text-xs cursor-pointer"
                          >
                            Enviar a otro correo
                          </button>
                          <button
                            type="button"
                            onClick={() => setDispatchRecord(null)}
                            className="px-4 py-1.5 rounded-lg bg-[#151E3A] text-white font-bold text-xs cursor-pointer"
                          >
                            Finalizar y Cerrar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Recipient Email Input */}
                        <div>
                          <label className="font-bold text-[#151E3A] block mb-1">
                            Para (Correo Electrónico del Paciente o Médico Destinatario) *
                          </label>
                          <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={dispatchEmail}
                            onChange={(e) => setDispatchEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#1F2952]/30 text-[#151E3A] font-semibold text-xs focus:ring-2 focus:ring-[#395AFF] focus:outline-hidden"
                          />
                        </div>

                        {/* Editable Subject */}
                        <div>
                          <label className="font-bold text-[#151E3A] block mb-1">
                            Asunto del Correo:
                          </label>
                          <input
                            type="text"
                            value={editableEmailSubject}
                            onChange={(e) => setEditableEmailSubject(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#1F2952]/25 text-[#151E3A] font-semibold text-xs focus:ring-2 focus:ring-[#395AFF] focus:outline-hidden"
                          />
                        </div>

                        {/* Editable Body inside the app */}
                        <div>
                          <label className="font-bold text-[#151E3A] block mb-1">
                            Mensaje del Correo (Editable aquí mismo en la app):
                          </label>
                          <textarea
                            rows={6}
                            value={editableEmailBody}
                            onChange={(e) => setEditableEmailBody(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#1F2952]/25 text-[#151E3A] font-sans text-xs leading-relaxed focus:ring-2 focus:ring-[#395AFF] focus:outline-hidden"
                          />
                        </div>

                        {/* Explicit Confirmation Step before calling Gmail API */}
                        {confirmingEmailSend ? (
                          <div className="p-4 rounded-xl bg-[#151E3A] text-white border-2 border-[#7DDACB] space-y-3 animate-fadeIn">
                            <div className="flex items-start gap-2.5">
                              <Mail className="w-5 h-5 text-[#7DDACB] shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#7DDACB] block">
                                  Confirmación de Envío Interno por Gmail
                                </span>
                                <p className="text-xs font-semibold mt-0.5">
                                  ¿Confirmas enviar este correo con el archivo PDF adjunto (<b>{pdfFilename}</b>) a{' '}
                                  <span className="text-[#7DDACB] underline">{dispatchEmail.trim()}</span> usando la cuenta asociada?
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={isSendingEmail}
                                onClick={() => setConfirmingEmailSend(false)}
                                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                disabled={isSendingEmail}
                                onClick={handleConfirmSendEmailInApp}
                                className="px-4 py-2 rounded-xl bg-[#7DDACB] hover:brightness-105 text-[#151E3A] font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>
                                  {isSendingEmail
                                    ? 'Enviando Correo y PDF...'
                                    : 'Sí, Confirmar y Enviar Correo Ahora'}
                                </span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!dispatchEmail.trim()) {
                                setDispatchError('Por favor ingrese el correo electrónico del destinatario antes de enviar.');
                                return;
                              }
                              setDispatchError(null);
                              setConfirmingEmailSend(true);
                            }}
                            className="w-full py-3 px-4 rounded-xl bg-[#395AFF] hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                          >
                            <Mail className="w-4 h-4 text-[#7DDACB]" />
                            <span>Enviar Correo con PDF Adjunto Internamente (Sin salir de la App)</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {/* Associated WhatsApp Bar & Optional Cloud API Configuration */}
                    <div className="p-3.5 rounded-xl bg-[#151E3A] text-white border border-[#7DDACB]/40 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7DDACB] block">
                            WhatsApp Asociado a la Clínica (Envío Interno)
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-xs text-white">
                              {config.phone || '+58 414-3651970'}
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#7DDACB] text-[#151E3A]">
                              {config.whatsappPhoneNumberId && config.whatsappAccessToken
                                ? '✓ WhatsApp Cloud API Activo'
                                : '✓ Ventana Interna Activa'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowInternalConfigPanel(!showInternalConfigPanel)}
                          className="px-3 py-1.5 rounded-lg bg-[#1F2952] hover:bg-[#395AFF] border border-[#7DDACB]/40 text-[#7DDACB] hover:text-white font-bold text-[11px] shrink-0 cursor-pointer"
                        >
                          {showInternalConfigPanel ? 'Ocultar Configuración API' : 'Configurar WhatsApp Business API'}
                        </button>
                      </div>

                      {showInternalConfigPanel && (
                        <div className="pt-2.5 mt-2 border-t border-white/15 space-y-2.5 text-[11px]">
                          <p className="text-[#F4F4F4]/90 leading-relaxed">
                            Para enviar mensajes de WhatsApp en segundo plano directamente desde los servidores de Meta sin intervención manual, puede ingresar las credenciales de <b>WhatsApp Business Cloud API</b> de su número asociado:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-[#7DDACB] font-bold block mb-0.5">
                                Phone Number ID (Meta WhatsApp Business)
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. 105928374651928"
                                value={waPhoneIdInput}
                                onChange={(e) => setWaPhoneIdInput(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white text-[#151E3A] font-mono text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-[#7DDACB] font-bold block mb-0.5">
                                Token Permanente (Meta Graph API)
                              </label>
                              <input
                                type="password"
                                placeholder="EAAGm0PX4ZCps..."
                                value={waTokenInput}
                                onChange={(e) => setWaTokenInput(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white text-[#151E3A] font-mono text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {whatsappSentSuccess ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-2 animate-fadeIn">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                              ¡Despacho Interno de WhatsApp Completado!
                            </span>
                            <h4 className="font-black text-sm text-emerald-950">
                              Informe PDF procesado y enviado internamente sin salir de la aplicación
                            </h4>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-emerald-200 text-[11px] space-y-1">
                          <p>
                            <b>Destinatario WhatsApp:</b>{' '}
                            <span className="font-mono font-bold">{whatsappSentSuccess.recipient}</span>
                          </p>
                          <p>
                            <b>Archivo PDF incluido:</b>{' '}
                            <span className="font-mono text-[#395AFF] font-bold">{pdfFilename}</span>
                          </p>
                          <p>
                            <b>Hora y Folio de Envío:</b>{' '}
                            <span className="font-mono">
                              {whatsappSentSuccess.timestamp} · {whatsappSentSuccess.messageId}
                            </span>
                          </p>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setWhatsappSentSuccess(null)}
                            className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-900 font-bold text-xs cursor-pointer"
                          >
                            Enviar a otro número
                          </button>
                          <button
                            type="button"
                            onClick={() => setDispatchRecord(null)}
                            className="px-4 py-1.5 rounded-lg bg-[#151E3A] text-white font-bold text-xs cursor-pointer"
                          >
                            Finalizar y Cerrar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="font-bold text-[#151E3A] block mb-1">
                            Número de WhatsApp del Paciente (Venezuela +58 o internacional):
                          </label>
                          <input
                            type="tel"
                            placeholder="Ej. 0414-1234567 o +58 4141234567"
                            value={dispatchPhone}
                            onChange={(e) => setDispatchPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#1F2952]/30 text-[#151E3A] font-mono font-bold text-xs focus:ring-2 focus:ring-[#395AFF] focus:outline-hidden"
                          />
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Número normalizado para envío interno: <b>+{cleanPhone || 'Ingrese los dígitos del número'}</b>
                          </span>
                        </div>

                        <div>
                          <label className="font-bold text-[#151E3A] block mb-1">
                            Mensaje de WhatsApp con Enlace de Descarga PDF (Editable aquí en la app):
                          </label>
                          <textarea
                            rows={6}
                            value={editableWhatsappText}
                            onChange={(e) => setEditableWhatsappText(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#1F2952]/25 bg-[#ECFDF5]/50 text-[#151E3A] font-sans text-xs leading-relaxed focus:ring-2 focus:ring-[#395AFF] focus:outline-hidden"
                          />
                        </div>

                        {confirmingWhatsappSend ? (
                          <div className="p-4 rounded-xl bg-[#151E3A] text-white border-2 border-[#7DDACB] space-y-3 animate-fadeIn">
                            <div className="flex items-start gap-2.5">
                              <Phone className="w-5 h-5 text-[#7DDACB] shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#7DDACB] block">
                                  Confirmación de Envío Interno de WhatsApp
                                </span>
                                <p className="text-xs font-semibold mt-0.5">
                                  ¿Confirmas enviar el informe en PDF (<b>{pdfFilename}</b>) por WhatsApp internamente al número{' '}
                                  <span className="text-[#7DDACB] font-mono">+{cleanPhone}</span>?
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={isSendingWhatsapp}
                                onClick={() => setConfirmingWhatsappSend(false)}
                                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                disabled={isSendingWhatsapp}
                                onClick={handleConfirmSendWhatsappInApp}
                                className="px-4 py-2 rounded-xl bg-[#7DDACB] hover:brightness-105 text-[#151E3A] font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>
                                  {isSendingWhatsapp
                                    ? 'Enviando internamente...'
                                    : 'Sí, Confirmar y Enviar Ahora'}
                                </span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!cleanPhone || cleanPhone.length < 10) {
                                  setDispatchError('Por favor ingrese un número de teléfono WhatsApp válido antes de enviar.');
                                  return;
                                }
                                setDispatchError(null);
                                setConfirmingWhatsappSend(true);
                              }}
                              className="w-full py-3 px-4 rounded-xl bg-[#7DDACB] hover:brightness-105 text-[#151E3A] font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                            >
                              <Phone className="w-4 h-4 text-[#151E3A]" />
                              <span>Enviar Informe en PDF por WhatsApp Internamente (Sin salir de la App)</span>
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => shareMedicalRecordPdfFileNative(dispatchRecord, config)}
                                className="py-2 px-3 rounded-xl bg-[#F4F4F4] hover:bg-slate-200 text-[#151E3A] font-bold text-[11px] border border-[#1F2952]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5 text-[#395AFF]" />
                                <span>Compartir PDF Nativo</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(editableWhatsappText);
                                  setCopiedDispatchText(true);
                                  setTimeout(() => setCopiedDispatchText(false), 2500);
                                }}
                                className="py-2 px-3 rounded-xl bg-[#F4F4F4] hover:bg-slate-200 text-[#151E3A] font-bold text-[11px] border border-[#1F2952]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                {copiedDispatchText ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">¡Mensaje Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-[#151E3A]" />
                                    <span>Copiar Texto + Link PDF</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setDispatchRecord(null)}
                    className="px-4 py-2 rounded-xl bg-[#151E3A] hover:bg-[#1F2952] text-white font-bold text-xs cursor-pointer"
                  >
                    Cerrar Ventana Interna
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 3: Quick Patient Registration Modal */}
      {isQuickPatientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div 
              className="p-4 text-white flex items-center justify-between"
              style={{ backgroundColor: config.primaryColor }}
            >
              <h3 className="font-bold text-sm">
                Registrar Nuevo Paciente
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickPatientModalOpen(false)}
                className="text-white hover:bg-white/10 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickRegisterPatient} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cédula de Identidad *</label>
                <div className="flex gap-2">
                  <select
                    value={newDniType}
                    onChange={(e) => setNewDniType(e.target.value as 'V' | 'E')}
                    className="w-16 px-2 py-2 rounded-xl border border-slate-300 font-bold bg-slate-50 text-xs"
                  >
                    <option value="V">V-</option>
                    <option value="E">E-</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 14892415"
                    value={newDniNum}
                    onChange={(e) => setNewDniNum(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre y Apellido Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrés Eloy Blanco"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teléfono WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+58 414-1234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="paciente@correo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickPatientModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs"
                  style={{ backgroundColor: config.accentColor }}
                >
                  Crear Historia del Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
