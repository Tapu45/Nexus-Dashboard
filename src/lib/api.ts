const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// API Endpoints Configuration
export const API_ROUTES = {
  // Auth Routes
  AUTH: {
    LOGIN: `${BASE_URL}/auth?action=login`,
    ADD_ADMIN: `${BASE_URL}/auth?action=add-admin`,
    GET_ADMINS: `${BASE_URL}/auth?action=get-admins`,
    GET_ADMIN_BY_ID: (id: string) => `${BASE_URL}/auth?action=get-admins&id=${id}`,
  },

  // Hero Section Routes
  HERO: {
    GET_ALL: `${BASE_URL}/function?action=get-hero`,
    GET_BY_ID: (id: string) => `${BASE_URL}/function?action=get-hero&id=${id}`,
    CREATE: `${BASE_URL}/function?action=create-hero`,
    UPDATE: (id: string) => `${BASE_URL}/function?action=update-hero&id=${id}`,
    DELETE: (id: string) => `${BASE_URL}/function?action=delete-hero&id=${id}`,
  },

  // Products Routes
  PRODUCTS: {
    GET_ALL: `${BASE_URL}/function?action=get-products`,
    GET_BY_ID: (id: string) => `${BASE_URL}/function?action=get-products&id=${id}`,
    GET_BY_CATEGORY: (category: string) => `${BASE_URL}/function?action=get-products&category=${category}`,
    GET_BY_STATUS: (status: string) => `${BASE_URL}/function?action=get-products&status=${status}`,
    GET_FEATURED: `${BASE_URL}/function?action=get-products&featured=true`,
    GET_CATEGORIES: `${BASE_URL}/function?action=get-product-categories`,
    CREATE: `${BASE_URL}/function?action=create-product`,
    UPDATE: (id: string) => `${BASE_URL}/function?action=update-product&id=${id}`,
    DELETE: (id: string) => `${BASE_URL}/function?action=delete-product&id=${id}`,
  },

  // Testimonials Routes
  TESTIMONIALS: {
    GET_ALL: `${BASE_URL}/function?action=get-testimonials`,
    GET_BY_ID: (id: string) => `${BASE_URL}/function?action=get-testimonials&id=${id}`,
    CREATE: `${BASE_URL}/function?action=create-testimonial`,
    UPDATE: (id: string) => `${BASE_URL}/function?action=update-testimonial&id=${id}`,
    DELETE: (id: string) => `${BASE_URL}/function?action=delete-testimonial&id=${id}`,
  },

  // Why Choose Us Routes
  WHY_CHOOSE_US: {
    GET_ALL: `${BASE_URL}/function?action=get-why-choose-us`,
    GET_BY_ID: (id: string) => `${BASE_URL}/function?action=get-why-choose-us&id=${id}`,
    CREATE: `${BASE_URL}/function?action=create-why-choose-us`,
    UPDATE: (id: string) => `${BASE_URL}/function?action=update-why-choose-us&id=${id}`,
    DELETE: (id: string) => `${BASE_URL}/function?action=delete-why-choose-us&id=${id}`,
  },

  // Book Demo Section Routes
  BOOK_DEMO: {
    GET_ALL: `${BASE_URL}/function?action=get-book-demo`,
    GET_BY_ID: (id: string) => `${BASE_URL}/function?action=get-book-demo&id=${id}`,
    CREATE: `${BASE_URL}/function?action=create-book-demo`,
    UPDATE: (id: string) => `${BASE_URL}/function?action=update-book-demo&id=${id}`,
    DELETE: (id: string) => `${BASE_URL}/function?action=delete-book-demo&id=${id}`,
  },

  // Demo Requests Routes
  DEMO_REQUESTS: {
    GET_ALL: `${BASE_URL}/function?action=get-demo-requests`,
    GET_BY_ID: (id: string) => `${BASE_URL}/function?action=get-demo-requests&id=${id}`,
    CREATE: `${BASE_URL}/function?action=create-demo-request`,
    UPDATE: (id: string) => `${BASE_URL}/function?action=update-demo-request&id=${id}`,
    DELETE: (id: string) => `${BASE_URL}/function?action=delete-demo-request&id=${id}`,
  },

  CONTACTS: {
    GET_ALL: `${BASE_URL}/function?action=get-contacts`,
    GET_BY_ID: (id: string) => `${BASE_URL}/function?action=get-contacts&id=${id}`,
    CREATE: `${BASE_URL}/function?action=create-contact`,
    UPDATE: (id: string) => `${BASE_URL}/function?action=update-contact&id=${id}`,
    DELETE: (id: string) => `${BASE_URL}/function?action=delete-contact&id=${id}`,
  },

  // Job Applications Routes
  JOB_APPLICATIONS: {
    GET_ALL: `${BASE_URL}/function?action=get-job-applications`,
    GET_BY_ID: (id: string) => `${BASE_URL}/function?action=get-job-applications&id=${id}`,
    GET_BY_POSITION: (position: string) => `${BASE_URL}/function?action=get-applications-by-position&position=${encodeURIComponent(position)}`,
    GET_BY_STATUS: (status: string) => `${BASE_URL}/function?action=get-applications-by-position&status=${status}`,
    GET_BY_POSITION_AND_STATUS: (position: string, status: string) => `${BASE_URL}/function?action=get-applications-by-position&position=${encodeURIComponent(position)}&status=${status}`,
    CREATE: `${BASE_URL}/function?action=create-job-application`,
    UPDATE: (id: string) => `${BASE_URL}/function?action=update-job-application&id=${id}`,
    DELETE: (id: string) => `${BASE_URL}/function?action=delete-job-application&id=${id}`,
  },

  // Site Settings Routes
  SETTINGS: {
    GET_ALL: `${BASE_URL}/function?action=get-settings`,
    GET_BY_KEY: (key: string) => `${BASE_URL}/function?action=get-settings&key=${key}`,
    CREATE: `${BASE_URL}/function?action=create-setting`,
    UPDATE: (id: string) => `${BASE_URL}/function?action=update-setting&id=${id}`,
    DELETE: (id: string) => `${BASE_URL}/function?action=delete-setting&id=${id}`,
  },

  // Dashboard Stats Routes
  DASHBOARD: {
    GET_STATS: `${BASE_URL}/function?action=get-stats`,
  },

  // Upload Routes
  UPLOAD: {
    SINGLE: `${BASE_URL}/upload?action=upload-single`,
    MULTIPLE: `${BASE_URL}/upload?action=upload-multiple`,
    BASE64: `${BASE_URL}/upload?action=upload-base64`,
    DELETE: (publicId: string) => `${BASE_URL}/upload?public_id=${publicId}`,
  },
} as const

// Export individual route groups for easier imports
export const {
  AUTH,
  HERO,
  PRODUCTS,
  TESTIMONIALS,
  WHY_CHOOSE_US,
  BOOK_DEMO,
  DEMO_REQUESTS,
  SETTINGS,
  DASHBOARD,
  UPLOAD,
} = API_ROUTES

// Default export
export default API_ROUTES