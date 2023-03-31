import React from 'react'

type MyCheckboxProps = {
  id: string
  name?: string
  label?: string
  value?: string
  checked?: boolean
  className?: string
  size?: 'small' | 'medium'
  style?: React.CSSProperties
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const MyCheckbox = ({
  id,
  name,
  label,
  value,
  checked = false,
  className,
  size = 'medium',
  style,
  onChange,
}: MyCheckboxProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChange === 'function') {
      onChange(e)
    }
  }

  return (
    <div className={`flex items-center group ${className}`} style={style}>
      <div
        className={`relative flex-shrink-0 ${size === 'small' ? 'w-[18px] h-[18px]' : 'w-6 h-6'}`}
      >
        <label
          htmlFor={id}
          className={`w-full h-full cursor-pointer flex items-center justify-center border transition-all ring-primary-ring ${
            checked
              ? 'bg-primary border-primary text-white rotate-0'
              : 'bg-white border-gray-400 text-white rotate-90'
          } ${
            size === 'small' ? 'rounded text-sm' : 'rounded-md'
          } group-hover:border-primary group-focus-within:border-primary group-focus-within:ring-2`}
        >
          <i className="fa-solid fa-check"></i>
        </label>
        <input
          className="absolute w-1 h-1 top-0 left-0 opacity-0"
          type="checkbox"
          name={name}
          id={id}
          value={value}
          checked={checked}
          onChange={handleChange}
        />
      </div>
      {label && (
        <label htmlFor={id} className="pl-2 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  )
}

export default MyCheckbox
