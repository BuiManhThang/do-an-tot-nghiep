import React from 'react'

type MyRadioProps = {
  id: string
  name?: string
  label?: string
  value?: string
  checked?: boolean
  className?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const MyRadio = ({
  id,
  name,
  label,
  value,
  checked = false,
  className,
  onChange,
}: MyRadioProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChange === 'function') {
      onChange(e)
    }
  }

  return (
    <div className={`flex items-center group ${className}`}>
      <div className="relative w-6 h-6">
        <label
          htmlFor={id}
          className={`w-full h-full cursor-pointer flex items-center justify-center rounded-full border transition-colors ring-primary-ring bg-white ${
            checked ? 'border-primary text-white' : 'border-gray-400 text-white'
          } group-hover:border-primary group-focus-within:border-primary group-focus-within:ring-2`}
        >
          <div
            className={`w-4 h-4 rounded-full transition-all ${
              checked ? 'bg-primary scale-100' : 'bg-white scale-20'
            }`}
          />
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

export default MyRadio
