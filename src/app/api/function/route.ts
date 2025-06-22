import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const id = searchParams.get('id')

  try {
    switch (action) {
      // Hero Section Routes
      case 'get-hero':
        if (id) {
          const hero = await prisma.heroSection.findUnique({ where: { id } })
          return NextResponse.json(hero)
        }
        const heroes = await prisma.heroSection.findMany({
          orderBy: { updatedAt: 'desc' }
        })
        return NextResponse.json(heroes)

      // Products Routes
      case 'get-products':
        const category = searchParams.get('category')
        const status = searchParams.get('status')
        const featured = searchParams.get('featured')
        
        if (id) {
          const product = await prisma.product.findUnique({ where: { id } })
          return NextResponse.json(product)
        }
        
        const whereConditions: any = {}
        if (category) whereConditions.category = category
        if (status) whereConditions.status = status
        if (featured === 'true') whereConditions.isFeatured = true
        
        const products = await prisma.product.findMany({
          where: whereConditions,
          orderBy: [
            { isFeatured: 'desc' },
            { order: 'asc' },
            { createdAt: 'desc' }
          ]
        })
        return NextResponse.json(products)

      // Get product categories
      case 'get-product-categories':
        const categories = await prisma.product.groupBy({
          by: ['category'],
          where: { 
            category: { not: null },
            status: 'published'
          },
          _count: { category: true }
        })
        return NextResponse.json(categories)

      // Testimonials Routes
      case 'get-testimonials':
        if (id) {
          const testimonial = await prisma.testimonial.findUnique({ where: { id } })
          return NextResponse.json(testimonial)
        }
        const testimonials = await prisma.testimonial.findMany({
          orderBy: { order: 'asc' }
        })
        return NextResponse.json(testimonials)

      // Why Choose Us Routes
      case 'get-why-choose-us':
        if (id) {
          const item = await prisma.whyChooseUsItem.findUnique({ where: { id } })
          return NextResponse.json(item)
        }
        const items = await prisma.whyChooseUsItem.findMany({
          orderBy: { order: 'asc' }
        })
        return NextResponse.json(items)

      // Book Demo Section Routes
      case 'get-book-demo':
        if (id) {
          const demo = await prisma.bookDemoSection.findUnique({ where: { id } })
          return NextResponse.json(demo)
        }
        const demos = await prisma.bookDemoSection.findMany({
          orderBy: { updatedAt: 'desc' }
        })
        return NextResponse.json(demos)

      // Demo Requests Routes
      case 'get-demo-requests':
        if (id) {
          const request = await prisma.demoRequest.findUnique({ where: { id } })
          return NextResponse.json(request)
        }
        const requests = await prisma.demoRequest.findMany({
          orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(requests)

      // Site Settings Routes
      case 'get-settings':
        const key = searchParams.get('key')
        if (key) {
          const setting = await prisma.siteSettings.findUnique({ where: { key } })
          return NextResponse.json(setting)
        }
        const settings = await prisma.siteSettings.findMany()
        return NextResponse.json(settings)

      // Dashboard Stats
      case 'get-stats':
        const stats = await Promise.all([
          prisma.product.count(),
          prisma.testimonial.count(),
          prisma.demoRequest.count(),
          prisma.demoRequest.count({ where: { status: 'pending' } }),
        ])
        return NextResponse.json({
          totalProducts: stats[0],
          totalTestimonials: stats[1],
          totalDemoRequests: stats[2],
          pendingRequests: stats[3],
        })

      // Contact Routes
      case 'get-contacts':
        if (id) {
          const contact = await prisma.contact.findUnique({ where: { id } })
          return NextResponse.json(contact)
        }
        const contacts = await prisma.contact.findMany({
          orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(contacts)

      // Job Applications Routes
      case 'get-job-applications':
        if (id) {
          const application = await prisma.jobApplication.findUnique({ where: { id } })
          return NextResponse.json(application)
        }
        const applications = await prisma.jobApplication.findMany({
          orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(applications)

      // Get applications by position
      case 'get-applications-by-position':
        const position = searchParams.get('position')
        const appStatus = searchParams.get('status')
        
        const appWhereConditions: any = {}
        if (position) appWhereConditions.position = position
        if (appStatus) appWhereConditions.status = appStatus
        
        const positionApplications = await prisma.jobApplication.findMany({
          where: appWhereConditions,
          orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(positionApplications)

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
      // Hero Section Routes
      case 'create-hero':
        const newHero = await prisma.heroSection.create({
          data: {
            title: body.title,
            subtitle: body.subtitle,
            description: body.description,
            buttonText: body.buttonText,
            buttonLink: body.buttonLink,
            backgroundImage: body.backgroundImage,
            isActive: body.isActive ?? true,
          }
        })
        return NextResponse.json(newHero)

      // Products Routes
     case 'create-product':
        const newProduct = await prisma.product.create({
          data: {
            title: body.title,
            slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
            shortDescription: body.shortDescription,
            description: body.description,
            features: body.features || [],
            specifications: body.specifications || {},
            benefits: body.benefits || [],
            
            // Pricing
            price: body.price,
            originalPrice: body.originalPrice,
            currency: body.currency || 'USD',
            pricingModel: body.pricingModel || 'one-time',
            
            // Media
            image: body.image,
            images: body.images || [],
            videoUrl: body.videoUrl,
            brochureUrl: body.brochureUrl,
            
            // Categorization
            category: body.category,
            subCategory: body.subCategory,
            tags: body.tags || [],
            
            // Business Info
            targetAudience: body.targetAudience || [],
            industries: body.industries || [],
            useCases: body.useCases || [],
            
            // Technical
            systemRequirements: body.systemRequirements || {},
            compatibility: body.compatibility || [],
            integrations: body.integrations || [],
            
            // Marketing
            metaTitle: body.metaTitle,
            metaDescription: body.metaDescription,
            keywords: body.keywords || [],
            
            // Status & Organization
            status: body.status || 'draft',
            isActive: body.isActive ?? true,
            isFeatured: body.isFeatured ?? false,
            order: body.order ?? 0,
            
            publishedAt: body.status === 'published' ? new Date() : null,
          }
        })
        return NextResponse.json(newProduct)

      // Testimonials Routes
      case 'create-testimonial':
        const newTestimonial = await prisma.testimonial.create({
          data: {
            name: body.name,
            role: body.role,
            company: body.company,
            content: body.content,
            rating: body.rating ?? 5,
            avatar: body.avatar,
            isActive: body.isActive ?? true,
            order: body.order ?? 0,
          }
        })
        return NextResponse.json(newTestimonial)

      // Why Choose Us Routes
      case 'create-why-choose-us':
        const newItem = await prisma.whyChooseUsItem.create({
          data: {
            title: body.title,
            description: body.description,
            icon: body.icon,
            isActive: body.isActive ?? true,
            order: body.order ?? 0,
          }
        })
        return NextResponse.json(newItem)

      // Book Demo Section Routes
      case 'create-book-demo':
        const newDemo = await prisma.bookDemoSection.create({
          data: {
            title: body.title,
            description: body.description,
            buttonText: body.buttonText,
            formFields: body.formFields || {},
            isActive: body.isActive ?? true,
          }
        })
        return NextResponse.json(newDemo)

      // Demo Requests Routes
      case 'create-demo-request':
        const newRequest = await prisma.demoRequest.create({
          data: {
            name: body.name,
            email: body.email,
            company: body.company,
            phone: body.phone,
            message: body.message,
            status: body.status ?? 'pending',
          }
        })
        return NextResponse.json(newRequest)

      // Contact Routes
      case 'create-contact':
        const newContact = await prisma.contact.create({
          data: {
            name: body.name,
            email: body.email,
            subject: body.subject,
            message: body.message,
            status: body.status ?? 'pending',
          }
        })
        return NextResponse.json(newContact)

      // Job Application Routes
      case 'create-job-application':
        const newJobApplication = await prisma.jobApplication.create({
          data: {
            name: body.name,
            email: body.email,
            address: body.address,
            position: body.position,
            resumeUrl: body.resumeUrl,
            coverLetter: body.coverLetter,
            phone: body.phone,
            status: body.status ?? 'pending',
          }
        })
        return NextResponse.json(newJobApplication)

      // Site Settings Routes
      case 'create-setting':
        const newSetting = await prisma.siteSettings.upsert({
          where: { key: body.key },
          update: {
            value: body.value,
            description: body.description,
          },
          create: {
            key: body.key,
            value: body.value,
            description: body.description,
          }
        })
        return NextResponse.json(newSetting)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const body = await request.json()

    switch (action) {
      // Hero Section Routes
      case 'update-hero':
        const updatedHero = await prisma.heroSection.update({
          where: { id },
          data: {
            title: body.title,
            subtitle: body.subtitle,
            description: body.description,
            buttonText: body.buttonText,
            buttonLink: body.buttonLink,
            backgroundImage: body.backgroundImage,
            isActive: body.isActive,
          }
        })
        return NextResponse.json(updatedHero)

      // Products Routes
       case 'update-product':
        const updateData: any = {
          title: body.title,
          slug: body.slug,
          shortDescription: body.shortDescription,
          description: body.description,
          features: body.features,
          specifications: body.specifications,
          benefits: body.benefits,
          
          // Pricing
          price: body.price,
          originalPrice: body.originalPrice,
          currency: body.currency,
          pricingModel: body.pricingModel,
          
          // Media
          image: body.image,
          images: body.images,
          videoUrl: body.videoUrl,
          brochureUrl: body.brochureUrl,
          
          // Categorization
          category: body.category,
          subCategory: body.subCategory,
          tags: body.tags,
          
          // Business Info
          targetAudience: body.targetAudience,
          industries: body.industries,
          useCases: body.useCases,
          
          // Technical
          systemRequirements: body.systemRequirements,
          compatibility: body.compatibility,
          integrations: body.integrations,
          
          // Marketing
          metaTitle: body.metaTitle,
          metaDescription: body.metaDescription,
          keywords: body.keywords,
          
          // Status & Organization
          status: body.status,
          isActive: body.isActive,
          isFeatured: body.isFeatured,
          order: body.order,
        }

        // Set publishedAt when status changes to published
        if (body.status === 'published') {
          const currentProduct = await prisma.product.findUnique({ 
            where: { id },
            select: { status: true, publishedAt: true }
          })
          if (currentProduct?.status !== 'published') {
            updateData.publishedAt = new Date()
          }
        }

        const updatedProduct = await prisma.product.update({
          where: { id },
          data: updateData
        })
        return NextResponse.json(updatedProduct)

      // Testimonials Routes
      case 'update-testimonial':
        const updatedTestimonial = await prisma.testimonial.update({
          where: { id },
          data: {
            name: body.name,
            role: body.role,
            company: body.company,
            content: body.content,
            rating: body.rating,
            avatar: body.avatar,
            isActive: body.isActive,
            order: body.order,
          }
        })
        return NextResponse.json(updatedTestimonial)

      // Why Choose Us Routes
      case 'update-why-choose-us':
        const updatedItem = await prisma.whyChooseUsItem.update({
          where: { id },
          data: {
            title: body.title,
            description: body.description,
            icon: body.icon,
            isActive: body.isActive,
            order: body.order,
          }
        })
        return NextResponse.json(updatedItem)

      // Book Demo Section Routes
      case 'update-book-demo':
        const updatedDemo = await prisma.bookDemoSection.update({
          where: { id },
          data: {
            title: body.title,
            description: body.description,
            buttonText: body.buttonText,
            formFields: body.formFields,
            isActive: body.isActive,
          }
        })
        return NextResponse.json(updatedDemo)

      // Demo Requests Routes
      case 'update-demo-request':
        const updatedRequest = await prisma.demoRequest.update({
          where: { id },
          data: {
            status: body.status,
          }
        })
        return NextResponse.json(updatedRequest)

      // Site Settings Routes
      case 'update-setting':
        const updatedSetting = await prisma.siteSettings.update({
          where: { id },
          data: {
            value: body.value,
            description: body.description,
          }
        })
        return NextResponse.json(updatedSetting)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    switch (action) {
      // Hero Section Routes
      case 'delete-hero':
        await prisma.heroSection.delete({ where: { id } })
        return NextResponse.json({ message: 'Hero section deleted' })

      // Products Routes
      case 'delete-product':
        await prisma.product.delete({ where: { id } })
        return NextResponse.json({ message: 'Product deleted' })

      // Testimonials Routes
      case 'delete-testimonial':
        await prisma.testimonial.delete({ where: { id } })
        return NextResponse.json({ message: 'Testimonial deleted' })

      // Why Choose Us Routes
      case 'delete-why-choose-us':
        await prisma.whyChooseUsItem.delete({ where: { id } })
        return NextResponse.json({ message: 'Why Choose Us item deleted' })

      // Book Demo Section Routes
      case 'delete-book-demo':
        await prisma.bookDemoSection.delete({ where: { id } })
        return NextResponse.json({ message: 'Book Demo section deleted' })

      // Demo Requests Routes
      case 'delete-demo-request':
        await prisma.demoRequest.delete({ where: { id } })
        return NextResponse.json({ message: 'Demo request deleted' })

      // Site Settings Routes
      case 'delete-setting':
        await prisma.siteSettings.delete({ where: { id } })
        return NextResponse.json({ message: 'Setting deleted' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}