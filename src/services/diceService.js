// src/services/diceService.js
import { db } from './firebase'
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore'


export const rollDice = async ({ campaignId, userId, userName, diceType, modifier = 0 }) => {
  try {
    const rawRoll = Math.floor(Math.random() * diceType) + 1
    const total = rawRoll + modifier

    await addDoc(collection(db, 'dice_rolls'), {
      campaignId,
      userId,
      userName,
      diceType: `d${diceType}`,
      rawRoll,
      modifier,
      total,
      createdAt: serverTimestamp()
    })

    return { success: true, rawRoll, total }
  } catch (error) {
    console.error("Error al registrar la tirada:", error)
    return { success: false, error }
  }
}


export const subscribeToDiceRolls = (campaignId, callback) => {
  const q = query(
    collection(db, 'dice_rolls'),
    where('campaignId', '==', campaignId),
    orderBy('createdAt', 'desc'),
    limit(15)
  )

  return onSnapshot(q, (snapshot) => {
    const rolls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(rolls)
  })
}