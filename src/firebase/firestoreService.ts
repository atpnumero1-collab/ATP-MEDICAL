import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './errorHandler';
import { 
  Doctor, 
  Patient, 
  Appointment, 
  PatientIntake, 
  ClinicConfig, 
  DoctorStatus,
  AppointmentStatus,
  IntakeStatus,
  PaymentMethod,
  MedicalRecord
} from '../types';
import { 
  INITIAL_CONFIG, 
  INITIAL_DOCTORS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_INTAKES 
} from '../data/initialData';

const COLLECTIONS = {
  DOCTORS: 'doctors',
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  INTAKES: 'intakes',
  CONFIG: 'config',
  MEDICAL_RECORDS: 'medicalRecords'
};


// Known demo IDs from previous test runs to ensure complete database sanitization
const DEMO_PATIENT_IDS = ['pat-1', 'pat-2', 'pat-3', 'pat-4', 'pat-5', 'pat-6'];
const DEMO_APPOINTMENT_IDS = ['apt-1', 'apt-2', 'apt-3', 'apt-4', 'apt-5', 'apt-6'];
const DEMO_INTAKE_IDS = ['intake-1', 'intake-2', 'intake-3', 'intake-4', 'intake-5', 'intake-6'];

/**
 * Purges any leftover demo/test patients, appointments, and intakes from Firestore,
 * ensuring only the official 11 doctors and clean data remain.
 */
export async function purgeTestFirestoreData(): Promise<void> {
  try {
    // 1. Delete known demo patients
    for (const patId of DEMO_PATIENT_IDS) {
      try {
        await deleteDoc(doc(db, COLLECTIONS.PATIENTS, patId));
      } catch {
        // ignore if doesn't exist
      }
    }

    // 2. Delete known demo appointments
    for (const aptId of DEMO_APPOINTMENT_IDS) {
      try {
        await deleteDoc(doc(db, COLLECTIONS.APPOINTMENTS, aptId));
      } catch {
        // ignore if doesn't exist
      }
    }

    // 3. Delete known demo intakes
    for (const intakeId of DEMO_INTAKE_IDS) {
      try {
        await deleteDoc(doc(db, COLLECTIONS.INTAKES, intakeId));
      } catch {
        // ignore if doesn't exist
      }
    }

    // 4. Also scan patient docs for test names or chilean format leftover
    const patientSnap = await getDocs(collection(db, COLLECTIONS.PATIENTS));
    for (const pDoc of patientSnap.docs) {
      const data = pDoc.data() as Patient;
      if (
        data.fullName === 'Elena Gómez Suárez' ||
        data.fullName === 'Lucas Benítez Díaz' ||
        data.fullName === 'Mateo Valenzuela Rivas' ||
        data.fullName === 'Camila Rojas Navarrete' ||
        data.fullName === 'Ignacio Tapia Cordero' ||
        data.fullName === 'Rosa María Carrasco Silva' ||
        data.dni?.includes('-K') ||
        DEMO_PATIENT_IDS.includes(pDoc.id)
      ) {
        await deleteDoc(doc(db, COLLECTIONS.PATIENTS, pDoc.id));
      }
    }

    // 5. Reset doctors to 'disponible' and clear active patient names
    const doctorSnap = await getDocs(collection(db, COLLECTIONS.DOCTORS));
    if (!doctorSnap.empty) {
      for (const dDoc of doctorSnap.docs) {
        const data = dDoc.data() as Doctor;
        if (data.status === 'en_consulta' || data.activePatientName) {
          await updateDoc(doc(db, COLLECTIONS.DOCTORS, dDoc.id), {
            status: 'disponible',
            activePatientName: ''
          });
        }
      }
    }

    console.info('Firestore: All test patients, appointments, and intakes purged successfully.');
  } catch (error) {
    console.warn('Notice during Firestore test data cleanup:', error);
  }
}

// Initial database seeding if Firestore collections are empty
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    // 1. Ensure the 11 official doctors exist in Firestore
    const docSnap = await getDocs(collection(db, COLLECTIONS.DOCTORS));
    if (docSnap.empty || docSnap.size < 11) {
      console.info('Seeding official doctors into Firestore...');
      const batch = writeBatch(db);
      for (const doctor of INITIAL_DOCTORS) {
        batch.set(doc(db, COLLECTIONS.DOCTORS, doctor.id), doctor);
      }
      await batch.commit();
    }

    // 2. Clinic Config
    const configSnap = await getDocs(collection(db, COLLECTIONS.CONFIG));
    if (configSnap.empty) {
      console.info('Seeding initial config into Firestore...');
      await setDoc(doc(db, COLLECTIONS.CONFIG, 'main_config'), INITIAL_CONFIG);
    }

    // 3. Purge all test data (patients, appointments, intakes)
    await purgeTestFirestoreData();
  } catch (error) {
    console.error('Error during Firestore initial seed:', error);
  }
}

