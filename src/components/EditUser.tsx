import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // adjust path
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

type Calculation = {
  id: string;
  num1: number;
  num2: number;
  result: number;
};

const EditableCalculations: React.FC = () => {
  const [data, setData] = useState<Calculation[]>([]);
  const [editing, setEditing] = useState<Calculation | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "calculations"), (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Calculation, "id">),
      }));
      setData(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    try {
      await updateDoc(doc(db, "calculations", editing.id), {
        num1: editing.num1,
        num2: editing.num2,
        result: editing.num1 + editing.num2,
      });
      setEditing(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="p-4 font-sans">
      <h2 className="text-xl font-bold mb-4">Calculations</h2>
      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Num 1</th>
            <th className="border px-4 py-2">Num 2</th>
            <th className="border px-4 py-2">Result</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((calc) => (
            <tr key={calc.id}>
              <td className="border px-4 py-2">{calc.num1}</td>
              <td className="border px-4 py-2">{calc.num2}</td>
              <td className="border px-4 py-2">{calc.result}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => setEditing(calc)}
                >
                  Edit
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
              <label className="block">Num 1</label>
              <input
                type="number"
                value={editing.num1}
                onChange={(e) =>
                  setEditing({ ...editing, num1: Number(e.target.value) })
                }
                className="border w-full px-2 py-1 rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block">Num 2</label>
              <input
                type="number"
                value={editing.num2}
                onChange={(e) =>
                  setEditing({ ...editing, num2: Number(e.target.value) })
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

export default EditableCalculations;
