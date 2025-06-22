import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of allowed origins
const allowedOrigins = [
  'http://localhost:3001',
  // Add other allowed origins as needed
  // 'https://your-production-frontend.com'
];

export function middleware(request: NextRequest) {
  // Get the origin from request headers
  const origin = request.headers.get('origin') || '';
  
  // Check if the origin is allowed
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  // Get the response
  const response = NextResponse.next();
  
  // Add CORS headers if origin is allowed
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 204,
      headers: response.headers,
    });
  }
  
  return response;
}

// Configure the middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
};