import React, { useState, useMemo } from 'react';
import { Patient, Appointment, PatientIntake, ClinicConfig } from '../../types';
import { 
  Users, 
  Search, 
  UserPlus, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  Edit, 
  Clock, 
  Plus
} from 'lucide-react';

interface PatientsModuleProps {
  patients: Patient[];
  appointments: Appointment[];
  intakes: PatientIntake[];
  config: ClinicConfig;
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onSelectPatientForAppointment: (patient: Patient) => void;
  onSelectPatientForIntake: (patient: Patient) => void;
}

export const PatientsModule: React.FC<PatientsModuleProps> = ({
  patients,
  appointments,
  intakes,
  config,
  onAddPatient,
  onUpdatePatient,
  onSelectPatientForAppointment,
  onSelectPatientForIntake
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form State
  const [dni, setDni] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('1985-06-15');
  const [gender, setGender] = useState<'Masculino' | 'Femenino' | 'Otro'>('Femenino');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [insurance, setInsurance] = useState('Particular');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergiesStr, setAllergiesStr] = useState('');
  const [conditionsStr, setConditionsStr] = useState('');
  const [emerName, setEmerName] = useState('');
  const [emerPhone, setEmerPhone] = useState('');
  const [emerRelation, setEmerRelation] = useState('');
  const [notes, setNotes] = useState('');

  // Filtered list
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(p => 
      p.fullName.toLowerCase().includes(q) ||
      p.dni.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.insurance.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0] || null;
  }, [patients, selectedPatientId]);

  // Appointments for this patient
  const patientAppointments = useMemo(() => {
    if (!activePatient) return [];
    return appointments.filter(a => a.patientId === activePatient.id || a.patientDni === activePatient.dni);
  }, [appointments, activePatient]);

  // Intakes for this patient
  const patientIntakes = useMemo(() => {
    if (!activePatient) return [];
    return intakes.filter(i => i.patientId === activePatient.id || i.patientDni === activePatient.dni);
  }, [intakes, activePatient]);

  // Open modal for Create or Edit
  const openFormModal = (patientToEdit?: Patient) => {
    if (patientToEdit) {
      setEditingPatient(patientToEdit);
      setDni(patientToEdit.dni);
      setFullName(patientToEdit.fullName);
      setBirthDate(patientToEdit.birthDate);
      setGender(patientToEdit.gender);
      setPhone(patientToEdit.phone);
      setEmail(patientToEdit.email);
      setAddress(patientToEdit.address);
      setInsurance(patientToEdit.insurance);
      setBloodGroup(patientToEdit.bloodGroup || 'O+');
      setAllergiesStr(patientToEdit.allergies.join(', '));
      setConditionsStr(patientToEdit.chronicConditions.join(', '));
      setEmerName(patientToEdit.emergencyContact.name);
      setEmerPhone(patientToEdit.emergencyContact.phone);
      setEmerRelation(patientToEdit.emergencyContact.relation);
      setNotes(patientToEdit.notes || '');
    } else {
      setEditingPatient(null);
      setDni('');
      setFullName('');
      setBirthDate('1990-01-01');
      setGender('Femenino');
      setPhone('');
      setEmail('');
      setAddress('');
      setInsurance('Particular');
      setBloodGroup('O+');
      setAllergiesStr('');
      setConditionsStr('');
      setEmerName('');
      setEmerPhone('');
      setEmerRelation('');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dni.trim()) return;

    const patientData: Patient = {
      id: editingPatient ? editingPatient.id : `pat-${Date.now()}`,
      dni: dni.trim(),
      fullName: fullName.trim(),
      birthDate,
      gender,
      phone: phone.trim() || 'No informado',
      email: email.trim() || 'No informado',
      address: address.trim() || 'No registrada',
      insurance: insurance.trim() || 'Particular',
      bloodGroup,
      allergies: allergiesStr ? allergiesStr.split(',').map(s => s.trim()).filter(Boolean) : ['Ninguna'],
      chronicConditions: conditionsStr ? conditionsStr.split(',').map(s => s.trim()).filter(Boolean) : [],
      emergencyContact: {
        name: emerName.trim() || 'Familiar',
        phone: emerPhone.trim() || phone.trim(),
        relation: emerRelation.trim() || 'Contacto'
      },
      notes: notes.trim() || undefined,
      createdAt: editingPatient ? editingPatient.createdAt : new Date().toISOString()
    };

    if (editingPatient) {
      onUpdatePatient(patientData);
    } else {
      onAddPatient(patientData);
      setSelectedPatientId(patientData.id);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header - Vanguard Patient Directory */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Directorio de Pacientes
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-mono">
                Padrón Maestro
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Fichas clínicas ambulatorias, antecedentes, alertas de alergias e historial de atenciones en ATP Medical.
            </p>
          </div>
        </div>

        <button
          onClick={() => openFormModal()}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all self-start md:self-center cursor-pointer"
          style={{ backgroundColor: config.primaryColor || '#0B5ED7' }}
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Registrar Nuevo Paciente</span>
        </button>
      </div>

      {/* Main Split: Patient List + Patient Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 5 Cols: Directory Search & List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder="Buscar por nombre, RUT/DNI o seguro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>{filteredPatients.length} pacientes registrados</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredPatients.map(p => {
              const isSelected = activePatient?.id === p.id;
              const hasAllergies = p.allergies && p.allergies.length > 0 && p.allergies[0] !== 'Ninguna';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`p-3.5 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected ? 'bg-sky-50/70 border-l-4 border-sky-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{p.fullName}</span>
                      {hasAllergies && (
                        <span className="w-2 h-2 rounded-full bg-rose-500" title="Posee alergias registradas" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="font-mono tabular-nums">DNI: {p.dni}</span>
                      <span>·</span>
                      <span>{p.insurance}</span>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-sky-600' : 'text-slate-300'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Complete Patient Chart */}
        <div className="lg:col-span-7 space-y-6">
          {activePatient ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              
              {/* Patient Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activePatient.fullName}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                    <span className="font-mono font-medium text-slate-700">DNI: {activePatient.dni}</span>
                    <span>·</span>
                    <span>{activePatient.gender}</span>
                    <span>·</span>
                    <span>F. Nac: {activePatient.birthDate}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700">{activePatient.insurance}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openFormModal(activePatient)}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Editar ficha del paciente"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectPatientForIntake(activePatient)}
                    className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95"
                    style={{ backgroundColor: config.accentColor }}
                    title="Ingresar a triaje ahora"
                  >
                    Ingreso / Triaje
                  </button>
                  <button
                    onClick={() => onSelectPatientForAppointment(activePatient)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Agendar cita futura"
                  >
                    Agendar Cita
                  </button>
                </div>
              </div>

              {/* Medical Alerts (Allergies & Chronic) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Allergies Box */}
                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Alergias Conocidas</span>
                  </div>
                  <div className="text-xs text-rose-900 font-medium pt-1">
                    {activePatient.allergies && activePatient.allergies.length > 0 ? (
                      activePatient.allergies.join(', ')
                    ) : (
                      'Sin alergias medicamentosas declaradas.'
                    )}
                  </div>
                </div>

                {/* Chronic conditions & Blood Group */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
                    <span>Antecedentes & Sangre</span>
                    <span className="px-2 py-0.2 bg-white rounded border border-slate-300 font-mono text-[11px]">
                      Grupo: {activePatient.bloodGroup || 'Desconocido'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 pt-1">
                    {activePatient.chronicConditions && activePatient.chronicConditions.length > 0 ? (
                      activePatient.chronicConditions.join(', ')
                    ) : (
                      'Sin patologías crónicas previas registradas.'
                    )}
                  </div>
                </div>

              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Teléfono
                  </span>
                  <div className="font-semibold text-slate-800 font-mono">{activePatient.phone}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Correo
                  </span>
                  <div className="font-semibold text-slate-800 truncate">{activePatient.email}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Contacto Emergencia
                  </span>
                  <div className="font-semibold text-slate-800">
                    {activePatient.emergencyContact.name} ({activePatient.emergencyContact.relation})
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{activePatient.emergencyContact.phone}</div>
                </div>
              </div>

              {/* Patient History: Intakes & Appointments */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Historial de Consultas & Triajes
                </h3>

                {patientIntakes.length === 0 && patientAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No se han registrado visitas previas para este paciente.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {patientIntakes.map(item => (
                      <div key={item.id} className="p-3 border border-slate-200 rounded-lg text-xs bg-white space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-mono">
                            Ingreso {item.ticketNumber} · {new Date(item.admissionTime).toLocaleDateString()}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            Triaje Nivel {item.priorityLevel}
                          </span>
                        </div>
                        <p className="text-slate-600">{item.chiefComplaint}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 font-mono">
                          <span>PA: {item.vitals.systolic}/{item.vitals.diastolic}</span>
                          <span>·</span>
                          <span>FC: {item.vitals.heartRate} lpm</span>
                          <span>·</span>
                          <span>Temp: {item.vitals.temperature}°C</span>
                          <span>·</span>
                          <span>{item.doctorName} ({item.specialty})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Seleccione un paciente de la lista para ver su expediente.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: Crear o Editar Paciente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPatient ? 'Editar Expediente de Paciente' : 'Registrar Nuevo Paciente en ATP Medical'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cédula / DNI / RUT *</label>
                  <input
                    type="text"
                    required
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="12.345.678-9"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Roberto Díaz"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">F. Nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Sexo</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Grupo Sanguíneo</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 ..."
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@paciente.com"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Previsión / Seguro Médico</label>
                <input
                  type="text"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  placeholder="Particular, Fonasa, Isapre, Sanitas..."
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alergias Conocidas (separadas por coma)</label>
                <input
                  type="text"
                  value={allergiesStr}
                  onChange={(e) => setAllergiesStr(e.target.value)}
                  placeholder="Ej. Penicilina, Sulfas, Látex"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Patologías Crónicas / Antecedentes</label>
                <input
                  type="text"
                  value={conditionsStr}
                  onChange={(e) => setConditionsStr(e.target.value)}
                  placeholder="Ej. Hipertensión, Diabetes Tipo 2"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              {/* Emergency Contact */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 text-[11px]">Contacto de Emergencia</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={emerName}
                    onChange={(e) => setEmerName(e.target.value)}
                    placeholder="Nombre familiar"
                    className="px-2 py-1 border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    value={emerRelation}
                    onChange={(e) => setEmerRelation(e.target.value)}
                    placeholder="Parentesco"
                    className="px-2 py-1 border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    value={emerPhone}
                    onChange={(e) => setEmerPhone(e.target.value)}
                    placeholder="Teléfono"
                    className="px-2 py-1 border border-slate-200 rounded bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-white font-semibold shadow-xs hover:opacity-95"
                  style={{ backgroundColor: config.accentColor }}
                >
                  {editingPatient ? 'Actualizar Ficha' : 'Guardar Paciente'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
