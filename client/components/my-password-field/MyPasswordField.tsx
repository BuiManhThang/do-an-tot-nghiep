import React, { useState } from 'react'
import MyTextField from '../my-text-field/MyTextField'

type MyPasswordFieldProps = {
  id: string
  name?: string
  label?: string
  value?: string
  error?: string
  autoComplete?: string
  className?: string
  inputStyle?: React.CSSProperties
  required?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const MyPasswordField = ({
  id,
  name,
  label,
  value,
  error,
  autoComplete = 'off',
  className,
  inputStyle,
  required = false,
  onChange,
}: MyPasswordFieldProps) => {
  const [inputType, setInputType] = useState<string>('password')

  let endIcon = <i className="fa-solid fa-eye text-gray-500 cursor-pointer"></i>
  if (inputType === 'text') {
    endIcon = <i className="fa-solid fa-eye-slash text-gray-500 cursor-pointer"></i>
  }

  const handleClickEndIcon = () => {
    if (inputType === 'password') {
      setInputType('text')
      return
    }
    setInputType('password')
  }

  return (
    <MyTextField
      id={id}
      name={name}
      label={label}
      error={error}
      type={inputType}
      autoComplete={autoComplete}
      className={className}
      inputStyle={inputStyle}
      required={required}
      endIcon={endIcon}
      value={value}
      onChange={onChange}
      onClickEndIcon={handleClickEndIcon}
    />
  )
}

export default MyPasswordField
