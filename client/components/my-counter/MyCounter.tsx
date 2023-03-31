import React from 'react'

type Props = {
  id: string
  name: string
  value: '' | number
  min?: number
  max?: number
  onChange?: (e: number | '') => void
}

const MyCounter = ({ id, name, value, min, max, onChange }: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChange !== 'function') return
    if (e.target.value === '') onChange('')
    else onChange(parseInt(e.target.value))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length > 1) {
      return
    }
    if (/\d/.test(e.key)) {
      return
    }
    e.preventDefault()
  }

  const handleIncrement = () => {
    if (typeof onChange !== 'function') return
    if (!value) onChange(1)
    else if (max !== undefined && value + 1 > max) return
    else onChange(value + 1)
  }

  const handleDecrement = () => {
    if (typeof onChange !== 'function') return
    if (!value) return
    if (min !== undefined && value - 1 < min) return
    onChange(value - 1 === 0 ? '' : value - 1)
  }

  return (
    <div className="flex items-center h-9 border bg-white border-gray-400 rounded-md ring-primary-ring transition-colors focus-within:border-primary focus-within:ring-2 overflow-hidden">
      <div
        className="w-9 h-9 flex items-center justify-center text-lg cursor-pointer hover:bg-primary hover:text-white transition-colors flex-shrink-0"
        onClick={handleDecrement}
      >
        <i className="fa-solid fa-minus"></i>
      </div>
      <input
        className="outline-none caret-primary px-3 w-full disabled:bg-slate-200 h-full border-x border-gray-400 text-center cursor-default"
        type="text"
        name={name}
        id={id}
        value={value}
        readOnly={true}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />

      <div
        className="w-9 h-9 flex items-center justify-center text-lg cursor-pointer hover:bg-primary hover:text-white transition-colors flex-shrink-0"
        onClick={handleIncrement}
      >
        <i className="fa-solid fa-plus"></i>
      </div>
    </div>
  )
}

export default MyCounter
