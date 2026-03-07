import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Star, ShoppingCart, Minus, Plus, Package, Truck, Shield, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Product } from '../types';
import { productService } from '../services/productService';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const p = await productService.getProductById(id);
        setProduct(p);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate('/products')}>Back to Products</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart`);
  };

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link><span>/</span>
          <Link to="/products" className="hover:text-blue-600">Products</Link><span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}><ArrowLeft className="size-4 mr-2" />Back</Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg p-8">
            <div className="aspect-square relative">
              <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
              {discount > 0 && <Badge className="absolute top-4 left-4 bg-red-600 text-lg px-3 py-1">-{discount}%</Badge>}
            </div>
          </div>

          <div className="bg-white rounded-lg p-8">
            <div className="text-sm text-gray-500 mb-2">{product.brand}</div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className={`size-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}</div>
              <span className="text-sm">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
            </div>

            <div className="mb-6">
              {product.stock > 0 ? (
                <Badge variant="outline" className="border-green-600 text-green-600"><Package className="size-3 mr-1" />In Stock ({product.stock} available)</Badge>
              ) : (
                <Badge variant="outline" className="border-red-600 text-red-600">Out of Stock</Badge>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="mb-6">
              <Label className="mb-2 block">Quantity</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}><Minus className="size-4" /></Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}><Plus className="size-4" /></Button>
              </div>
            </div>

            <Button size="lg" className="w-full mb-4" onClick={handleAddToCart} disabled={product.stock === 0}><ShoppingCart className="size-5 mr-2" />Add to Cart</Button>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center"><Truck className="size-6 mx-auto mb-2 text-blue-600" /><div className="text-xs text-gray-600">Free Shipping</div></div>
              <div className="text-center"><Shield className="size-6 mx-auto mb-2 text-blue-600" /><div className="text-xs text-gray-600">2 Year Warranty</div></div>
              <div className="text-center"><Package className="size-6 mx-auto mb-2 text-blue-600" /><div className="text-xs text-gray-600">Easy Returns</div></div>
            </div>
          </div>
        </div>

        <Card className="mb-12">
          <CardContent className="p-6">
            <Tabs defaultValue="specs">
              <TabsList><TabsTrigger value="specs">Specifications</TabsTrigger><TabsTrigger value="description">Description</TabsTrigger></TabsList>
              <TabsContent value="specs" className="mt-6"><div className="text-gray-500">No specification details from API.</div></TabsContent>
              <TabsContent value="description" className="mt-6"><p className="text-gray-600 leading-relaxed">{product.description}</p></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
