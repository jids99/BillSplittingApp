import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Make sure path is correct
import { collection, getDocs } from "firebase/firestore";

const TestFirestoreConnection: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(docs);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h2>Firestore Connection Test</h2>
      {error && <p style={{ color: "red" }}>❌ Error: {error}</p>}
      {!error && data.length === 0 && <p>✅ Connected, but no documents found in <strong>testCollection</strong>.</p>}
      <ul>
        {data.map(doc => (
          <li key={doc.id}>{JSON.stringify(doc)}</li>
        ))}
      </ul>
    </div>
  );
};

export default TestFirestoreConnection;
