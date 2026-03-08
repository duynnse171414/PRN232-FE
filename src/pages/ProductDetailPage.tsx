import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Star, ShoppingCart, Minus, Plus, Package, Truck, Shield, ArrowLeft, ChevronRight, Heart, Share2, Zap } from 'lucide-react';
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
  const [wishlisted, setWishlisted] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

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
    return (
      <>
        <style>{skeletonCss}</style>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="pdp-spin" style={{ width: 44, height: 44, margin: '0 auto 16px' }} />
            <div style={{ color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>Loading product...</div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <style>{skeletonCss}</style>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Product not found</h2>
            <button className="pdp-btn-primary" onClick={() => navigate('/products')}>Back to Products</button>
          </div>
        </div>
      </>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 600);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  return (
    <>
      <style>{pageCss}</style>

      <div className="pdp-root">

        {/* ── Hero breadcrumb bar ── */}
        <div className="pdp-topbar">
          <div className="pdp-topbar-grid" />
          <div className="pdp-topbar-orb1" />
          <div className="pdp-topbar-orb2" />
          <div className="pdp-container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Link to="/" style={{ fontSize: 13, color: '#93c5fd', textDecoration: 'none' }}>Home</Link>
              <ChevronRight size={13} color="#93c5fd" />
              <Link to="/products" style={{ fontSize: 13, color: '#93c5fd', textDecoration: 'none' }}>Products</Link>
              <ChevronRight size={13} color="#93c5fd" />
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
            </div>
            <button className="pdp-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={15} /> Back to Products
            </button>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="pdp-container" style={{ paddingTop: 32, paddingBottom: 40 }}>
          <div className="pdp-main-grid">

            {/* LEFT — Image */}
            <div className="pdp-img-col">
              <div className="pdp-img-wrap">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="pdp-img"
                />
                {discount > 0 && (
                  <div className="pdp-discount-badge">-{discount}%</div>
                )}
                {product.stock < 10 && product.stock > 0 && (
                  <div className="pdp-stock-badge">Only {product.stock} left!</div>
                )}
                {/* Wishlist */}
                <button
                  className={`pdp-wishlist-btn ${wishlisted ? 'pdp-wishlisted' : ''}`}
                  onClick={() => { setWishlisted(w => !w); toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
                >
                  <Heart size={18} fill={wishlisted ? '#ef4444' : 'none'} />
                </button>
              </div>

              {/* Floating spec chips under image */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {[`Brand: ${product.brand}`, `Category: ${product.category}`, `Stock: ${product.stock} units`].map(chip => (
                  <span key={chip} style={{
                    background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 20,
                    padding: '5px 14px', fontSize: 12, color: '#475569', fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{chip}</span>
                ))}
              </div>
            </div>

            {/* RIGHT — Info */}
            <div className="pdp-info-col">

              {/* Brand */}
              <div style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
                {product.brand}
              </div>

              {/* Name */}
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-.5px', marginBottom: 16 }}>
                {product.name}
              </h1>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 14px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fef3c7', width: 'fit-content' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16}
                      fill={i < Math.floor(product.rating) ? '#fbbf24' : 'none'}
                      color={i < Math.floor(product.rating) ? '#fbbf24' : '#d1d5db'}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{product.rating}</span>
                <span style={{ fontSize: 13, color: '#a16207' }}>({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
                    ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  {product.originalPrice && (
                    <span style={{ fontSize: 20, color: '#94a3b8', textDecoration: 'line-through', fontWeight: 400 }}>
                      ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', border: '1px solid #86efac', borderRadius: 8, padding: '4px 12px' }}>
                    <Zap size={12} color="#16a34a" fill="#16a34a" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>You save ${savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {/* Stock badge */}
              <div style={{ marginBottom: 20 }}>
                {product.stock > 0 ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '7px 14px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d', fontFamily: "'DM Sans', sans-serif" }}>In Stock — {product.stock} units available</span>
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '7px 14px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.75, marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>
                {product.description}
              </p>

              {/* Divider */}
              <div style={{ height: 1, background: '#f1f5f9', marginBottom: 24 }} />

              {/* Quantity */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>Quantity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: 'fit-content', border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                  <button className="pdp-qty-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  ><Minus size={15} /></button>
                  <span style={{ padding: '0 24px', fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: "'Syne', sans-serif", minWidth: 60, textAlign: 'center' }}>{quantity}</span>
                  <button className="pdp-qty-btn"
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                  ><Plus size={15} /></button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                <button
                  className={`pdp-btn-primary ${addedAnim ? 'pdp-btn-pulse' : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  style={{ flex: 1, minWidth: 200 }}
                >
                  <ShoppingCart size={18} />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  className="pdp-btn-outline"
                  onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="pdp-guarantee-grid">
                {[
                  { icon: Truck, label: 'Free Shipping', sub: 'On orders over $50' },
                  { icon: Shield, label: '2-Year Warranty', sub: 'Full coverage' },
                  { icon: Package, label: 'Easy Returns', sub: '30-day policy' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="pdp-guarantee-item">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      <Icon size={18} color="#3b82f6" />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: "'Syne', sans-serif" }}>{label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="pdp-tabs-wrap">
            <Tabs defaultValue="description">
              <TabsList style={{ background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 24 }}>
                <TabsTrigger value="description" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, borderRadius: 8 }}>Description</TabsTrigger>
                <TabsTrigger value="specs" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, borderRadius: 8 }}>Specifications</TabsTrigger>
                <TabsTrigger value="reviews" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, borderRadius: 8 }}>Reviews ({product.reviews})</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <div style={{ fontSize: 15, color: '#475569', lineHeight: 1.85, fontFamily: "'DM Sans', sans-serif" }}>
                  {product.description}
                  <div style={{ marginTop: 16, padding: 20, background: 'linear-gradient(135deg,#eff6ff,#f0f9ff)', borderRadius: 12, border: '1px solid #bfdbfe' }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>Why choose {product.brand}?</div>
                    <p style={{ color: '#3b82f6', fontSize: 14, lineHeight: 1.7 }}>
                      {product.brand} products are known for their reliability, performance, and industry-leading warranties.
                      This product is perfect for both enthusiasts and professionals.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specs">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Brand', value: product.brand },
                    { label: 'Category', value: product.category },
                    { label: 'Rating', value: `${product.rating} / 5.0` },
                    { label: 'Total Reviews', value: product.reviews.toString() },
                    { label: 'Stock', value: `${product.stock} units` },
                    { label: 'SKU', value: `#${product.id}` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                      <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 64, marginBottom: 12 }}>⭐</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 52, fontWeight: 800, color: '#0f172a' }}>{product.rating}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '8px 0' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={22} fill={i < Math.floor(product.rating) ? '#fbbf24' : 'none'} color={i < Math.floor(product.rating) ? '#fbbf24' : '#d1d5db'} />
                    ))}
                  </div>
                  <p style={{ color: '#64748b', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Based on {product.reviews} reviews</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Styles ─────────────────────────────────────── */
const skeletonCss = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
  .pdp-spin { border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:pdpSpin .7s linear infinite; }
  @keyframes pdpSpin { to{transform:rotate(360deg)} }
`;

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pdp-root { font-family:'DM Sans',sans-serif; background:#f8fafc; min-height:100vh; }

  /* Top bar */
  .pdp-topbar {
    position:relative;overflow:hidden;
    background:linear-gradient(135deg,#0b1120 0%,#0f2044 50%,#071528 100%);
    padding:28px 0 32px;
  }
  .pdp-topbar-grid {
    position:absolute;inset:0;
    background-image:linear-gradient(rgba(59,130,246,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.07) 1px,transparent 1px);
    background-size:48px 48px;
  }
  .pdp-topbar-orb1 { position:absolute;width:350px;height:350px;border-radius:50%;background:rgba(59,130,246,.14);filter:blur(70px);top:-120px;left:-80px;pointer-events:none; }
  .pdp-topbar-orb2 { position:absolute;width:280px;height:280px;border-radius:50%;background:rgba(6,182,212,.1);filter:blur(60px);bottom:-80px;right:-60px;pointer-events:none; }

  .pdp-container { max-width:1280px;margin:0 auto;padding:0 32px; }
  @media(max-width:640px) { .pdp-container { padding:0 16px; } }

  .pdp-back-btn {
    display:inline-flex;align-items:center;gap:7px;
    background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
    color:#fff;border-radius:10px;padding:8px 16px;font-size:13px;font-weight:600;
    cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;
  }
  .pdp-back-btn:hover { background:rgba(255,255,255,.15); }

  /* Main grid */
  .pdp-main-grid {
    display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:40px;
    align-items:start;
  }
  @media(max-width:900px) { .pdp-main-grid { grid-template-columns:1fr;gap:24px; } }

  /* Image */
  .pdp-img-col {}
  .pdp-img-wrap {
    position:relative;border-radius:20px;overflow:hidden;
    background:#fff;border:1.5px solid #f1f5f9;
    box-shadow:0 8px 30px rgba(0,0,0,.08);aspect-ratio:1;
  }
  .pdp-img { width:100%;height:100%;object-fit:cover; }
  .pdp-discount-badge {
    position:absolute;top:16px;left:16px;
    background:linear-gradient(135deg,#dc2626,#ef4444);
    color:#fff;font-weight:800;font-size:14px;
    padding:6px 14px;border-radius:10px;
    font-family:'Syne',sans-serif;
    box-shadow:0 4px 12px rgba(220,38,38,.4);
  }
  .pdp-stock-badge {
    position:absolute;top:16px;right:50px;
    background:linear-gradient(135deg,#d97706,#f59e0b);
    color:#fff;font-weight:700;font-size:12px;
    padding:5px 12px;border-radius:8px;
    font-family:'DM Sans',sans-serif;
  }
  .pdp-wishlist-btn {
    position:absolute;top:16px;right:16px;
    width:36px;height:36px;border-radius:10px;
    background:rgba(255,255,255,.9);border:1.5px solid #e2e8f0;
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;transition:all .2s;color:#64748b;
  }
  .pdp-wishlist-btn:hover { border-color:#fca5a5;color:#ef4444;transform:scale(1.05); }
  .pdp-wishlisted { color:#ef4444!important;border-color:#fca5a5!important;background:#fff5f5!important; }

  /* Info col */
  .pdp-info-col { background:#fff;border-radius:20px;padding:32px;border:1.5px solid #f1f5f9;box-shadow:0 4px 20px rgba(0,0,0,.05); }

  /* Qty button */
  .pdp-qty-btn {
    width:42px;height:42px;background:#f8fafc;border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;color:#374151;
    transition:all .2s;
  }
  .pdp-qty-btn:hover:not(:disabled) { background:#dbeafe;color:#3b82f6; }
  .pdp-qty-btn:disabled { opacity:.4;cursor:not-allowed; }

  /* Primary button */
  .pdp-btn-primary {
    display:inline-flex;align-items:center;justify-content:center;gap:9px;
    background:linear-gradient(135deg,#1d4ed8,#3b82f6,#0ea5e9);
    background-size:200% 200%;
    color:#fff;padding:14px 24px;border-radius:12px;
    font-weight:700;font-size:15px;font-family:'Syne',sans-serif;
    border:none;cursor:pointer;transition:all .35s ease;letter-spacing:.3px;
  }
  .pdp-btn-primary:hover:not(:disabled) { background-position:right center;transform:translateY(-2px);box-shadow:0 12px 30px rgba(59,130,246,.4); }
  .pdp-btn-primary:disabled { opacity:.55;cursor:not-allowed;transform:none; }
  .pdp-btn-pulse { animation:btnPulse .4s ease; }
  @keyframes btnPulse { 0%,100%{transform:scale(1)}50%{transform:scale(0.97)} }

  /* Outline button */
  .pdp-btn-outline {
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    background:#fff;border:1.5px solid #e2e8f0;color:#374151;
    padding:14px 16px;border-radius:12px;font-weight:600;font-size:14px;
    cursor:pointer;transition:all .2s;
  }
  .pdp-btn-outline:hover { border-color:#3b82f6;color:#3b82f6;background:#eff6ff; }

  /* Guarantee grid */
  .pdp-guarantee-grid {
    display:grid;grid-template-columns:repeat(3,1fr);gap:12px;
    padding:20px;background:#f8fafc;border-radius:14px;border:1px solid #f1f5f9;
  }
  .pdp-guarantee-item { text-align:center;padding:8px 0; }

  /* Tabs section */
  .pdp-tabs-wrap {
    background:#fff;border-radius:20px;padding:32px;
    border:1.5px solid #f1f5f9;box-shadow:0 4px 20px rgba(0,0,0,.05);
  }
`;