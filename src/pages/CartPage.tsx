import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ChevronRight, ShieldCheck, RotateCcw, Truck, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleRemove = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast.success(`${productName} removed from cart`);
  };

  const shippingCost = totalPrice > 50 ? 0 : 9.99;
  const taxRate = 0.08;
  const tax = totalPrice * taxRate;
  const finalTotal = totalPrice + shippingCost + tax;
  const freeShippingLeft = Math.max(0, 50 - totalPrice);
  const freeShippingPct = Math.min(100, (totalPrice / 50) * 100);

  if (cart.length === 0) {
    return (
      <>
        <style>{css}</style>
        <div className="cart-root">
          <div className="cart-hero">
            <div className="cart-hero-grid" />
            <div className="cart-hero-orb1" /><div className="cart-hero-orb2" />
          </div>
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', animation: 'fadeUp .6s ease both' }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #bfdbfe' }}>
                <ShoppingBag size={38} color="#3b82f6" />
              </div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Your cart is empty</h2>
              <p style={{ color: '#64748b', marginBottom: 28, fontSize: 15 }}>Add some products to get started!</p>
              <Link to="/products" className="cart-primary-btn" style={{ textDecoration: 'none' }}>
                Browse Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="cart-root">

        {/* ── Hero header ── */}
        <div className="cart-hero">
          <div className="cart-hero-grid" />
          <div className="cart-hero-orb1" /><div className="cart-hero-orb2" />
          <div className="cart-scan" />
          <div className="cart-container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Link to="/" style={{ fontSize: 13, color: '#93c5fd', textDecoration: 'none' }}>Home</Link>
              <ChevronRight size={13} color="#93c5fd" />
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>Shopping Cart</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 6, lineHeight: 1.1 }}>
                  Shopping <span style={{ background: 'linear-gradient(90deg,#60a5fa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Cart</span>
                </h1>
                <p style={{ color: 'rgba(148,163,184,.8)', fontSize: 14 }}>
                  <span style={{ color: '#60a5fa', fontWeight: 700 }}>{cart.length}</span> item{cart.length !== 1 ? 's' : ''} in your cart
                </p>
              </div>
              {/* Free shipping progress */}
              {freeShippingLeft > 0 && (
                <div style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, padding: '12px 18px', backdropFilter: 'blur(10px)', minWidth: 220 }}>
                  <div style={{ fontSize: 12, color: 'rgba(148,163,184,.8)', marginBottom: 6 }}>
                    Add <span style={{ color: '#60a5fa', fontWeight: 700 }}>${freeShippingLeft.toFixed(2)}</span> more for free shipping
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${freeShippingPct}%`, background: 'linear-gradient(90deg,#3b82f6,#06b6d4)', borderRadius: 3, transition: 'width .5s ease' }} />
                  </div>
                </div>
              )}
              {freeShippingLeft === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 12, padding: '10px 16px' }}>
                  <Truck size={15} color="#4ade80" />
                  <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>Free shipping unlocked!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="cart-container" style={{ paddingTop: 28, paddingBottom: 48 }}>
          <div className="cart-layout">

            {/* LEFT — Cart items */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cart.map((item, idx) => (
                <div key={item.product.id} className="cart-item" style={{ animationDelay: `${idx * 0.06}s` }}>
                  {/* Image */}
                  <Link to={`/product/${item.product.id}`} style={{ flexShrink: 0 }}>
                    <div style={{ width: 90, height: 90, borderRadius: 12, overflow: 'hidden', border: '1.5px solid #f1f5f9', background: '#f8fafc' }}>
                      <ImageWithFallback src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/product/${item.product.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 3, lineHeight: 1.3, transition: 'color .2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#3b82f6')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#0f172a')}>
                        {item.product.name}
                      </div>
                    </Link>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{item.product.brand}</div>

                  </div>

                  {/* Qty + Remove */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                    <button className="cart-remove-btn" onClick={() => handleRemove(item.product.id, item.product.name)}>
                      <Trash2 size={14} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                      <button className="cart-qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}>
                        <Minus size={13} />
                      </button>
                      <span style={{ padding: '0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: "'Syne', sans-serif", minWidth: 40, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button className="cart-qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}>
                        <Plus size={13} />
                      </button>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                      ${(item.product.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue shopping */}
              <div style={{ paddingTop: 4 }}>
                <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3b82f6', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'gap .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.gap = '10px')}
                  onMouseLeave={e => (e.currentTarget.style.gap = '6px')}>
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* RIGHT — Summary */}
            <div className="cart-summary">
              {/* Dark header */}
              <div style={{ background: 'linear-gradient(135deg,#0b1120,#0f2044)', borderRadius: '16px 16px 0 0', padding: '20px 24px' }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Order Summary</div>
                <div style={{ fontSize: 12, color: 'rgba(148,163,184,.7)' }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</div>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {/* Line items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ color: '#64748b', flexShrink: 0 }}>Subtotal</span>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, textAlign: 'right' }}>${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ color: '#64748b', flexShrink: 0 }}>Shipping</span>
                    {shippingCost === 0
                      ? <span style={{ fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}><Truck size={12} /> FREE</span>
                      : <span style={{ fontWeight: 600, fontSize: 13 }}>${shippingCost.toFixed(2)}</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ color: '#64748b', flexShrink: 0 }}>Tax (8%)</span>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, textAlign: 'right' }}>${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9', marginBottom: 16 }} />

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 22, paddingTop: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                    ${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Checkout button */}
                <button className="cart-primary-btn" onClick={() => navigate('/checkout')} style={{ width: '100%', marginBottom: 10 }}>
                  Proceed to Checkout <ArrowRight size={16} />
                </button>

                <Link to="/products" className="cart-outline-btn" style={{ width: '100%', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                  Continue Shopping
                </Link>

                {/* Trust badges */}
                <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {[
                    { icon: Truck, text: 'Free shipping on orders over $50' },
                    { icon: RotateCcw, text: '30-day money-back guarantee' },
                    { icon: ShieldCheck, text: 'Secure payment processing' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={13} color="#16a34a" />
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── CSS ──────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .cart-root { font-family:'DM Sans',sans-serif;background:#f8fafc;min-height:100vh; }

  .cart-hero {
    position:relative;overflow:hidden;
    background:linear-gradient(135deg,#0b1120 0%,#0f2044 50%,#071528 100%);
    padding:30px 0 38px;
  }
  .cart-hero-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.07) 1px,transparent 1px);background-size:48px 48px; }
  .cart-hero-orb1 { position:absolute;width:380px;height:380px;border-radius:50%;background:rgba(59,130,246,.14);filter:blur(80px);top:-120px;left:-80px;pointer-events:none; }
  .cart-hero-orb2 { position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(6,182,212,.1);filter:blur(70px);bottom:-80px;right:-60px;pointer-events:none; }
  .cart-scan { position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(96,165,250,.4),transparent);animation:scanMove 5s linear infinite; }
  @keyframes scanMove { from{top:0}to{top:100%} }

  .cart-container { max-width:1280px;margin:0 auto;padding:0 32px; }
  @media(max-width:640px) { .cart-container{padding:0 16px;} }

  .cart-layout { display:flex;gap:28px;align-items:flex-start; }
  @media(max-width:1024px) { .cart-layout{flex-direction:column;} }

  /* Cart item card */
  .cart-item {
    background:#fff;border-radius:16px;padding:20px;
    border:1.5px solid #f1f5f9;
    box-shadow:0 2px 10px rgba(0,0,0,.04);
    display:flex;align-items:center;gap:16px;
    transition:all .25s;
    animation:cardIn .45s ease both;
  }
  @keyframes cardIn { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none} }
  .cart-item:hover { box-shadow:0 8px 24px rgba(59,130,246,.09);border-color:#dbeafe; }

  /* Qty button */
  .cart-qty-btn {
    width:36px;height:36px;background:#f8fafc;border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;color:#374151;transition:all .2s;
  }
  .cart-qty-btn:hover:not(:disabled) { background:#dbeafe;color:#3b82f6; }
  .cart-qty-btn:disabled { opacity:.35;cursor:not-allowed; }

  /* Remove button */
  .cart-remove-btn {
    width:32px;height:32px;border-radius:8px;
    background:#fff5f5;border:1.5px solid #fecaca;
    color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:all .2s;
  }
  .cart-remove-btn:hover { background:#fee2e2;transform:scale(1.05); }

  /* Summary sidebar */
  .cart-summary {
    width:300px;flex-shrink:0;
    background:#fff;border-radius:16px;
    border:1.5px solid #f1f5f9;
    box-shadow:0 4px 20px rgba(0,0,0,.07);
    position:sticky;top:88px;overflow:hidden;
  }
  @media(max-width:1024px) { .cart-summary{width:100%;position:static;} }

  /* Buttons */
  .cart-primary-btn {
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    background:linear-gradient(135deg,#1d4ed8,#3b82f6,#0ea5e9);
    background-size:200% 200%;color:#fff;padding:13px 20px;border-radius:11px;
    font-weight:700;font-size:14px;font-family:'Syne',sans-serif;
    border:none;cursor:pointer;transition:all .35s;letter-spacing:.2px;
  }
  .cart-primary-btn:hover { background-position:right center;transform:translateY(-2px);box-shadow:0 10px 24px rgba(59,130,246,.4); }

  .cart-outline-btn {
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    background:#fff;border:1.5px solid #e2e8f0;color:#374151;
    padding:12px 20px;border-radius:11px;font-weight:600;font-size:14px;
    font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;
  }
  .cart-outline-btn:hover { border-color:#3b82f6;color:#3b82f6;background:#eff6ff; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none} }
`;