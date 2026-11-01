import React from 'react';
import { OfficialAtpLogo } from '../OfficialLogo';
import {
  Calendar,
  Stethoscope,
  ClipboardCheck,
  Bike,
  Phone,
  MapPin,
  Instagram,
  PlusSquare,
  CalendarClock,
  BriefcaseMedical
} from 'lucide-react';
import consultImg from '../../assets/images/atp_medical_consultation_1792340095088.jpg';
import teamImg from '../../assets/images/atp_specialist_team_official_v2.jpg';
import wellnessImg from '../../assets/images/atp_therapy_wellness_1792340111007.jpg';

/**
 * Official Cashea Logo Badge ("C" yellow icon + cashea wordmark)
 */
export const CasheaBadge: React.FC<{ size?: 'sm' | 'md' | 'lg'; iconOnly?: boolean }> = ({
  size = 'md',
  iconOnly = false
}) => {
  if (iconOnly) {
    return (
      <div className="w-11 h-11 rounded-xl bg-[#FAFF00] flex items-center justify-center shadow-sm border border-black/5">
        <svg viewBox="0 0 40 40" className="w-7 h-7">
          <path
            d="M24 11 A10 10 0 1 0 29 23"
            fill="none"
            stroke="#000000"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <circle cx="27.5" cy="22.5" r="2.8" fill="#000000" />
        </svg>
      </div>
    );
  }

  const isLg = size === 'lg';
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl ${
        isLg
          ? 'bg-white/95 px-6 py-3 shadow-md border border-amber-200/80'
          : 'bg-[#FAFF00] px-3 py-1.5 shadow-xs'
      }`}
    >
      <div
        className={`${
          isLg ? 'w-10 h-10 bg-[#FAFF00]' : 'w-6 h-6 bg-black'
        } rounded-lg flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 40 40" className={isLg ? 'w-7 h-7' : 'w-4 h-4'}>
          <path
            d="M23 11 A10 10 0 1 0 29 23"
            fill="none"
            stroke={isLg ? '#000000' : '#FAFF00'}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span
        className={`font-black tracking-tight text-black ${
          isLg ? 'text-2xl sm:text-3xl' : 'text-sm sm:text-base'
        }`}
      >
        cashea<span className="text-black">.</span>
      </span>
    </div>
  );
};

/**
 * FLYER 1: "Así funciona: DEL CONSULTORIO A TU HOGAR"
 * (1. Solicitud de Cita -> 2. Cita Médica -> 3. Diagnóstico -> 4. Delivery)
 */
