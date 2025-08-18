import { useEffect, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, doc, getDoc, Timestamp, updateDoc} from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUndo, faSliders} from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';

type Transaction = {
    id: string;
    transactionid: string;
    eventDate: string;
    amount: number;
    paidstatus: number;
    created: Timestamp;
    rowid: string | null;
    budolItem: string | null;
    fullName: string | null
    billerName: string | null
};

function MyBills({ user_id }: any) {
  const [data, setData] = useState<any[]>([]);

    const getTransaction = async (transaction_id: any): Promise<Map<string, any> | null> => {
        try {
            const docRef = doc(db, "transactions", transaction_id); // ✅ points to a document
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
            return new Map(Object.entries(docSnap.data()));
            } else {
            console.warn("Transaction not found.");
            return null;
            }
        } catch (error) {
            console.error("Error fetching transaction:", error);
            return null;
        }
    };

    const getName = async (userId: string): Promise<string | null> => {
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

    const markAsPaid = async (id: string) => {
        try {
            await updateDoc(doc(db, "participants", id), {
                paidstatus: 1
            });
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const undoPayment = async (id: string) => {
        try {
            await updateDoc(doc(db, "participants", id), {
                paidstatus: 0
            });
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const q = query(
        collection(db, "participants"),
        where("userid", "==", user_id),
    );

    useEffect(() => {
        if (!user_id) return;

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const transactions: Transaction[] = await Promise.all (
                snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const transaction = await getTransaction(data.transactionid);
                    const fullName = await getName(data.userid);

                    const billerid = (transaction ?? null)?.get("userid");
                    const billerName = await getName(billerid);

                return {
                    id: doc.id,
                    transactionid: data.transactionid,
                    eventDate: (transaction ?? null)?.get("eventDate"),
                    amount: data.amount,
                    created: data.created,
                    paidstatus: data.paidstatus,
                    rowid: (transaction ?? null)?.get("rowid"),
                    budolItem: (transaction ?? null)?.get("budolItem"),
                    fullName: (fullName ?? null),
                    billerName: (billerName ?? null),
                };
            })
        );
            setData(transactions);

        });
    
        return () => unsubscribe();
        }, 
    [user_id]);

    return (

        <>
          <table className="responsive-table">
            
            <caption>
                <div className='table-title'>
                    <h2>My Bills</h2>
                    <p className='table-description'>MGA BAYARIN MO</p>
                </div>
                {/* <button className={styles.iconBtn}>
                    <FontAwesomeIcon icon={faSliders} /> 
                    Filter
                </button> */}
            </caption>
            
              <thead>
                
                  <tr>
                      {/* <th hidden> ID </th> */}
                      {/* <th> Transaction </th> */}
                      <th> Item </th>
                      <th> Biller </th>
                      <th> Date </th>
                      <th> Amount </th>
                      <th> Status </th>
                      {/* <th> Created </th> */}
                      <td></td>
                  </tr>
              </thead>
              <tbody>

                {data && data.length ? (
                  
                  data.map(item => (
                  <tr 
                  key={item.id}
                  >
                    {/* <td hidden>{item.id}</td> */}
                      {/* <td data-label="ID"> {item.rowid} </td> */}
                      <td data-label="Item" title={item.rowid}> 
                         {(item.budolItem) ? (
                            <span className='readable-id' title={item.rowid} > {item.budolItem} </span>
                          ) : (
                              <b className='danger-text'> (¬_¬") </b>
                          )}
                    </td>
                      <td data-label="Biller"> {item.billerName} </td>
                      <td data-label="Date"> {item.eventDate} </td>
                      <td data-label="Amount"> ₱ {item.amount} </td>
                      <td data-label="Status"> 
                        <div className={item.paidstatus ? 'badge success' : 'badge warning'}>
                            {item.paidstatus ? 'Paid' : 'Unpaid'}
                        </div> 
                      </td>
                      {/* <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td> */}
                      <td data-label="Actions">
                        {item.paidstatus ? (
                            <button
                                onClick={() => undoPayment(item.id)}
                                className="bruh"
                            >
                                <FontAwesomeIcon icon={faUndo} />
                            </button>
                        ) : (
                            <button
                                onClick={() => markAsPaid(item.id)}
                                className="success"
                            >
                                <FontAwesomeIcon icon={faCheck} />
                            </button>
                        )}
                      </td>
                    </tr>
                  
                  ))
                  
                ) : (
                  <tr><td colSpan={6}>Wala</td></tr>
                )}
                  
              </tbody>
              <tfoot>
                <tr>
                    {/* show all comp */}
                    {/* <td colSpan={6} style={{textAlign: 'end'}}>Show all</td>  */}
                </tr>
              </tfoot>
          </table>
            
        </>
    )
        
};

    

export default MyBills;
