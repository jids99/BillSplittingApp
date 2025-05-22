import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, orderBy, onSnapshot} from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import RegisterUser from './RegisterUser';
import styles from './Login.module.css';

const UserUD: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();

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

  return (
    <>
      <div className={styles.content}>
        <div className="card">
          <h1>Budol Split Users</h1>
          <div className="login-btn-group">
              {data.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(`/dashboard/${item.id}`)}
              >
                {item.name}
              </button>
              ))}
          </div>
        </div>
        <RegisterUser />
      </div>
      
    </>
  );
};

export default UserUD;
