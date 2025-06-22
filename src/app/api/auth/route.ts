import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const id = searchParams.get('id')

  try {
    switch (action) {
      // Get all admins
      case 'get-admins':
        if (id) {
          const admin = await prisma.admin.findUnique({ 
            where: { id },
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true
            }
          })
          return NextResponse.json(admin)
        }
        const admins = await prisma.admin.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(admins)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    const body = await request.json()

    switch (action) {
      // Login
      case 'login':
        const { email, password } = body

        if (!email || !password) {
          return NextResponse.json(
            { error: 'Email and password are required' }, 
            { status: 400 }
          )
        }

        // Find admin by email
        const admin = await prisma.admin.findUnique({
          where: { email }
        })

        if (!admin) {
          return NextResponse.json(
            { error: 'Invalid credentials' }, 
            { status: 401 }
          )
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password)

        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'Invalid credentials' }, 
            { status: 401 }
          )
        }

        // Generate JWT token
        const token = sign(
          { 
            adminId: admin.id, 
            email: admin.email,
            name: admin.name 
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        )

        // Return success response
        return NextResponse.json({
          message: 'Login successful',
          token,
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name
          }
        })

      // Add new admin
      case 'add-admin':
        const { name, email: newEmail, password: newPassword } = body

        if (!name || !newEmail || !newPassword) {
          return NextResponse.json(
            { error: 'Name, email, and password are required' }, 
            { status: 400 }
          )
        }

        // Check if admin with email already exists
        const existingAdmin = await prisma.admin.findUnique({
          where: { email: newEmail }
        })

        if (existingAdmin) {
          return NextResponse.json(
            { error: 'Admin with this email already exists' }, 
            { status: 409 }
          )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        // Create new admin
        const newAdmin = await prisma.admin.create({
          data: {
            name,
            email: newEmail,
            password: hashedPassword
          },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        })

        return NextResponse.json({
          message: 'Admin created successfully',
          admin: newAdmin
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}