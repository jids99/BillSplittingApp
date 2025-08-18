import { useEffect, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, deleteDoc, doc, updateDoc, getDocs} from "firebase/firestore";
import TransactionDetails from './TransactionDetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClose, faTrash, faPenToSquare} from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';
import TransactionsAdd from './TransactionsAdd';
import Modal from 'react-modal';
import MyBills from './MyBills';

type Transaction = {
  id: string;
  budolItem: string;
  amount: number;
};

function Transactions({ user_id }: any) {
  const [data, setData] = useState<any[] | null>([]);
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

      try {
          await deleteDoc(doc(db, "transactions", id));
          console.log("Deleted");
          setSelectedTransactionId(null);
      } catch (error) {
          console.error("Error deleting:", error);
      }

      const q_delete_participations = query(collection(db, "participants"), where("transactionid", "==", id));
      const snapshot = await getDocs(q_delete_participations);

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
      if (!user_id) return;
        const q = query(
          collection(db, "transactions"),
          where("userid", "==", user_id),
        );  

        const unsubscribe = onSnapshot(q, (snapshot) => {

          if (snapshot.empty) {
            setData([]);
            return;
          }

          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          if (snapshot.empty) return;

          const doc = snapshot.docs[0];
          setSelectedTransactionId(doc.id);
          setData(items);

        });
    
        return () => unsubscribe();
      }, 
    []);

    const handleSave = async () => {
      if (!editing) return;
      try {
        await updateDoc(doc(db, "transactions", editing.id), {
          budolItem: editing.budolItem,
          amount: editing.amount
        });
        setEditing(null);
      } catch (err) {
        console.error("Update failed:", err);
      }
    };

    const handleAddedTransaction = (id: any) => {
      setSelectedTransactionId(id);
    };
    
    return (

        <>

        <div className={styles.transactionsContainer}>

          <div className='tableContainer'>
            <MyBills user_id={user_id} />
          </div>
          <div className='tableContainer'>
            <table className="responsive-table">
              <caption>
                <div className='table-title'>
                  <h2>Transactions</h2>
                  <p className='table-description'>MGA CNOVER MO</p>
                </div>
                <button onClick={openAddModal}>
                <FontAwesomeIcon icon={faPlus} />
                </button>
                <p className='hint' style={{textAlign: 'end'}}> 1. Click mo Add [+] paps </p>
              </caption>
                <thead>
                    
                    <tr>
                        {/* <th hidden> ID </th> */}
                        {/* <th> Transaction </th> */}
                        <th> Item </th>
                        <th> Date </th>
                        <th> Amount </th>
                        {/* <th> Status </th> */}
                        {/* <th> Created </th> */}
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='hint'>
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
                      {/* <td hidden>{item.id}</td> */}
                        {/* <td data-label='ID'> {item.rowid} </td> */}
                        <td data-label='Item' title={item.rowid}> 
                          {(item.budolItem) ? (
                            <span className='readable-id' title={item.rowid} > {item.budolItem} </span>
                          ) : (
                              <b className='danger-text'> (¬_¬") </b>
                          )}
                        </td>
                        <td data-label='Date'> {item.eventDate} </td>
                        <td data-label='Amount'> ₱ {item.amount} </td>
                        {/* <td data-label='Status'> 
                          <div className={item.paidstatus ? 'badge success' : 'badge warning'}>
                              {item.paidstatus ? 'Paid' : 'Unpaid'}
                          </div> 
                        </td> */}
                        {/* <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td> */}
                        <td data-label='Actions' >
                          <div className='actionsContainer'>
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
                          </div>
                        </td>
                      </tr>
                    
                    ))
                    
                  ) : (
                    <tr><td colSpan={6}>Wala</td></tr>
                  )}
                  
                </tbody>
                <tfoot>
                  <tr>
                    {/* show all comp */}
                    {/* <td colSpan={6} style={{textAlign: 'end'}}>Show all</td>  */}
                  </tr>
                </tfoot>
            </table>
          </div>

          {selectedTransactionId && (
            <div className='tableContainer'>
              <TransactionDetails user={user_id} transaction_id={selectedTransactionId} isCalledOnModal={false}/>
            </div>
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
                backgroundColor: 'white',
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                padding: '20px',
                borderRadius: '8px',
                clipPath: "polygon(0 10px, 10px 0, 20px 10px, 30px 0, 40px 10px, 50px 0, 60px 10px, 70px 0, 80px 10px, 90px 0, 100px 10px, 100% 0, 100% 100%, 0% 100%)",
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
                  <label htmlFor="budolIetmInput">Budol Item</label>
                  <input
                      id="budolIetmInput"
                      type="text"
                      value={editing.budolItem}
                      onChange={(e) =>
                        setEditing({ ...editing, budolItem: String(e.target.value) })
                      }
                      placeholder="Yung binili mo"
                      className={styles.input}
                  />
                </div>
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
                backgroundColor: 'white',
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                padding: '20px',
                borderRadius: '8px',
                clipPath: "polygon(0 10px, 10px 0, 20px 10px, 30px 0, 40px 10px, 50px 0, 60px 10px, 70px 0, 80px 10px, 90px 0, 100px 10px, 100% 0, 100% 100%, 0% 100%)",
            },
            }}
        >

          <div className='receipt-zigzag'>
            <div className='modal-header'>
                <h2>Add Budol</h2>
                <button onClick={closeModals}>
                    <FontAwesomeIcon icon={faClose} />
                </button>
            </div>
            <div className='modal-body'>
                <TransactionsAdd user_id={user_id} onAddSuccess={handleAddedTransaction}/>
            </div>
          </div>
        </Modal>
            
        </>
    )
        
};

    

export default Transactions;
