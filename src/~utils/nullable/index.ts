import { Nullable } from '@glyph-cat/swiss-army-knife'

export function NullableString(value: string): Nullable<string> {
  return value ? value : null
}

export function NullableTrue(value: boolean): Nullable<true> {
  return value === true || null
}

export function NotZeroOrNull(value: number): Nullable<number> {
  return (value && value !== 0) ? value : null
}
