import type { JSX } from 'react'
import type { FieldLayoutProps } from '../types'

/**
 * Defines a layout component for a form field, accepting layout properties and returning a JSX element.
 *
 * @param props The configuration properties for the field layout.
 *
 * @returns The rendered field layout component.
 */
export type FieldLayout = (props: FieldLayoutProps) => JSX.Element
