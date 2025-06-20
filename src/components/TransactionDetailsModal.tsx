import { useEffect, useMemo, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, doc, getDoc, Timestamp} from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faUndo, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';
import { acceptSplit, deleteParticipant, markAsPaid, undoPayment, getName  } from './Utils';

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

function TransactionDetailsModal({ transaction_id}: any) {
    const [nameLookUp, setData] = useState<Participant[]>([]);
    const [totalData, setTotalData] = useState<any>();

    const [readableId, setReadableId] = useState<any>();
    const [totalPaid, setTotalPaid] = useState<number>();
    const [totalUnpaid, setTotalUnpaid] = useState<number>();
    const [variance, setVariance] = useState<number>();
    
    const [totalPaidPercent, setTotalPaidPercent] = useState<number>();
    const [totalAccountedPercent, setTotalAccountedPercent] = useState<number>();

    const [transactionAmount, setTransactionAmount] = useState<any>();
    const [totalPerSplitter, setTotalPerSplitter] = useState<number>(0);

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
        const kalahoks = nameLookUp;
        
        // total by transaction
        const totalamount = result?.get("amount");
        const totalpaid = totalPaid ? totalPaid : 0;

        setTransactionAmount(totalamount);

        setReadableId((result ?? null)?.get("rowid"));
        setVariance(totalamount - totalData);
        setTotalUnpaid(totalamount - totalpaid);

        const totalpaidpercent = totalPaid ? (totalpaid / totalamount) * 100 : 0;
        const totalaccountedpercent = totalData ? (totalData / totalamount) * 100 : 0;

        setTotalPaidPercent(Math.round(totalpaidpercent));
        setTotalAccountedPercent(Math.round(totalaccountedpercent));

        // change totalSplitters per condition
        const totalSplitters = kalahoks.filter(item => Number(item.paidstatus) === 0).length;

        // change transactionAmount per condition
        const totalEach = (transactionAmount - totalpaid) / totalSplitters;

        setTotalPerSplitter(Math.round(totalEach));

        };

        fetchRowId();
    }, [transaction_id, totalData, totalPaid, nameLookUp]); 

    const userTuple = [...nameLookUp.values()].map(item => [item.userid, item.fullName, item.paidstatus]);

    return (

        <>
        <table className='modalTable responsive-table'>
            <caption>
                <tr>
                  <td colSpan={6}>
                    <div className={styles.thActions}>
                        <div className='table-title'>
                            <h3>Payers <span className='readable-id'>| {readableId}</span></h3>
                        </div>
                        <div style={{display: 'flex'}}>
                            <button 
                            className={styles.iconBtn}
                            onClick={() => {acceptSplit(transaction_id, userTuple, totalPerSplitter)}}
                            >
                                <FontAwesomeIcon icon={faMoneyBill} />
                                <span className='btn-name'>Split Even</span>
                            </button>
                        </div>
                    </div>
                        <p className='hint' style={{textAlign: 'end'}}> 3. Click mo Add [+] dito naman </p>
                  </td>
                </tr>
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
            
        </>
    )
        
};
    

export default TransactionDetailsModal;
