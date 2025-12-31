import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore";

export interface RsvpData {
    name: string;
    attendeeCount: number;
    timestamp: Date;
}

export const checkExistingRsvp = async (name: string) => {
    const rsvpRef = collection(db, "rsvp");
    const q = query(rsvpRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null;
};

export const updateRsvp = async (docId: string, attendeeCount: number) => {
    const rsvpDoc = doc(db, "rsvp", docId);
    await updateDoc(rsvpDoc, {
        attendeeCount,
        timestamp: Timestamp.now()
    });
};

export const submitRsvp = async (name: string, attendeeCount: number) => {
    const rsvpRef = collection(db, "rsvp");
    await addDoc(rsvpRef, {
        name,
        attendeeCount,
        timestamp: Timestamp.now()
    });
};

