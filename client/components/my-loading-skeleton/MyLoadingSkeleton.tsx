import React from 'react'
import styles from './MyLoadingSkeleton.module.css'

type Props = {
  className?: string
  style?: React.CSSProperties
}

const MyLoadingSkeleton = ({ className, style }: Props) => {
  return <div className={`${styles.skeleton} ${className}`} style={style}></div>
}

export default MyLoadingSkeleton
