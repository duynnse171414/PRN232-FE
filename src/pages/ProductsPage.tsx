import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { SlidersHorizontal, X, Search, Package, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Product } from '../types';
import { productService } from '../services/productService';

const catIcons: Record<string, string> = {
  CPU: '🔲', GPU: '🎮', RAM: '💾', SSD: '💿', Storage: '💿',
  Motherboard: '🔌', PSU: '⚡', Case: '🗄️', Cooling: '❄️',
  Monitor: '🖥️', Keyboard: '⌨️', Mouse: '🖱️', Headset: '🎧', default: '🔧',
};

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
    const categorySet = Array.from(new Set(products.map(p => p.category)));
    return [{ name: 'All Products', slug: 'all' }, ...categorySet.map(c => ({ name: c, slug: c }))];
  }, [products]);

  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand))).sort(), [products]);

  let filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    return categoryMatch && brandMatch && priceMatch;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      default: return b.reviews - a.reviews;
    }
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') searchParams.delete('category');
    else searchParams.set('category', category);
    setSearchParams(searchParams);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrands([]);
    setPriceRange([0, 50000000]);
    setSortBy('popular');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedBrands.length > 0;

  const FilterContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Categories */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>
          Categories
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: selectedCategory === cat.slug ? 600 : 400,
                background: selectedCategory === cat.slug
                  ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
                  : 'transparent',
                color: selectedCategory === cat.slug ? '#fff' : '#374151',
                transition: 'all .2s', textAlign: 'left',
              }}
              onMouseEnter={e => { if (selectedCategory !== cat.slug) (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; }}
              onMouseLeave={e => { if (selectedCategory !== cat.slug) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 16 }}>{catIcons[cat.slug] || catIcons.default}</span>
              <span style={{ flex: 1 }}>{cat.name}</span>
              {selectedCategory === cat.slug && <ChevronRight size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>
          Brands
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {brands.map(brand => (
            <div key={brand} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label htmlFor={`brand-${brand}`} style={{ cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: selectedBrands.includes(brand) ? 600 : 400, color: selectedBrands.includes(brand) ? '#3b82f6' : '#374151' }}>
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>
          Price Range
        </div>
        <Slider
          min={0} max={50000000} step={100000}
          value={priceRange}
          onValueChange={(value: number[]) => setPriceRange([value[0] ?? 0, value[1] ?? 50000000])}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>
          <span style={{ background: '#f1f5f9', borderRadius: 6, padding: '3px 8px', fontWeight: 500 }}>${priceRange[0].toLocaleString()}</span>
          <span style={{ background: '#f1f5f9', borderRadius: 6, padding: '3px 8px', fontWeight: 500 }}>${priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          style={{
            width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #fecaca',
            background: '#fff5f5', color: '#dc2626', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <X size={14} /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .pp-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f8fafc; }

        /* ── Hero header ── */
        .pp-header {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #0b1120 0%, #0f2044 50%, #071528 100%);
          padding: 48px 0 52px;
        }
        .pp-header-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(59,130,246,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.07) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .pp-header-orb1 { position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(59,130,246,.15);filter:blur(80px);top:-120px;left:-80px;pointer-events:none; }
        .pp-header-orb2 { position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(6,182,212,.1);filter:blur(70px);bottom:-80px;right:-60px;pointer-events:none; }

        .pp-header-inner {
          position: relative; z-index: 2;
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
        }

        /* ── Sidebar ── */
        .pp-sidebar {
          width: 256px; flex-shrink: 0;
          position: sticky; top: 88px; align-self: flex-start;
          background: #fff; border-radius: 18px; padding: 24px;
          box-shadow: 0 2px 16px rgba(0,0,0,.06); border: 1.5px solid #f1f5f9;
          max-height: calc(100vh - 110px); overflow-y: auto;
        }

        /* ── Sort bar ── */
        .pp-sortbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
        }

        /* ── Active filter chips ── */
        .pp-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: #eff6ff; border: 1.5px solid #bfdbfe;
          color: #1d4ed8; border-radius: 20px; padding: 4px 12px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all .2s; font-family: 'DM Sans', sans-serif;
        }
        .pp-chip:hover { background: #dbeafe; }

        /* ── Product grid ── */
        .pp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media(max-width:1100px) { .pp-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:600px)  { .pp-grid { grid-template-columns: 1fr; } }

        /* ── Skeleton loader ── */
        .pp-skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmerLoad 1.4s infinite;
          border-radius: 16px;
        }
        @keyframes shimmerLoad { to { background-position: -200% 0; } }

        /* ── Mobile filter btn ── */
        .pp-filter-btn {
          display: none; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 9px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
          color: #374151; font-family: 'DM Sans', sans-serif; transition: all .2s;
        }
        @media(max-width:1024px) { .pp-filter-btn { display: flex; } }
        .pp-filter-btn:hover { border-color: #3b82f6; color: #3b82f6; }

        @media(max-width:1024px) { .pp-sidebar { display: none; } }

        .pp-result-count {
          font-size: 14px; color: #64748b;
          background: #f1f5f9; border-radius: 8px; padding: '4px 12px';
        }
      `}</style>

      <div className="pp-root">

        {/* ── Hero Header ── */}
        <div className="pp-header">
          <div className="pp-header-grid" />
          <div className="pp-header-orb1" />
          <div className="pp-header-orb2" />
          <div className="pp-header-inner">
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, opacity: .7 }}>
              <span style={{ fontSize: 13, color: '#93c5fd' }}>Home</span>
              <ChevronRight size={13} color="#93c5fd"/>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>Products</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
                  All Products
                </h1>
                <p style={{ color: 'rgba(148,163,184,.8)', fontSize: 15 }}>
                  Showing <span style={{ color: '#60a5fa', fontWeight: 600 }}>{filteredProducts.length}</span> of{' '}
                  <span style={{ color: '#fff', fontWeight: 600 }}>{products.length}</span> products
                </p>
              </div>

              {/* Category quick-pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categories.slice(0, 6).map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryChange(cat.slug)}
                    style={{
                      padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                      background: selectedCategory === cat.slug ? 'rgba(59,130,246,.9)' : 'rgba(255,255,255,.1)',
                      color: '#fff', backdropFilter: 'blur(10px)',
                      border: selectedCategory === cat.slug ? '1px solid rgba(59,130,246,.5)' : '1px solid rgba(255,255,255,.15)',
                      transition: 'all .2s',
                    } as React.CSSProperties}
                  >
                    {catIcons[cat.slug] || '🔧'} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px' }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

            {/* Sidebar */}
            <aside className="pp-sidebar">
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={17} color="#3b82f6"/>
                Filters
              </div>
              <FilterContent />
            </aside>

            {/* Products area */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Sort bar */}
              <div className="pp-sortbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Mobile filter trigger */}
                  <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <SheetTrigger asChild>
                      <button className="pp-filter-btn">
                        <SlidersHorizontal size={15}/> Filters
                        {hasActiveFilters && (
                          <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                            {(selectedCategory !== 'all' ? 1 : 0) + selectedBrands.length}
                          </span>
                        )}
                      </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                      <div className="mt-6"><FilterContent /></div>
                    </SheetContent>
                  </Sheet>

                  {/* Active chips */}
                  {selectedCategory !== 'all' && (
                    <span className="pp-chip" onClick={() => handleCategoryChange('all')}>
                      {categories.find(c => c.slug === selectedCategory)?.name}
                      <X size={11}/>
                    </span>
                  )}
                  {selectedBrands.map(brand => (
                    <span key={brand} className="pp-chip" onClick={() => toggleBrand(brand)}>
                      {brand} <X size={11}/>
                    </span>
                  ))}
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger style={{ width: 200, fontFamily: "'DM Sans', sans-serif", borderRadius: 10, borderColor: '#e2e8f0', fontSize: 14 }}>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="pp-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="pp-skeleton" style={{ height: 360 }} />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="pp-grid">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <Package size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }}/>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No products found</div>
                  <p style={{ color: '#94a3b8', marginBottom: 20 }}>Try adjusting your filters</p>
                  <button
                    onClick={clearFilters}
                    style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}