import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Product } from '../types';
import { productService } from '../services/productService';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [sortBy, setSortBy] = useState('popular');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) setSelectedCategory(category);
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await productService.getProducts({ page: 1, pageSize: 100 });
        setProducts(list);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const categories = useMemo(() => {
    const categorySet = Array.from(new Set(products.map((p) => p.category)));
    return [{ name: 'All Products', slug: 'all' }, ...categorySet.map((c) => ({ name: c, slug: c }))];
  }, [products]);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);

  let filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    return categoryMatch && brandMatch && priceMatch;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        return b.reviews - a.reviews;
    }
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') searchParams.delete('category');
    else searchParams.set('category', category);
    setSearchParams(searchParams);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrands([]);
    setPriceRange([0, 50000000]);
    setSortBy('popular');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <Button key={category.slug} variant={selectedCategory === category.slug ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => handleCategoryChange(category.slug)}>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox id={`brand-${brand}`} checked={selectedBrands.includes(brand)} onCheckedChange={() => toggleBrand(brand)} />
              <Label htmlFor={`brand-${brand}`} className="cursor-pointer">{brand}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider
            min={0}
            max={50000000}
            step={100000}
            value={priceRange}
            onValueChange={(value: number[]) => setPriceRange([value[0] ?? 0, value[1] ?? 50000000])}
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${priceRange[0].toLocaleString()}</span><span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>Clear All Filters</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">Showing {filteredProducts.length} of {products.length} products</p>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0"><div className="sticky top-24 bg-white rounded-lg p-6 shadow-sm"><FilterContent /></div></aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild><Button variant="outline" className="lg:hidden"><SlidersHorizontal className="size-4 mr-2" />Filters</Button></SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><div className="mt-6"><FilterContent /></div></SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(selectedCategory !== 'all' || selectedBrands.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory !== 'all' && (
                  <Button variant="secondary" size="sm" onClick={() => handleCategoryChange('all')}>
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                    <X className="ml-2 size-3" />
                  </Button>
                )}
                {selectedBrands.map((brand) => (
                  <Button key={brand} variant="secondary" size="sm" onClick={() => toggleBrand(brand)}>
                    {brand}
                    <X className="ml-2 size-3" />
                  </Button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading products...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="text-center py-12"><p className="text-gray-500 mb-4">No products found</p><Button onClick={clearFilters}>Clear Filters</Button></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
