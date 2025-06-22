"use client";

import { useState, useRef, useEffect } from "react";
import CreateProduct from "@/components/form/product";
import ProductShowcase from "@/components/minicomponents/product/view";
import { GripVertical } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductsPage() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(60); // Default 60%
  const resizerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

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

  return (
    <div 
      ref={containerRef} 
      className="flex h-screen overflow-hidden bg-white"
    >
      {/* Left panel - Create form */}
      <div 
        className="h-full overflow-auto relative"
        style={{ width: `${leftPanelWidth}%` }}
      >
        {/* Custom wrapper to control padding and margins */}
        <div className="w-full h-full">
          <style jsx global>{`
            /* Override form component's inner padding */
            .product-form-container .max-w-4xl {
              max-width: 100% !important;
              padding-left: 1rem !important;
              padding-right: 1rem !important;
            }
            
            /* Remove extra margin/padding from the form */
            .product-form-container .min-h-screen {
              min-height: 0 !important;
              padding: 0 !important;
            }
            
            /* Ensure the header has consistent height */
            .product-form-container .bg-white.shadow-sm.border-b {
              height: 72px;
              display: flex;
              align-items: center;
            }
          `}</style>
          <div className="product-form-container w-full h-full">
            <CreateProduct />
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
      
      {/* Right panel - Product showcase */}
      <div 
        className="h-full overflow-auto bg-gray-50"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        {/* Custom wrapper for product showcase to align header height */}
        <div className="w-full h-full">
          <style jsx global>{`
            /* Ensure the header of showcase has consistent styling */
            .product-showcase-container .container {
              padding-top: 0 !important;
            }
            
            /* Match the header height with left panel */
            .product-showcase-container .mb-8 {
              height: 72px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              margin-bottom: 1rem !important;
            }
          `}</style>
          {100 - leftPanelWidth < 35 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center p-4"
            >
              <div className="text-center">
                <p className="text-gray-500">Drag handle leftward to expand product view</p>
              </div>
            </motion.div>
          ) : (
            <div className="product-showcase-container h-full">
              <ProductShowcase />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}