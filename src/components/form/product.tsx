"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Upload,
  X,
  LinkIcon,
  ImageIcon,
  Tag,
  Users,
  Building,
  Settings,
  Globe,
  Zap,
  Star,
  AlertCircle,
  Check,
  Plus,
  DollarSign,
  Package,
  Sparkles,
  Trash2,
} from "lucide-react"
import { API_ROUTES } from "@/lib/api"
import type { ProductFormData } from "@/types/product"

const CreateProduct = () => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageUploadMode, setImageUploadMode] = useState<"url" | "upload">("url")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const [currentImageUrl, setCurrentImageUrl] = useState("")
  

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    price: "",
    originalPrice: "",
    currency: "USD",
    pricingModel: "one-time",
    image: "",
    images: [],
    videoUrl: "",
    brochureUrl: "",
    category: "",
    subCategory: "",
    tags: [],
    targetAudience: [],
    industries: [],
    useCases: [],
    features: [],
    benefits: [],
    specifications: {},
    systemRequirements: {},
    compatibility: [],
    integrations: [],
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    status: "draft",
    isActive: true,
    isFeatured: false,
    order: "",
  })

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      metaTitle: value,
    }))
  }

  // Handle array field changes
  const handleArrayField = (field: keyof ProductFormData, value: string, action: "add" | "remove", index?: number) => {
    setFormData((prev) => {
      const currentArray = (prev[field] as string[]) || []

      if (action === "add" && value.trim()) {
        return { ...prev, [field]: [...currentArray, value.trim()] }
      } else if (action === "remove" && typeof index === "number") {
        return { ...prev, [field]: currentArray.filter((_, i) => i !== index) }
      }
      return prev
    })
  }

  // Handle object field changes
  const handleObjectField = (field: keyof ProductFormData, key: string, value: string, action: "add" | "remove") => {
    setFormData((prev) => {
      const currentObj = (prev[field] as Record<string, string>) || {}

      if (action === "add" && key.trim() && value.trim()) {
        return { ...prev, [field]: { ...currentObj, [key.trim()]: value.trim() } }
      } else if (action === "remove") {
        const newObj = { ...currentObj }
        delete newObj[key]
        return { ...prev, [field]: newObj }
      }
      return prev
    })
  }

  // Handle multiple file upload
  const handleMultipleFileUpload = async (files: FileList) => {
    if (files.length === 0) return

    setUploadProgress(0)
    setUploadStatus("uploading")
    setUploadMessage(`Uploading ${files.length} image(s)...`)
    
    const formDataUpload = new FormData()
    formDataUpload.append("action", "upload-multiple")
    formDataUpload.append("folder", "products")
    formDataUpload.append("resource_type", "image")
    
    Array.from(files).forEach((file) => {
      formDataUpload.append("files", file)
    })

    try {
      const response = await fetch(API_ROUTES.UPLOAD.MULTIPLE, {
        method: "POST",
        body: formDataUpload,
      })

      if (response.ok) {
        const result = await response.json()
        const uploadedUrls = result.data.map((item: any) => item.url)
        
        setFormData((prev) => ({ 
          ...prev, 
          images: [...prev.images, ...uploadedUrls] 
        }))
        
        setUploadProgress(100)
        setUploadStatus("success")
        setUploadMessage(`${files.length} image(s) uploaded successfully!`)
        
        setTimeout(() => {
          setUploadStatus("idle")
          setUploadMessage("")
        }, 3000)
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      setUploadStatus("error")
      setUploadMessage("Upload failed. Please try again.")
      setUploadProgress(0)

      setTimeout(() => {
        setUploadStatus("idle")
        setUploadMessage("")
      }, 5000)
    }
  }

  // Add image URL
  const handleAddImageUrl = () => {
    if (currentImageUrl.trim()) {
      setFormData((prev) => ({ 
        ...prev, 
        images: [...prev.images, currentImageUrl.trim()] 
      }))
      setCurrentImageUrl("")
    }
  }

  // Remove image by index
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Set as main image
  const handleSetAsMainImage = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, image: imageUrl }))
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.shortDescription.trim()) newErrors.shortDescription = "Short description is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category.trim()) newErrors.category = "Category is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit form
  const handleSubmit = async (status: "draft" | "published") => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await fetch(API_ROUTES.PRODUCTS.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status }),
      })

      if (response.ok) {
        router.push("/dashboard/products")
      }
    } catch (error) {
      console.error("Failed to create product:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Array input component
  const ArrayInput = ({
    label,
    field,
    placeholder,
    icon: Icon,
    description,
  }: {
    label: string
    field: keyof ProductFormData
    placeholder: string
    icon: React.ElementType
    description?: string
  }) => {
    const [inputValue, setInputValue] = useState("")
    const items = formData[field] as string[]

    return (
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium text-gray-900">{label}</Label>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === "Enter" && inputValue.trim()) {
                handleArrayField(field, inputValue, "add")
                setInputValue("")
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (inputValue.trim()) {
                handleArrayField(field, inputValue, "add")
                setInputValue("")
              }
            }}
            className="px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Badge
                key={`${field}-${index}`}
                variant="secondary"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              >
                <Icon className="w-3 h-3 mr-1" />
                {item}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2 hover:bg-transparent text-blue-600 hover:text-blue-800"
                  onClick={() => handleArrayField(field, "", "remove", index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Object input component
  const ObjectInput = ({
    label,
    field,
    keyPlaceholder,
    valuePlaceholder,
    description,
  }: {
    label: string
    field: keyof ProductFormData
    keyPlaceholder: string
    valuePlaceholder: string
    description?: string
  }) => {
    const [keyInput, setKeyInput] = useState("")
    const [valueInput, setValueInput] = useState("")
    const items = formData[field] as Record<string, string>

    const handleAdd = () => {
      if (keyInput.trim() && valueInput.trim()) {
        handleObjectField(field, keyInput, valueInput, "add")
        setKeyInput("")
        setValueInput("")
      }
    }

    return (
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium text-gray-900">{label}</Label>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="flex gap-2">
          <Input
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1"
          />
          <Input
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1"
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="px-3">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {Object.entries(items).length > 0 && (
          <div className="space-y-2">
            {Object.entries(items).map(([key, value]) => (
              <div
                key={`${field}-${key}`}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border"
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{key}:</span>
                  <span className="text-gray-700 ml-2">{value}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleObjectField(field, key, "", "remove")}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
                <p className="text-gray-600 mt-1">Add a new product to your catalog with detailed information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit("draft")}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Save Draft
              </Button>
              <Button
                onClick={() => handleSubmit("published")}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Publish Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Basic Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Basic Information</CardTitle>
                    <CardDescription className="text-gray-600">Essential details about your product</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-900">
                      Product Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter your product title"
                      className={`${errors.title ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} h-11`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-medium text-gray-900">
                      URL Slug
                    </Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="product-url-slug"
                      className="border-gray-300 focus:border-blue-500 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription" className="text-sm font-medium text-gray-900">
                    Short Description *
                  </Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="A compelling brief description of your product"
                    rows={3}
                    maxLength={200}
                    className={`${errors.shortDescription ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} resize-none`}
                  />
                  <div className="flex justify-between items-center">
                    {errors.shortDescription && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.shortDescription}
                      </p>
                    )}
                    <span className="text-gray-400 text-sm ml-auto">{formData.shortDescription.length}/200</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-900">
                    Full Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide a detailed description of your product, its features, and benefits"
                    rows={6}
                    className={`${errors.description ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} resize-none`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-900">
                      Category *
                    </Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Software, Hardware, Service"
                      className={`${errors.category ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} h-11`}
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.category}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subCategory" className="text-sm font-medium text-gray-900">
                      Sub Category
                    </Label>
                    <Input
                      id="subCategory"
                      value={formData.subCategory}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
                      placeholder="e.g., CRM, Analytics, Design"
                      className="border-gray-300 focus:border-blue-500 h-11"
                    />
                  </div>
                </div>

                <ArrayInput
                  label="Tags"
                  field="tags"
                  placeholder="Add a tag (press Enter)"
                  icon={Tag}
                  description="Add relevant tags to help users find your product"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Pricing & Business */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Pricing & Business</CardTitle>
                    <CardDescription className="text-gray-600">
                      Set pricing and target market information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium text-gray-900">
                      Price
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, price: e.target.value ? Number(e.target.value) : "" }))
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="border-gray-300 focus:border-blue-500 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice" className="text-sm font-medium text-gray-900">
                      Original Price
                    </Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          originalPrice: e.target.value ? Number(e.target.value) : "",
                        }))
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="border-gray-300 focus:border-blue-500 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm font-medium text-gray-900">
                      Currency
                    </Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                      placeholder="USD"
                      className="border-gray-300 focus:border-blue-500 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricingModel" className="text-sm font-medium text-gray-900">
                    Pricing Model
                  </Label>
                  <Input
                    id="pricingModel"
                    value={formData.pricingModel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pricingModel: e.target.value }))}
                    placeholder="e.g., one-time, subscription, freemium"
                    className="border-gray-300 focus:border-blue-500 h-11"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ArrayInput
                    label="Target Audience"
                    field="targetAudience"
                    placeholder="Add target audience"
                    icon={Users}
                    description="Who is this product designed for?"
                  />

                  <ArrayInput
                    label="Industries"
                    field="industries"
                    placeholder="Add industry"
                    icon={Building}
                    description="Which industries can benefit from this product?"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Media & Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Media & Assets</CardTitle>
                    <CardDescription className="text-gray-600">Upload or link to your product media</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-900">Product Images</Label>
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={imageUploadMode === "url" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setImageUploadMode("url")}
                      className={imageUploadMode === "url" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={imageUploadMode === "upload" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setImageUploadMode("upload")}
                      className={imageUploadMode === "upload" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                  </div>

                  {imageUploadMode === "url" ? (
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        value={currentImageUrl}
                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="border-gray-300 focus:border-blue-500 h-11 flex-1"
                        onKeyPress={(e) => e.key === "Enter" && handleAddImageUrl()}
                      />
                      <Button
                        type="button"
                        onClick={handleAddImageUrl}
                        disabled={!currentImageUrl.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files
                          if (files && files.length > 0) handleMultipleFileUpload(files)
                        }}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
                      >
                        <Upload className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mx-auto mb-4 transition-colors" />
                        <div className="text-gray-600 font-medium group-hover:text-blue-600 transition-colors">
                          Click to upload images
                        </div>
                        <div className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 10MB each • Multiple files supported</div>
                      </div>
                      
                      {/* Upload Progress */}
                      {uploadStatus === "uploading" && (
                        <div className="mt-4">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                            />
                            {uploadMessage}
                          </div>
                        </div>
                      )}
                      
                      {/* Upload Status Messages */}
                      {uploadStatus === "success" && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm text-green-700 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            {uploadMessage}
                          </div>
                        </div>
                      )}
                      
                      {uploadStatus === "error" && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-sm text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {uploadMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Images Preview */}
                  {formData.images.length > 0 && (
                    <div className="mt-6">
                      <div className="text-sm font-medium text-gray-900 mb-4">
                        Uploaded Images ({formData.images.length})
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50 shadow-sm">
                              <Image
                                src={imageUrl}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                              
                              {/* Image Actions */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleSetAsMainImage(imageUrl)}
                                  className="bg-white/90 hover:bg-white text-gray-900 text-xs px-2 py-1 h-auto"
                                >
                                  Set Main
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRemoveImage(index)}
                                  className="bg-red-500/90 hover:bg-red-600 text-white p-1 h-auto"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              {/* Main Image Badge */}
                              {formData.image === imageUrl && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-blue-600 text-white text-xs">
                                    Main
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl" className="text-sm font-medium text-gray-900">
                      Product Video URL
                    </Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                      className="border-gray-300 focus:border-blue-500 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brochureUrl" className="text-sm font-medium text-gray-900">
                      Product Brochure URL
                    </Label>
                    <Input
                      id="brochureUrl"
                      type="url"
                      value={formData.brochureUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, brochureUrl: e.target.value }))}
                      placeholder="https://example.com/brochure.pdf"
                      className="border-gray-300 focus:border-blue-500 h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features & Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Features & Benefits</CardTitle>
                    <CardDescription className="text-gray-600">
                      Highlight what makes your product special
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ArrayInput
                    label="Key Features"
                    field="features"
                    placeholder="Add a feature"
                    icon={Zap}
                    description="What can your product do?"
                  />

                  <ArrayInput
                    label="Key Benefits"
                    field="benefits"
                    placeholder="Add a benefit"
                    icon={Star}
                    description="How does it help users?"
                  />
                </div>

                <ObjectInput
                  label="Specifications"
                  field="specifications"
                  keyPlaceholder="Specification name"
                  valuePlaceholder="Specification value"
                  description="Technical specifications and details"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Technical Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Settings className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Technical Details</CardTitle>
                    <CardDescription className="text-gray-600">
                      Technical specifications and requirements
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ObjectInput
                  label="System Requirements"
                  field="systemRequirements"
                  keyPlaceholder="Requirement type"
                  valuePlaceholder="Requirement details"
                  description="What systems or conditions are needed?"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ArrayInput
                    label="Compatibility"
                    field="compatibility"
                    placeholder="Add compatibility"
                    icon={Settings}
                    description="What platforms or systems is it compatible with?"
                  />

                  <ArrayInput
                    label="Integrations"
                    field="integrations"
                    placeholder="Add integration"
                    icon={Globe}
                    description="What other tools does it integrate with?"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SEO & Marketing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Globe className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">SEO & Marketing</CardTitle>
                    <CardDescription className="text-gray-600">
                      Optimize your product for search engines
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle" className="text-sm font-medium text-gray-900">
                    Meta Title
                  </Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="SEO-optimized title"
                    maxLength={60}
                    className="border-gray-300 focus:border-blue-500 h-11"
                  />
                  <p className="text-gray-400 text-sm">{formData.metaTitle.length}/60 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription" className="text-sm font-medium text-gray-900">
                    Meta Description
                  </Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Brief description for search results"
                    rows={3}
                    maxLength={160}
                    className="border-gray-300 focus:border-blue-500 resize-none"
                  />
                  <p className="text-gray-400 text-sm">{formData.metaDescription.length}/160 characters</p>
                </div>

                <ArrayInput
                  label="SEO Keywords"
                  field="keywords"
                  placeholder="Add keyword"
                  icon={Tag}
                  description="Keywords to help people find your product"
                />

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="order" className="text-sm font-medium text-gray-900">
                      Display Order
                    </Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, order: e.target.value ? Number(e.target.value) : "" }))
                      }
                      placeholder="0"
                      min="0"
                      className="border-gray-300 focus:border-blue-500 h-11"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="featured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, isFeatured: checked as boolean }))
                        }
                        className="border-gray-300"
                      />
                      <Label htmlFor="featured" className="text-sm font-medium text-gray-900">
                        Featured Product
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="active"
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, isActive: checked as boolean }))
                        }
                        className="border-gray-300"
                      />
                      <Label htmlFor="active" className="text-sm font-medium text-gray-900">
                        Active Product
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CreateProduct