import { useEffect, useMemo, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, doc, getDoc, Timestamp} from "firebase/firestore";
import Modal from 'react-modal';
import TransactionDetailsAdd from './TransactionDetailsAdd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClose, faTrash, faCheck, faUndo, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';
import BillSplit from './BillSplit';
import { deleteParticipant, markAsPaid, undoPayment, getName } from './Utils';

type Participant = {
        id: string;
        transactionid: string;
        userid: string;
        rowid: string | null;
        budolItem: string | null;
        amount: number;
        paidstatus: string;
        created: Timestamp;
        fullName: string | null
    };

function TransactionDetails({ transaction_id }: any) {
    const [nameLookUp, setData] = useState<Participant[]>([]);
    const [totalData, setTotalData] = useState<any>();

    const [readableId, setReadableId] = useState<any>();
    const [budolItem, setBudolItem] = useState<any>();
    const [totalPaid, setTotalPaid] = useState<number>();
    const [totalUnpaid, setTotalUnpaid] = useState<number>();
    const [variance, setVariance] = useState<number>();
    
    const [totalPaidPercent, setTotalPaidPercent] = useState<number>();
    const [totalAccountedPercent, setTotalAccountedPercent] = useState<number>();

    const [addKalahokModalIsOpen, setAddKalahokModalIsOpen] = useState(false);
    const [splitevenModalIsOpen, setSplitevenModalIsOpen] = useState(false);

    const openAddModal = () => {
        setSplitevenModalIsOpen(false);
        setAddKalahokModalIsOpen(true);
    };

    const openSplitModal = () => {
        setSplitevenModalIsOpen(true);
        setAddKalahokModalIsOpen(false);
    };

    const closeModals = () => {
        setSplitevenModalIsOpen(false);
        setAddKalahokModalIsOpen(false);
    };

    const q = query(
          collection(db, "participants"),
          where("transactionid", "==", transaction_id),
        );

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
                    budolItem: (rowId ?? null)?.get("budolItem"),
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
        setBudolItem((result ?? null)?.get("budolItem"));
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
        <table className="responsive-table">
            <caption>
                <div className='table-title'>
                    <h2>
                        {(budolItem) ? (
                            <span className='readable-id' title={readableId} > {budolItem} </span>
                        ) : (
                            <span className='danger-text' title='Walang label no, paps?'>(¬_¬") Bruh.. </span>
                        )}
                        </h2>
                    <p className='table-description'>PAYERS</p>
                </div>
                <div style={{display: 'flex'}}>
                    <button 
                    className={styles.iconBtn}
                    onClick={openSplitModal}
                    >
                        <FontAwesomeIcon icon={faMoneyBill} />
                        <span className='btn-name'>Split Even</span>
                    </button>
                    <button onClick={openAddModal}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
                <p className='hint' style={{textAlign: 'end'}}> 3. Click mo Add [+] dito naman </p>
            </caption>
            <thead>
                <tr>
                    {/* <th hidden> Transaction </th> */}
                    <th> Billed to </th>
                    <th> Amount </th>
                    <th> Status </th>
                    {/* <th> Created </th> */}
                    <td></td>
                </tr>
                
                
            </thead>
            <tbody>
                {nameLookUp && nameLookUp.length ? (
                nameLookUp.map(item => (
                <tr key={item.id}>
                    {/* <td hidden> {item.transactionid} </td> */}
                    <td data-label='Billed to'> {item.fullName} </td>
                    <td data-label='Amount'> ₱ {item.amount} </td>
                    <td data-label='Status'> 
                        <div className={item.paidstatus ? 'badge success' : 'badge warning'}>
                            {item.paidstatus ? 'Paid' : 'Unpaid'}
                        </div> 
                    </td>
                    {/* <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td> */}
                    <td data-label='Actions'>
                        <div className='actionsContainer'>
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
                        </div>
                    </td>
                </tr>
                ))
                ) : (
                  <tr><td colSpan={6}>Wala</td></tr>
                )}
          
                <tr>
                    <td>
                        Total (Accounted): {totalData} ({totalAccountedPercent}%) <br />
                        {(variance ?? 0) > 1 ? (
                            <span>Unaccounted {variance}</span>
                        ) : null}
                    </td>
                </tr>
       
                <tr>
                    <td>
                        Paid: {totalPaid} ({totalPaidPercent}%) <br />
                        {totalUnpaid ? (
                                <span>Unpaid {totalUnpaid} </span>
                        ) : null}
                    </td>
                </tr>
                
            </tbody>
        </table>
                        
        <Modal
            isOpen={addKalahokModalIsOpen}
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
                overflowY: 'auto',
                maxHeight: '80vh',
                border: '0',
                clipPath: "polygon(0 10px, 10px 0, 20px 10px, 30px 0, 40px 10px, 50px 0, 60px 10px, 70px 0, 80px 10px, 90px 0, 100px 10px, 100% 0, 100% 100%, 0% 100%)",
            },
            }}
        >
            <div className='modal-Container'>
                <div className='modal-header'>
                    <h2>Add Kalahok</h2>
                    <button onClick={closeModals}>
                        <FontAwesomeIcon icon={faClose} />
                    </button>
                </div>
                <div className='modal-body'>
                    <TransactionDetailsAdd transaction_id={transaction_id} />
                </div>

            </div>
        </Modal>

        <Modal
            isOpen={splitevenModalIsOpen}
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
            },
            }}
        >
            <div className='modal-header'>
                <div className='modal-title'>
                    <h2>Split Even</h2>
                    <p>{readableId}</p>
                </div>
                <button onClick={closeModals}>
                    <FontAwesomeIcon icon={faClose} />
                </button>
            </div>
            <div className='modal-body'>
                <BillSplit transaction_id={transaction_id} />
            </div>
        </Modal>
            
        </>
    )
        
};
    

export default TransactionDetails;
