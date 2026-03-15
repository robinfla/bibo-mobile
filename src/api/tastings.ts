import { apiFetch } from './client'
import type { Tasting, CreateTastingInput, UpdateTastingInput } from '../types/api'

export const tastingsApi = {
  /**
   * Create a new comprehensive tasting
   */
  create: (data: CreateTastingInput): Promise<Tasting> =>
    apiFetch<Tasting>('/api/tastings', {
      method: 'POST',
      body: data as Record<string, unknown>,
    }),

  /**
   * Get a specific tasting by ID
   */
  get: (id: number): Promise<Tasting> =>
    apiFetch<Tasting>(`/api/tastings/${id}`),

  /**
   * Update a tasting
   */
  update: (id: number, data: UpdateTastingInput): Promise<Tasting> =>
    apiFetch<Tasting>(`/api/tastings/${id}`, {
      method: 'PUT',
      body: data as Record<string, unknown>,
    }),

  /**
   * Delete a tasting
   */
  delete: (id: number): Promise<void> =>
    apiFetch<void>(`/api/tastings/${id}`, {
      method: 'DELETE',
    }),

  /**
   * Get all tastings for a specific wine
   */
  listForWine: (wineId: number): Promise<Tasting[]> =>
    apiFetch<Tasting[]>(`/api/wines/${wineId}/tastings`),
}
