'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Users,
  Bell,
  Search,
  TrendingUp,
  Calendar,
  Plus,
  Eye,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Package,
  Clock,
  ChevronRight,
  LogOut,
  Settings
} from 'lucide-react'
import { API_ROUTES } from '@/lib/api'

interface DashboardStats {
  totalProducts: number
  totalTestimonials: number
  totalDemoRequests: number
  pendingRequests: number
}

interface Admin {
  id: string
  name: string
  email: string
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const adminData = localStorage.getItem('admin')
    
    if (!token || !adminData) {
      router.push('/login')
      return
    }

    setAdmin(JSON.parse(adminData))
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(API_ROUTES.DASHBOARD.GET_STATS)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    router.push('/login')
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const statsCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Testimonials',
      value: stats?.totalTestimonials || 0,
      icon: Star,
      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Demo Requests',
      value: stats?.totalDemoRequests || 0,
      icon: Calendar,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      trend: '+23%',
      trendUp: true
    },
    {
      title: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      icon: Clock,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      trend: '-5%',
      trendUp: false
    }
  ]

  const quickActions = [
    { 
      title: 'Add Product', 
      icon: Plus, 
      href: '/dashboard/products/new', 
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      description: 'Create new product'
    },
    { 
      title: 'View Requests', 
      icon: Eye, 
      href: '/dashboard/requests', 
      color: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      description: 'Manage demo requests'
    },
    { 
      title: 'Manage Users', 
      icon: Users, 
      href: '/dashboard/users', 
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      description: 'User management'
    },
    { 
      title: 'Settings', 
      icon: Settings, 
      href: '/dashboard/settings', 
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      description: 'System settings'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.webp"
                  alt="Nexus Logo"
                  width={120}
                  height={24}
                  className="h-8 w-auto"
                />
              </Link>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard
              </h1>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {stats?.pendingRequests && stats.pendingRequests > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    {stats.pendingRequests}
                  </span>
                )}
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {admin?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {admin?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Administrator
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {admin?.name}! 👋
          </h2>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your dashboard today.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              className={`${card.bgColor} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  card.trendUp ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {card.trend}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {card.value.toLocaleString()}
              </h3>
              <p className={`text-sm font-medium ${card.textColor}`}>
                {card.title}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className={`block p-6 rounded-2xl text-white transition-all duration-300 shadow-lg hover:shadow-xl ${action.color}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <action.icon className="w-8 h-8" />
                    <ChevronRight className="w-5 h-5 opacity-70" />
                  </div>
                  <h4 className="text-lg font-semibold mb-1">{action.title}</h4>
                  <p className="text-sm opacity-90">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                { action: 'New demo request from Acme Corp', time: '2 minutes ago', type: 'request' },
                { action: 'Product "AI Assistant" was updated', time: '1 hour ago', type: 'update' },
                { action: 'New testimonial added', time: '3 hours ago', type: 'testimonial' },
                { action: 'User John Doe registered', time: '5 hours ago', type: 'user' }
              ].map((activity, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    activity.type === 'request' ? 'bg-blue-500' :
                    activity.type === 'update' ? 'bg-green-500' :
                    activity.type === 'testimonial' ? 'bg-pink-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              Performance Overview
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Chart visualization coming soon</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard