export interface ProductFormData {
  // Basic Info
  title: string
  slug: string
  shortDescription: string
  description: string
  
  // Pricing
  price: number | ''
  originalPrice: number | ''
  currency: string
  pricingModel: string
  
  // Media
  image: string
  images: string[]
  videoUrl: string
  brochureUrl: string
  
  // Categorization
  category: string
  subCategory: string
  tags: string[]
  
  // Business Info
  targetAudience: string[]
  industries: string[]
  useCases: string[]
  
  // Features & Benefits
  features: string[]
  benefits: string[]
  specifications: Record<string, string>
  
  // Technical
  systemRequirements: Record<string, string>
  compatibility: string[]
  integrations: string[]
  
  // Marketing
  metaTitle: string
  metaDescription: string
  keywords: string[]
  
  // Status & Organization
  status: 'draft' | 'published' | 'archived'
  isActive: boolean
  isFeatured: boolean
  order: number | ''
}