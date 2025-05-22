import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import UserUD from './UserUD';
import Transactions from './Transactions';
import styles from './UserDashboard.module.css';

function UserDashboard() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUser(userDoc.data());
      }
    };

    fetchUser();
  }, [userId]);

  if (!user) return <p>Loading user...</p>;

  return (
    <>
      <div className={styles.dashboardContent}>
        <aside className={styles.header}>
          <h1>Welcome, {user.name}</h1>
          <button onClick={() => navigate(`/`)}> Log out </button>
        </aside>
        
      <div className={styles.body}>
        <Transactions user_id={userId} />

        {user?.name === 'jids' && (
          <div className="admin-panel">
            <UserUD />
          </div>
        )}
      </div>

      
      </div>

    </>
  );

}

export default UserDashboard;
