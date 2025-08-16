import React from 'react'
import { Helmet } from 'react-helmet'
import styles from "../css/NotFound.module.css"

const NotFound = () => {
  return (
    <div className={styles['not-found-container1']}>
      <Helmet>
        <title>404 - Not Found</title>
      </Helmet>
      <h3>OOPS! PAGE NOT FOUND</h3>
      <div className={styles['not-found-container2']}>
        <h1 className={styles["not-found-text2"]}>404</h1>
      </div>
      <div className={styles["not-found-container3"]}>
        <h2 className={styles["not-found-text3"]}>
          WE ARE SORRY, BUT THE PAGE YOU REQUESTED WAS NOT FOUND
        </h2>
      </div>
    </div>
  )
}

export default NotFound
