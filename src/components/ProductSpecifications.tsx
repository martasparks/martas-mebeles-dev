"use client";
import React, { useEffect, useState } from "react";

type Attribute = {
  id: string;
  attributeType: { id: string; name: string };
  attributeValue?: { id: string; value: string };
  customValue?: string;
};

export default function ProductSpecifications({ productId }: { productId: string }) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  useEffect(() => {
    fetch(`/api/products/${productId}/attributes`)
      .then((res) => res.json())
      .then((data) => setAttributes(data));
  }, [productId]);

  if (attributes.length === 0) {
    return <p className="text-gray-500">Nav specifikāciju</p>;
  }

  // Sadalām atribūtus divās kolonnās
  const midPoint = Math.ceil(attributes.length / 2);
  const leftColumn = attributes.slice(0, midPoint);
  const rightColumn = attributes.slice(midPoint);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Izmēri un īpašības</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {/* Kreisā kolonna */}
        <div className="p-0">
          {leftColumn.map((attr, index) => (
            <div 
              key={attr.id} 
              className={`flex justify-between items-center px-6 py-3 ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <span className="text-sm text-gray-600 font-medium">
                {attr.attributeType.name}:
              </span>
              <span className="text-sm text-gray-900 font-semibold">
                {attr.attributeValue ? attr.attributeValue.value : attr.customValue}
              </span>
            </div>
          ))}
        </div>

        {/* Labā kolonna */}
        <div className="p-0">
          {rightColumn.map((attr, index) => (
            <div 
              key={attr.id} 
              className={`flex justify-between items-center px-6 py-3 ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <span className="text-sm text-gray-600 font-medium">
                {attr.attributeType.name}:
              </span>
              <span className="text-sm text-gray-900 font-semibold">
                {attr.attributeValue ? attr.attributeValue.value : attr.customValue}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
