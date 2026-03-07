import React from 'react';
import { Link } from 'react-router-dom';
import { products, categories } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowRight, Cpu, Monitor, Zap, Shield } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function HomePage() {
  const featuredProducts = products.filter((p) => p.originalPrice).slice(0, 4);
  const popularProducts = products
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Build Your Dream PC
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Premium computer components and custom builds. Get the performance you deserve.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-gray-100">
                  <Link to="/build-pc">
                    Build Your PC
                    <ArrowRight className="ml-2 size-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-blue-500 hover:bg-white/10">
                  <Link to="/products">Browse Products</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1733945761533-727f49908d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb21wdXRlciUyMHNldHVwfGVufDF8fHx8MTc2ODQ0OTM5MXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Gaming Setup"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center size-12 bg-blue-100 rounded-full mb-4">
                  <Zap className="size-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Fast Shipping</h3>
                <p className="text-sm text-gray-600">
                  Free shipping on orders over $50
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center size-12 bg-blue-100 rounded-full mb-4">
                  <Shield className="size-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Warranty</h3>
                <p className="text-sm text-gray-600">
                  2-year warranty on all products
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center size-12 bg-blue-100 rounded-full mb-4">
                  <Cpu className="size-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Expert Support</h3>
                <p className="text-sm text-gray-600">
                  24/7 technical support available
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center size-12 bg-blue-100 rounded-full mb-4">
                  <Monitor className="size-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Custom Builds</h3>
                <p className="text-sm text-gray-600">
                  Personalized PC configurations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.filter((cat) => cat.slug !== 'all').slice(0, 10).map((category) => (
              <Link
                key={category.slug}
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Cpu className="size-8 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Hot Deals</h2>
            <Button variant="outline" asChild>
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Popular Products</h2>
            <Button variant="outline" asChild>
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your Dream PC?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Use our PC Builder to create the perfect custom computer for your needs.
          </p>
          <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-gray-100">
            <Link to="/build-pc">
              Start Building
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
