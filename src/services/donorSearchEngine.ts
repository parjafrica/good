// Re-export the real donor search engine as the main interface
export { realDonorSearchEngine as donorSearchEngine } from './realDonorSearchEngine';
export type { RealDonorOpportunity as DonorOpportunity, SearchFilters, SearchResult } from './realDonorSearchEngine';