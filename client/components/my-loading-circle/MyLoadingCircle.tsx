import React from 'react'
import styles from './MyLoadingCircle.module.css'

type Props = {
  type?: 'primary' | 'secondary'
  size?: number | string
}

const MyLoadingCircle = ({ type = 'secondary', size = 32 }: Props) => {
  if (type === 'primary') {
    return (
      <div className={`${styles['lds-dual-ring']} ${styles['primary']}`}>
        <div
          className={styles['lds-dual-ring-main']}
          style={{
            width: size,
            height: size,
          }}
        ></div>
      </div>
    )
  }
  return (
    <div className={styles['lds-dual-ring']}>
      <div
        className={styles['lds-dual-ring-main']}
        style={{
          width: size,
          height: size,
        }}
      ></div>
    </div>
  )
}

export default MyLoadingCircle
