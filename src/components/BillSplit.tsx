import { useEffect, useState } from 'react';
import { db } from "../firebase"; // Make sure path is correct
import { collection, query, onSnapshot, where, doc, getDoc, Timestamp, updateDoc} from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUndo, faSliders} from '@fortawesome/free-solid-svg-icons';
import styles from './Transactions.module.css';

function BillSplit({ transaction_id }: any) {
  
    return (

        <>
          <p>{transaction_id}</p> 
        </>
    )
        
};

    

export default BillSplit;
