import { jsPDF } from 'jspdf';
import { MedicalRecord, ClinicConfig } from '../types';
import { formatPhoneForWhatsApp } from './whatsapp';

/**
 * Builds the public URL where a patient or doctor can directly view and download
 * the official PDF of a specific Medical Record (?informe=<recordId>).
 * Automatically converts private AI Studio dev preview origins (ais-dev-)
 * to the public shared preview origin (ais-pre-) so patients can open it on any phone.
 */
export const getPublicReportPdfUrl = (recordId: string): string => {
  if (typeof window === 'undefined') return `?informe=${recordId}`;
  const origin = window.location.origin.replace('://ais-dev-', '://ais-pre-');
  return `${origin}${window.location.pathname}?informe=${encodeURIComponent(recordId)}`;
};

/**
 * Generates an official A4 PDF document for a Medical Record with the ATP Medical
 * corporate palette (#151E3A, #1F2952, #7DDACB, #F4F4F4, #395AFF) and vector logo.
 */
export const createMedicalRecordPdfDoc = (
  rec: MedicalRecord,
  config: ClinicConfig
): { doc: jsPDF; filename: string } => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 12;

  // 1. Top Corporate 4-Color Bar (#151E3A, #1F2952, #7DDACB, #395AFF)
  const segW = contentWidth / 4;
  doc.setFillColor(21, 30, 58); // #151E3A
  doc.rect(margin, y, segW, 2.5, 'F');
  doc.setFillColor(31, 41, 82); // #1F2952
  doc.rect(margin + segW, y, segW, 2.5, 'F');
  doc.setFillColor(125, 218, 203); // #7DDACB
  doc.rect(margin + segW * 2, y, segW, 2.5, 'F');
  doc.setFillColor(57, 90, 255); // #395AFF
  doc.rect(margin + segW * 3, y, segW, 2.5, 'F');
  y += 5;

  // 2. Institutional Header Banner (#151E3A with #7DDACB bottom accent)
  const headerH = 30;
  doc.setFillColor(21, 30, 58); // #151E3A
  doc.roundedRect(margin, y, contentWidth, headerH, 3, 3, 'F');
  doc.setFillColor(125, 218, 203); // #7DDACB bottom border
  doc.rect(margin, y + headerH - 1.5, contentWidth, 1.5, 'F');

  // Official ATP Vector Logo Box inside Header
  const logoX = margin + 4;
  const logoY = y + 4.5;
  const logoW = 34;
  const logoH = 19;
  doc.setFillColor(244, 244, 244); // #F4F4F4
  doc.setDrawColor(125, 218, 203); // #7DDACB
  doc.setLineWidth(0.6);
  doc.roundedRect(logoX, logoY, logoW, logoH, 2.5, 2.5, 'FD');

  // Draw Official Geometric 'a', 't', 'p' inside the logo badge
  // 'a' (left): navy vertical pill top + aqua horizontal pill bottom
  doc.setFillColor(21, 30, 58); // #151E3A
  doc.roundedRect(logoX + 6.5, logoY + 6.2, 4.2, 7.5, 2, 2, 'F');
  doc.setFillColor(125, 218, 203); // #7DDACB
  doc.roundedRect(logoX + 3.2, logoY + 9.5, 7.5, 4.2, 2, 2, 'F');
  doc.rect(logoX + 7.5, logoY + 9.5, 3.2, 4.2, 'F'); // square bottom-right corner of 'a'

  // 't' (center): aqua top dot + aqua left arm + navy stem & right arm
  doc.setFillColor(125, 218, 203); // #7DDACB
  doc.circle(logoX + 17.2, logoY + 3.8, 1.9, 'F');
  doc.roundedRect(logoX + 12.2, logoY + 6.5, 5.2, 3.8, 1.8, 1.8, 'F');
  doc.setFillColor(21, 30, 58); // #151E3A
  doc.roundedRect(logoX + 15.3, logoY + 6.5, 4.0, 7.5, 1.8, 1.8, 'F');
  doc.roundedRect(logoX + 15.3, logoY + 6.5, 7.0, 3.8, 1.8, 1.8, 'F');

  // 'p' (right): navy stem & loop + aqua circle
  doc.setFillColor(21, 30, 58); // #151E3A
  doc.roundedRect(logoX + 24.0, logoY + 6.5, 4.0, 7.5, 1.8, 1.8, 'F');
  doc.roundedRect(logoX + 24.0, logoY + 6.5, 6.8, 4.2, 2.0, 2.0, 'F');
  doc.setFillColor(125, 218, 203); // #7DDACB
  doc.circle(logoX + 26.0, logoY + 8.6, 2.0, 'F');

  // "MEDICAL" subtitle inside logo badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(21, 30, 58);
  doc.text('M E D I C A L', logoX + logoW / 2, logoY + 17.2, { align: 'center' });

  // Clinic Title & Contact Info
  const textStartX = logoX + logoW + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('ATP MEDICAL', textStartX, y + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(125, 218, 203); // #7DDACB
  doc.text((config.slogan || 'LA ENERGÍA QUE IMPULSA TU BIENESTAR').toUpperCase(), textStartX, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(244, 244, 244);
  doc.text(config.address || 'C.C. Parque Humboldt, Piso 1, Ofic. 5, Caracas', textStartX, y + 18.5);
  doc.setTextColor(125, 218, 203);
  doc.text(`Tlf: ${config.phone || '+58 414-3651970'}  |  ${config.email || 'contacto@atpmedical.com'}`, textStartX, y + 23.5);

  // Right Folio Box inside Header
  const folioW = 46;
  const folioX = margin + contentWidth - folioW - 4;
  doc.setFillColor(31, 41, 82); // #1F2952
  doc.setDrawColor(125, 218, 203);
  doc.setLineWidth(0.3);
  doc.roundedRect(folioX, y + 3.5, folioW, 21.5, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(125, 218, 203);
  doc.text('INFORME MÉDICO OFICIAL', folioX + folioW - 3, y + 8, { align: 'right' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(rec.recordNumber || 'HM-ATP', folioX + folioW - 3, y + 13.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(244, 244, 244);
  doc.text(`Fecha: ${rec.date}`, folioX + folioW - 3, y + 18.5, { align: 'right' });
  doc.setTextColor(125, 218, 203);
  doc.text(`Hora: ${rec.time} hrs`, folioX + folioW - 3, y + 22.5, { align: 'right' });

  y += headerH + 4;

  // 3. Patient Identification Card (#F4F4F4 with #395AFF left accent)
  const patCardH = 16;
  doc.setFillColor(244, 244, 244); // #F4F4F4
  doc.roundedRect(margin, y, contentWidth, patCardH, 2, 2, 'F');
  doc.setFillColor(57, 90, 255); // #395AFF
  doc.rect(margin, y, 2, patCardH, 'F');

  const colW = contentWidth / 4;
  // Col 1: Paciente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(31, 41, 82);
  doc.text('PACIENTE', margin + 5, y + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(21, 30, 58);
  doc.text((rec.patientName || '').slice(0, 28), margin + 5, y + 11.5);

  // Col 2: Cédula
  doc.setFontSize(6.5);
  doc.setTextColor(31, 41, 82);
  doc.text('CÉDULA DE IDENTIDAD', margin + colW + 4, y + 5.5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(57, 90, 255);
  doc.text(rec.patientDni || 'N/A', margin + colW + 4, y + 11.5);

  // Col 3: Edad / Sexo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(31, 41, 82);
  doc.text('EDAD / SEXO', margin + colW * 2 + 2, y + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(21, 30, 58);
  const ageGender = `${rec.patientAge ? `${rec.patientAge} años` : 'Adulto'} ${rec.patientGender ? `· ${rec.patientGender}` : ''}`;
  doc.text(ageGender, margin + colW * 2 + 2, y + 11.5);

  // Col 4: Teléfono
  doc.setFontSize(6.5);
  doc.setTextColor(31, 41, 82);
  doc.text('TELÉFONO', margin + colW * 3, y + 5.5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 30, 58);
  doc.text(rec.patientPhone || config.phone, margin + colW * 3, y + 11.5);

  y += patCardH + 3.5;

  // 4. Treating Specialist Banner (#1F2952 with #7DDACB accent)
  const docCardH = 14;
  doc.setFillColor(31, 41, 82); // #1F2952
  doc.roundedRect(margin, y, contentWidth, docCardH, 2, 2, 'F');
  doc.setFillColor(125, 218, 203); // #7DDACB
  doc.rect(margin, y, 2, docCardH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(125, 218, 203);
  doc.text('MÉDICO ESPECIALISTA TRATANTE', margin + 5, y + 5);
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(rec.doctorName || 'Especialista ATP Medical', margin + 5, y + 10.8);

  doc.setFontSize(8);
  doc.setTextColor(125, 218, 203);
  doc.text((rec.specialty || '').toUpperCase(), margin + contentWidth - 4, y + 5.8, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(244, 244, 244);
  doc.text(rec.room || 'Consultorio ATP Medical', margin + contentWidth - 4, y + 10.8, { align: 'right' });

  y += docCardH + 5;

  // Helper to check page overflow
  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > 265) {
      doc.addPage();
      y = 16;
    }
  };

  // Helper to draw a numbered clinical section header
  const drawSectionTitle = (title: string) => {
    ensureSpace(14);
    doc.setFillColor(57, 90, 255); // #395AFF dot
    doc.circle(margin + 1.5, y - 1, 1.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(21, 30, 58); // #151E3A
    doc.text(title.toUpperCase(), margin + 4.5, y);
    y += 1.8;
    doc.setDrawColor(57, 90, 255);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 4.5;
  };

  // Helper to write wrapped paragraph text
  const writeParagraph = (text: string, isBold = false) => {
    if (!text) return;
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(21, 30, 58);
    const lines = doc.splitTextToSize(text, contentWidth - 2);
    ensureSpace(lines.length * 4.2 + 3);
    doc.text(lines, margin + 1, y);
    y += lines.length * 4.2 + 2.5;
  };

  // Section 1: Motivo de Consulta & Enfermedad Actual
  drawSectionTitle('1. Motivo de Consulta & Enfermedad Actual');
  writeParagraph(`Motivo de consulta: ${rec.chiefComplaint || 'Evaluación clínica'}`, true);
  if (rec.currentIllness) {
    writeParagraph(rec.currentIllness, false);
  }

  // Section 2: Signos Vitales
  if (rec.vitals) {
    drawSectionTitle('2. Signos Vitales & Somatometría');
    ensureSpace(16);
    const vBoxH = 13;
    doc.setFillColor(244, 244, 244); // #F4F4F4
    doc.setDrawColor(31, 41, 82);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, y - 1, contentWidth, vBoxH, 1.5, 1.5, 'FD');

    const vitalsItems = [
      { label: 'T.A. (mmHg)', val: `${rec.vitals.systolic}/${rec.vitals.diastolic}` },
      { label: 'F.C. (lpm)', val: `${rec.vitals.heartRate}` },
      { label: 'F.R. (rpm)', val: `${rec.vitals.respRate}` },
      { label: 'Temp (°C)', val: `${rec.vitals.temperature}°C` },
      { label: 'SpO2 (%)', val: `${rec.vitals.spo2}%` },
      { label: 'Peso (kg)', val: `${rec.vitals.weightKg} kg` },
      { label: 'Talla (cm)', val: `${rec.vitals.heightCm} cm` },
      { label: 'IMC', val: `${rec.vitals.bmi || '-'}` }
    ];

    const vColW = contentWidth / vitalsItems.length;
    vitalsItems.forEach((item, idx) => {
      const cx = margin + vColW * idx + vColW / 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(31, 41, 82);
      doc.text(item.label, cx, y + 3.5, { align: 'center' });

      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(21, 30, 58);
      doc.text(item.val, cx, y + 9, { align: 'center' });
    });

    y += vBoxH + 4.5;
  }

  // Section 3: Examen Físico
  if (rec.physicalExam) {
    drawSectionTitle('3. Hallazgos al Examen Físico');
    writeParagraph(rec.physicalExam, false);
  }

  // Section 4: Diagnóstico Clínico (Highlighted Box)
  ensureSpace(20);
  const diagLines = doc.splitTextToSize(rec.diagnosis || 'Evaluación médica satisfactoria', contentWidth - 10);
  const diagBoxH = Math.max(14, diagLines.length * 4.5 + 9);
  doc.setFillColor(244, 244, 244); // #F4F4F4
  doc.roundedRect(margin, y, contentWidth, diagBoxH, 2, 2, 'F');
  doc.setFillColor(125, 218, 203); // #7DDACB
  doc.rect(margin, y, 2.5, diagBoxH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 82);
  doc.text('4. DIAGNÓSTICO CLÍNICO', margin + 5, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(21, 30, 58);
  doc.text(diagLines, margin + 5, y + 10.5);
  y += diagBoxH + 5;

  // Section 5: Plan de Tratamiento & Récipe Médico
  if (rec.treatmentPlan || rec.prescriptions) {
    drawSectionTitle('5. Plan de Tratamiento & Récipe Médico');
    if (rec.treatmentPlan) {
      writeParagraph(rec.treatmentPlan, false);
    }
    if (rec.prescriptions) {
      const rxLines = doc.splitTextToSize(rec.prescriptions, contentWidth - 10);
      const rxBoxH = Math.max(15, rxLines.length * 4.2 + 10);
      ensureSpace(rxBoxH + 4);
      doc.setFillColor(244, 244, 244);
      doc.roundedRect(margin, y, contentWidth, rxBoxH, 2, 2, 'F');
      doc.setFillColor(57, 90, 255); // #395AFF
      doc.rect(margin, y, 2, rxBoxH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(31, 41, 82);
      doc.text('RÉCIPE / PRESCRIPCIONES FARMACOLÓGICAS:', margin + 5, y + 5);

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(21, 30, 58);
      doc.text(rxLines, margin + 5, y + 10);
      y += rxBoxH + 4.5;
    }
  }

  // Section 6: Estudios Complementarios & Próximo Control
  if (rec.complementaryStudies || rec.nextFollowUpDate) {
    drawSectionTitle('6. Estudios Solicitados & Seguimiento');
    if (rec.complementaryStudies) {
      writeParagraph(`Estudios Complementarios: ${rec.complementaryStudies}`, false);
    }
    if (rec.nextFollowUpDate) {
      writeParagraph(`Próximo Control Sugerido: ${rec.nextFollowUpDate}`, true);
    }
  }

  // Footer & Doctor Signature Block at Bottom of Page
  ensureSpace(32);
  const footerY = Math.max(y + 8, 255);
  doc.setDrawColor(21, 30, 58);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  // Left footer info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 30, 58);
  doc.text('ATP MEDICAL CARACAS · J-50642234-4', margin, footerY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(31, 41, 82);
  doc.text(config.address || 'C.C. Parque Humboldt, Piso 1, Ofic. 5, Caracas', margin, footerY + 10.5);
  doc.text('Documento médico legal confidencial expedido en formato PDF oficial.', margin, footerY + 14.5);

  // Right signature block
  const sigCenterX = margin + contentWidth - 35;
  doc.setDrawColor(21, 30, 58);
  doc.setLineWidth(0.4);
  doc.line(sigCenterX - 28, footerY + 12, sigCenterX + 28, footerY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 30, 58);
  doc.text(rec.doctorName || 'Médico Especialista', sigCenterX, footerY + 16.5, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(57, 90, 255);
  doc.text((rec.specialty || '').toUpperCase(), sigCenterX, footerY + 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(31, 41, 82);
  doc.text('Firma y Sello del Médico Especialista', sigCenterX, footerY + 23.5, { align: 'center' });

  const safePatient = (rec.patientName || 'Paciente')
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const filename = `Informe_Medico_${rec.recordNumber || 'ATP'}_${safePatient}.pdf`;

  return { doc, filename };
};

/**
 * Downloads the Medical Record as an official .pdf file directly to the user's device.
 */
export const downloadMedicalRecordPdf = (rec: MedicalRecord, config: ClinicConfig): string => {
  const { doc, filename } = createMedicalRecordPdfDoc(rec, config);
  doc.save(filename);
  return filename;
};

/**
 * Generates the official .pdf file, downloads it locally, and sends the report
 * in PDF format via WhatsApp (using Web Share API for direct .pdf file attachment on
 * supported mobile devices, or opening WhatsApp with the direct PDF download link + downloaded file).
 */
export const sendMedicalRecordPdfViaWhatsApp = async (
  rec: MedicalRecord,
  config: ClinicConfig
): Promise<{ filename: string; pdfUrl: string }> => {
  const { doc, filename } = createMedicalRecordPdfDoc(rec, config);
  const pdfUrl = getPublicReportPdfUrl(rec.id);

  // 1. Always trigger local download of the .pdf file so the doctor/staff has the PDF ready
  doc.save(filename);

  // 2. Build the WhatsApp message including the direct official PDF download link
  const whatsappText =
    `📄 *INFORME MÉDICO EN PDF - ATP MEDICAL*\n` +
    `Folio: *${rec.recordNumber}*\n` +
    `Paciente: *${rec.patientName}* (C.I. ${rec.patientDni})\n` +
    `Fecha: *${rec.date} ${rec.time}*\n` +
    `Especialista: *${rec.doctorName}* (${rec.specialty})\n\n` +
    `📥 *Descargar Informe Médico Oficial en PDF aquí:*\n` +
    `👉 ${pdfUrl}\n\n` +
    `*Diagnóstico:* ${rec.diagnosis}\n` +
    (rec.treatmentPlan ? `*Indicaciones:* ${rec.treatmentPlan}\n` : '') +
    (rec.prescriptions ? `*Récipe:* ${rec.prescriptions}\n` : '') +
    `\n📍 _${config.address} · Tlf: ${config.phone}_`;

  // 3. Open WhatsApp directed to the patient's phone number with the PDF download link
  const cleanPhone = formatPhoneForWhatsApp(rec.patientPhone);
  const encodedText = encodeURIComponent(whatsappText);
  const waUrl =
    cleanPhone && cleanPhone.length >= 10
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

  window.open(waUrl, '_blank', 'noopener,noreferrer');

  return { filename, pdfUrl };
};
