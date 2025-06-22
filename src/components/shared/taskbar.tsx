'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BarChart3,
  Package,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  Bell,
  Search,
  Plus
} from 'lucide-react'

interface TaskbarItem {
  id: string
  name: string
  icon: React.ElementType
  href: string
  color: string
}

const Taskbar = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  // Don't show taskbar on home and login pages
  const shouldShowTaskbar = !['/', '/login'].includes(pathname)

  const taskbarItems: TaskbarItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      href: '/dashboard',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'products',
      name: 'Products',
      icon: Package,
      href: '/products',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'requests',
      name: 'Demo Requests',
      icon: Calendar,
      href: '/dashboard/requests',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      icon: MessageSquare,
      href: '/testimonial',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'users',
      name: 'Users',
      icon: Users,
      href: '/dashboard/users',
      color: 'from-indigo-500 to-indigo-600'
    },
  ]

  // Auto-hide functionality
  useEffect(() => {
    if (!shouldShowTaskbar) return

    const startHideTimer = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      hideTimeoutRef.current = setTimeout(() => {
        if (!isHovered) {
          setIsVisible(false)
        }
      }, 15000) // Hide after 15 seconds
    }

    if (isVisible && !isHovered) {
      startHideTimer()
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [isVisible, isHovered, pathname, shouldShowTaskbar])

  // Show taskbar when mouse is near bottom
  useEffect(() => {
    if (!shouldShowTaskbar) return

    const handleMouseMove = (e: MouseEvent) => {
      const bottomThreshold = window.innerHeight - 100
      
      if (e.clientY > bottomThreshold && !isVisible) {
        setIsVisible(true)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [isVisible, shouldShowTaskbar])

  // Reset visibility when pathname changes
  useEffect(() => {
    if (shouldShowTaskbar) {
      setIsVisible(true)
    }
  }, [pathname, shouldShowTaskbar])

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setActiveTooltip(null)
  }

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true
    if (href !== '/dashboard' && pathname.startsWith(href)) return true
    return false
  }

  // Don't render taskbar on home and login pages
  if (!shouldShowTaskbar) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            opacity: { duration: 0.2 }
          }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Taskbar Container */}
          <div className="relative">
            {/* Background with glassmorphism effect */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl" />
            
            {/* Taskbar Items */}
            <div className="relative flex items-center gap-2 px-4 py-3">
              {taskbarItems.map((item, index) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <div key={item.id} className="relative">
                    {/* Tooltip */}
                    <AnimatePresence>
                      {activeTooltip === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2"
                        >
                          <div className="bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                            {item.name}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Taskbar Item */}
                    <Link href={item.href}>
                      <motion.div
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                        onMouseEnter={() => setActiveTooltip(item.id)}
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        {/* Active indicator */}
                        {active && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        
                        {/* Icon container */}
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                          ${active 
                            ? `bg-gradient-to-r ${item.color} shadow-lg` 
                            : 'bg-white/30 hover:bg-white/50'
                          }
                        `}>
                          <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-700'}`} />
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                )
              })}
              
              {/* Divider */}
              <div className="w-px h-8 bg-white/30 mx-2" />
              
            
            </div>
            
            {/* Tooltips for quick actions */}
            <AnimatePresence>
              {activeTooltip === 'add' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className="absolute bottom-full mb-2 right-20 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg"
                >
                  Quick Add
                </motion.div>
              )}
              {activeTooltip === 'search' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className="absolute bottom-full mb-2 right-12 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg"
                >
                  Search
                </motion.div>
              )}
              {activeTooltip === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className="absolute bottom-full mb-2 right-4 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg"
                >
                  Notifications
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Taskbar