export interface User {
  id: number
  email: string
  name: string | null
  isAdmin: boolean
  preferredCurrency: string | null
}

export interface LoginResponse {
  token: string
  user: User
}

export interface InventoryLot {
  id: number
  wineId: number
  wineName: string
  producerName: string
  producerId: number
  vintage: number | null
  quantity: number
  cellarName: string
  cellarId: number
  wineColor: string
  regionName: string | null
  appellationName: string | null
  purchaseDate: string | null
  purchasePricePerBottle: string | null
  formatId: number
  formatName: string
  maturity: MaturityInfo | null
}

export interface MaturityInfo {
  status: 'peak' | 'ready' | 'approaching' | 'declining' | 'too_early' | 'past' | 'unknown'
  message: string
  drinkFrom: number | null
  drinkUntil: number | null
}

export interface InventoryResponse {
  lots: InventoryLot[]
  total: number
}

export interface InventoryFilters {
  producers: { id: number; name: string }[]
  regions: { id: number; name: string }[]
  vintages: number[]
  cellars: { id: number; name: string }[]
}

export interface StatsResponse {
  totals: {
    bottles: number
    lots: number
    estimatedValue: number
  }
  readyToDrink: number
  byColor: { color: string; bottles: string }[]
  byCellar: { cellarId: number; cellarName: string; bottles: string }[]
  byRegion: { regionId: number; regionName: string; bottles: string }[]
  byVintage: { vintage: number; bottles: string }[]
  byGrape: { grapeId: number; grapeName: string; bottles: string }[]
}

export interface ConsumePayload {
  quantity: number
  tastingNote?: {
    score: number
    comment: string
    pairing: string
  }
}

export interface InventoryQueryParams {
  search?: string
  maturity?: string
  producerId?: number
  regionId?: number
  color?: string
  vintage?: number
  cellarId?: number
  inStock?: string
  limit?: number
  offset?: number
}
