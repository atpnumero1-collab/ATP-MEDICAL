import React, { useState, useEffect, useRef } from 'react';
import { 
  ClinicConfig, 
  Doctor, 
  Appointment, 
  PatientIntake, 
  Patient, 
  MedicalRecord 
} from '../../types';
import { ActiveModule } from '../Navigation';
import { 
  Instagram, 
  Phone, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  HeartPulse,
  Tv, 
  Calendar, 
  FileText, 
  Users, 
  Stethoscope, 
  BarChart3, 
  Share2, 
  ExternalLink, 
  ArrowRight, 
  Sparkles,
  Heart,
  MessageCircle,
  Bookmark,
  CalendarCheck2,
  Activity,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';

// Official ATP Medical generated Instagram reel assets
import teamImg from '../../assets/images/atp_specialist_team_1792340127476.jpg';
import consultImg from '../../assets/images/atp_medical_consultation_1792340095088.jpg';
import wellnessImg from '../../assets/images/atp_therapy_wellness_1792340111007.jpg';
import diagImg from '../../assets/images/atp_medical_diagnostics_1792340140952.jpg';
import receptionImg from '../../assets/images/clinic_reception_interior_1792268353740.jpg';

interface HomeWelcomeModuleProps {
  config: ClinicConfig;
  doctors: Doctor[];
  appointments: Appointment[];
  intakes: PatientIntake[];
  patients: Patient[];
  medicalRecords: MedicalRecord[];
  onNavigateTo: (module: ActiveModule) => void;
  onQuickIntake: () => void;
  onQuickAppointment: () => void;
  onSharePortalLink: () => void;
}

export const HomeWelcomeModule: React.FC<HomeWelcomeModuleProps> = ({
  config,
  doctors,
  appointments,
  intakes,
  patients,
  medicalRecords,
  onNavigateTo,
  onQuickIntake,
  onQuickAppointment,
  onSharePortalLink
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const instagramUrl = 'https://www.instagram.com/atpmedical_ve?cplk=YmI1YWRwcjVnZmlr';

  // Instagram reel slides showcasing ATP Medical
  const slides = [
    {
      id: 1,
      image: teamImg,
      tag: 'Equipo Especialistas',
      title: 'Nuestro Directorio Médico en Parque Humboldt',
      caption: 'Comprometidos con tu salud: Medicina Interna, Cardiología, Pediatría, Ginecología, Cirugía, Nutrición y Traumatología. ¡Cuidamos cada detalle de tu bienestar!',
      hashtags: '#ATPMedical #SaludCaracas #Especialistas #ParqueHumboldt #MedicinaVenezuela',
      likes: '482',
      comments: '34'
    },
    {
      id: 2,
      image: consultImg,
      tag: 'Consultas Médicas',
      title: 'Atención Médica Cercana, Empática y Precisa',
      caption: 'Diagnósticos certeros y seguimiento clínico integral con vista panorámica a Caracas. Agenda tu consulta presencial o mediante nuestro portal de autogestión.',
      hashtags: '#ConsultaMedica #MedicinaPreventiva #Chequeo #SaludFamiliar #Caracas',
      likes: '391',
      comments: '21'
    },
    {
      id: 3,
      image: wellnessImg,
      tag: 'Terapia Celular ATP',
      title: 'Revitalización Celular & Terapias de Bienestar',
      caption: 'La energía que impulsa tu bienestar. Espacios diseñados para tu máxima serenidad, sueroterapia avanzada y revitalización celular con el majestuoso Ávila de fondo.',
      hashtags: '#BienestarIntegral #TerapiaCelular #ATP #Vitalidad #SaludYVida',
      likes: '627',
      comments: '58'
    },
    {
      id: 4,
      image: diagImg,
      tag: 'Unidad de Diagnóstico',
      title: 'Cardiología & Evaluaciones Preventivas',
      caption: 'Equipamiento de última generación para chequeos cardiovasculares, ecosonogramas y estudios clínicos preventivos. Tu corazón en las mejores manos.',
      hashtags: '#Cardiologia #EcoDoppler #ChequeoPreventivo #SaludCardiovascular',
      likes: '354',
      comments: '19'
    },
    {
      id: 5,
      image: receptionImg,
      tag: 'Instalaciones Oficiales',
      title: 'Visítanos en Centro Comercial Parque Humboldt',
      caption: 'Piso 1, Oficina 5. Recepción cómoda, atención rápida y ambiente acogedor diseñado para que tu experiencia médica sea de primer nivel.',
      hashtags: '#ClinicaCaracas #ParqueHumboldt #AtencionInmediata #ATP',
      likes: '512',
      comments: '42'
    }
  ];

  // Auto-advance carousel every 5.5 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const toggleLike = (index: number) => {
    setLikedPosts(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Quick metrics calculations
  const pendingIntakes = intakes.filter(i => i.status === 'en_espera' || i.status === 'llamado' || i.status === 'pendiente_pago');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. HERO HEADER: Distinctive Welcome Banner with Brand & Instagram Anchor */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white shadow-xl">
        {/* Subtle decorative glow circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-5 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sede Oficial Caracas · C.C. Parque Humboldt</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Bienvenido al Sistema Integral de <span className="text-cyan-200">ATP MEDICAL</span>
            </h1>

            <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
              «{config.slogan || 'La energía que impulsa tu bienestar'}». Gestión médica ágil de consultas, admisión en sala de espera, historias clínicas e informes médicos en tiempo real.
            </p>

            {/* Quick contact and Instagram pill */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold shadow-md hover:opacity-95 transition-transform active:scale-95"
              >
                <Instagram className="w-4 h-4" />
                <span>@atpmedical_ve en Instagram</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              <a
                href={`https://wa.me/584143651970?text=${encodeURIComponent('Hola ATP Medical, le contacto desde la clínica.')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-white font-bold backdrop-blur-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{config.phone}</span>
              </a>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-blue-200 text-xs py-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                <span>Piso 1, Ofic. 5</span>
              </span>
            </div>
          </div>

          {/* Quick Start Buttons for Front Desk & Staff */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={onQuickAppointment}
              className="px-5 py-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Agendar Nueva Cita</span>
            </button>

            <button
              onClick={onSharePortalLink}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Link Autogestión WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. INSTAGRAM REEL / CARROUSEL: Official Visuals of ATP Medical */}
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-md overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Instagram Header Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 shadow-sm shrink-0">
              <img 
                src="/src/assets/images/atp_medical_badge_1792268353732.jpg" 
                alt="ATP Medical"
                className="w-full h-full object-cover rounded-full bg-white border border-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight">
                  atpmedical_ve
                </span>
                <span className="w-3.5 h-3.5 bg-sky-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold" title="Cuenta Oficial">
                  ✓
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">·</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">Instagram Oficial</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                C.C. Parque Humboldt, Caracas · Medicina & Revitalización
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs hover:opacity-95 transition-all"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Seguir en Instagram</span>
              <span className="sm:hidden">Seguir</span>
            </a>

            {/* Slider Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-lg border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
                title="Imagen anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-lg border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
                title="Siguiente imagen"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slide Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Main Visual Image (7 cols desktop) */}
          <div className="lg:col-span-7 relative bg-slate-950 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto flex items-center justify-center overflow-hidden group">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Visual subtle gradient on bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />

                <div className="absolute bottom-3 left-3 right-3 lg:hidden text-white z-20">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/90 px-2 py-0.5 rounded text-white">
                    {s.tag}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 drop-shadow-md">
                    {s.title}
                  </h3>
                </div>
              </div>
            ))}

            {/* Quick Carousel Floating Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Post Information & Caption (5 cols desktop) */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between bg-white space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  {slides[currentSlide].tag}
                </span>

                <span className="text-xs font-bold text-slate-400">
                  {currentSlide + 1} de {slides.length}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {slides[currentSlide].title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {slides[currentSlide].caption}
              </p>

              <p className="text-xs font-bold text-blue-600 leading-relaxed select-all">
                {slides[currentSlide].hashtags}
              </p>
            </div>

            {/* Social Engagement Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLike(currentSlide)}
                    className="flex items-center gap-1.5 text-xs font-bold hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-transform active:scale-125 ${
                        likedPosts[currentSlide] ? 'text-rose-600 fill-rose-600' : 'text-slate-700'
                      }`} 
                    />
                    <span>{likedPosts[currentSlide] ? parseInt(slides[currentSlide].likes) + 1 : slides[currentSlide].likes}</span>
                  </button>

                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{slides[currentSlide].comments}</span>
                  </a>
                </div>

                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 hover:underline"
                >
                  <span>Ver en Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === currentSlide 
                        ? 'w-6 bg-blue-600' 
                        : 'w-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                    title={`Ver imagen ${i + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. QUICK STATS SUMMARY: Clinic Activity Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Especialistas</span>
            <Stethoscope className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {doctors.length}
          </p>
          <p className="text-[11px] text-slate-500">
            Directorio oficial ATP
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sala de Espera</span>
            <HeartPulse className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {pendingIntakes.length}
          </p>
          <p className="text-[11px] text-slate-500">
            Pacientes por atender hoy
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Citas Médicas</span>
            <Calendar className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {appointments.length}
          </p>
          <p className="text-[11px] text-slate-500">
            {todayAppointments.length} programadas hoy
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-violet-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Historias Médicas</span>
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {medicalRecords.length}
          </p>
          <p className="text-[11px] text-slate-500">
            Expedientes registrados
          </p>
        </div>
      </div>

      {/* 4. MODULES LAUNCHPAD: Responsive Interactive Grid to Access All Features */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Módulos y Herramientas del Sistema
            </h2>
            <p className="text-xs text-slate-500">
              Seleccione cualquier módulo para ingresar directamente a sus funciones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Creación de tickets */}
          <div 
            onClick={() => onNavigateTo('tickets')}
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer space-y-2.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                Creación de Tickets
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Admisión inmediata, registro de triaje de signos vitales y asignación de turno por orden de llegada.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-sky-600 pt-1">
              <span>Ingresar a Tickets</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Pacientes en Sala */}
          <div 
            onClick={() => onNavigateTo('waitingRoom')}
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer space-y-2.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                  Pacientes en Sala
                </h3>
                {pendingIntakes.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                    {pendingIntakes.length} en espera
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Turnero en vivo, llamado a consulta, cobranza de pagos y confirmación de atención en consultorio.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-600 pt-1">
              <span>Ver Monitor de Sala</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Citas y Agenda */}
          <div 
            onClick={() => onNavigateTo('appointments')}
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-2.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                Citas y Agenda
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Programación de citas, cupos por especialista, recordatorios para WhatsApp y confirmación.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-600 pt-1">
              <span>Gestionar Agenda</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Historias Médicas */}
          <div 
            onClick={() => onNavigateTo('medicalRecords')}
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-violet-300 transition-all cursor-pointer space-y-2.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-600 transition-colors">
                Historias Médicas
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Expedientes clínicos, diagnósticos CIE-10, récipe y generación de informe médico con logo oficial.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-violet-600 pt-1">
              <span>Abrir Expedientes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Directorio Pacientes */}
          <div 
            onClick={() => onNavigateTo('patients')}
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer space-y-2.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-cyan-600 transition-colors">
                Directorio Pacientes
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Padrón general, búsqueda rápida por cédula (V/E), antecedentes y teléfono de contacto.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-cyan-600 pt-1">
              <span>Ver Pacientes ({patients.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Médicos & Box */}
          <div 
            onClick={() => onNavigateTo('doctors')}
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer space-y-2.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                Médicos & Box
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Directorio de 11 especialistas oficiales, asignación de consultorio y disponibilidad en tiempo real.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 pt-1">
              <span>Directorio ({doctors.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 7: Métricas & Reportes */}
          <div 
            onClick={() => onNavigateTo('reports')}
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-pink-300 transition-all cursor-pointer space-y-2.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-pink-600 transition-colors">
                Métricas & Reportes
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tiempos promedio de atención, distribución por especialidad y volumen de pacientes atendidos.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-pink-600 pt-1">
              <span>Ver Estadísticas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 8: Enlace WhatsApp Pacientes */}
          <div 
            onClick={onSharePortalLink}
            className="group bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-300/80 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer space-y-2.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold group-hover:scale-110 shadow-sm transition-all">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-emerald-900">
                Link WhatsApp Pacientes
              </h3>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Compartir enlace para que los pacientes autogestionen su cita médica desde su teléfono móvil.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 pt-1">
              <span>Compartir o Copiar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
