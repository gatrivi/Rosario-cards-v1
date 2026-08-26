import { isFirebaseConfigured } from '../config/firebase';
import {
  ensureSignedInUser,
  getFirebaseDb,
  getFirebaseStorage,
} from './firebaseClient';

function safePrayerId(prayerId) {
  return String(prayerId || 'clip')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .slice(0, 64) || 'clip';
}

function extensionFor(mimeType = '') {
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('mp3')) return 'mp3';
  return 'webm';
}

/**
 * Upload a user's recording without publishing it into the shared library.
 * Moderation/promotion to shared content is intentionally a separate step.
 */
export async function submitVoiceContribution({
  prayerId,
  blob,
  mimeType,
  label = '',
  mystery = null,
  sequenceIndex = null,
  variantIndex = null,
  voiceLang = null,
}) {
  if (!prayerId || !blob) throw new Error('prayerId y blob requeridos');

  const user = await ensureSignedInUser();
  if (!user) throw new Error('No se pudo identificar al usuario');

  const [storage, db] = await Promise.all([
    getFirebaseStorage(),
    getFirebaseDb(),
  ]);
  if (!storage || !db) throw new Error('Firebase no configurado');

  const safeId = safePrayerId(prayerId);
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const resolvedMime = mimeType || blob.type || 'audio/webm';
  const storagePath = `voice/users/${user.uid}/${safeId}/${stamp}.${extensionFor(resolvedMime)}`;

  const { ref, uploadBytes } = await import('firebase/storage');
  await uploadBytes(ref(storage, storagePath), blob, {
    contentType: resolvedMime,
    customMetadata: {
      ownerUid: user.uid,
      prayerId: String(prayerId),
    },
  });

  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  const recordingRef = await addDoc(collection(db, 'recordings'), {
    ownerUid: user.uid,
    prayerId: String(prayerId),
    label: label || safeId,
    storagePath,
    mimeType: resolvedMime,
    size: blob.size,
    mystery,
    sequenceIndex,
    variantIndex,
    voiceLang,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  return {
    id: recordingRef.id,
    ownerUid: user.uid,
    prayerId,
    storagePath,
    status: 'pending',
  };
}

export async function submitVoiceContributionSoft(opts) {
  if (!isFirebaseConfigured()) return { ok: false, reason: 'no-firebase' };
  try {
    const contribution = await submitVoiceContribution(opts);
    return { ok: true, contribution };
  } catch (error) {
    console.warn('[voiceContribution] upload failed', error);
    return { ok: false, reason: 'upload-failed', error };
  }
}
