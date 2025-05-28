import { useEffect, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, deleteDoc, doc, updateDoc, getDocs } from "firebase/firestore";
import TransactionDetails from './TransactionDetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClose, faTrash, faPenToSquare} from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';
import TransactionsAdd from './TransactionsAdd';
import Modal from 'react-modal';
import MyBills from './MyBills';

type Transaction = {
  id: string;
  amount: number;
};

function Transactions({ user_id }: any) {
  const [data, setData] = useState<any[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const handleRowClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
    setIsEditModalOpen(false);
  };

  const openEditModal = (data: any) => {
    setIsEditModalOpen(true);
    setIsAddModalOpen(false); 
    setEditing(data);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditing(null);
  };


  const deleteTransaction = async (id: string) => {
      const confirmed = window.confirm("Are you sure you want to delete this entry?");
      if (!confirmed) return;

      const q_delete_participations = query(collection(db, "participants"), where("transactionid", "==", id));
      const snapshot = await getDocs(q_delete_participations);

      try {
          await deleteDoc(doc(db, "transactions", id));
          console.log("Deleted");
      } catch (error) {
          console.error("Error deleting:", error);
      }

      if (snapshot.empty) {
        console.log("No matching participations.");
        return;
      }

      try {
          for (const document of snapshot.docs) {
            await deleteDoc(doc(db, "participants", document.id));
            console.log(`Deleted participation with ID: ${document.id}`);
          }
      } catch (error) {
          console.error("Error deleting:", error);
      }

      setSelectedTransactionId(null);

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

          <MyBills user_id={user_id} />

          <table>
              <thead>
                  <tr>
                    <td colSpan={6}>
                      <div className={styles.thActions}>
                        <div className='table-title'>
                          <h2>Transactions</h2>
                          <p>MGA CNOVER MO</p>
                        </div>
                        <button onClick={openAddModal}>
                        <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>
                        <p className='hint' style={{textAlign: 'end'}}> 1. Click mo Add [+] paps </p>
                    </td>
                  </tr>
                  <tr>
                      <th hidden> ID </th>
                      <th> Transaction </th>
                      <th> Date </th>
                      <th> Amount </th>
                      <th> Status </th>
                      {/* <th> Created </th> */}
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
                      <td> {item.eventDate} </td>
                      <td> ₱ {item.amount} </td>
                      <td> 
                        <div className={item.paidstatus ? 'badge success' : 'badge warning'}>
                            {item.paidstatus ? 'Paid' : 'Unpaid'}
                        </div> 
                      </td>
                      {/* <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td> */}
                      <td >
                        <button
                          className=""
                          onClick={() => openEditModal(item)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                            onClick={() => deleteTransaction(item.id)}
                            className="danger"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  
                  ))
                  
                ) : (
                  <tr><td colSpan={6}>Wala</td></tr>
                )}
                  {/* show all comp */}
                    <td colSpan={6} style={{textAlign: 'end'}}>Show all</td> 
              </tbody>
          </table>

          {selectedTransactionId && (
            <TransactionDetails user={user_id} transaction_id={selectedTransactionId} />
          )}
        </div>

      {/* Modal */}
      {editing && (
        <Modal
            isOpen={isEditModalOpen}
            onRequestClose={closeModals}
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
              <h2>Edit Transaction </h2>
              <button onClick={closeModals}>
                    <FontAwesomeIcon icon={faClose} />
                </button>
            </div>
            <div className="modal-body">
              <div className="modal-content">
                <div className="form-group">
                  <label className="block" htmlFor="amountInput">Amount</label>
                  <input
                    id='amountInput'
                    type="text"
                    value={editing.amount}
                    onChange={(e) =>
                      setEditing({ ...editing, amount: Number(e.target.value) })
                    }
                    className={styles.input}
                  />
                </div>
                <div className="btn-container">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
        </Modal>
      )}

        <Modal
            isOpen={isAddModalOpen}
            onRequestClose={closeModals}
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
                <button onClick={closeModals}>
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
