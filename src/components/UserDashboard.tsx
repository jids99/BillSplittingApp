import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function UserDashboard() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  console.log('DashboardPage rendered with userId:', userId);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const userDoc = await getDoc(doc(db, 'users', userId));
  //     if (userDoc.exists()) {
  //       setUser(userDoc.data());
  //     }
  //   };

  //   fetchUser();
  // }, [userId]);

  // if (!user) return <p>Loading user...</p>;

  // return (
  //   <div>
  //     <h1>Welcome, {user.name}</h1>
  //   </div>
  // );
}

export default UserDashboard;
