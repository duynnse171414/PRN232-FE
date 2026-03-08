import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  CreditCard, Truck, Package, CheckCircle2, ChevronRight,
  MapPin, User, Mail, Phone, FileText, Banknote, QrCode, ArrowRight,
  ShieldCheck, Clock, Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { AddressOption } from '../types';
import { orderService, OrderDto } from '../services/orderService';
import { addressService } from '../services/addressService';

export function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [addressOptions, setAddressOptions] = useState<AddressOption[]>([]);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    addressId: '1',
    notes: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    deliveryMethod: 'standard',
    paymentMethod: 'cod', // 'cod' | 'card' | 'bank'
  });

  useEffect(() => {
    if (!isAuthenticated) { setAddressOptions([]); return; }
    const loadAddresses = async () => {
      const mapped = await addressService.getMyAddresses();
      if (mapped.length > 0) {
        setAddressOptions(mapped);
        setFormData(prev => ({ ...prev, addressId: String(mapped[0].id) }));
      } else { setAddressOptions([]); }
    };
    loadAddresses();
  }, [isAuthenticated]);

  const shippingCost = totalPrice > 50 ? 0 : 9.99;
  const taxRate = 0.08;
  const tax = totalPrice * taxRate;
  const deliveryFee = formData.deliveryMethod === 'express' ? 19.99 : formData.deliveryMethod === 'overnight' ? 39.99 : 0;
  const finalTotal = totalPrice + shippingCost + tax + deliveryFee;

  if (cart.length === 0 && !orderPlaced) { navigate('/cart'); return null; }

  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city) {
      toast.error('Please fill in all required fields'); return;
    }
    if (formData.paymentMethod === 'card' && (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv)) {
      toast.error('Please fill in card information'); return;
    }
    setLoading(true);
    try {
      const combinedNotes = [`delivery=${formData.deliveryMethod}`, `payment=${formData.paymentMethod}`, `${formData.address}, ${formData.city}`, formData.notes?.trim() || ''].filter(Boolean).join(' | ');
      const addressId = Number(formData.addressId || '0');
      let order: OrderDto;
      if (isAuthenticated) {
        order = await orderService.checkoutFromCart({ addressId: addressId > 0 ? addressId : undefined, notes: combinedNotes });
      } else {
        order = await orderService.placeOrder({
          guestName: `${formData.firstName} ${formData.lastName}`.trim(),
          guestEmail: formData.email, guestPhone: formData.phone,
          addressId: addressId > 0 ? addressId : undefined, notes: combinedNotes,
          paymentMethod: formData.paymentMethod,
          items: cart.map(item => ({ productId: Number(item.product.id), quantity: item.quantity })),
        });
      }
      setPlacedOrderId(order.id);
      setOrderPlaced(true);
      await clearCart();
      toast.success('Order placed successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Checkout failed. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Order Confirmed screen ──
  if (orderPlaced) {
    return (
      <>
        <style>{css}</style>
        <div className="co-root">
          <div className="co-hero"><div className="co-hero-grid" /><div className="co-orb1" /><div className="co-orb2" /></div>
          <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div style={{ background: '#fff', borderRadius: 24, border: '1.5px solid #f1f5f9', boxShadow: '0 8px 40px rgba(0,0,0,.1)', padding: '44px 40px', maxWidth: 460, width: '100%', textAlign: 'center', animation: 'fadeUp .6s ease both' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #86efac' }}>
                <CheckCircle2 size={34} color="#16a34a" />
              </div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Order Confirmed!</h2>
              <p style={{ color: '#64748b', marginBottom: 6, fontSize: 14 }}>Confirmation sent to <strong style={{ color: '#0f172a' }}>{formData.email}</strong></p>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 20px', margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Order ID</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>#{placedOrderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Total</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Payment</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {formData.paymentMethod === 'cod' ? 'Cash on Delivery' : formData.paymentMethod === 'card' ? 'Credit Card' : 'Bank Transfer'}
                  </span>
                </div>
              </div>
              <button className="co-primary-btn" onClick={() => navigate('/')} style={{ width: '100%', marginBottom: 10 }}>Continue Shopping</button>
              <button className="co-outline-btn" onClick={() => navigate('/products')} style={{ width: '100%' }}>Browse Products</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const paymentMethods = [
    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: Banknote },
    { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, JCB', icon: CreditCard },
    { id: 'bank', label: 'Bank Transfer', desc: 'Scan QR to transfer', icon: QrCode },
  ];

  const deliveryOptions = [
    { id: 'standard', label: 'Standard Delivery', desc: '5-7 business days', price: 'FREE', icon: Truck },
    { id: 'express', label: 'Express Delivery', desc: '2-3 business days', price: '$19.99', icon: Zap },
    { id: 'overnight', label: 'Overnight Delivery', desc: 'Next business day', price: '$39.99', icon: Clock },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="co-root">

        {/* ── Hero ── */}
        <div className="co-hero">
          <div className="co-hero-grid" /><div className="co-orb1" /><div className="co-orb2" />
          <div className="co-scan" />
          <div className="co-container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Link to="/" style={{ fontSize: 13, color: '#93c5fd', textDecoration: 'none' }}>Home</Link>
              <ChevronRight size={13} color="#93c5fd" />
              <Link to="/cart" style={{ fontSize: 13, color: '#93c5fd', textDecoration: 'none' }}>Cart</Link>
              <ChevronRight size={13} color="#93c5fd" />
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>Checkout</span>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1 }}>
              Check<span style={{ background: 'linear-gradient(90deg,#60a5fa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>out</span>
            </h1>
            <p style={{ color: 'rgba(148,163,184,.8)', fontSize: 14, marginTop: 6 }}>Complete your order below</p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="co-container" style={{ paddingTop: 32, paddingBottom: 56 }}>
          <form onSubmit={handleSubmit}>
            <div className="co-layout">

              {/* ── LEFT COLUMN ── */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Shipping Info */}
                <div className="co-card">
                  <div className="co-card-header">
                    <div className="co-card-icon"><Truck size={16} color="#3b82f6" /></div>
                    <span>Shipping Information</span>
                  </div>
                  <div className="co-card-body">
                    <div className="co-grid2">
                      <div className="co-field">
                        <label className="co-label"><User size={12} /> First Name *</label>
                        <input className="co-input" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
                      </div>
                      <div className="co-field">
                        <label className="co-label"><User size={12} /> Last Name *</label>
                        <input className="co-input" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} required />
                      </div>
                    </div>
                    <div className="co-grid2">
                      <div className="co-field">
                        <label className="co-label"><Mail size={12} /> Email *</label>
                        <input className="co-input" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required />
                      </div>
                      <div className="co-field">
                        <label className="co-label"><Phone size={12} /> Phone</label>
                        <input className="co-input" type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                      </div>
                    </div>
                    <div className="co-field">
                      <label className="co-label"><MapPin size={12} /> Street Address *</label>
                      <input className="co-input" value={formData.address} onChange={e => handleChange('address', e.target.value)} required />
                    </div>
                    <div className="co-grid3">
                      <div className="co-field">
                        <label className="co-label">City *</label>
                        <input className="co-input" value={formData.city} onChange={e => handleChange('city', e.target.value)} required />
                      </div>
                      <div className="co-field">
                        <label className="co-label">State</label>
                        <input className="co-input" value={formData.state} onChange={e => handleChange('state', e.target.value)} />
                      </div>
                      <div className="co-field">
                        <label className="co-label">ZIP Code</label>
                        <input className="co-input" value={formData.zipCode} onChange={e => handleChange('zipCode', e.target.value)} />
                      </div>
                    </div>
                    <div className="co-grid2">
                      <div className="co-field">
                        <label className="co-label"><MapPin size={12} /> Saved Address</label>
                        {isAuthenticated && addressOptions.length > 0 ? (
                          <Select value={formData.addressId} onValueChange={v => handleChange('addressId', v)}>
                            <SelectTrigger className="co-input" style={{ height: 42 }}>
                              <SelectValue placeholder="Select address" />
                            </SelectTrigger>
                            <SelectContent>
                              {addressOptions.map(opt => <SelectItem key={opt.id} value={String(opt.id)}>{opt.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <input className="co-input" type="number" min={1} value={formData.addressId} onChange={e => handleChange('addressId', e.target.value)} placeholder="1" />
                        )}
                      </div>
                      <div className="co-field">
                        <label className="co-label"><FileText size={12} /> Order Notes</label>
                        <input className="co-input" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="e.g. Call before delivery" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="co-card">
                  <div className="co-card-header">
                    <div className="co-card-icon"><Package size={16} color="#3b82f6" /></div>
                    <span>Delivery Method</span>
                  </div>
                  <div className="co-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {deliveryOptions.map(opt => {
                      const Icon = opt.icon;
                      const active = formData.deliveryMethod === opt.id;
                      return (
                        <div key={opt.id} className={`co-option ${active ? 'co-option-active' : ''}`}
                          onClick={() => handleChange('deliveryMethod', opt.id)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: active ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                              <Icon size={16} color={active ? '#fff' : '#64748b'} />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{opt.label}</div>
                              <div style={{ fontSize: 12, color: '#94a3b8' }}>{opt.desc}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: opt.price === 'FREE' ? '#22c55e' : '#0f172a' }}>{opt.price}</span>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? '#3b82f6' : '#cbd5e1'}`, background: active ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                              {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="co-card">
                  <div className="co-card-header">
                    <div className="co-card-icon"><CreditCard size={16} color="#3b82f6" /></div>
                    <span>Payment Method</span>
                  </div>
                  <div className="co-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                    {/* Payment method selector */}
                    {paymentMethods.map(pm => {
                      const Icon = pm.icon;
                      const active = formData.paymentMethod === pm.id;
                      return (
                        <div key={pm.id} className={`co-option ${active ? 'co-option-active' : ''}`}
                          onClick={() => handleChange('paymentMethod', pm.id)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: active ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                              <Icon size={16} color={active ? '#fff' : '#64748b'} />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{pm.label}</div>
                              <div style={{ fontSize: 12, color: '#94a3b8' }}>{pm.desc}</div>
                            </div>
                          </div>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? '#3b82f6' : '#cbd5e1'}`, background: active ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                            {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                          </div>
                        </div>
                      );
                    })}

                    {/* Card fields */}
                    {formData.paymentMethod === 'card' && (
                      <div className="co-payment-expand" style={{ animationName: 'expandIn' }}>
                        <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0 16px' }} />
                        <div className="co-field" style={{ marginBottom: 12 }}>
                          <label className="co-label">Card Number *</label>
                          <input className="co-input" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={e => handleChange('cardNumber', e.target.value)} maxLength={19} required />
                        </div>
                        <div className="co-field" style={{ marginBottom: 12 }}>
                          <label className="co-label">Cardholder Name *</label>
                          <input className="co-input" placeholder="John Doe" value={formData.cardName} onChange={e => handleChange('cardName', e.target.value)} required />
                        </div>
                        <div className="co-grid2">
                          <div className="co-field">
                            <label className="co-label">Expiry Date *</label>
                            <input className="co-input" placeholder="MM/YY" value={formData.expiryDate} onChange={e => handleChange('expiryDate', e.target.value)} maxLength={5} required />
                          </div>
                          <div className="co-field">
                            <label className="co-label">CVV *</label>
                            <input className="co-input" placeholder="123" value={formData.cvv} onChange={e => handleChange('cvv', e.target.value)} maxLength={4} required />
                          </div>
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, padding: '10px 14px' }}>
                          <ShieldCheck size={14} color="#16a34a" />
                          <span style={{ fontSize: 12, color: '#15803d' }}>Your card info is encrypted and secure</span>
                        </div>
                      </div>
                    )}

                    {/* Bank transfer QR */}
                    {formData.paymentMethod === 'bank' && (
                      <div className="co-payment-expand" style={{ animationName: 'expandIn' }}>
                        <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0 16px' }} />
                        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          {/* QR Code */}
                          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 140, height: 140, background: '#fff', border: '2px solid #e2e8f0', borderRadius: 14, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {/* SVG QR placeholder */}
                              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                <rect width="120" height="120" fill="white"/>
                                {/* QR corners */}
                                <rect x="4" y="4" width="34" height="34" rx="4" fill="#0f172a"/>
                                <rect x="9" y="9" width="24" height="24" rx="2" fill="white"/>
                                <rect x="13" y="13" width="16" height="16" rx="1" fill="#0f172a"/>
                                <rect x="82" y="4" width="34" height="34" rx="4" fill="#0f172a"/>
                                <rect x="87" y="9" width="24" height="24" rx="2" fill="white"/>
                                <rect x="91" y="13" width="16" height="16" rx="1" fill="#0f172a"/>
                                <rect x="4" y="82" width="34" height="34" rx="4" fill="#0f172a"/>
                                <rect x="9" y="87" width="24" height="24" rx="2" fill="white"/>
                                <rect x="13" y="91" width="16" height="16" rx="1" fill="#0f172a"/>
                                {/* QR data dots */}
                                {[44,48,52,56,60,64,68,72,76].map(x =>
                                  [44,48,52,56,60,64,68,72,76].map(y =>
                                    Math.sin(x * y) > 0.2 ? <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" fill="#0f172a"/> : null
                                  )
                                )}
                                <rect x="44" y="4" width="4" height="4" fill="#0f172a"/>
                                <rect x="52" y="4" width="4" height="4" fill="#0f172a"/>
                                <rect x="60" y="4" width="4" height="4" fill="#0f172a"/>
                                <rect x="68" y="4" width="4" height="4" fill="#0f172a"/>
                                <rect x="4" y="44" width="4" height="4" fill="#0f172a"/>
                                <rect x="4" y="52" width="4" height="4" fill="#0f172a"/>
                                <rect x="4" y="60" width="4" height="4" fill="#0f172a"/>
                                <rect x="4" y="68" width="4" height="4" fill="#0f172a"/>
                              </svg>
                            </div>
                            <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>Scan to pay</span>
                          </div>
                          {/* Bank details */}
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Bank Account Details</div>
                            {[
                              { label: 'Bank', value: 'Vietcombank' },
                              { label: 'Account No.', value: '1234 5678 9012' },
                              { label: 'Account Name', value: 'TECHSTORE CO. LTD' },
                              { label: 'Amount', value: `$${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                              { label: 'Reference', value: `ORDER-${Date.now().toString().slice(-6)}` },
                            ].map(({ label, value }) => (
                              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7, gap: 8 }}>
                                <span style={{ color: '#64748b', flexShrink: 0 }}>{label}</span>
                                <span style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>{value}</span>
                              </div>
                            ))}
                            <div style={{ marginTop: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#92400e' }}>
                              ⚠️ Please include the reference code in your transfer note
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COD note */}
                    {formData.paymentMethod === 'cod' && (
                      <div className="co-payment-expand" style={{ animationName: 'expandIn' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px' }}>
                          <Banknote size={18} color="#16a34a" />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>Pay when you receive</div>
                            <div style={{ fontSize: 12, color: '#16a34a' }}>Have cash ready when the delivery arrives</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT — Order Summary ── */}
              <div className="co-summary">
                <div style={{ background: 'linear-gradient(135deg,#0b1120,#0f2044)', borderRadius: '16px 16px 0 0', padding: '20px 24px' }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Order Summary</div>
                  <div style={{ fontSize: 12, color: 'rgba(148,163,184,.7)' }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</div>
                </div>

                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, gap: 8 }}>
                      <span style={{ color: '#64748b', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product.name} <span style={{ color: '#94a3b8' }}>×{item.quantity}</span>
                      </span>
                      <span style={{ fontWeight: 600, color: '#0f172a', flexShrink: 0 }}>
                        ${(item.product.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                    {[
                      { label: 'Subtotal', value: `$${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, green: false },
                      { label: 'Shipping', value: shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`, green: shippingCost === 0 },
                      ...(deliveryFee > 0 ? [{ label: `${formData.deliveryMethod === 'express' ? 'Express' : 'Overnight'} fee`, value: `$${deliveryFee.toFixed(2)}`, green: false }] : []),
                      { label: 'Tax (8%)', value: `$${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, green: false },
                    ].map(({ label, value, green }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <span style={{ color: '#64748b', flexShrink: 0 }}>{label}</span>
                        <span style={{ fontWeight: 600, color: green ? '#22c55e' : '#0f172a', textAlign: 'right' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 1, background: '#f1f5f9', marginBottom: 14 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Total</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <button type="submit" className="co-primary-btn" disabled={loading} style={{ width: '100%' }}>
                    {loading ? (
                      <><div className="co-spin" style={{ width: 16, height: 16 }} /> Processing...</>
                    ) : (
                      <><ShieldCheck size={16} /> Place Order</>
                    )}
                  </button>

                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[
                      { icon: ShieldCheck, text: 'SSL encrypted & secure' },
                      { icon: Truck, text: 'Free shipping over $50' },
                      { icon: Package, text: '30-day return policy' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={11} color="#16a34a" />
                        </div>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
  .co-root { font-family:'DM Sans',sans-serif;background:#f8fafc;min-height:100vh; }

  .co-hero { position:relative;overflow:hidden;background:linear-gradient(135deg,#0b1120 0%,#0f2044 50%,#071528 100%);padding:30px 0 38px; }
  .co-hero-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.07) 1px,transparent 1px);background-size:48px 48px; }
  .co-orb1 { position:absolute;width:380px;height:380px;border-radius:50%;background:rgba(59,130,246,.14);filter:blur(80px);top:-120px;left:-80px;pointer-events:none; }
  .co-orb2 { position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(6,182,212,.1);filter:blur(70px);bottom:-80px;right:-60px;pointer-events:none; }
  .co-scan { position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(96,165,250,.4),transparent);animation:scanMove 5s linear infinite; }
  @keyframes scanMove { from{top:0}to{top:100%} }

  .co-container { max-width:1280px;margin:0 auto;padding:0 32px; }
  @media(max-width:640px){.co-container{padding:0 16px;}}

  .co-layout { display:flex;gap:28px;align-items:flex-start; }
  @media(max-width:1024px){.co-layout{flex-direction:column;}}

  /* Cards */
  .co-card { background:#fff;border-radius:16px;border:1.5px solid #f1f5f9;box-shadow:0 2px 10px rgba(0,0,0,.04);overflow:hidden;animation:cardIn .45s ease both; }
  @keyframes cardIn { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none} }

  .co-card-header { display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1.5px solid #f1f5f9;font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:#0f172a; }
  .co-card-icon { width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#eff6ff,#dbeafe);display:flex;align-items:center;justify-content:center; }
  .co-card-body { padding:20px; }

  /* Form fields */
  .co-grid2 { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px; }
  .co-grid3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px; }
  @media(max-width:600px){.co-grid2{grid-template-columns:1fr;}.co-grid3{grid-template-columns:1fr;}}
  .co-field { display:flex;flex-direction:column;gap:5px; }
  .co-label { display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#374151; }
  .co-input { height:42px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 13px;font-size:13px;font-family:'DM Sans',sans-serif;color:#0f172a;background:#fff;outline:none;transition:border-color .2s,box-shadow .2s;width:100%;box-sizing:border-box; }
  .co-input:focus { border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.12); }
  .co-input::placeholder { color:#cbd5e1; }

  /* Option rows (delivery / payment) */
  .co-option { display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border:1.5px solid #f1f5f9;border-radius:12px;cursor:pointer;transition:all .2s; }
  .co-option:hover { border-color:#bfdbfe;background:#fafeff; }
  .co-option-active { border-color:#3b82f6!important;background:linear-gradient(135deg,#fafeff,#f0f9ff)!important; }

  /* Animated payment expand */
  .co-payment-expand { animation:expandIn .3s ease both; }
  @keyframes expandIn { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none} }

  /* Summary sidebar */
  .co-summary { width:300px;flex-shrink:0;background:#fff;border-radius:16px;border:1.5px solid #f1f5f9;box-shadow:0 4px 20px rgba(0,0,0,.07);position:sticky;top:88px;overflow:hidden; }
  @media(max-width:1024px){.co-summary{width:100%;position:static;}}

  /* Buttons */
  .co-primary-btn { display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#1d4ed8,#3b82f6,#0ea5e9);background-size:200% 200%;color:#fff;padding:13px 20px;border-radius:11px;font-weight:700;font-size:14px;font-family:'Syne',sans-serif;border:none;cursor:pointer;transition:all .35s;letter-spacing:.2px; }
  .co-primary-btn:hover:not(:disabled) { background-position:right center;transform:translateY(-2px);box-shadow:0 10px 24px rgba(59,130,246,.4); }
  .co-primary-btn:disabled { opacity:.5;cursor:not-allowed;transform:none; }
  .co-outline-btn { display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;border:1.5px solid #e2e8f0;color:#374151;padding:12px 20px;border-radius:11px;font-weight:600;font-size:14px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s; }
  .co-outline-btn:hover { border-color:#3b82f6;color:#3b82f6;background:#eff6ff; }

  .co-spin { border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
`;