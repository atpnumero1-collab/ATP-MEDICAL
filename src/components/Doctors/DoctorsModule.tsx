import React, { useState } from 'react';
import { Doctor, DoctorStatus, ClinicConfig, Appointment, PatientIntake } from '../../types';
import { 
  Stethoscope, 
  UserPlus, 
  Phone, 
  Mail, 
  Clock, 
  DoorClosed, 
  CheckCircle, 
  Coffee, 
  PowerOff, 
  X,
  Search
} from 'lucide-react';

interface DoctorsModuleProps {
  doctors: Doctor[];
  appointments: Appointment[];
  intakes: PatientIntake[];
  config: ClinicConfig;
  onUpdateDoctorStatus: (doctorId: string, status: DoctorStatus) => void;
  onAddDoctor: (doctor: Doctor) => void;
}

export const DoctorsModule: React.FC<DoctorsModuleProps> = ({
  doctors,
  appointments,
  intakes,
  config,
  onUpdateDoctorStatus,
  onAddDoctor
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Doctor form
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('MEDICINA GENERAL');
  const [room, setRoom] = useState('Consultorio 1');
  const [scheduleDays, setScheduleDays] = useState('LUNES');
  const [scheduleHours, setScheduleHours] = useState('8:00 AM A 12:00 PM');
  const [phone, setPhone] = useState('+58 414-3651970');
  const [email, setEmail] = useState('');
  const [shiftStart, setShiftStart] = useState('08:00');
  const [shiftEnd, setShiftEnd] = useState('12:00');

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    d.room.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      name: name.trim().startsWith('Dr') || name.trim().startsWith('Lic') ? name.trim() : `Dr. ${name.trim()}`,
      specialty: specialty.trim().toUpperCase(),
      scheduleDays: scheduleDays.trim().toUpperCase(),
      scheduleHours: scheduleHours.trim(),
      room: room.trim(),
      phone: phone.trim() || '+58 414-3651970',
      email: email.trim() || `${name.toLowerCase().replace(/[^a-z]/g, '.')}@atpmedical.com`,
      status: 'disponible',
      shiftStart,
      shiftEnd
    };

    onAddDoctor(newDoc);
    setIsModalOpen(false);
    setName('');
    setPhone('+58 414-3651970');
    setEmail('');
  };

  const statusConfig: Record<DoctorStatus, { label: string; bg: string; text: string; icon: any }> = {
    disponible: { label: 'Disponible', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
    en_consulta: { label: 'En Consulta', bg: 'bg-sky-50 text-sky-800 border-sky-200', text: 'text-sky-700', icon: Stethoscope },
    en_pausa: { label: 'En Pausa / Colación', bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-700', icon: Coffee },
    fuera_turno: { label: 'Fuera de Turno', bg: 'bg-slate-100 text-slate-600 border-slate-200', text: 'text-slate-500', icon: PowerOff }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Cuerpo Médico & Consultorios</span>
            <span 
              className="text-xs font-semibold px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              ATP MEDICAL
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Especialistas clínicos, asignación de boxes de atención y control de disponibilidad en vivo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95"
            style={{ backgroundColor: config.accentColor }}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Agregar Especialista</span>
          </button>
        </div>
      </div>

      {/* Filter and Doctors Grid */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por médico, especialidad o consultorio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <span className="text-xs text-slate-500">{filteredDoctors.length} facultativos registrados</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map(doc => {
          const status = statusConfig[doc.status];
          const StatusIcon = status.icon;

          // Today's appointments count
          const todayAptsCount = appointments.filter(a => a.doctorId === doc.id).length;
          // Patients currently waiting for this doctor
          const waitingCount = intakes.filter(i => i.doctorId === doc.id && (i.status === 'en_espera' || i.status === 'llamado')).length;

          return (
            <div 
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs font-semibold text-sky-700 mt-0.5">{doc.specialty}</p>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg border bg-slate-100 text-slate-800 font-mono">
                    {doc.room}
                  </span>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span><strong className="text-slate-800">{doc.scheduleDays}</strong>: {doc.scheduleHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{doc.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                </div>

                {/* Counters */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Citas Hoy</span>
                    <span className="text-sm font-bold text-slate-800 font-mono tabular-nums">{todayAptsCount}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">En Espera Box</span>
                    <span className="text-sm font-bold text-amber-600 font-mono tabular-nums">{waitingCount}</span>
                  </div>
                </div>
              </div>

              {/* Status Selector Bar */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-[11px] text-slate-400 font-medium mb-1.5">
                  Estado de Disponibilidad:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onUpdateDoctorStatus(doc.id, 'disponible')}
                    className={`py-1 px-2 text-[11px] font-semibold rounded border transition-colors ${
                      doc.status === 'disponible' 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Disponible
                  </button>
                  <button
                    onClick={() => onUpdateDoctorStatus(doc.id, 'en_consulta')}
                    className={`py-1 px-2 text-[11px] font-semibold rounded border transition-colors ${
                      doc.status === 'en_consulta' 
                        ? 'bg-sky-600 text-white border-sky-600' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    En Consulta
                  </button>
                  <button
                    onClick={() => onUpdateDoctorStatus(doc.id, 'en_pausa')}
                    className={`py-1 px-2 text-[11px] font-semibold rounded border transition-colors ${
                      doc.status === 'en_pausa' 
                        ? 'bg-amber-500 text-white border-amber-500' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    En Pausa
                  </button>
                  <button
                    onClick={() => onUpdateDoctorStatus(doc.id, 'fuera_turno')}
                    className={`py-1 px-2 text-[11px] font-semibold rounded border transition-colors ${
                      doc.status === 'fuera_turno' 
                        ? 'bg-slate-700 text-white border-slate-700' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Fuera Turno
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL: Agregar Médico */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Agregar Profesional Médico</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre y Apellidos *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Dr. Rodrigo Palma"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Especialidad *</label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ej. GASTROENTEROLOGIA"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Consultorio / Box</label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Ej. Consultorio 1"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Días de Atención *</label>
                  <input
                    type="text"
                    required
                    value={scheduleDays}
                    onChange={(e) => setScheduleDays(e.target.value)}
                    placeholder="Ej. LUNES o DE LUNES A VIERNES"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 uppercase font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Horarios de Atención *</label>
                  <input
                    type="text"
                    required
                    value={scheduleHours}
                    onChange={(e) => setScheduleHours(e.target.value)}
                    placeholder="Ej. 8:00 AM A 12:00 PM"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Inicio de Turno</label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fin de Turno</label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                  <label className="block text-slate-700 font-semibold mb-1">Email Institucional</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="medico@atpmedical.com"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-white font-semibold shadow-xs"
                  style={{ backgroundColor: config.accentColor }}
                >
                  Guardar Especialista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
