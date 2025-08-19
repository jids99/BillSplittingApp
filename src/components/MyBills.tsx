import { useEffect, useRef, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, doc, getDoc, Timestamp, updateDoc} from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClose, faUndo} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import TransactionHistory from './TransactionHistory';

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
  const [pendingPaid, setPendingPaid] = useState<{ [id: string]: boolean }>({});
  const delayPaid = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const [countdown, setCountdown] = useState<{ [id: string]: number }>({});

  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const intervals = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  
    const [openViewBills, setOpenViewBills] = useState(false);

    const closeModals = () => {
        setOpenViewBills(false);
    };

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
        console.log('Pending payment');
        setPendingPaid(prev => ({ ...prev, [id]: true }));
        setCountdown(prev => ({ ...prev, [id]: 5 }));

        const intervalId = setInterval(() => {
            setCountdown(prev => {
                const newTime = (prev[id] ?? 1) - 1;
                if (newTime <= 0) {
                clearInterval(intervalId);
                return { ...prev, [id]: 0 };
                }
                return { ...prev, [id]: newTime };
            });
            }, 1000);
        intervals.current.set(id, intervalId);

        const timeout = setTimeout(async () => {
            try {
                await updateDoc(doc(db, "participants", id), {
                    paidstatus: 1
                });
                setPendingPaid(prev => {
                    const copy = { ...prev };
                    delete copy[id];
                    return copy;
                });
                setCountdown(prev => {
                    const copy = { ...prev };
                    delete copy[id];
                    return copy;
                });
                delayPaid.current.delete(id);
                console.log('Paid!');
            } catch (err) {
                console.error("Update failed:", err);
            }
        }, 5000);
        delayPaid.current.set(id, timeout);

    };

    const undoPayment = async (id: string) => {
        // try {
        //     await updateDoc(doc(db, "participants", id), {
        //         paidstatus: 0
        //     });
        // } catch (err) {
        //     console.error("Update failed:", err);
        // }

        const timeoutId = timeouts.current.get(id);
        const intervalId = intervals.current.get(id);

        if (timeoutId) clearTimeout(timeoutId);
        if (intervalId) clearInterval(intervalId);

        timeouts.current.delete(id);
        intervals.current.delete(id);

        console.log('Undo payment');
       const timeout = delayPaid.current.get(id);
        if (timeout) {
            clearTimeout(timeout);
            delayPaid.current.delete(id);
        }

        setPendingPaid(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
        setCountdown(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    };

    const q = query(
        collection(db, "participants"),
        where("userid", "==", user_id),
        where("paidstatus", "==", 0)
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
                        {pendingPaid[item.id] ? (
                            <button
                                onClick={() => undoPayment(item.id)}
                                className=" vertical-btn bruh"
                            >
                                <FontAwesomeIcon icon={faUndo} />
                                <span>{countdown[item.id]}s</span>
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
                  <tr><td colSpan={6}>Wala bayarin, sana all</td></tr>
                )}
                  
              </tbody>
              <tfoot>
                <tr>
                    {/* show all comp */}
                    <td colSpan={6} style={{textAlign: 'end'}}>
                        <button 
                        onClick={() => setOpenViewBills(true)}
                        > 
                            Show all 
                        </button>
                    </td> 
                </tr>
              </tfoot>
          </table>

          <Modal
            isOpen={openViewBills}
            onRequestClose={closeModals}
            style={{
            overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
            content: {
                backgroundColor: 'white',
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                padding: '20px',
                borderRadius: '8px',
                clipPath: "polygon(0 10px, 10px 0, 20px 10px, 30px 0, 40px 10px, 50px 0, 60px 10px, 70px 0, 80px 10px, 90px 0, 100px 10px, 100% 0, 100% 100%, 0% 100%)",
            },
            }}
        >

          <div className='receipt-zigzag'>
            <div className='modal-header'>
                <h2>Transaction History </h2>
                <button 
                    onClick={closeModals}
                >
                    <FontAwesomeIcon icon={faClose} />
                </button>
            </div>
            <div className='modal-body'>
                <TransactionHistory user_id={user_id}  />
            </div>
          </div>
        </Modal>
            
        </>
    )
        
};

    

export default MyBills;
