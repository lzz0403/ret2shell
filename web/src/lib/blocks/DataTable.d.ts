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
  level: 'info' | 'warning' | 'error' | 'success'
  onClick: (data: DTDataEntry) => void
}
