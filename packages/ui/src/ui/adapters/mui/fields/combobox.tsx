import { MenuItem as MUIMenuItem, Select as MUISelect } from '@mui/material'
import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import type { MenuItemProps as MUIMenuItemProps, SelectChangeEvent } from '@mui/material'

/* =========================
 * MenuItem
 * ========================= */

export interface MenuItemProps<T extends string | number = string> extends Omit<
  MUIMenuItemProps,
  'value'
> {
  value: T
  label: string
}

export const MenuItem = <T extends string | number>({ label, ...props }: MenuItemProps<T>) => {
  return <MUIMenuItem {...props}>{label}</MUIMenuItem>
}

/* =========================
 * Select
 * ========================= */

export type SelectProps<T extends string | number> = {
  id?: string
  label?: React.ReactNode

  value: T
  onChange: (value: T) => void
  onBlur?: () => void
  items: Array<MenuItemProps<T>>

  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

export const Select = <T extends string | number = string>({
  id,
  label,
  value,
  onChange,
  onBlur,
  items,
  disabled,
  className,
  style,
}: SelectProps<T>) => {
  const labelId = id ? `select-label-${id}` : undefined
  const selectId = id ? `select-${id}` : undefined

  return (
    <Box sx={{ minWidth: 250 }}>
      <FormControl fullWidth disabled={disabled}>
        {label && <InputLabel id={labelId}>{label}</InputLabel>}

        <MUISelect
          labelId={labelId}
          id={selectId}
          value={String(value)}
          label={label}
          variant="outlined"
          className={className}
          style={style}
          onChange={(e: SelectChangeEvent) => {
            onChange(e.target.value as T)
          }}
          onBlur={() => onBlur?.()}
          renderValue={(v) => {
            const found = items.find((item) => item.value === v)
            return found ? found.label : ''
          }}
        >
          {items.map((item) => (
            <MenuItem key={String(item.value)} {...item} />
          ))}
        </MUISelect>
      </FormControl>
    </Box>
  )
}
