import { db } from "../firebase"; // Make sure path is correct
import { collection, query, where, doc, getDoc, getDocs, deleteDoc, updateDoc} from "firebase/firestore";

export const acceptSplit = async (tId: any, users: any, splitAmount: any) => {

        console.log('------- SPLITTING ------- ');
        console.log('SPLIT AMOUNT: ', splitAmount);

        for (const [userid, fullName, paidstatus] of users) {

            if(!paidstatus) {
                const q = query(
                    collection(db, "participants"),
                    where("transactionid", "==", tId),
                    where("userid", "==", userid),
                ); 
    
                try {
                    
                    const querySnapshot = await getDocs(q);
    
                    if (querySnapshot.empty) {
                        console.warn(`No matching documents for user: ${userid}`);
                        continue;
                    }
    
                    const updatePromises = querySnapshot.docs.map((docSnap) => {
                        console.log(`-- Updating document: ${docSnap.id}`);
                        console.log(`-- User: `, fullName.toUpperCase());
                        return updateDoc(docSnap.ref, {
                            amount: splitAmount
                        });
                    });
                    
                    await Promise.all(updatePromises); 
                    console.log('[/] Sakses paps');
                } catch (err) {
                    console.error("Update failed:", err);
                }
                console.log('-------------- ');
            } else {
                console.log("[x] Huh? Paid na ata to si paps: ", fullName.toUpperCase());
                console.log('-------------- ');
                continue;
            }

        }

    };

    export const deleteParticipant = async (id: string) => {
            const confirmed = window.confirm("Are you sure you want to delete this entry?");
            if (!confirmed) return;
    
            try {
                await deleteDoc(doc(db, "participants", id));
                console.log("Deleted");
            } catch (error) {
                console.error("Error deleting:", error);
            }
        };
    
       export const markAsPaid = async (id: string) => {
            try {
                await updateDoc(doc(db, "participants", id), {
                    paidstatus: 1
                });
            } catch (err) {
                console.error("Update failed:", err);
            }
        };
    
       export const undoPayment = async (id: string) => {
            try {
                await updateDoc(doc(db, "participants", id), {
                    paidstatus: 0
                });
            } catch (err) {
                console.error("Update failed:", err);
            }
        };
    
       export const getName = async (userId: string): Promise<string | null> => {
            try {
                const userRef = doc(db, "users", userId!);
                const userSnap = await getDoc(userRef);
    
                if (userSnap.exists()) {
                const userData = userSnap.data();
                return userData.name ?? null;
                } else {
                console.warn("Name not found.");
                return null;
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                return null;
            }
        };
    