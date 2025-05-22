import React, { useEffect, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, where } from "firebase/firestore";


function Transactions({ user_id }) {
  const [data, setData] = useState<any[]>([]);

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
                <tr key={item.id}>
                    <td> </td>
                    <td> {item.total} </td>
                    <td> </td>
                    <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td>
                </tr>
                ))}
                
            </tbody>
        </table>
            
        </>
    )
        
};

    

export default Transactions;
