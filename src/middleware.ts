import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of allowed origins
const allowedOrigins = [
  'https://nexus-website-zeta.vercel.app',
  'http://localhost:3000', // for local development
  'http://localhost:3001', // for local development
  // Add other allowed origins as needed
];

export function middleware(request: NextRequest) {
  // Get the origin from request headers
  const origin = request.headers.get('origin') || '';
  
  // Check if the origin is allowed or if we want to allow all origins
  const isAllowedOrigin = allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development';
  
  // Create response
  const response = NextResponse.next();
  
  // Add CORS headers
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    // Allow all origins in development or if you want to allow all
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200,
      headers: response.headers,
    });
  }
  
  return response;
}

// Configure the middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
};