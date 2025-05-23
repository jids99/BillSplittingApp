import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

type User = {
  id: string;
  name: string;
};

const UserUD: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [editing, setEditing] = useState<User | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("created", "asc")
    );  

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(items);
    });

    return () => unsubscribe();
  }, []);

  const deleteUser = async (id: string) => {

    const confirmed = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "users", id));
      console.log("Goodbye paps ");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await updateDoc(doc(db, "users", editing.id), {
        name: editing.name
      });
      setEditing(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };
  

  return (

    <div>

      <table>
        <thead>
          <tr>
            <th colSpan={3}>
              <h2>Budol Split Users</h2>
            </th>
          </tr>
          <tr>
            <th hidden>ID</th>
            <th>Name</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{new Date(item.created.seconds * 1000).toLocaleString()}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => setEditing(item)}
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button
                  onClick={() => deleteUser(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {editing && (
        <div className="edit-modal">
          <div className="edit-container">
            <h3 className="">Edit </h3>
            <div className="mb-2">
              <label className="block">Name</label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: String(e.target.value) })
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

    </div>
  );
};

export default UserUD;
