'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Grid3X3, 
  List, 
  ChevronRight, 
  Tag, 
  ShoppingCart, 
  Sparkles, 
  Search 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCTS } from '@/lib/api';

// Product type definition
interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  image: string;
  images: string[];
  price: number;
  originalPrice?: number;
  currency: string;
  category?: string;
  tags?: string[];
  isFeatured: boolean;
  status: 'published' | 'draft';
}

// View modes
type ViewMode = 'grid' | 'list';

export default function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{category: string, _count: {category: number}}[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories first
        const categoriesResponse = await fetch(PRODUCTS.GET_CATEGORIES);
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // Fetch products based on selected category
        const url = selectedCategory === 'all' 
          ? PRODUCTS.GET_ALL
          : PRODUCTS.GET_BY_CATEGORY(selectedCategory);
          
        const productsResponse = await fetch(url);
        let productsData = await productsResponse.json();
        
        // Filter by search query if present
        if (searchQuery) {
          productsData = productsData.filter((product: Product) => 
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCategory, searchQuery]);

  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  // Filter products by category and search
  const filteredProducts = products;

  return (
    <div className="container mx-auto py-8">
      {/* Header with filters and search */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
            Our Products
          </h1>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button
              variant={viewMode === 'grid' ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Category filter */}
          <div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
             <SelectContent>
  <SelectItem value="all">All Categories</SelectItem>
  {(Array.isArray(categories) ? categories : []).map((cat) => (
    <SelectItem key={cat.category} value={cat.category}>
      {cat.category} ({cat._count.category})
    </SelectItem>
  ))}
</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* No products message */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold mb-2">No products found</h3>
          <p className="text-gray-500">
            Try changing your search criteria or browse all categories
          </p>
          <Button 
            className="mt-4 bg-blue-600 hover:bg-blue-700" 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            View All Products
          </Button>
        </div>
      )}

      {/* Products grid view */}
      {!loading && viewMode === 'grid' && filteredProducts.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                  {/* Product image */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400">
                        No image
                      </div>
                    )}
                    
                    {/* Featured badge */}
                    {product.isFeatured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-pink-500 hover:bg-pink-600">
                          <Sparkles className="h-3 w-3 mr-1" /> Featured
                        </Badge>
                      </div>
                    )}
                    
                    {/* Category tag */}
                    {product.category && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                          <Tag className="h-3 w-3 mr-1" /> {product.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2 text-xl">{product.title}</CardTitle>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-lg text-blue-600">
                        {formatPrice(product.price, product.currency)}
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through ml-2">
                            {formatPrice(product.originalPrice, product.currency)}
                          </span>
                        )}
                      </p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2 flex-grow">
                    <CardDescription className="line-clamp-3">
                      {product.shortDescription}
                    </CardDescription>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors">
                      <ShoppingCart className="h-4 w-4 mr-2" /> View Details
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Products list view */}
      {!loading && viewMode === 'list' && filteredProducts.length > 0 && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                  <div className="flex flex-col sm:flex-row">
                    {/* Product image */}
                    <div className="relative h-48 sm:h-auto sm:w-1/4 flex-shrink-0 bg-gray-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400">
                          No image
                        </div>
                      )}
                      
                      {/* Featured badge */}
                      {product.isFeatured && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-pink-500 hover:bg-pink-600">
                            <Sparkles className="h-3 w-3 mr-1" /> Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 sm:w-3/4 flex flex-col">
                      <div className="flex justify-between mb-2">
                        {product.category && (
                          <Badge variant="outline" className="self-start">
                            <Tag className="h-3 w-3 mr-1" /> {product.category}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{product.shortDescription}</p>
                      
                      <div className="flex justify-between items-end mt-auto">
                        <div>
                          <p className="font-bold text-lg text-blue-600">
                            {formatPrice(product.price, product.currency)}
                            {product.originalPrice && (
                              <span className="text-sm text-gray-400 line-through ml-2">
                                {formatPrice(product.originalPrice, product.currency)}
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}