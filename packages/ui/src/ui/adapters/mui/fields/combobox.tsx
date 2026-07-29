import { MenuItem as MUIMenuItem, Select as MUISelect } from '@mui/material'
import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import { withOptional } from '@gyomu/schema'
import type { MenuItemProps as MUIMenuItemProps, SelectChangeEvent } from '@mui/material'

/* =========================
 * MenuItem
 * ========================= */

/**
 * Defines the properties for an individual menu item, extending standard MUI Menu Item properties.
 */
export interface MenuItemProps<T extends string | number = string> extends Omit<
  MUIMenuItemProps,
  'value'
> {
  /**
   * The underlying value associated with the menu item.
   */
  value: T

  /**
   * The display label for the menu item.
   */
  label: string
}

/**
 * Renders a menu item with a label for use within a combobox or select menu.
 */
export const MenuItem = <T extends string | number>({ label, ...props }: MenuItemProps<T>) => {
  return <MUIMenuItem {...props}>{label}</MUIMenuItem>
}

/* =========================
 * Select
 * ========================= */

/**
 * Defines the properties for the Select component, including items, value, and event handlers.
 */
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

/**
 * Renders a labeled select input component that supports typed values and custom menu items.
 */
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
      <FormControl fullWidth {...withOptional({ disabled })}>
        {label && <InputLabel id={labelId}>{label}</InputLabel>}

        <MUISelect
          value={String(value)}
          label={label}
          variant="outlined"
          {...withOptional({
            labelId,
            id: selectId,
            className,
            style,
          })}
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
