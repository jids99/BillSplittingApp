import React, { useState } from "react";
import { db } from "../firebase"; // Adjust path as needed
import { collection, addDoc, Timestamp } from "firebase/firestore";

const RegisterUser: React.FC = () => {
  const [name, setNameInput] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleAdd = async () => {

    try {
      await addDoc(collection(db, "users"), {
        name,
        created: Timestamp.now()
      });
      setStatus("✅ Pasok ka na paps " + name);
      setNameInput("");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      setStatus("❌ Mali");
    }
  };

  return (
    <>
      <div className="card">
          <h2>Wala ka pa?</h2>
          <div className="register-btn-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setNameInput(String(e.target.value))}
              placeholder="Name"
              className="register-name-input"
            />
            <button 
              onClick={handleAdd}
              className="register-name-btn"
            >Register</button>
          </div>

          {status && <p>{status}</p>}
      </div>
      
    </>
  );
};

export default RegisterUser;
