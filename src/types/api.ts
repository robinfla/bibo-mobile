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
  status: 'peak' | 'approaching' | 'to_age' | 'past_prime' | 'declining' | 'unknown'
  message: string
  drinkFrom: number | null
  drinkUntil: number | null
}

export interface InventoryResponse {
  lots: InventoryLot[]
  total: number
}

export interface VintageData {
  vintage: number | null
  bottleCount: number
  maturityStatus: 'peak' | 'approaching' | 'to_age' | 'past_prime' | 'declining' | 'unknown'
  maturityLabel: string
  maturityColor: string
  drinkFrom?: number
  drinkUntil?: number
}

export interface WineCard {
  wineId: number
  wineName: string
  producerName: string
  regionName: string | null
  appellationName: string | null
  wineColor: string
  bottleImageUrl: string | null
  vintages: VintageData[]
  totalBottles: number
}

export interface WineCardsResponse {
  cards: WineCard[]
  total: number
}

export interface WineDetail {
  id: number
  name: string
  color: string
  notes: string | null
  bottleImageUrl: string | null
  defaultDrinkFromYears: number | null
  defaultDrinkUntilYears: number | null
  tasteProfile: string[] | null
  
  // Taste characteristics
  bodyWeight: number | null
  tanninLevel: number | null
  sweetnessLevel: number | null
  acidityLevel: number | null
  
  // Serving guide
  servingTempCelsius: number | null
  decantMinutes: number | null
  glassType: string | null
  foodPairings: string[] | null
  
  // Relations
  producer: {
    id: number
    name: string
    website: string | null
  } | null
  producerName?: string // Computed from producer.name
  region: {
    id: number
    name: string
    countryCode: string
  } | null
  regionName?: string | null
  appellation: {
    id: number
    name: string
    level: string | null
  } | null
  appellationName?: string | null
  
  // Grapes
  grapes: Array<{ id: number; name: string; color: string; percentage: number | null }>
  
  // Vintages
  vintages?: Array<{
    id: number
    vintage: number | null
    quantity: number
    binLocation: string | null
    purchaseDate: string | null
    purchasePricePerBottle: string | null
    purchaseCurrency: string | null
    format: {
      id: number
      name: string
      volumeMl: number
    } | null
    cellar: {
      id: number
      name: string
    } | null
    valuation: {
      vintage: number | null
      priceEstimate: string | null
      priceLow: string | null
      priceHigh: string | null
      source: string | null
      fetchedAt: string | null
    } | null
    maturity: {
      status: 'to_age' | 'approaching' | 'peak' | 'past_prime' | 'declining' | 'unknown'
      message: string
      drinkFrom?: number
      drinkUntil?: number
    }
  }>
  
  // History
  history?: Array<{
    id: number
    eventType: string
    quantityChange: number
    eventDate: string
    rating: number | null
    tastingNotes: string | null
    notes: string | null
    lotId: number
    vintage: number | null
    cellarName: string | null
  }>
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

export interface Cellar {
  id: number
  name: string
}

export interface Format {
  id: number
  name: string
  volumeMl: number
}

export interface Region {
  id: number
  name: string
}

export interface Grape {
  id: number
  name: string
}

export interface ParsedWine {
  producer: string
  wineName: string
  vintage: number | null
  color: string
  region: string | null
  appellation: string | null
}

export interface WineMatch {
  wine: { id: number; name: string; color: string }
  producer: { id: number; name: string }
  region: { id: number; name: string } | null
  score: number
}

export interface AiSearchResponse {
  parsed: ParsedWine
  matches: WineMatch[]
}

export interface ScanResponse {
  parsed: ParsedWine
  matches: WineMatch[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface PairingResponse {
  reply: string
}

export interface InventoryEvent {
  id: number
  lotId: number
  eventType: 'purchase' | 'consume'
  quantityChange: number
  eventDate: string
  notes: string | null
  rating: number | null
  tastingNotes: string | null
  pairing: string | null
  createdAt: string
  wineName: string
  wineColor: string
  producerName: string
  vintage: number | null
  cellarName: string
}

export interface EventsResponse {
  events: InventoryEvent[]
  total: number
}

export interface InventoryEvent {
  id: number
  lotId: number
  eventType: 'purchase' | 'consume'
  quantityChange: number
  eventDate: string
  notes: string | null
  rating: number | null
  tastingNotes: string | null
  createdAt: string
  wineName: string
  wineColor: string
  producerName: string
  vintage: number | null
  cellarName: string
}

export interface InventoryEventsResponse {
  events: InventoryEvent[]
  total: number
}

export interface WishlistItem {
  id: number
  itemType: 'wine' | 'producer'
  name: string
  wineId: number | null
  producerId: number | null
  regionId: number | null
  vintage: number | null
  notes: string | null
  winesOfInterest: string | null
  priceTarget: string | null
  priceCurrency: string | null
  url: string | null
  createdAt: string
  updatedAt: string
  wineName: string | null
  wineColor: string | null
  producerName: string | null
  regionName: string | null
}

export interface CreateWishlistItem {
  itemType: 'wine' | 'producer'
  name: string
  vintage?: number | null
  notes?: string | null
  priceTarget?: string | null
  priceCurrency?: string
  url?: string | null
  regionId?: number | null
  winesOfInterest?: string | null
}

// Wine Detail
export interface WineDetailResponse {
  id: number
  name: string
  color: string
  notes: string | null
  defaultDrinkFromYears: number | null
  defaultDrinkUntilYears: number | null
  tasteProfile: string[] | null
  servingTempCelsius: number | null
  decantMinutes: number | null
  glassType: string | null
  foodPairings: string[] | null
  producer: {
    id: number
    name: string
    website: string | null
  } | null
  region: {
    id: number
    name: string
    countryCode: string
  } | null
  appellation: {
    id: number
    name: string
    level: string | null
  } | null
  grapes: Array<{
    id: number
    name: string
    color: string | null
    percentage: number | null
  }>
  vintages: Array<{
    id: number
    vintage: number | null
    quantity: number
    binLocation: string | null
    purchaseDate: string | null
    purchasePricePerBottle: string | null
    purchaseCurrency: string | null
    format: {
      id: number
      name: string
      volumeMl: number
    } | null
    cellar: {
      id: number
      name: string
    } | null
    valuation: {
      vintage: number | null
      priceEstimate: string | null
      priceLow: string | null
      priceHigh: string | null
      source: string | null
      fetchedAt: string | null
    } | null
  }>
  history: Array<{
    id: number
    eventType: string
    quantityChange: number
    eventDate: string
    rating: number | null
    tastingNotes: string | null
    notes: string | null
    lotId: number
    vintage: number | null
    cellarName: string | null
  }>
}
