import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="h-full">
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow flex flex-col">

        {/* Image — fixed height */}
        <div className="relative flex-shrink-0 overflow-hidden bg-gray-100" style={{ height: '220px' }}>
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-600">-{discount}%</Badge>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <Badge className="absolute top-2 right-2 bg-orange-600">Only {product.stock} left</Badge>
          )}
        </div>

        <CardContent className="p-4 flex flex-col flex-1">

          {/* Brand — 1 line cố định */}
          <div className="text-xs text-gray-500 mb-1 truncate" style={{ height: '1rem' }}>
            {product.brand}
          </div>

          {/* Name — luôn 2 dòng, không hơn không kém */}
          <h3
            className="font-semibold group-hover:text-blue-600 transition-colors mb-2"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '2.75rem',       // cố định đúng 2 dòng
              lineHeight: '1.375rem',
            }}
          >
            {product.name}
          </h3>

          {/* Rating — 1 dòng cố định */}
          <div className="flex items-center gap-1 mb-2" style={{ height: '1.25rem' }}>
            <Star className="size-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
            <span className="text-sm">{product.rating}</span>
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>

          {/* Price — 1 dòng cố định */}
          <div className="flex items-center gap-2 mb-3" style={{ height: '1.75rem' }}>
            <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Button — luôn ở đáy */}
          <Button
            className="w-full mt-auto"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="size-4 mr-2" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

        </CardContent>
      </Card>
    </Link>
  );
}