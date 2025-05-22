import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";

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

    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h2>Budol Split Users</h2>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th hidden>ID</th>
            <th>Name</th>
            <th>Created Date</th>
            <th></th>
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
                  Edit
                </button>
              </td>
              <td>
                <button
                  onClick={() => deleteUser(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
            <h3 className="text-lg font-semibold mb-4">Edit Calculation</h3>
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
            <div className="flex justify-end gap-2 mt-4">
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
