import { Patient, Doctor, Appointment, PatientIntake, ClinicConfig, AppUser } from '../types';
import { 
  INITIAL_CONFIG, 
  INITIAL_DOCTORS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_INTAKES,
  INITIAL_USERS
} from '../data/initialData';

const STORAGE_KEYS = {
  CONFIG: 'atp_medical_config_v1',
  DOCTORS: 'atp_medical_doctors_v1',
  PATIENTS: 'atp_medical_patients_v1',
  APPOINTMENTS: 'atp_medical_appointments_v1',
  INTAKES: 'atp_medical_intakes_v1',
  USERS: 'atp_medical_users_v1',
  ACTIVE_USER_ID: 'atp_medical_active_user_v1'
};

export const loadStoredData = () => {
  try {
    const configRaw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const doctorsRaw = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    const patientsRaw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    const appointmentsRaw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    const intakesRaw = localStorage.getItem(STORAGE_KEYS.INTAKES);
    const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
    const activeUserIdRaw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);

    let loadedConfig = configRaw ? (JSON.parse(configRaw) as ClinicConfig) : INITIAL_CONFIG;
    // Ensure the user-provided official address, phone, colors, and slogan for Venezuela are updated
    if (loadedConfig.address.includes('Las Condes') || !loadedConfig.address) {
      loadedConfig.address = INITIAL_CONFIG.address;
    }
    if (loadedConfig.phone.includes('800') || !loadedConfig.phone) {
      loadedConfig.phone = INITIAL_CONFIG.phone;
    }
    if (loadedConfig.branchName.includes('Centro Médico') || !loadedConfig.branchName) {
      loadedConfig.branchName = INITIAL_CONFIG.branchName;
    }
    if (!loadedConfig.slogan || loadedConfig.slogan.includes('Excelencia')) {
      loadedConfig.slogan = INITIAL_CONFIG.slogan;
    }
    if (
      loadedConfig.activePresetId === 'atp-classic' || 
      loadedConfig.activePresetId === 'atp-venezuela' || 
      loadedConfig.activePresetId === 'atp-vivos' ||
      loadedConfig.primaryColor === '#002B49' ||
      loadedConfig.primaryColor === '#0B5ED7' ||
      !loadedConfig.primaryColor
    ) {
      loadedConfig.primaryColor = INITIAL_CONFIG.primaryColor;
      loadedConfig.accentColor = INITIAL_CONFIG.accentColor;
      loadedConfig.secondaryColor = INITIAL_CONFIG.secondaryColor;
      loadedConfig.activePresetId = 'atp-oficial-pdf';
      saveToStorage('CONFIG', loadedConfig);
    }

    let loadedDoctors = doctorsRaw ? (JSON.parse(doctorsRaw) as Doctor[]) : INITIAL_DOCTORS;
    // Verify that the official 11 doctors are present
    const hasOfficialDoctors = loadedDoctors.some(d => d.name.includes('Maria J. Gonzalez') || d.name.includes('Luis Guzmán') || d.name.includes('Valerio Dennis'));
    if (!hasOfficialDoctors || loadedDoctors.length < 11) {
      loadedDoctors = INITIAL_DOCTORS;
      saveToStorage('DOCTORS', INITIAL_DOCTORS);
    }

    let loadedAppointments = appointmentsRaw ? (JSON.parse(appointmentsRaw) as Appointment[]) : [];
    // Purge test appointments
    loadedAppointments = loadedAppointments.filter(a => 
      !['apt-1', 'apt-2', 'apt-3', 'apt-4', 'apt-5', 'apt-6'].includes(a.id) &&
      !a.doctorName.includes('Silva Morales') &&
      !a.doctorName.includes('Castillo Bravo') &&
      !a.patientDni.includes('-K') &&
      !a.patientName.includes('Elena Gómez') &&
      !a.patientName.includes('Lucas Benítez')
    );
    saveToStorage('APPOINTMENTS', loadedAppointments);

    let loadedPatients = patientsRaw ? (JSON.parse(patientsRaw) as Patient[]) : [];
    // Purge test patients
    loadedPatients = loadedPatients.filter(p => 
      !['pat-1', 'pat-2', 'pat-3', 'pat-4', 'pat-5', 'pat-6'].includes(p.id) &&
      !p.dni.includes('-K') &&
      !p.phone.startsWith('+56') &&
      !['Elena Gómez Suárez', 'Lucas Benítez Díaz', 'Mateo Valenzuela Rivas', 'Camila Rojas Navarrete', 'Ignacio Tapia Cordero', 'Rosa María Carrasco Silva'].includes(p.fullName)
    );
    saveToStorage('PATIENTS', loadedPatients);

    let loadedIntakes = intakesRaw ? (JSON.parse(intakesRaw) as PatientIntake[]) : [];
    // Purge test intakes
    loadedIntakes = loadedIntakes.filter(i => 
      !['intake-1', 'intake-2', 'intake-3', 'intake-4', 'intake-5'].includes(i.id) &&
      !i.doctorName.includes('Silva Morales') &&
      !i.patientDni.includes('-K') &&
      !i.patientName.includes('Elena Gómez') &&
      !i.patientName.includes('Lucas Benítez')
    );
    saveToStorage('INTAKES', loadedIntakes);

    let loadedUsers = usersRaw ? (JSON.parse(usersRaw) as AppUser[]) : [...INITIAL_USERS];
    // Ensure the 3 core system users (Ivo Hernández, Carlos Flores, Médico 1) always exist and have a password
    for (const defUser of INITIAL_USERS) {
      const existingIdx = loadedUsers.findIndex(u => u.id === defUser.id);
      if (existingIdx === -1) {
        loadedUsers.push(defUser);
      } else if (!loadedUsers[existingIdx].password) {
        loadedUsers[existingIdx] = {
          ...loadedUsers[existingIdx],
          password: defUser.password
        };
      }
    }
    saveToStorage('USERS', loadedUsers);

    const activeUserId =
      activeUserIdRaw && loadedUsers.some(u => u.id === activeUserIdRaw)
        ? activeUserIdRaw
        : INITIAL_USERS[0].id;

    return {
      config: loadedConfig,
      doctors: loadedDoctors,
      patients: loadedPatients,
      appointments: loadedAppointments,
      intakes: loadedIntakes,
      users: loadedUsers,
      activeUserId
    };
  } catch (err) {
    console.error('Error loading data from localStorage, falling back to initial data', err);
    return {
      config: INITIAL_CONFIG,
      doctors: INITIAL_DOCTORS,
      patients: INITIAL_PATIENTS,
      appointments: INITIAL_APPOINTMENTS,
      intakes: INITIAL_INTAKES,
      users: INITIAL_USERS,
      activeUserId: INITIAL_USERS[0].id
    };
  }
};

export const saveToStorage = (key: keyof typeof STORAGE_KEYS, data: unknown) => {
  try {
    if (typeof data === 'string' && key === 'ACTIVE_USER_ID') {
      localStorage.setItem(STORAGE_KEYS[key], data);
    } else {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
    }
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage`, err);
  }
};

export const resetAllToInitial = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('Error clearing localStorage', err);
  }
};

export const exportFullBackup = () => {
  const current = loadStoredData();
  const blob = new Blob([JSON.stringify(current, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ATP_MEDICAL_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
