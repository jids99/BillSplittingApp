import { useState } from "react";
import { db } from "../firebase"; // Adjust path as needed
import { collection, addDoc, Timestamp } from "firebase/firestore";
import styles from "./Transactions.module.css"
import TransactionDetailsAdd from "./TransactionDetailsAdd";

const TransactionsAdd = ({ user_id, onAddSuccess }: any) => {
  const [status, setStatus] = useState<string>("");
  const [generatedId, setGeneratedId] = useState<string>("");
  const [amount, setAmountInput] = useState<number>(0);

  const [eventDate, setEventDateInput] = useState(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });

  const [modalStep, setModalStep] = useState(1); // Track current content step
  
  const handleNext = () => setModalStep(2);
  // const handleBack = () => setModalStep(1);

  const handleAdd = async () => {

    try {
      const docRef = await addDoc(collection(db, "transactions"), {
        rowid: `TR${Date.now()}`,
        userid: user_id,
        amount: amount,
        eventDate: eventDate,
        paidstatus: 0,
        created: Timestamp.now()
      });

      setGeneratedId(docRef.id);
      onAddSuccess(docRef.id);
      
      console.log('Saved! id: ', docRef.id);
      // setStatus("✅ Saved!");
      setAmountInput(0);
      handleNext();
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      setStatus("❌ Mali");
    }
  };


  return (
    <>
    {modalStep === 1 && (
        <div className="modal-content">
            <div className="form-group">
                <label htmlFor="amountInput">Date</label>
                <input
                    id="eventDateInput"
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDateInput(e.target.value)}
                    placeholder="Amount"
                    className={styles.input}
                />
            </div>
            <div className="form-group">
                <label htmlFor="amountInput">Amount</label>
                <input
                    id="amountInput"
                    type="text"
                    value={amount}
                    onChange={(e) => setAmountInput(Number(e.target.value))}
                    placeholder="Amount"
                    className={styles.input}
                />
            </div>

            <div className="modal-footer">
              <button 
                  onClick={handleAdd}
                  className=""
              >
                  Next
              </button>
              
            </div>
            
          {status && <p>{status}</p>}
        </div>
    )}

    {modalStep === 2 && (
      <TransactionDetailsAdd transaction_id={generatedId}/>
    )}
      
    </>
  );
};

export default TransactionsAdd;
