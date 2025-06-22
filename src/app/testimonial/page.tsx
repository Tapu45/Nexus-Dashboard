"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { GripVertical, Star, Plus, Trash2, Edit2, Eye, AlertCircle } from "lucide-react";
import { TESTIMONIALS } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// Testimonial type definition
interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function TestimonialsPage() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(55);
  const resizerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: "",
    role: "",
    company: "",
    content: "",
    rating: 5,
    avatar: "",
    isActive: true,
    order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle resizing
  useEffect(() => {
    const container = containerRef.current;
    const resizer = resizerRef.current;
    if (!container || !resizer) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Limit the resize between 30% and 80%
      if (newLeftWidth >= 30 && newLeftWidth <= 80) {
        setLeftPanelWidth(newLeftWidth);
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    resizer.addEventListener("mousedown", onMouseDown);
    
    // Clean up
    return () => {
      resizer.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const response = await fetch(TESTIMONIALS.GET_ALL);
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data);
        } else {
         toast.error("Failed to fetch testimonials");
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        toast.error("An Unexpected Error Occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [toast]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      company: "",
      content: "",
      rating: 5,
      avatar: "",
      isActive: true,
      order: 0,
    });
    setEditMode(false);
    setSelectedTestimonial(null);
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("action", "upload-single");
    formDataUpload.append("file", file);
    formDataUpload.append("folder", "testimonials");
    formDataUpload.append("resource_type", "image");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, avatar: data.url }));
      } else {
       toast.error("Upload failed! could not upload the file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Upload failed! could not upload the file");
    }
  };

  // Handle testimonial selection for editing
  const handleEditTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company,
      content: testimonial.content,
      rating: testimonial.rating,
      avatar: testimonial.avatar,
      isActive: testimonial.isActive,
      order: testimonial.order,
    });
    setEditMode(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (editMode && selectedTestimonial) {
        // Update existing testimonial
        response = await fetch(TESTIMONIALS.UPDATE(selectedTestimonial.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new testimonial
        response = await fetch(TESTIMONIALS.CREATE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        const data = await response.json();
        
        setTestimonials((prev) => {
          if (editMode) {
            return prev.map((item) => (item.id === data.id ? data : item));
          } else {
            return [...prev, data];
          }
        });
        
        toast.success(
  editMode 
    ? "The testimonial has been updated successfully" 
    : "New testimonial has been created successfully", 
  {
    description: editMode ? "Testimonial Updated" : "Testimonial Created"
  }
);
        
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save testimonial");
      }
    } catch (error) {
      console.error("Error saving testimonial:", error);
     toast.success(
  editMode 
    ? "The testimonial has been updated successfully" 
    : "New testimonial has been created successfully", 
  {
    description: editMode ? "Testimonial Updated" : "Testimonial Created"
  }
);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle testimonial deletion
  const handleDeleteTestimonial = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      try {
        const response = await fetch(TESTIMONIALS.DELETE(id), {
          method: "DELETE",
        });

        if (response.ok) {
          setTestimonials((prev) => prev.filter((item) => item.id !== id));
          
         toast.success("The testimonial has been deleted successfully");
          
          if (selectedTestimonial?.id === id) {
            resetForm();
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete testimonial");
        }
      } catch (error) {
        console.error("Error deleting testimonial:", error);
       toast.error(
  error instanceof Error ? error.message : "Failed to delete testimonial",
  {
    description: "Deletion Error"
  }
);
      }
    }
  };

  // Rating stars component
  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className="flex h-screen overflow-hidden bg-white"
    >
      {/* Left panel - Create/Edit form */}
      <div 
        className="h-full overflow-auto border-r"
        style={{ width: `${leftPanelWidth}%` }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm border-b h-[70px] flex items-center px-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {editMode ? "Cancel Edit" : "New Testimonial"}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  form="testimonial-form"
                  disabled={isSubmitting}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Saving...</span>
                    </div>
                  ) : editMode ? (
                    "Update Testimonial"
                  ) : (
                    "Add Testimonial"
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Form content */}
          <div className="flex-1 overflow-auto p-6">
            <form id="testimonial-form" onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        placeholder="CEO"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        placeholder="Acme Inc."
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Select
                        value={formData.rating?.toString()}
                        onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} {rating === 1 ? "Star" : "Stars"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Avatar */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Profile Image</h2>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Avatar className="h-16 w-16 border">
                        <AvatarImage src={formData.avatar || ""} alt={formData.name} />
                        <AvatarFallback>{formData.name ? formData.name.charAt(0) : "?"}</AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="avatar">Avatar URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="avatar"
                          placeholder="https://example.com/avatar.jpg"
                          value={formData.avatar || ""}
                          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        />
                        <input
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Browse
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Testimonial Content */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Testimonial</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Share your experience..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                </div>
                
                {/* Organization */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Organization</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="order">Display Order</Label>
                      <Input
                        id="order"
                        type="number"
                        placeholder="0"
                        value={formData.order?.toString() || "0"}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-gray-500">Lower numbers appear first</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="isActive">Status</Label>
                      <Select
                        value={formData.isActive ? "active" : "inactive"}
                        onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Resizer */}
      <div 
        ref={resizerRef}
        className="h-full w-2 bg-gray-100 hover:bg-blue-200 cursor-col-resize flex items-center justify-center relative z-10 active:bg-blue-300 transition-colors"
      >
        <div className="absolute inset-y-0 flex items-center justify-center pointer-events-none">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      {/* Right panel - Testimonials list */}
      <div 
        className="h-full overflow-auto bg-gray-50"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm border-b h-[70px] flex items-center px-6">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl font-semibold">Testimonials</h1>
              
              <Button 
                onClick={() => {
                  resetForm();
                  setEditMode(false);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Testimonial
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">No testimonials found</h3>
                <p className="text-gray-500 mt-2 mb-6">Start adding testimonials from your clients</p>
                <Button 
                  onClick={() => {
                    resetForm();
                    setEditMode(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Testimonial
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {testimonials.map((testimonial) => (
                  <Card 
                    key={testimonial.id}
                    className={`overflow-hidden transition-all duration-200 ${
                      selectedTestimonial?.id === testimonial.id 
                        ? "ring-2 ring-blue-500 shadow-lg" 
                        : "hover:shadow-md"
                    } ${
                      !testimonial.isActive && "opacity-70"
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/4 bg-gray-50 p-6 flex flex-col items-center justify-center text-center border-r">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                          {testimonial.role && (
                            <p className="text-gray-600 text-sm">{testimonial.role}</p>
                          )}
                          {testimonial.company && (
                            <p className="text-gray-600 text-sm">{testimonial.company}</p>
                          )}
                          <div className="mt-3">
                            <RatingStars rating={testimonial.rating} />
                          </div>
                          {!testimonial.isActive && (
                            <div className="mt-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                              Inactive
                            </div>
                          )}
                        </div>
                        
                        <div className="sm:w-3/4 p-6">
                          <div className="flex justify-end mb-4 space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditTestimonial(testimonial)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteTestimonial(testimonial.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                          
                          <div className="relative">
                            <div className="text-3xl text-gray-200 absolute top-0 left-0">"</div>
                            <div className="pl-6 pt-2">
                              <p className="text-gray-700">{testimonial.content}</p>
                            </div>
                            <div className="text-3xl text-gray-200 absolute bottom-0 right-0">"</div>
                          </div>
                          
                          <div className="mt-6 text-xs text-gray-500 flex justify-between">
                            <span>Order: #{testimonial.order}</span>
                            <span>ID: {testimonial.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}