import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import firebaseConfigRaw from '../../firebase-applet-config.json';

// Support both embedded firebase-applet-config.json and optional Vercel environment variables
const rawConfig = firebaseConfigRaw as Record<string, string | undefined>;
const firebaseConfig = {
  projectId: (import.meta.env?.VITE_FIREBASE_PROJECT_ID as string) || rawConfig.projectId || '',
  appId: (import.meta.env?.VITE_FIREBASE_APP_ID as string) || rawConfig.appId || '',
  apiKey: (import.meta.env?.VITE_FIREBASE_API_KEY as string) || rawConfig.apiKey || '',
  authDomain: (import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN as string) || rawConfig.authDomain || '',
  firestoreDatabaseId:
    (import.meta.env?.VITE_FIREBASE_DATABASE_ID as string) ||
    rawConfig.firestoreDatabaseId ||
    'ai-studio-atpmedicalgestin-28a46342-2ed6-4153-bfff-caf2f7cb89ba',
  storageBucket: (import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET as string) || rawConfig.storageBucket || '',
  messagingSenderId: (import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || rawConfig.messagingSenderId || '',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore using the provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google OAuth Provider configured with Gmail Send scope (Least Privilege)
export const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope(GMAIL_SEND_SCOPE);

// In-memory cache for the Google OAuth access token (never persisted in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let cachedTokenExpiry = 0;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedAccessToken = null;
    cachedTokenExpiry = 0;
  }
});

export function hasActiveGmailToken(): boolean {
  return Boolean(cachedAccessToken && Date.now() < cachedTokenExpiry);
}

export function getConnectedGoogleEmail(): string | null {
  return auth.currentUser?.email || null;
}

/**
 * Initiates Google Sign-In popup requesting permission to send emails via Gmail API.
 */
export async function connectGmailAccount(loginHint?: string): Promise<{
  accessToken: string;
  email: string;
}> {
  const provider = new GoogleAuthProvider();
  provider.addScope(GMAIL_SEND_SCOPE);
  if (loginHint && loginHint.trim()) {
    provider.setCustomParameters({
      login_hint: loginHint.trim(),
      prompt: 'consent'
    });
  } else {
    provider.setCustomParameters({
      prompt: 'consent'
    });
  }

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken || null;

  if (!token) {
    throw new Error('No se pudo obtener el permiso de envío de Gmail. Intente nuevamente.');
  }

  cachedAccessToken = token;
  // Google OAuth access tokens are valid for ~3600s; cache for 50 minutes in memory
  cachedTokenExpiry = Date.now() + 50 * 60 * 1000;

  return {
    accessToken: token,
    email: result.user.email || loginHint || ''
  };
}

/**
 * Returns a valid in-memory Google OAuth access token, or requests authorization via popup if expired/missing.
 */
export async function getValidGmailAccessToken(loginHint?: string): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedTokenExpiry) {
    return cachedAccessToken;
  }
  const { accessToken } = await connectGmailAccount(loginHint);
  return accessToken;
}

export async function disconnectGmailAccount(): Promise<void> {
  cachedAccessToken = null;
  cachedTokenExpiry = 0;
  await signOut(auth);
}

/**
 * Encodes a UTF-8 string into Base64 for MIME headers/parts.
 */
function encodeUtf8Base64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Encodes a UTF-8 string into URL-safe Base64 (base64url) required by Gmail API raw messages.
 */
function encodeBase64Url(str: string): string {
  return encodeUtf8Base64(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email directly from inside the app using the Gmail REST API
 * (`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`),
 * optionally attaching an official PDF report.
 */
export async function sendEmailViaGmailApi(params: {
  to: string;
  subject: string;
  bodyText: string;
  fromName?: string;
  loginHint?: string;
  pdfAttachment?: {
    filename: string;
    base64Content: string; // raw base64 without data:application/pdf;base64, prefix
  };
}): Promise<{ id: string; threadId: string; senderEmail: string }> {
  const token = await getValidGmailAccessToken(params.loginHint);
  const senderEmail = auth.currentUser?.email || params.loginHint || 'me';

  const boundary = `atp_medical_boundary_${Date.now()}`;
  const encodedSubject = `=?UTF-8?B?${encodeUtf8Base64(params.subject)}?=`;
  const fromHeader = params.fromName
    ? `"${params.fromName.replace(/"/g, '')}" <${senderEmail}>`
    : senderEmail;

  let mimeMessage = '';

  if (params.pdfAttachment && params.pdfAttachment.base64Content) {
    const cleanFilename = params.pdfAttachment.filename.replace(/["\r\n]/g, '');
    mimeMessage = [
      `From: ${fromHeader}`,
      `To: ${params.to.trim()}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      encodeUtf8Base64(params.bodyText),
      '',
      `--${boundary}`,
      `Content-Type: application/pdf; name="${cleanFilename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${cleanFilename}"`,
      '',
      params.pdfAttachment.base64Content,
      '',
      `--${boundary}--`
    ].join('\r\n');
  } else {
    mimeMessage = [
      `From: ${fromHeader}`,
      `To: ${params.to.trim()}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      encodeUtf8Base64(params.bodyText)
    ].join('\r\n');
  }

  const raw = encodeBase64Url(mimeMessage);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  if (response.status === 401 || response.status === 403) {
    // Clear expired/insufficient token and retry once with fresh consent
    cachedAccessToken = null;
    cachedTokenExpiry = 0;
    const freshToken = await getValidGmailAccessToken(params.loginHint);
    const retryResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${freshToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw })
    });
    if (!retryResponse.ok) {
      const errData = await retryResponse.json().catch(() => ({}));
      throw new Error(
        errData?.error?.message ||
          `Error al enviar correo con Gmail (${retryResponse.status}). Verifique el permiso de envío.`
      );
    }
    const data = await retryResponse.json();
    return {
      id: data.id,
      threadId: data.threadId,
      senderEmail: auth.currentUser?.email || senderEmail
    };
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData?.error?.message || `Error al enviar el correo (${response.status}).`
    );
  }

  const data = await response.json();
  return {
    id: data.id,
    threadId: data.threadId,
    senderEmail: auth.currentUser?.email || senderEmail
  };
}

// Validation of server connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Firestore: Connected to server successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore: Client appears offline, will sync when reconnected.');
    }
    return false;
  }
}

