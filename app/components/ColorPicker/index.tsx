'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import s from './index.module.css'

type Option = { value: string; label: string }

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  inputClassName?: string
  placeholder?: string
}


export default function ColorPicker({ label, value, onChange, inputClassName, placeholder }: Props) {
  const [open, setOpen] = useState<boolean>(false)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const colors = useMemo(() => ([
    { value: 'red', label: 'Red' },
    { value: '#FF7A00', label: 'Orange' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: '#00FFAA', label: 'Cyan' },
    { value: 'magenta', label: 'Magenta' },
    { value: 'purple', label: 'Purple' },
    { value: '#FFFFFF', label: 'White' },
    { value: '#000000', label: 'Black' },
  ]), [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (boxRef.current && !boxRef.current.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div>
      <label>{label}</label>
      <div className={s.combo} ref={boxRef}>
        <input
          className={inputClassName}
          type="text"
          placeholder={placeholder}
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className={`${s.comboList} ${open ? s.comboOpen : ''}`} role="listbox" aria-label={`${label} options`}>
          {colors.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={s.comboItem}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              <span className={s.swatch} style={{ background: opt.value }} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


