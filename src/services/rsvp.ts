import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export interface RsvpData {
    id: string;
    name: string;
    attendeeCount: number;
    timestamp: any;
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

export const getAllRsvps = async (pageSize: number = 30, lastDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    const rsvpRef = collection(db, "rsvp");
    let q;

    if (lastDoc) {
        q = query(rsvpRef, orderBy("timestamp", "desc"), startAfter(lastDoc), limit(pageSize));
    } else {
        q = query(rsvpRef, orderBy("timestamp", "desc"), limit(pageSize));
    }

    const querySnapshot = await getDocs(q);
    const rsvps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as RsvpData[];

    return {
        rsvps,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
};

export const getTotalAttendeeCount = async () => {
    const rsvpRef = collection(db, "rsvp");
    const querySnapshot = await getDocs(rsvpRef);
    return querySnapshot.docs.reduce((acc, doc) => acc + (doc.data().attendeeCount || 0), 0);
};

export const fetchAllRsvps = async () => {
    const rsvpRef = collection(db, "rsvp");
    const q = query(rsvpRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as RsvpData[];
};
