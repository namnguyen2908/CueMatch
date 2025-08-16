import React from 'react';
import styles from './AuthWarningModal.module.css';

const AuthWarningModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon}>⚠️</div>
        <h3 className={styles.title}>You are not logged in</h3>
        <p className={styles.message}>
          Please login to access this content.
        </p>
        <button className={styles.closeBtn} onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
};

export default AuthWarningModal;
