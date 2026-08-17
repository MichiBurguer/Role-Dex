// src/services/characterService.js
import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";

/**
 * Crea una nueva ficha de personaje
 */
export const createCharacter = async (characterData) => {
  try {
    const docRef = await addDoc(collection(db, "characters"), {
      ...characterData,
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCharacterByCampaign = async (campaignId, userId) => {
  try {
    const q = query(
      collection(db, "characters"), 
      where("campaignId", "==", campaignId),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: true, character: null };
    }

    const docData = querySnapshot.docs[0];
    return { success: true, character: { id: docData.id, ...docData.data() } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


export const subscribeToCharacter = (characterId, callback) => {
  const charRef = doc(db, "characters", characterId);
  return onSnapshot(charRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    }
  });
};

/**
 * Actualiza campos específicos de la ficha 
 */
export const updateCharacter = async (characterId, updatedFields) => {
  try {
    const charRef = doc(db, "characters", characterId);
    await updateDoc(charRef, updatedFields);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const subscribeToCampaignCharacters = (campaignId, callback) => {
  const q = query(collection(db, "characters"), where("campaignId", "==", campaignId));
  return onSnapshot(q, (querySnapshot) => {
    const characters = [];
    querySnapshot.forEach((doc) => {
      characters.push({ id: doc.id, ...doc.data() });
    });
    callback(characters);
  });
};