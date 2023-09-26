export interface DTDataEntry {
  [key: string]: string | number | boolean | null
}

export interface DTColumn {
    header: string
    dimmed: boolean
    type: 'plain' | 'number' | 'tag' | 'bool' | 'date' | 'hidden'
    sizePolicy: 'shrink' | 'grow' | number
    justify?: 'text-start' | 'text-center' | 'text-end'
}

export interface DTColumnsDef {
  [key: string]: DTColumn
}
export interface DTColumnAction {
  label: string
  icon: string
  type: 'button' | 'link'
  level: 'info' | 'warning' | 'error' | 'success'
  href?: string
  onClick?: (data: DTDataEntry) => void
}