// Real-time Subscriptions with error handlers
export function subscribeDoctors(onUpdate: (doctors: Doctor[]) => void): () => void {
  const path = COLLECTIONS.DOCTORS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (!snapshot.empty) {
        const docs: Doctor[] = [];
        snapshot.forEach((d) => {
          docs.push(d.data() as Doctor);
        });
        onUpdate(docs);
      } else {
        onUpdate(INITIAL_DOCTORS);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribePatients(onUpdate: (patients: Patient[]) => void): () => void {
  const path = COLLECTIONS.PATIENTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Patient[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Patient);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeAppointments(onUpdate: (appointments: Appointment[]) => void): () => void {
  const path = COLLECTIONS.APPOINTMENTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Appointment);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeIntakes(onUpdate: (intakes: PatientIntake[]) => void): () => void {
  const path = COLLECTIONS.INTAKES;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: PatientIntake[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as PatientIntake);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeClinicConfig(onUpdate: (config: ClinicConfig) => void): () => void {
  const path = `${COLLECTIONS.CONFIG}/main_config`;
  return onSnapshot(
    doc(db, COLLECTIONS.CONFIG, 'main_config'),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as ClinicConfig);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Mutations
export async function dbSaveDoctor(doctor: Doctor): Promise<void> {
  const path = `${COLLECTIONS.DOCTORS}/${doctor.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.DOCTORS, doctor.id), doctor);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function dbUpdateDoctorStatus(doctorId: string, status: DoctorStatus, activePatientName?: string): Promise<void> {
  const path = `${COLLECTIONS.DOCTORS}/${doctorId}`;
  try {
    const updatePayload: Record<string, any> = { status };
    if (activePatientName !== undefined) {
      updatePayload.activePatientName = activePatientName;
    } else {
      updatePayload.activePatientName = '';
    }
    await updateDoc(doc(db, COLLECTIONS.DOCTORS, doctorId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function dbSavePatient(patient: Patient): Promise<void> {
  const path = `${COLLECTIONS.PATIENTS}/${patient.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.PATIENTS, patient.id), patient);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function dbDeletePatient(patientId: string): Promise<void> {
  const path = `${COLLECTIONS.PATIENTS}/${patientId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.PATIENTS, patientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function dbSaveAppointment(appointment: Appointment): Promise<void> {
  const path = `${COLLECTIONS.APPOINTMENTS}/${appointment.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointment.id), appointment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function dbUpdateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<void> {
  const path = `${COLLECTIONS.APPOINTMENTS}/${appointmentId}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function dbDeleteAppointment(appointmentId: string): Promise<void> {
  const path = `${COLLECTIONS.APPOINTMENTS}/${appointmentId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function dbSaveIntake(intake: PatientIntake): Promise<void> {
  const path = `${COLLECTIONS.INTAKES}/${intake.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.INTAKES, intake.id), intake);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function dbUpdateIntake(intake: PatientIntake): Promise<void> {
  const path = `${COLLECTIONS.INTAKES}/${intake.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.INTAKES, intake.id), intake);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function dbDeleteIntake(intakeId: string): Promise<void> {
  const path = `${COLLECTIONS.INTAKES}/${intakeId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.INTAKES, intakeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function dbSaveConfig(config: ClinicConfig): Promise<void> {
  const path = `${COLLECTIONS.CONFIG}/main_config`;
  try {
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'main_config'), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Medical Records Subscription
export function subscribeMedicalRecords(onUpdate: (records: MedicalRecord[]) => void): () => void {
  const path = COLLECTIONS.MEDICAL_RECORDS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: MedicalRecord[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as MedicalRecord);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Medical Records Mutations
export async function dbSaveMedicalRecord(record: MedicalRecord): Promise<void> {
  const path = `${COLLECTIONS.MEDICAL_RECORDS}/${record.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.MEDICAL_RECORDS, record.id), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function dbDeleteMedicalRecord(recordId: string): Promise<void> {
  const path = `${COLLECTIONS.MEDICAL_RECORDS}/${recordId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.MEDICAL_RECORDS, recordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

