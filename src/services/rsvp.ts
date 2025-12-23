import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";

export interface RsvpData {
    name: string;
    attendeeCount: number;
    timestamp: Date;
}

export const submitRsvp = async (name: string, attendeeCount: number) => {
    const rsvpRef = collection(db, "rsvp");

    // Check for duplicates
    const q = query(rsvpRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        throw new Error("이미 등록된 이름입니다.");
    }

    await addDoc(rsvpRef, {
        name,
        attendeeCount,
        timestamp: Timestamp.now()
    });
};
