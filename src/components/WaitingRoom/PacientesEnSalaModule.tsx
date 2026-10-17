import React, { useState, useEffect, useMemo } from 'react';
import { PatientIntake, ClinicConfig, Doctor, IntakeStatus, PaymentMethod } from '../../types';
import { 
  CreditCard, 
  Clock, 
  UserCheck, 
  Users, 
  Printer, 
  Search, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  X, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign,
  Smartphone,
  Banknote,
  Building,
  CheckCircle,
  FileText
} from 'lucide-react';
import { getTodayDateString } from '../../data/initialData';

interface PacientesEnSalaModuleProps {
  intakes: PatientIntake[];
  doctors: Doctor[];
  config: ClinicConfig;
  onUpdateIntakeStatus: (id: string, status: IntakeStatus, paymentMethod?: PaymentMethod) => void;
  onNavigateToNewTicket: () => void;
}

export const PacientesEnSalaModule: React.FC<PacientesEnSalaModuleProps> = ({
  intakes,
  doctors,
  config,
  onUpdateIntakeStatus,
  onNavigateToNewTicket
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Date filter: defaults to today
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [statusTab, setStatusTab] = useState<'all' | 'pendiente_pago' | 'en_espera' | 'en_atencion' | 'atendido'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment method selection modal state
  const [paymentModalTicket, setPaymentModalTicket] = useState<PatientIntake | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Pago móvil');

  // Reprint ticket modal
  const [reprintTicket, setReprintTicket] = useState<PatientIntake | null>(null);

  // Keep clock ticking every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter tickets by day
  const ticketsForSelectedDay = useMemo(() => {
    return intakes.filter(item => {
      const itemDate = item.admissionTime ? item.admissionTime.split('T')[0] : getTodayDateString();
      if (selectedDate && itemDate !== selectedDate) return false;
      return true;
    });
  }, [intakes, selectedDate]);

  // Filter tickets by active tab and search
  const filteredTickets = useMemo(() => {
    return ticketsForSelectedDay.filter(item => {
      // Tab filter
      if (statusTab === 'pendiente_pago' && item.status !== 'pendiente_pago') return false;
      if (statusTab === 'en_espera' && item.status !== 'en_espera') return false;
      if (statusTab === 'en_atencion' && item.status !== 'en_atencion' && item.status !== 'en_consulta') return false;
      if (statusTab === 'atendido' && item.status !== 'atendido') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTicket = item.ticketNumber.toLowerCase().includes(q);
        const mName = item.patientName.toLowerCase().includes(q);
        const mDni = item.patientDni.toLowerCase().includes(q);
        const mSpec = item.specialty.toLowerCase().includes(q);
        if (!mTicket && !mName && !mDni && !mSpec) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.admissionTime).getTime() - new Date(a.admissionTime).getTime());
  }, [ticketsForSelectedDay, statusTab, searchQuery]);

  // Statistics for the selected day in exact order
  const dayStats = useMemo(() => {
    const total = ticketsForSelectedDay.length;
    const pendingPayment = ticketsForSelectedDay.filter(i => i.status === 'pendiente_pago').length;
    const waitingCare = ticketsForSelectedDay.filter(i => i.status === 'en_espera').length;
    const inCare = ticketsForSelectedDay.filter(i => i.status === 'en_atencion' || i.status === 'en_consulta').length;
    const attended = ticketsForSelectedDay.filter(i => i.status === 'atendido').length;
    return { total, pendingPayment, waitingCare, inCare, attended };
  }, [ticketsForSelectedDay]);

  // Handle switching to 'En Espera de atención': must select payment method first
  const handleInitiateWaitingStatus = (ticket: PatientIntake) => {
    setPaymentModalTicket(ticket);
    setSelectedPaymentMethod('Pago móvil');
  };

  // Confirm payment method and move to 'en_espera'
  const handleConfirmPaymentAndMoveToWaiting = () => {
    if (!paymentModalTicket) return;
    onUpdateIntakeStatus(paymentModalTicket.id, 'en_espera', selectedPaymentMethod);
    setPaymentModalTicket(null);
  };

  const getStatusBadge = (status: IntakeStatus) => {
    switch (status) {
      case 'pendiente_pago':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <CreditCard className="w-3.5 h-3.5 text-amber-700" />
            <span>1. Pendiente por pago</span>
          </span>
        );
      case 'en_espera':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300">
            <Clock className="w-3.5 h-3.5 text-sky-700" />
            <span>2. En espera de atención</span>
          </span>
        );
      case 'en_atencion':
      case 'en_consulta':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <UserCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>3. Paciente en atención</span>
          </span>
        );
      case 'atendido':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Paciente atendido</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header - Centered & Premium Aesthetic */}
      <div className="relative p-6 sm:p-7 rounded-2xl border bg-white border-slate-200/80 shadow-xs overflow-hidden">
        {/* Subtle decorative background gradient mesh */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 0%, ${config.accentColor} 0%, transparent 70%)`
          }}
        />

        {/* Top utilities row: Clock and Action Button */}
        <div className="flex items-center justify-between gap-3 relative z-10 mb-2">
          {/* Clock badge */}
          <div className="px-3 py-1.5 rounded-lg border font-mono font-bold text-xs tabular-nums flex items-center gap-2 bg-slate-50 border-slate-200 text-slate-800 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>{currentTime.toLocaleTimeString('es-ES')}</span>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onNavigateToNewTicket}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-all"
            style={{ backgroundColor: config.accentColor }}
          >
            <span>+ Crear Ticket</span>
          </button>
        </div>

        {/* Centered Title Lockup */}
        <div className="text-center space-y-2 relative z-10 py-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold tracking-widest text-slate-600 uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.accentColor }} />
            <span>ATP MEDICAL VENEZUELA</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.secondaryColor }} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans">
            Pacientes en Sala
          </h1>

          {/* Elegant decorative color bar */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <div className="h-0.5 w-6 rounded-full" style={{ backgroundColor: config.primaryColor }} />
            <div className="h-1 w-10 rounded-full" style={{ backgroundColor: config.accentColor }} />
            <div className="h-0.5 w-6 rounded-full" style={{ backgroundColor: config.primaryColor }} />
          </div>
        </div>
      </div>

      {/* DASHBOARD DE PACIENTES EN SALA CON LAS OPCIONES EN ORDEN */}
      <div className="p-5 rounded-2xl border bg-white border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Dashboard de Control de Sala</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Haga clic sobre cualquiera de las opciones para filtrar los tickets del día.
            </p>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-600 font-semibold">Día:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg font-mono font-bold bg-slate-50 text-slate-900"
            />
            {selectedDate !== getTodayDateString() && (
              <button
                onClick={() => setSelectedDate(getTodayDateString())}
                className="px-2 py-1 text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 font-semibold"
              >
                Volver a Hoy
              </button>
            )}
          </div>
        </div>

        {/* The 3 Core Options in Exact Order + Total */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Option 1: Pendiente por pago (DEFAULT) */}
          <div
            onClick={() => setStatusTab(statusTab === 'pendiente_pago' ? 'all' : 'pendiente_pago')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              statusTab === 'pendiente_pago'
                ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-400/30 shadow-sm'
                : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">1. Pendiente por Pago</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                  Default
                </span>
              </div>
              <div className="text-3xl font-black text-amber-600 mt-2 font-mono tabular-nums">
                {dayStats.pendingPayment}
              </div>
              <p className="text-[11px] text-amber-800/80 mt-1 leading-snug">
                Tickets emitidos en espera de cobro en caja o recepción.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-amber-900">
                {dayStats.total > 0 ? Math.round((dayStats.pendingPayment / dayStats.total) * 100) : 0}% del día
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                statusTab === 'pendiente_pago' ? 'bg-amber-600 text-white' : 'text-amber-700 underline'
              }`}>
                {statusTab === 'pendiente_pago' ? 'Filtro Activo' : 'Ver tickets'}
              </span>
            </div>
          </div>

          {/* Option 2: En Espera de atención */}
          <div
            onClick={() => setStatusTab(statusTab === 'en_espera' ? 'all' : 'en_espera')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              statusTab === 'en_espera'
                ? 'border-sky-400 bg-sky-50/70 ring-2 ring-sky-400/30 shadow-sm'
                : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900">2. En Espera de Atención</span>
                <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-sky-600 mt-2 font-mono tabular-nums">
                {dayStats.waitingCare}
              </div>
              <p className="text-[11px] text-sky-800/80 mt-1 leading-snug">
                Pago verificado. Pacientes en sala listos para su consulta.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-sky-200/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-sky-900">
                {dayStats.total > 0 ? Math.round((dayStats.waitingCare / dayStats.total) * 100) : 0}% del día
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                statusTab === 'en_espera' ? 'bg-sky-600 text-white' : 'text-sky-700 underline'
              }`}>
                {statusTab === 'en_espera' ? 'Filtro Activo' : 'Ver tickets'}
              </span>
            </div>
          </div>

          {/* Option 3: Paciente en atención */}
          <div
            onClick={() => setStatusTab(statusTab === 'en_atencion' ? 'all' : 'en_atencion')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              statusTab === 'en_atencion'
                ? 'border-purple-400 bg-purple-50/70 ring-2 ring-purple-400/30 shadow-sm'
                : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900">3. Paciente en Atención</span>
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-purple-600 mt-2 font-mono tabular-nums">
                {dayStats.inCare}
              </div>
              <p className="text-[11px] text-purple-800/80 mt-1 leading-snug">
                Actualmente dentro del consultorio médico asignado.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-purple-200/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-purple-900">
                {dayStats.total > 0 ? Math.round((dayStats.inCare / dayStats.total) * 100) : 0}% del día
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                statusTab === 'en_atencion' ? 'bg-purple-600 text-white' : 'text-purple-700 underline'
              }`}>
                {statusTab === 'en_atencion' ? 'Filtro Activo' : 'Ver tickets'}
              </span>
            </div>
          </div>

          {/* Option 4: Total & Atendidos */}
          <div
            onClick={() => setStatusTab('all')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              statusTab === 'all'
                ? 'border-slate-400 bg-slate-50 ring-2 ring-slate-400/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Total Tickets del Día</span>
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2 font-mono tabular-nums">
                {dayStats.total}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {dayStats.attended} atendidos / consultas completadas.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Todos los tickets</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                statusTab === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 underline'
              }`}>
                {statusTab === 'all' ? 'Mostrando Todos' : 'Ver todos'}
              </span>
            </div>
          </div>

        </div>

        {/* Visual Distribution Flow Bar */}
        {dayStats.total > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
              <span>Distribución del flujo:</span>
              <span className="font-mono text-slate-700">
                {dayStats.pendingPayment} pago · {dayStats.waitingCare} en espera · {dayStats.inCare} en atención · {dayStats.attended} atendidos
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
              <div 
                className="bg-amber-400 transition-all cursor-pointer"
                style={{ width: `${(dayStats.pendingPayment / dayStats.total) * 100}%` }}
                title={`1. Pendiente por pago: ${dayStats.pendingPayment}`}
                onClick={() => setStatusTab('pendiente_pago')}
              />
              <div 
                className="bg-sky-500 transition-all cursor-pointer"
                style={{ width: `${(dayStats.waitingCare / dayStats.total) * 100}%` }}
                title={`2. En espera de atención: ${dayStats.waitingCare}`}
                onClick={() => setStatusTab('en_espera')}
              />
              <div 
                className="bg-purple-500 transition-all cursor-pointer"
                style={{ width: `${(dayStats.inCare / dayStats.total) * 100}%` }}
                title={`3. Paciente en atención: ${dayStats.inCare}`}
                onClick={() => setStatusTab('en_atencion')}
              />
              <div 
                className="bg-emerald-500 transition-all cursor-pointer"
                style={{ width: `${(dayStats.attended / dayStats.total) * 100}%` }}
                title={`Atendidos: ${dayStats.attended}`}
                onClick={() => setStatusTab('atendido')}
              />
            </div>
          </div>
        )}

      </div>

      {/* LISTADO DE TICKETS DEL DÍA */}
      <div className="rounded-xl border bg-white border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Filter Tabs and Search Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Quick status tabs in strict order */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
            <button
              onClick={() => setStatusTab('all')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                statusTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({dayStats.total})
            </button>
            <button
              onClick={() => setStatusTab('pendiente_pago')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                statusTab === 'pendiente_pago' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-800 hover:bg-amber-100/60'
              }`}
            >
              <CreditCard className="w-3 h-3" />
              <span>1. Pendiente por pago ({dayStats.pendingPayment})</span>
            </button>
            <button
              onClick={() => setStatusTab('en_espera')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                statusTab === 'en_espera' ? 'bg-sky-600 text-white shadow-xs' : 'text-sky-800 hover:bg-sky-100/60'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>2. En espera de atención ({dayStats.waitingCare})</span>
            </button>
            <button
              onClick={() => setStatusTab('en_atencion')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                statusTab === 'en_atencion' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-800 hover:bg-purple-100/60'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>3. Paciente en atención ({dayStats.inCare})</span>
            </button>
            <button
              onClick={() => setStatusTab('atendido')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                statusTab === 'atendido' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:bg-emerald-100/60'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              <span>Atendido ({dayStats.attended})</span>
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Buscar por ticket, cédula, nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50 text-slate-900"
            />
          </div>

        </div>

        {/* Tickets Cards */}
        {filteredTickets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se encontraron tickets para el día <strong>{selectedDate}</strong> con el filtro seleccionado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map(item => {
              const minutesWaiting = Math.floor((Date.now() - new Date(item.admissionTime).getTime()) / 60000);

              return (
                <div 
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  
                  {/* Left Column: Ticket Badge & Patient Information */}
                  <div className="flex items-start gap-4">
                    {/* Ticket Box */}
                    <div className="text-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 shrink-0 w-20">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Ticket</span>
                      <div className="text-xl font-black font-mono text-slate-900 tracking-wider mt-1">
                        {item.ticketNumber}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-1">
                        {new Date(item.admissionTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {item.patientName}
                        </span>
                        <span className="text-xs text-slate-500 font-mono font-bold">
                          Cédula: {item.patientDni}
                        </span>
                        <span className="text-xs text-slate-500">
                          · {item.patientAge} años
                        </span>
                        {/* Current Status Badge */}
                        <div className="ml-1">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>

                      {/* Medical Specialty and Room */}
                      <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {item.specialty}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-slate-800">{item.room}</span>
                        <span>·</span>
                        <span className="text-slate-500">{item.doctorName}</span>
                      </div>

                      {/* Contact Details & Wait Time */}
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-0.5 flex-wrap">
                        {item.patientPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <strong className="text-slate-600 font-mono">{item.patientPhone}</strong>
                          </span>
                        )}
                        {item.patientEmail && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-600">{item.patientEmail}</span>
                          </span>
                        )}
                        {item.patientAddress && (
                          <span className="flex items-center gap-1 truncate max-w-[220px]">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-600">{item.patientAddress}</span>
                          </span>
                        )}
                        <span>
                          Tiempo transcurrido: <strong className="text-slate-700 font-mono font-bold">{minutesWaiting} min</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Ordered State Selection Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0 self-end lg:self-center">
                    
                    {/* The 3 Ordered Option Selectors */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
                      
                      {/* Option 1: Pendiente por pago (Default) */}
                      <button
                        onClick={() => onUpdateIntakeStatus(item.id, 'pendiente_pago')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          item.status === 'pendiente_pago'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-amber-800 hover:bg-amber-100 bg-white'
                        }`}
                        title="Marcar como pendiente por pago en caja"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>1. Pendiente Pago</span>
                      </button>

                      {/* Option 2: En Espera de atención (Opens payment method selector!) */}
                      <button
                        onClick={() => handleInitiateWaitingStatus(item)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          item.status === 'en_espera'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-sky-800 hover:bg-sky-100 bg-white'
                        }`}
                        title="Seleccionar tipo de pago y pasar a En Espera de atención"
                      >
                        <Clock className="w-3 h-3" />
                        <span>2. En Espera</span>
                      </button>

                      {/* Option 3: Paciente en atención */}
                      <button
                        onClick={() => onUpdateIntakeStatus(item.id, 'en_atencion')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          item.status === 'en_atencion' || item.status === 'en_consulta'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-purple-800 hover:bg-purple-100 bg-white'
                        }`}
                        title="Marcar paciente en atención médica dentro del box"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>3. En Atención</span>
                      </button>

                      {/* Completion: Atendido */}
                      <button
                        onClick={() => onUpdateIntakeStatus(item.id, 'atendido')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          item.status === 'atendido'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-emerald-800 hover:bg-emerald-100 bg-white'
                        }`}
                        title="Marcar paciente atendido / consulta finalizada"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Atendido</span>
                      </button>
                    </div>

                    {/* Print ticket button */}
                    <button
                      onClick={() => setReprintTicket(item)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      title="Ver o Reimprimir Ticket"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Registro de Tipo de Pago al pasar a 'En Espera de atención' */}
      {paymentModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full overflow-hidden">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">2. En Espera de Atención</h3>
                <p className="text-[11px] text-slate-400">
                  Ticket {paymentModalTicket.ticketNumber} · {paymentModalTicket.patientName}
                </p>
              </div>
              <button 
                onClick={() => setPaymentModalTicket(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Seleccione el Tipo de Pago Recibido por el Paciente:
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Esta información quedará guardada en la base de datos para el control interno de la clínica.
                </p>
              </div>

              {/* The 4 requested payment options */}
              <div className="grid grid-cols-2 gap-2.5">
                
                {/* Pago móvil */}
                <div
                  onClick={() => setSelectedPaymentMethod('Pago móvil')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPaymentMethod === 'Pago móvil'
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Smartphone className="w-4 h-4 text-sky-600" />
                    {selectedPaymentMethod === 'Pago móvil' && (
                      <Check className="w-4 h-4 text-sky-600 font-bold" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900">Pago móvil</span>
                </div>

                {/* Punto de venta */}
                <div
                  onClick={() => setSelectedPaymentMethod('Punto de venta')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPaymentMethod === 'Punto de venta'
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    {selectedPaymentMethod === 'Punto de venta' && (
                      <Check className="w-4 h-4 text-sky-600 font-bold" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900">Punto de venta</span>
                </div>

                {/* Efectivo */}
                <div
                  onClick={() => setSelectedPaymentMethod('Efectivo')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPaymentMethod === 'Efectivo'
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    {selectedPaymentMethod === 'Efectivo' && (
                      <Check className="w-4 h-4 text-sky-600 font-bold" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900">Efectivo</span>
                </div>

                {/* Transferencia */}
                <div
                  onClick={() => setSelectedPaymentMethod('Transferencia')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPaymentMethod === 'Transferencia'
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Building className="w-4 h-4 text-purple-600" />
                    {selectedPaymentMethod === 'Transferencia' && (
                      <Check className="w-4 h-4 text-sky-600 font-bold" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900">Transferencia</span>
                </div>

              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                Al confirmar, el estado cambiará a <strong>"En espera de atención"</strong> y la opción de pago quedará almacenada internamente sin volver a mostrarse en la tarjeta pública.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaymentModalTicket(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPaymentAndMoveToWaiting}
                  className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Guardar Pago y Pasar a Espera
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL: Comprobante Imprimible de Ticket */}
      {reprintTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-sm w-full overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="text-xs font-bold uppercase tracking-wider">Ticket de Atención</span>
              <button onClick={() => setReprintTicket(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono printable-area">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h2 className="text-base font-black tracking-tight text-slate-900 font-sans">{config.clinicName}</h2>
                <p className="text-[11px] text-slate-500 font-sans">{config.address}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{config.phone}</p>
                <div className="mt-3 text-3xl font-black tracking-widest text-slate-900 bg-slate-100 py-2 rounded-lg border border-slate-200">
                  {reprintTicket.ticketNumber}
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  {new Date(reprintTicket.admissionTime).toLocaleString('es-ES')}
                </p>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">ESTADO:</span>
                  <span className="font-bold text-slate-900 uppercase">{reprintTicket.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PACIENTE:</span>
                  <span className="font-bold text-slate-900 text-right">{reprintTicket.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CÉDULA:</span>
                  <span className="font-bold">{reprintTicket.patientDni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">EDAD:</span>
                  <span>{reprintTicket.patientAge} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TELÉFONO:</span>
                  <span>{reprintTicket.patientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CORREO:</span>
                  <span className="truncate max-w-[170px]">{reprintTicket.patientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DIRECCIÓN:</span>
                  <span className="truncate max-w-[170px]">{reprintTicket.patientAddress}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">ESPECIALIDAD:</span>
                  <span className="font-bold text-sky-700">{reprintTicket.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CONSULTORIO:</span>
                  <span className="font-bold">{reprintTicket.room}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 no-print">
              <button
                onClick={() => setReprintTicket(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-xs"
                style={{ backgroundColor: config.primaryColor }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