export const FlyerConsultorioHogar: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Solicitud de Cita',
      desc: 'Seleccionamos el mejor horario para ti.',
      icon: Calendar
    },
    {
      num: '2',
      title: 'Cita Médica',
      desc: 'Asistes a consulta con nuestros especialistas.',
      icon: Stethoscope
    },
    {
      num: '3',
      title: 'Diagnóstico',
      desc: 'Identificamos tu dolencia y determinamos el tratamiento.',
      icon: ClipboardCheck
    },
    {
      num: '4',
      title: 'Delivery',
      desc: 'Enviamos tus medicamentos a tu hogar u oficina.',
      icon: Bike
    }
  ];

  return (
    <div className="w-full h-full min-h-[460px] bg-gradient-to-b from-[#E9F5FE] via-[#F5FAFF] to-white flex flex-col justify-between relative overflow-hidden select-none text-[#151E3A]">
      {/* Top Split Photographic Scene: Doctor with ATP Medical Bag + Delivery Rider */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-gradient-to-r from-[#DCEFFB] to-[#CBE7FA]">
        <img
          src={teamImg}
          alt="Del Consultorio a tu Hogar - ATP Medical"
          className="w-full h-full object-cover object-top opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F5FAFF] via-transparent to-black/10" />

        {/* Center Official ATP MEDICAL Bag / Delivery Badge Overlay */}
        <div className="absolute bottom-3 left-4 sm:left-6 bg-[#F4F4F4]/95 backdrop-blur-xs px-3.5 py-2 rounded-2xl shadow-xl border-2 border-[#7DDACB] flex items-center justify-center">
          <OfficialAtpLogo className="w-36 h-10" transparentBg />
        </div>

        <div className="absolute bottom-3 right-4 sm:right-6 bg-[#151E3A]/95 text-white px-3.5 py-2 rounded-xl border border-[#7DDACB] shadow-lg flex items-center gap-2">
          <Bike className="w-5 h-5 text-[#7DDACB]" />
          <div className="leading-tight">
            <span className="text-[10px] font-black text-[#7DDACB] block tracking-wider">
              DELIVERY OFICIAL
            </span>
            <span className="text-xs font-extrabold text-white">ATP MEDICAL</span>
          </div>
        </div>
      </div>

      {/* Middle Headline */}
      <div className="px-5 sm:px-8 pt-3 pb-2">
        <p className="text-lg sm:text-xl font-medium text-[#151E3A] leading-tight">
          Así funciona
        </p>
        <h3 className="text-xl sm:text-2xl font-black text-[#0066FF] tracking-tight leading-tight mt-0.5">
          DEL CONSULTORIO A TU HOGAR
        </h3>
      </div>

      {/* Bottom 4 Steps Grid */}
      <div className="px-4 sm:px-7 pb-6 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 items-start">
        {steps.map((s) => {
          const IconComponent = s.icon;
          return (
            <div key={s.num} className="flex flex-col items-center text-center group">
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-[#D7F3FE] to-[#EFF9FF] border-2 border-[#7DDACB] shadow-md flex items-center justify-center mb-2">
                <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#CBE7FA] text-[#151E3A] font-black text-xs flex items-center justify-center shadow-2xs border border-white">
                  {s.num}
                </span>
                <IconComponent className="w-8 h-8 text-[#151E3A] stroke-[1.8]" />
              </div>
              <h4 className="font-black text-xs sm:text-sm text-[#151E3A] leading-tight">
                {s.title}
              </h4>
              <p className="text-[11px] text-[#1F2952]/90 leading-snug mt-1">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * FLYER 2: "CONSULTAS MÉDICAS — ATENCIÓN PENSADA EN TU COMODIDAD (DESDE $30 + CASHEA)"
 */
export const FlyerConsultasMedicas: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[460px] bg-gradient-to-br from-[#F2F9FF] via-[#E6F4FE] to-[#D9F0FC] flex flex-col justify-between relative overflow-hidden select-none text-[#151E3A]">
      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-3.5 flex-1 flex flex-col justify-between">
        {/* Top Row: Official Logo + RIF & Doctor Photo */}
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-7 space-y-2">
            {/* Logo Oficial Completo + RIF */}
            <div className="flex flex-col items-start gap-0.5">
              <OfficialAtpLogo className="w-44 h-12 shrink-0" transparentBg />
              <span className="text-[10px] font-bold text-[#1F2952] tracking-wider pl-1">
                J-50642234-4
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0066FF] leading-none tracking-tight">
                CONSULTAS
                <br />
                MÉDICAS
              </h3>
              <p className="text-xs sm:text-sm font-extrabold text-[#151E3A] uppercase tracking-tight mt-1.5 leading-snug">
                ATENCIÓN PENSADA EN TU COMODIDAD
              </p>
            </div>

            {/* Nuevo Beneficio Box */}
            <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3 border border-[#7DDACB] shadow-sm flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4FE] text-[#151E3A] flex items-center justify-center shrink-0 mt-0.5">
                <PlusSquare className="w-5 h-5 text-[#0066FF]" />
              </div>
              <div className="space-y-0.5">
                <span className="inline-block px-2 py-0.5 rounded-full bg-[#00A8B5] text-white font-black text-[9px] uppercase tracking-wider">
                  NUEVO BENEFICIO
                </span>
                <h4 className="font-black text-xs text-[#151E3A] leading-tight">
                  TICKET DE MEDICAMENTOS SIN COSTO ADICIONAL
                </h4>
                <p className="text-[10px] text-[#1F2952] leading-snug">
                  Recibe los medicamentos indicados por tu médico. Te los enviamos a tu hogar u oficina.
                </p>
              </div>
            </div>
          </div>

          {/* Right Doctor & Patient Portrait inside Glowing Cyan Arc */}
          <div className="col-span-5 relative flex items-center justify-center">
            <div className="w-36 h-44 sm:w-44 sm:h-54 rounded-t-full rounded-b-3xl overflow-hidden border-4 border-[#00C4CC] shadow-xl relative">
              <img
                src={consultImg}
                alt="Consultas Médicas ATP Medical"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Lower Cashea & "DESDE $30" Box */}
        <div className="relative bg-gradient-to-r from-[#D5F3F8]/90 via-[#E6F8FC]/95 to-[#D5F3F8]/90 rounded-2xl p-3.5 pt-5 border-2 border-[#00C4CC] shadow-sm">
          <div className="absolute -top-3 left-4 px-3.5 py-1 rounded-xl bg-[#00B8C4] text-white font-black text-xs sm:text-sm shadow-md">
            DESDE $30
          </div>

          <p className="text-center font-black text-xs text-[#151E3A] uppercase tracking-wide mb-2.5">
            MÁS DE 10 ESPECIALIDADES A TU ALCANCE
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center border-t border-[#00C4CC]/30 pt-2">
            <div>
              <span className="text-[10px] font-black text-[#151E3A] uppercase block mb-1">
                PAGA CON
              </span>
              <CasheaBadge size="sm" />
            </div>

            <div className="sm:border-l sm:border-[#151E3A]/20 sm:pl-3">
              <span className="font-black text-sm sm:text-base text-[#151E3A] leading-none block">
                01–06
              </span>
              <span className="font-black text-[10px] text-[#151E3A] uppercase block">
                DE CADA MES
              </span>
              <span className="text-[10px] text-[#1F2952] font-semibold">
                Hasta 0% de inicial* + más cuotas
              </span>
            </div>

            <div className="sm:border-l sm:border-[#151E3A]/20 sm:pl-3">
              <span className="font-black text-sm sm:text-base text-[#151E3A] leading-none block">
                15–20
              </span>
              <span className="font-black text-[10px] text-[#151E3A] uppercase block">
                DE CADA MES
              </span>
              <span className="text-[11px] font-black text-[#151E3A] uppercase">
                0% DE INICIAL
              </span>
            </div>
          </div>

          <p className="text-center text-[9px] text-[#1F2952] font-semibold mt-1.5">
            *Según tu nivel y condiciones de Cashea.
          </p>
        </div>
      </div>

      {/* Bottom Navy Footer */}
      <div className="bg-[#0B2247] text-white px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#00C4CC]/20 border border-[#00C4CC] flex items-center justify-center text-[#00C4CC]">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] text-sky-200 block leading-none">
              Contáctanos por WhatsApp
            </span>
            <span className="font-black text-xs sm:text-sm text-white">0414 3651970</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-sky-100">
          <MapPin className="w-4 h-4 text-[#00C4CC] shrink-0" />
          <span>Centro comercial Parque Humboldt, Piso 1, Oficina 5-B. Prados del Este.</span>
        </div>
      </div>
    </div>
  );
};

/**
 * FLYER 3: "TUS CONSULTAS CON TU TICKET DE MEDICAMENTOS AHORA ESTÁN A TU ALCANCE (CASHEA)"
 */
export const FlyerCasheaTicket: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[460px] bg-gradient-to-b from-[#F4F9FF] via-[#E1F0FE] to-[#EDF5FF] flex flex-col justify-between relative overflow-hidden select-none text-[#151E3A]">
      <div className="p-5 sm:p-7 space-y-4 flex-1 flex flex-col justify-between items-center text-center">
        {/* Top Heading */}
        <div className="space-y-1 max-w-lg">
          <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#151E3A]">
            TUS CONSULTAS CON TU TICKET DE MEDICAMENTOS
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-[#151E3A] leading-none tracking-tight">
            AHORA ESTÁN
            <br />A TU ALCANCE
          </h3>
          <p className="text-xs sm:text-sm text-[#1F2952] font-medium pt-1">
            Aprovecha tus beneficios de Cashea y obtén hasta 6 cuotas e inicial baja.
          </p>
        </div>

        {/* Center Cashea Hero Pill */}
        <div className="my-1">
          <CasheaBadge size="lg" />
        </div>

        {/* Two Side-by-Side Date Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <div className="bg-white/85 backdrop-blur-xs rounded-2xl p-3.5 border-2 border-amber-200/80 shadow-sm flex flex-col items-center justify-center space-y-1.5">
            <div className="flex items-center gap-2 text-left">
              <Calendar className="w-7 h-7 text-[#151E3A] shrink-0" />
              <div className="text-xs font-black text-[#151E3A] leading-tight">
                DEL 01 AL 06
                <br />
                DE CADA MES
              </div>
            </div>
            <p className="font-black text-xs sm:text-sm text-[#151E3A] leading-tight pt-1">
              HASTA 6 CUOTAS
              <br />+ INICIAL BAJA
            </p>
          </div>

          <div className="bg-white/85 backdrop-blur-xs rounded-2xl p-3.5 border-2 border-amber-200/80 shadow-sm flex flex-col items-center justify-center space-y-1.5">
            <div className="flex items-center gap-2 text-left">
              <CalendarClock className="w-7 h-7 text-[#151E3A] shrink-0" />
              <div className="text-xs font-black text-[#151E3A] leading-tight">
                DEL 15 AL 20
                <br />
                DE CADA MES
              </div>
            </div>
            <p className="font-black text-sm sm:text-base text-[#151E3A] leading-tight pt-2">
              INICIAL BAJA
            </p>
          </div>
        </div>

        {/* Bottom Ticket de Medicamentos Card */}
        <div className="w-full max-w-xl bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border-2 border-amber-200/80 shadow-sm flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#EBF5FF] border border-[#151E3A]/15 flex items-center justify-center shrink-0">
            <BriefcaseMedical className="w-6 h-6 text-[#151E3A]" />
          </div>
          <div className="border-l border-slate-300 pl-3.5">
            <h4 className="font-black text-xs sm:text-sm text-[#151E3A]">
              Ticket de Medicamentos.
            </h4>
            <p className="text-xs text-[#1F2952] leading-snug">
              Consulta médica + ticket + delivery a tu hogar u oficina.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom White/Light Footer with Official ATP Logo in Center */}
      <div className="bg-white/95 border-t border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[#151E3A]">
        <div className="flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-[#151E3A]" />
          <div className="leading-none">
            <span className="text-[9px] text-slate-500 block">Contáctanos por WhatsApp</span>
            <span className="font-black text-xs">04143651970</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <OfficialAtpLogo className="w-32 h-9" transparentBg />
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-[#151E3A]">
          <MapPin className="w-3.5 h-3.5 text-[#151E3A]" />
          <span>CC. Parque Humboldt, Piso 1, Of. 5-B</span>
        </div>
      </div>
    </div>
  );
};

/**
 * FLYER 4: "JORNADA ESPECIAL BOTOX — PARA UNA BELLEZA ATEMPORAL"
 */
export const FlyerJornadaBotox: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[460px] bg-[#F7F8FA] flex flex-col justify-between relative overflow-hidden select-none text-[#151E3A]">
      {/* Top Right Instagram Handle */}
      <div className="absolute top-3.5 right-4 z-20 inline-flex items-center gap-1 text-xs font-semibold text-[#151E3A] bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs">
        <Instagram className="w-3.5 h-3.5 text-[#151E3A]" />
        <span>ATPMedical_ve</span>
      </div>

      <div className="grid grid-cols-12 flex-1 items-center">
        {/* Left Content Column */}
        <div className="col-span-7 sm:col-span-7 py-5 pr-2 space-y-3 z-10">
          <div className="pl-5 sm:pl-7">
            <span className="text-sm sm:text-base font-bold uppercase tracking-wide text-[#151E3A]">
              JORNADA <strong className="font-black">ESPECIAL</strong>
            </span>
          </div>

          {/* Navy Pill with Outlined Teal BOTOX */}
          <div className="bg-[#152244] rounded-r-full py-2.5 px-5 sm:px-7 shadow-md inline-block w-full max-w-[290px]">
            <span
              className="text-3xl sm:text-5xl font-black tracking-widest block leading-none"
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px #1CD4C6'
              }}
            >
              BOTOX
            </span>
          </div>

          <div className="pl-5 sm:pl-7 space-y-2.5">
            <p className="text-xs sm:text-base font-medium uppercase tracking-wider text-[#151E3A] leading-tight">
              PARA UNA BELLEZA
              <br />
              ATEMPORAL
            </p>

            {/* Teal Agenda Pill */}
            <div className="inline-flex items-center gap-1.5 bg-[#1CD4C6] text-[#151E3A] px-3.5 py-1 rounded-r-full -ml-5 sm:-ml-7 pl-5 sm:pl-7 font-bold text-xs sm:text-sm shadow-xs">
              <span>Agenda al:</span>
              <Phone className="w-3.5 h-3.5 fill-[#151E3A]" />
              <span className="font-black">0414-3651970</span>
            </div>

            {/* Incluye List */}
            <div className="pt-1 space-y-1 text-xs sm:text-sm text-[#151E3A]">
              <p className="font-semibold text-sm sm:text-base">Incluye:</p>
              <ul className="space-y-0.5 font-medium pl-1">
                <li>• Evaluación Medica</li>
                <li>• Limpieza Facial</li>
                <li>• Botox Full Face</li>
                <li>• Reevaluación</li>
              </ul>

              <div className="pt-1.5">
                <p className="font-semibold text-xs sm:text-sm">Adicional:</p>
                <p className="font-medium text-xs">
                  • <strong>PDRN</strong> <span className="text-[11px]">(Esperma de salmon)</span>
                </p>
              </div>
            </div>

            <div className="pt-1">
              <CasheaBadge iconOnly />
            </div>
          </div>
        </div>

        {/* Right Aesthetic Portrait */}
        <div className="col-span-5 sm:col-span-5 h-full relative overflow-hidden flex items-end justify-center">
          <img
            src={wellnessImg}
            alt="Jornada Especial Botox - ATP Medical"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F8FA] via-transparent to-transparent" />
        </div>
      </div>

      {/* Bottom Bright Yellow Cashea Banner */}
      <div className="bg-[#FAFF00] text-black px-4 py-3 text-center font-black text-xs sm:text-sm tracking-tight border-t border-black/5">
        Compra ahora, paga después, en cuotas sin interés.
      </div>
    </div>
  );
};
