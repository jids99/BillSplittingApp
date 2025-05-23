import { useEffect, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, doc, getDoc, Timestamp, deleteDoc, updateDoc } from "firebase/firestore";
import Modal from 'react-modal';
import TransactionDetailsAdd from './TransactionDetailsAdd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClose, faTrash, faCheck, faUndo } from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';

Modal.setAppElement('#root');

type Participant = {
        id: string;
        transactionid: string;
        userid: string;
        amount: number;
        paidstatus: string;
        created: Timestamp;
        fullName: string | null
    };

function Transactions({ transaction_id }: any) {
    const [nameLookUp, setData] = useState<Participant[]>([]);
    const [totalData, setTotalData] = useState<any>();
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

    useEffect(() => {
        if (!transaction_id) return;
        console.log(transaction_id);

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const participants: Participant[] = await Promise.all (
                snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const fullName = await getName(data.userid);
            console.log(data);

                return {
                    id: doc.id,
                    transactionid: data.transactionid,
                    userid: data.userid,
                    amount: data.amount,
                    paidstatus: data.paidstatus == 1 ? 'Paid' : 'Unpaid',
                    created: data.created,
                    fullName: (fullName ?? null)
                };
            })
        );
            setData(participants);

            const total = participants.reduce((sum, p) => sum + p.amount, 0);
            setTotalData(total);
        });
    
        return () => unsubscribe();
      }, 
    [transaction_id]);
    
    return (

        <>
        <table>
            <thead>
                <tr>
                  <th colSpan={5}>
                    <div className={styles.thActions}>
                        <h2>Transaction Details</h2>
                        {/* <p>{transaction_id}</p> */}
                        <button onClick={() => setModalIsOpen(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>
                  </th>
                </tr>
                <tr>
                    <th hidden> Transaction </th>
                    <th> Billed to </th>
                    <th> Amount </th>
                    <th> Status </th>
                    <th> Date </th>
                    <td></td>
                </tr>
                
            </thead>
            <tbody>
                {nameLookUp.map(item => (
                <tr key={item.id}>
                    <td hidden> {item.transactionid} </td>
                    <td> {item.fullName} </td>
                    <td> {item.amount} </td>
                    <td> {item.paidstatus} </td>
                    <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td>
                    <td>
                        {item.paidstatus == 'Paid' ? (
                            <button
                                onClick={() => undoPayment(item.id)}
                                className="p-2 hover:bg-gray-200 rounded-full"
                            >
                                <FontAwesomeIcon icon={faUndo} />
                            </button>
                        ) : (
                            <button
                                onClick={() => markAsPaid(item.id)}
                                className="p-2 hover:bg-gray-200 rounded-full"
                            >
                                <FontAwesomeIcon icon={faCheck} />
                            </button>
                        )}
                        <button
                            onClick={() => deleteParticipant(item.id)}
                            className="p-2 hover:bg-gray-200 rounded-full"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </td>
                </tr>
                ))}
                <tr>
                    <td colSpan={4}>
                        <hr />
                    </td>
                </tr>
                <tr>
                    <th>Total</th>
                    <th>{totalData}</th>
                    <td colSpan={2}></td>
                </tr>
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
