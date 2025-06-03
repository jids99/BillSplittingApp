import { useEffect, useMemo, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, doc, getDoc, Timestamp, deleteDoc, updateDoc} from "firebase/firestore";
import Modal from 'react-modal';
import TransactionDetailsAdd from './TransactionDetailsAdd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClose, faTrash, faCheck, faUndo } from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';


type Participant = {
        id: string;
        transactionid: string;
        userid: string;
        rowid: string | null;
        amount: number;
        paidstatus: string;
        created: Timestamp;
        fullName: string | null
    };

function Transactions({ transaction_id }: any) {
    const [nameLookUp, setData] = useState<Participant[]>([]);
    const [totalData, setTotalData] = useState<any>();

    const [readableId, setReadableId] = useState<any>();
    const [totalPaid, setTotalPaid] = useState<number>();
    const [totalUnpaid, setTotalUnpaid] = useState<number>();
    const [variance, setVariance] = useState<number>();
    
    const [totalPaidPercent, setTotalPaidPercent] = useState<number>();
    const [totalAccountedPercent, setTotalAccountedPercent] = useState<number>();

    const q = query(
          collection(db, "participants"),
          where("transactionid", "==", transaction_id),
        );
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const deleteParticipant = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this entry?");
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, "participants", id));
            console.log("Deleted");
        } catch (error) {
            console.error("Error deleting:", error);
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

    const getTransaction = async (): Promise<Map<string, any> | null> => {
        try {
            const docRef = doc(db, "transactions", transaction_id); 
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

    useEffect(() => {
        if (!transaction_id) return;

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const participants: Participant[] = await Promise.all (
                snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const fullName = await getName(data.userid);
                    const rowId = await getTransaction();

                return {
                    id: doc.id,
                    transactionid: data.transactionid,
                    userid: data.userid,
                    amount: data.amount,
                    paidstatus: data.paidstatus,
                    created: data.created,
                    rowid: (rowId ?? null)?.get("rowid"),
                    fullName: (fullName ?? null)
                };
            })
        );
            setData(participants);

            // total paid
            const totalpaid = participants.reduce((sum, p) => {
                if(p.paidstatus){
                    return sum + p.amount
                } else {
                    return sum;
                }
                }
            , 0);
            setTotalPaid(totalpaid); 

            // total by participants
            const total = participants.reduce((sum, p) => sum + p.amount, 0);
            setTotalData(total); 
        });
    
        return () => unsubscribe();
      }, 
    [transaction_id]);

    useMemo(() => {
        const fetchRowId = async () => {
        if (!transaction_id) return;

        const result: Map<string, any> | null = await getTransaction();
        // total by transaction
        const totalamount = result?.get("amount");
        const totalpaid = totalPaid ? totalPaid : 0;

        setReadableId((result ?? null)?.get("rowid"));
        setVariance(totalamount - totalData);
        setTotalUnpaid(totalamount - totalpaid);

        const totalpaidpercent = totalPaid ? (totalpaid / totalamount) * 100 : 0;
        const totalaccountedpercent = totalData ? (totalData / totalamount) * 100 : 0;

        setTotalPaidPercent(Math.round(totalpaidpercent));
        setTotalAccountedPercent(Math.round(totalaccountedpercent));

        };

        fetchRowId();
    }, [transaction_id, totalData, totalPaid]); 

    return (

        <>
        <table>
            <thead>
                <tr>
                  <td colSpan={6}>
                    <div className={styles.thActions}>
                        <div className='table-title'>
                            <h2>Payers | {readableId}</h2>
                            <p>MAY UTANG SA IMO</p>
                        </div>
                        <button onClick={() => setModalIsOpen(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>
                        <p className='hint' style={{textAlign: 'end'}}> 3. Click mo Add [+] dito naman </p>
                  </td>
                </tr>
                <tr>
                    <th hidden> Transaction </th>
                    <th> Billed to </th>
                    <th> Amount </th>
                    <th> Status </th>
                    {/* <th> Created </th> */}
                    <td></td>
                </tr>
                
                <tr>
                    <td colSpan={5}>
                        <hr />
                    </td>
                </tr>
                
            </thead>
            <tbody>
                {nameLookUp && nameLookUp.length ? (
                nameLookUp.map(item => (
                <tr key={item.id}>
                    <td hidden> {item.transactionid} </td>
                    <td> {item.fullName} </td>
                    <td> ₱ {item.amount} </td>
                    <td> 
                        <div className={item.paidstatus ? 'badge success' : 'badge warning'}>
                            {item.paidstatus ? 'Paid' : 'Unpaid'}
                        </div> 
                    </td>
                    {/* <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td> */}
                    <td>
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
                        <button
                            onClick={() => deleteParticipant(item.id)}
                            className="danger"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </td>
                </tr>
                ))
                ) : (
                  <tr><td colSpan={6}>Wala</td></tr>
                )}
                <tr>
                    <td colSpan={5}>
                        <hr />
                    </td>
                </tr>
                <tr>
                    <th>Total (Accounted)</th>
                    <th>{totalData}  ({totalAccountedPercent}%)</th>
                    <td colSpan={2}></td>
                </tr>
                {variance ? (
                    <tr className={styles.subtotal}>
                        <td>Unaccounted</td>
                        <td>{variance}</td>
                    </tr>
                ) : null}

                <tr>
                    <td colSpan={5}>
                        <hr />
                    </td>
                </tr>
                <tr>
                    <th>Paid</th>
                    <th>{totalPaid} ({totalPaidPercent}%)</th>
                </tr>
                {totalUnpaid ? (
                    <tr className={styles.subtotal}>
                        <td>Unpaid</td>
                        <td>{totalUnpaid}</td>
                    </tr>
                ) : null}
                
            </tbody>
        </table>
                        

        <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            contentLabel="Example Modal"
            style={{
            overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
            content: {
                backgroundColor: '#242424',
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                padding: '20px',
                borderRadius: '8px',
            },
            }}
        >
            <div className='modal-header'>
                <h2>Add Kalahok</h2>
                <button onClick={() => setModalIsOpen(false)}>
                    <FontAwesomeIcon icon={faClose} />
                </button>
            </div>
            <div className='modal-body'>
                <TransactionDetailsAdd transaction_id={transaction_id} />
            </div>
        </Modal>
            
        </>
    )
        
};
    

export default Transactions;
