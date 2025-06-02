import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Adjust path as needed
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import styles from "./Transactions.module.css"

const TransactionDetailsAdd = ({ transaction_id }: any) => {
  const [status, setStatus] = useState<string>("");
  const [amount, setAmountInput] = useState<number>(0);

  

  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "Sino?",
      }));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(e.target.value);
    console.log("Selected User ID:", e.target.value);
  };

  const handleAdd = async () => {

    console.log("User ID:", selectedUserId);
    console.log("Transaction ID:", transaction_id);
    console.log("Amount:", amount);

    try {
      await addDoc(collection(db, "participants"), {
        userid: selectedUserId,
        transactionid: transaction_id,
        amount: amount,
        paidstatus: 0,
        created: Timestamp.now()
      });
      setStatus("✅ Puro ka gastos!");
      setAmountInput(0);
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      setStatus("❌ Mali");
    }
  };

  return (
    <>
      <div className="card">
        <div className="modal-content">
            <div className="form-group">
                <label htmlFor="userSelect">User:</label>
                <select id="userSelect" value={selectedUserId} onChange={handleChange}>
                    <option value="">-- Choose a user --</option>
                    {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.name}
                    </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmountInput(Number(e.target.value))}
                    placeholder="Amount"
                    className={styles.input}
                />
            </div>
                
            
            <button 
                onClick={handleAdd}
                className=""
            >
                Save
            </button>
        </div>
            

          {status && <p>{status}</p>}
      </div>
      
    </>
  );
};

export default TransactionDetailsAdd;
