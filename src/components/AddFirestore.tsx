import React, { useState } from "react";
import { db } from "../firebase"; // Adjust path as needed
import { collection, addDoc, Timestamp } from "firebase/firestore";

const AddNumbers: React.FC = () => {
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [sum, setSum] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleAdd = async () => {
    const result = num1 + num2;
    setSum(result);

    try {
      await addDoc(collection(db, "calculations"), {
        num1,
        num2,
        result,
        createdAt: Timestamp.now()
      });
      setStatus("✅ Calculation saved to Firestore.");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      setStatus("❌ Failed to save to Firestore.");
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h2>Add Two Numbers & Save to Firestore</h2>
      <input
        type="number"
        value={num1}
        onChange={(e) => setNum1(Number(e.target.value))}
        placeholder="First number"
        style={{ marginRight: "0.5rem" }}
      />
      <input
        type="number"
        value={num2}
        onChange={(e) => setNum2(Number(e.target.value))}
        placeholder="Second number"
        style={{ marginRight: "0.5rem" }}
      />
      <button onClick={handleAdd}>Add & Save</button>

      {sum !== null && (
        <p style={{ marginTop: "1rem" }}>
          <strong>Result:</strong> {sum}
        </p>
      )}
      {status && <p>{status}</p>}
    </div>
  );
};

export default AddNumbers;
