import { useEffect, useMemo, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, doc, getDoc, Timestamp} from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';
import { acceptSplit } from './Utils';

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

function BillSplit({ transaction_id }: any) {

    const [nameLookUp, setData] = useState<Participant[]>([]);
    const [totalData, setTotalData] = useState<any>();

    const [transactionAmount, setTransactionAmount] = useState<any>();
    const [totalPaid, setTotalPaid] = useState<number>();
    const [variance, setVariance] = useState<number>();

    const [totalPaidPercent, setTotalPaidPercent] = useState<number>();
    const [totalAccountedPercent, setTotalAccountedPercent] = useState<number>();

    const [totalPerSplitter, setTotalPerSplitter] = useState<number>(0);

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

    const q = query(
        collection(db, "participants"),
        where("transactionid", "==", transaction_id),
    );
    
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

          setVariance(transactionAmount - totalData);
  
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
        
            <div className="modal-content">
            <p>
                <span>Total Amount: </span>
                <span>{transactionAmount} </span>
            </p> 
            <p>
                <span>Total Accounted: </span>
                <span>{totalData} ({totalAccountedPercent}%)</span>
            </p> 
            {(variance ?? 0) > 0 ? (
                <p>
                    <span>Total Unaccounted: </span>
                    <span>{variance}</span>
                </p> 
            ) : null}
            <p>
                <span>Total Paid: </span>
                <span>{totalPaid} ({totalPaidPercent}%)</span>
            </p>
            </div>
            <table className='modalTable'>
                <thead>
                    <tr>
                        <th>Billed to</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {nameLookUp && nameLookUp.length ? (
                    nameLookUp.map(item => (
                        <tr key={item.id}>
                            <td>{item.fullName}</td>
                            {item.paidstatus ? (
                                <td>{item.amount}</td>
                            ) : (
                                <td>
                                    <span className='split-even-amount'> 
                                        {String(totalPerSplitter)} {/*NUMBER TO PERO PINAPACAST NI REACT SA STRING? WTHELLY */}
                                    </span> &nbsp;
                                    <span style={{opacity: '.5'}}>
                                        {item.amount} (Prev)
                                    </span>
                                </td>
                            )}
                            <td className={item.paidstatus ? 'badge success' : 'badge warning'}>
                                {item.paidstatus ? 'Paid' : 'Unpaid'}
                            </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan={3}>Wala</td>
                    </tr>
                    )}
                    
                </tbody>
            </table>

            <hr></hr>

            <button
                className="vertical-btn"
                onClick={() => {acceptSplit(transaction_id, userTuple, totalPerSplitter)}}
            >
                <FontAwesomeIcon icon={faSave} />
                Accept
            </button>

          

        </>
    )
        
};

    

export default BillSplit;
