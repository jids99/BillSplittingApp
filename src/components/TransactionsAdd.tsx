import { useState } from "react";
import { db } from "../firebase"; // Adjust path as needed
import { collection, addDoc, Timestamp } from "firebase/firestore";
import styles from "./Transactions.module.css"

const TransactionsAdd = ({ user_id }: any) => {
  const [status, setStatus] = useState<string>("");
  const [amount, setAmountInput] = useState<number>(0);


  const handleAdd = async () => {

    try {
      await addDoc(collection(db, "transactions"), {
        rowid: `TR${Date.now()}`,
        userid: user_id,
        amount: amount,
        paidstatus: 0,
        created: Timestamp.now()
      });
      setStatus("✅ Ayan na nga");
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
                <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmountInput(Number(e.target.value))}
                    placeholder="Amount"
                    className={styles.amountInput}
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

export default TransactionsAdd;
