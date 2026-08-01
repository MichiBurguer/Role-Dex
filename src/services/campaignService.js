// src/services/campaignService.js
import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  arrayUnion, 
  doc, 
  updateDoc 
} from "firebase/firestore";

/**
 * Genera un código aleatorio de 6 caracteres para invitar jugadores
 */
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Crea una nueva campaña en Firestore
 */
export const createCampaign = async (name, description, dmId) => {
  try {
    const inviteCode = generateInviteCode();
    const docRef = await addDoc(collection(db, "campaigns"), {
      name,
      description,
      dmId,
      inviteCode,
      playerIds: [dmId],
      createdAt: new Date()
    });

    return { success: true, id: docRef.id, inviteCode };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Une un jugador a una campaña mediante un código de invitación
 */
export const joinCampaignByCode = async (inviteCode, userId) => {
  try {
    const q = query(collection(db, "campaigns"), where("inviteCode", "==", inviteCode.trim().toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: "El código de invitación no existe." };
    }

    const campaignDoc = querySnapshot.docs[0];
    const campaignRef = doc(db, "campaigns", campaignDoc.id);

    // Agregar el ID del usuario al array de jugadores
    await updateDoc(campaignRef, {
      playerIds: arrayUnion(userId)
    });

    return { success: true, campaignId: campaignDoc.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Obtiene todas las campañas donde el usuario es DM o Jugador
 */
export const getUserCampaigns = async (userId) => {
  try {
    const q = query(collection(db, "campaigns"), where("playerIds", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    
    const campaigns = [];
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, campaigns };
  } catch (error) {
    return { success: false, error: error.message };
  }
};