import { useEffect, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where } from "firebase/firestore";
import TransactionDetails from './TransactionDetails';
import styles from './Transactions.module.css';


function Transactions({ user_id }: any) {
  const [data, setData] = useState<any[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const handleRowClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
  };

    useEffect(() => {
        const q = query(
          collection(db, "transactions"),
          where("userid", "==", user_id),
        );  
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setData(items);
        });
    
        return () => unsubscribe();
      }, 
    []);
    
    return (

        <>
        <div className={styles.transactionsContainer}>
          <table>
              <thead>
                  <tr>
                    <th colSpan={4}>
                      <h2>Transactions</h2>
                    </th>
                  </tr>
                  <tr>
                      <th> Transaction </th>
                      <th> Amount </th>
                      <th> Status </th>
                      <th> Date </th>
                  </tr>
              </thead>
              <tbody>
                  {data.map(item => (
                  <tr 
                  key={item.id}
                  onClick={() => handleRowClick(item.id)}
                  >
                      <td> {item.id} </td>
                      <td> {item.total} </td>
                      <td> </td>
                      <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td>
                  </tr>
                  ))}
                  
              </tbody>
          </table>

          {selectedTransactionId && (
            <TransactionDetails user={user_id} transaction_id={selectedTransactionId} />
          )}
        </div>
            
        </>
    )
        
};

    

export default Transactions;
