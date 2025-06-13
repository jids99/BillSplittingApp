import { db } from "../firebase"; // Make sure path is correct
import { collection, query, where, getDocs, updateDoc} from "firebase/firestore";

export const acceptSplit = async (tId: any, users: any, splitAmount: any) => {

        console.log('------- SPLITTING ------- ');

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