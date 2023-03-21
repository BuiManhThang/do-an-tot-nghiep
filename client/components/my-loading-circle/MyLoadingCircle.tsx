import React from 'react'
import styles from './MyLoadingCircle.module.css'

const MyLoadingCircle = () => {
  return (
    // <div className={styles['loader-circle']}>
    //   <span />
    // </div>
    <div className={styles['lds-dual-ring']}></div>
  )
}

export default MyLoadingCircle
