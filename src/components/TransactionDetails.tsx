import { useEffect, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, doc, getDoc, Timestamp } from "firebase/firestore";
import Modal from 'react-modal';
import TransactionDetailsAdd from './TransactionDetailsAdd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClose } from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';

Modal.setAppElement('#root');


function Transactions({ transaction_id }: any) {
    // const [data, setData] = useState<any[]>([]);
    const [nameLookUp, setData] = useState<Participant[]>([]);
    const [totalData, setTotalData] = useState<any>();
    const q = query(
          collection(db, "participants"),
          where("transactionid", "==", transaction_id),
        );
    const [modalIsOpen, setModalIsOpen] = useState(false);

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
  
    type Participant = {
        id: string;
        transactionid: string;
        userid: string;
        amount: number;
        created: Timestamp;
        fullName: string | null
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const participants: Participant[] = await Promise.all (
                snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const fullName = await getName(data.userid);

                return {
                    id: doc.id,
                    transactionid: data.transactionid,
                    userid: data.userid,
                    amount: data.amount,
                    created: data.created,
                    fullName: (fullName ?? null)
                };
            })
        );
            setData(participants);

            const total = participants.reduce((sum, p) => sum + p.amount, 0);
            setTotalData(total);
            console.log('total: ' + total)
        });
    
        return () => unsubscribe();
      }, 
    []);
    
    return (

        <>
        <table>
            <thead>
                <tr>
                  <th colSpan={4}>
                    <div className={styles.thActions}>
                        <h2>Transaction Details</h2>
                        <button onClick={() => setModalIsOpen(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>
                  </th>
                </tr>
                <tr>
                    <th hidden> Transaction </th>
                    <th> Paid by </th>
                    <th> Amount </th>
                    <th> Status </th>
                    <th> Date </th>
                </tr>
                
            </thead>
            <tbody>
                {nameLookUp.map(item => (
                <tr key={item.id}>
                    <td hidden> {item.transactionid} </td>
                    <td> {item.fullName} </td>
                    <td> {item.amount} </td>
                    <td> </td>
                    <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td>
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
