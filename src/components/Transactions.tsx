import { useEffect, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import TransactionDetails from './TransactionDetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClose, faTrash, faPenToSquare} from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';
import TransactionsAdd from './TransactionsAdd';
import Modal from 'react-modal';

type Transaction = {
  id: string;
  amount: number;
};

function Transactions({ user_id }: any) {
  const [data, setData] = useState<any[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const handleRowClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
  };

  const deleteTransaction = async (id: string) => {
      const confirmed = window.confirm("Are you sure you want to delete this entry?");
      if (!confirmed) return;

      try {
          await deleteDoc(doc(db, "transactions", id));
          console.log("Deleted");
      } catch (error) {
          console.error("Error deleting:", error);
      }
  };

    useEffect(() => {
        const q = query(
          collection(db, "transactions"),
          where("userid", "==", user_id),
        );  
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData(items);
        });
    
        return () => unsubscribe();
      }, 
    []);

    const handleSave = async () => {
        if (!editing) return;
        try {
          await updateDoc(doc(db, "transactions", editing.id), {
            amount: editing.amount
          });
          setEditing(null);
        } catch (err) {
          console.error("Update failed:", err);
        }
      };
      
    
    return (

        <>
        <div className={styles.transactionsContainer}>
          <table>
              <thead>
                  <tr>
                    <td colSpan={5}>
                      <div className={styles.thActions}>
                        <h2>Binayaran mo</h2>
                        <button onClick={() => setModalIsOpen(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>
                        <p className='hint' style={{textAlign: 'end'}}> 1. Click mo Add [+] paps </p>
                    </td>
                  </tr>
                  <tr>
                      <th hidden> ID </th>
                      <th> Transaction </th>
                      <th> Amount </th>
                      <th> Status </th>
                      <th> Date </th>
                      <td></td>
                  </tr>
              </thead>
              <tbody>
                <tr>
                    <td>
                        <p className='hint' style={{textAlign: 'end'}}> 
                          2. Tapos click ka isa dito 
                        </p>
                      </td>
                  </tr>

                {data && data.length ? (
                  
                  data.map(item => (
                  <tr 
                  key={item.id}
                  onClick={() => handleRowClick(item.id)}
                  >
                    <td hidden>{item.id}</td>
                      <td> {item.rowid} </td>
                      <td> {item.amount} </td>
                      <td> {item.paidstatus ? 'Paid' : 'Unpaid'} </td>
                      <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td>
                      <td>
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() => setEditing(item)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                            onClick={() => deleteTransaction(item.id)}
                            className="p-2 hover:bg-gray-200 rounded-full"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  
                  ))
                  
                ) : (
                  <tr><td colSpan={5}>Wala</td></tr>
                )}
               
                  
              </tbody>
          </table>

          {selectedTransactionId && (
            <TransactionDetails user={user_id} transaction_id={selectedTransactionId} />
          )}
        </div>

        {/* Modal */}
      {editing && (
        
        <div className="edit-modal">
          <div className="edit-container">
            <h3 className="">Edit </h3>
            <div className="mb-2">
              <label className="block">Amount</label>
              <input
                type="text"
                value={editing.amount}
                onChange={(e) =>
                  setEditing({ ...editing, amount: Number(e.target.value) })
                }
                className="border w-full px-2 py-1 rounded"
              />
            </div>
            <div className="btn-container">
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
                <TransactionsAdd user_id={user_id} />
            </div>
        </Modal>
            
        </>
    )
        
};

    

export default Transactions;
