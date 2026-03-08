import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import {
  Cpu, Monitor, HardDrive, Activity, Zap, ShoppingCart,
  Check, AlertCircle, Save, ChevronRight, Trash2, RefreshCw, Star,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  buildPcService, BuildPcComponentTypeDto, BuildPcProductDto, BuildResponseDto,
} from '../services/buildPcService';

type SelectedMap = Record<number, { productId: number; quantity: number }>;

const iconByName: Array<{ keyword: string; icon: any }> = [
  { keyword: 'cpu', icon: Cpu }, { keyword: 'processor', icon: Cpu },
  { keyword: 'gpu', icon: Monitor }, { keyword: 'graphics', icon: Monitor }, { keyword: 'vga', icon: Monitor },
  { keyword: 'motherboard', icon: Activity }, { keyword: 'mainboard', icon: Activity },
  { keyword: 'ram', icon: Zap }, { keyword: 'memory', icon: Zap },
  { keyword: 'storage', icon: HardDrive }, { keyword: 'ssd', icon: HardDrive }, { keyword: 'hdd', icon: HardDrive },
];

function getIconForComponent(name: string) {
  const lower = (name || '').toLowerCase();
  const matched = iconByName.find(x => lower.includes(x.keyword));
  return matched?.icon || Cpu;
}

function mapBuildProductToProduct(item: BuildPcProductDto): Product {
  return {
    id: String(item.id), name: item.name || 'Unnamed product',
    category: 'PC Component', price: Number(item.price ?? 0),
    image: item.imageUrls?.[0] || '', description: '',
    specifications: {}, stock: Number(item.stock ?? 0),
    rating: 4.5, reviews: 0, brand: '',
  };
}

export function BuildPCPage() {
  const [componentTypes, setComponentTypes] = useState<BuildPcComponentTypeDto[]>([]);
  const [selectedMap, setSelectedMap] = useState<SelectedMap>({});
  const [selectedComponentType, setSelectedComponentType] = useState<BuildPcComponentTypeDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [savingBuild, setSavingBuild] = useState(false);
  const [myBuilds, setMyBuilds] = useState<BuildResponseDto[]>([]);
  const [loadingMyBuilds, setLoadingMyBuilds] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoadingComponents(true);
      try {
        const list = await buildPcService.getComponents();
        setComponentTypes([...(list || [])].sort((a, b) => a.sortOrder - b.sortOrder));
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load Build PC components');
        setComponentTypes([]);
      } finally { setLoadingComponents(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { setMyBuilds([]); return; }
    const loadMyBuilds = async () => {
      setLoadingMyBuilds(true);
      try { setMyBuilds((await buildPcService.getMyBuilds()) || []); }
      catch { setMyBuilds([]); }
      finally { setLoadingMyBuilds(false); }
    };
    loadMyBuilds();
  }, [isAuthenticated]);

  const productLookup = useMemo(() => {
    const map = new Map<number, BuildPcProductDto>();
    for (const ct of componentTypes) for (const p of ct.products || []) map.set(p.id, p);
    return map;
  }, [componentTypes]);

  const selectedProductByType = useMemo(() => {
    const map = new Map<number, BuildPcProductDto>();
    for (const ct of componentTypes) {
      const selected = selectedMap[ct.id];
      if (!selected) continue;
      const found = (ct.products || []).find(p => p.id === selected.productId);
      if (found) map.set(ct.id, found);
    }
    return map;
  }, [componentTypes, selectedMap]);

  const selectedCount = Object.keys(selectedMap).length;
  const requiredCount = componentTypes.filter(x => x.isRequired).length;
  const totalPrice = useMemo(() => {
    let sum = 0;
    for (const s of Object.values(selectedMap)) {
      const p = productLookup.get(s.productId);
      if (p) sum += Number(p.price ?? 0) * Number(s.quantity ?? 1);
    }
    return sum;
  }, [selectedMap, productLookup]);

  const missingRequired = useMemo(
    () => componentTypes.filter(ct => ct.isRequired && !selectedMap[ct.id]).map(ct => ct.name),
    [componentTypes, selectedMap]
  );

  const openSelectDialog = (ct: BuildPcComponentTypeDto) => { setSelectedComponentType(ct); setDialogOpen(true); };

  const handleChooseProduct = (componentTypeId: number, productId: number) => {
    setSelectedMap(prev => ({ ...prev, [componentTypeId]: { productId, quantity: 1 } }));
    setDialogOpen(false);
    const p = productLookup.get(productId);
    if (p) toast.success(`${p.name} selected`);
  };

  const handleRemoveComponent = (componentTypeId: number) => {
    setSelectedMap(prev => { const n = { ...prev }; delete n[componentTypeId]; return n; });
  };

  const handleAddToCart = async () => {
    const entries = Object.values(selectedMap);
    if (entries.length === 0) { toast.error('Please add components to your build'); return; }
    for (const item of entries) {
      const p = productLookup.get(item.productId);
      if (p) await addToCart(mapBuildProductToProduct(p), item.quantity);
    }
    toast.success(`${entries.length} components added to cart!`);
  };

  const handleSaveBuild = async () => {
    const items = Object.entries(selectedMap).map(([cid, v]) => ({
      componentTypeId: Number(cid), productId: v.productId, quantity: v.quantity,
    }));
    if (items.length === 0) { toast.error('Please choose at least one component'); return; }
    if (missingRequired.length > 0) { toast.error(`Missing: ${missingRequired.join(', ')}`); return; }
    setSavingBuild(true);
    try {
      const saved = await buildPcService.createBuild({ userId: null, name: `Build ${new Date().toLocaleString()}`, items });
      toast.success(`Build saved! (#${saved.id})`);
      if (isAuthenticated) { try { setMyBuilds((await buildPcService.getMyBuilds()) || []); } catch {} }
    } catch (e: any) { toast.error(e?.message || 'Failed to save build'); }
    finally { setSavingBuild(false); }
  };

  const progressPct = Math.round((selectedCount / Math.max(requiredCount || componentTypes.length, 1)) * 100);

  return (
    <>
      <style>{css}</style>
      <div className="bpc-root">

        {/* ── Hero header ── */}
        <div className="bpc-hero">
          <div className="bpc-hero-grid" />
          <div className="bpc-hero-orb1" /><div className="bpc-hero-orb2" />
          <div className="bpc-scan" />
          <div className="bpc-container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: '#93c5fd' }}>Home</span>
              <ChevronRight size={13} color="#93c5fd" />
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>PC Builder</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 8, lineHeight: 1.1 }}>
                  PC <span style={{ background: 'linear-gradient(90deg,#60a5fa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Builder</span>
                </h1>
                <p style={{ color: 'rgba(148,163,184,.85)', fontSize: 15 }}>Configure your perfect custom PC build</p>
              </div>
              {/* Progress pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 14, padding: '10px 20px', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#60a5fa' }}>{selectedCount}</div>
                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,.15)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(148,163,184,.7)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Components</div>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{progressPct}% complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="bpc-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
          {loadingComponents && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="bpc-spin" style={{ width: 40, height: 40, margin: '0 auto 12px' }} />
              <div style={{ color: '#64748b', fontSize: 14 }}>Loading components...</div>
            </div>
          )}

          {!loadingComponents && (
            <div className="bpc-layout">

              {/* LEFT — Component list */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

                {componentTypes.map((ct, idx) => {
                  const Icon = getIconForComponent(ct.name);
                  const selected = selectedProductByType.get(ct.id);
                  return (
                    <div key={ct.id} className={`bpc-comp-card ${selected ? 'bpc-comp-selected' : ''}`}
                      style={{ animationDelay: `${idx * 0.06}s` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>

                        {/* Icon */}
                        <div className={`bpc-comp-icon ${selected ? 'bpc-comp-icon-active' : ''}`}>
                          <Icon size={22} color={selected ? '#fff' : '#3b82f6'} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{ct.name}</span>
                            {ct.isRequired && (
                              <span style={{ fontSize: 11, fontWeight: 700, background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', borderRadius: 6, padding: '2px 8px' }}>Required</span>
                            )}
                          </div>

                          {selected ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e2e8f0', flexShrink: 0, background: '#f8fafc' }}>
                                <ImageWithFallback src={selected.imageUrls?.[0] || ''} alt={selected.name} className="w-full h-full object-cover" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.name}</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#3b82f6', fontFamily: "'Syne', sans-serif", marginTop: 2 }}>${Number(selected.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>No component selected — click Select to choose</div>
                          )}
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          {selected && (
                            <button className="bpc-remove-btn" onClick={() => handleRemoveComponent(ct.id)}>
                              <Trash2 size={14} />
                            </button>
                          )}
                          <button className={`bpc-select-btn ${selected ? 'bpc-change-btn' : ''}`} onClick={() => openSelectDialog(ct)}>
                            {selected ? <><RefreshCw size={13}/> Change</> : 'Select'}
                          </button>
                        </div>
                      </div>

                      {/* Selected checkmark strip */}
                      {selected && (
                        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Check size={13} color="#22c55e" />
                          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Component selected</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Missing required warning */}
                {missingRequired.length > 0 && (
                  <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 12 }}>
                    <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#92400e', marginBottom: 6 }}>Missing Required Components</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {missingRequired.map(name => (
                          <span key={name} style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT — Summary sidebar */}
              <div className="bpc-summary">
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#0b1120,#0f2044)', borderRadius: '16px 16px 0 0', padding: '20px 24px', marginBottom: 0 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Build Summary</div>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'rgba(148,163,184,.8)' }}>Progress</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>{selectedCount}/{requiredCount || componentTypes.length}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#3b82f6,#06b6d4)', borderRadius: 3, width: `${progressPct}%`, transition: 'width .5s ease' }} />
                  </div>
                </div>

                {/* Components list */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Components</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {componentTypes.map(ct => {
                      const Icon = getIconForComponent(ct.name);
                      const isSelected = !!selectedMap[ct.id];
                      return (
                        <div key={ct.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon size={13} color={isSelected ? '#3b82f6' : '#cbd5e1'} style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13, color: isSelected ? '#0f172a' : '#94a3b8', fontWeight: isSelected ? 600 : 400 }}>{ct.name}</span>
                          {isSelected
                            ? <Check size={13} color="#22c55e" />
                            : <span style={{ fontSize: 11, color: '#cbd5e1' }}>—</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total */}
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#374151' }}>Total Price</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: '#1d4ed8' }}>
                      ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button className="bpc-primary-btn" onClick={handleAddToCart} disabled={selectedCount === 0} style={{ width: '100%', marginBottom: 10 }}>
                    <ShoppingCart size={16} /> Add All to Cart
                  </button>
                  <button className="bpc-outline-btn" onClick={handleSaveBuild} disabled={selectedCount === 0 || savingBuild} style={{ width: '100%' }}>
                    <Save size={14} /> {savingBuild ? 'Saving...' : 'Save Build'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── My Builds ── */}
          {isAuthenticated && (
            <div style={{ marginTop: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-.4px' }}>My Saved Builds</h2>
                <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>{myBuilds.length}</span>
              </div>
              {loadingMyBuilds ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading builds...</div>
              ) : myBuilds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 16, border: '1.5px dashed #e2e8f0' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🔧</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#374151', marginBottom: 4 }}>No saved builds yet</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Configure a build above and save it</div>
                </div>
              ) : (
                <div className="bpc-builds-grid">
                  {myBuilds.map(b => (
                    <div key={b.id} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #f1f5f9', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,.05)', transition: 'all .2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(59,130,246,.12)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#bfdbfe'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,.05)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>{b.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>#{b.id} • {new Date(b.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: '#1d4ed8' }}>${Number(b.totalPrice ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {b.items.slice(0, 4).map((it, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                            <span style={{ fontWeight: 600, color: '#374151' }}>{it.componentTypeName}</span>
                            <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.productName}</span>
                          </div>
                        ))}
                        {b.items.length > 4 && <div style={{ fontSize: 11, color: '#94a3b8' }}>+{b.items.length - 4} more items</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Select Dialog ── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[82vh] overflow-y-auto" style={{ borderRadius: 20 }}>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800 }}>
                Select {selectedComponentType?.name}
              </DialogTitle>
            </DialogHeader>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginTop: 8 }}>
              {(selectedComponentType?.products || []).map(product => (
                <div key={product.id} className="bpc-dialog-card"
                  onClick={() => selectedComponentType && handleChooseProduct(selectedComponentType.id, product.id)}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                      <ImageWithFallback src={product.imageUrls?.[0] || ''} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.4, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                        {product.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#1d4ed8' }}>
                          ${Number(product.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {Number(product.stock ?? 0) < 10 && (
                          <span style={{ fontSize: 10, background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', borderRadius: 6, padding: '2px 7px', fontWeight: 700 }}>
                            {product.stock} left
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 2, marginTop: 5 }}>
                        {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < 4 ? '#fbbf24' : 'none'} color={i < 4 ? '#fbbf24' : '#e2e8f0'} />)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

/* ─── CSS ──────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .bpc-root { font-family:'DM Sans',sans-serif;background:#f8fafc;min-height:100vh; }

  /* Hero */
  .bpc-hero {
    position:relative;overflow:hidden;
    background:linear-gradient(135deg,#0b1120 0%,#0f2044 50%,#071528 100%);
    padding:32px 0 40px;
  }
  .bpc-hero-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.07) 1px,transparent 1px);background-size:48px 48px; }
  .bpc-hero-orb1 { position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(59,130,246,.15);filter:blur(80px);top:-120px;left:-80px;pointer-events:none; }
  .bpc-hero-orb2 { position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(6,182,212,.1);filter:blur(70px);bottom:-80px;right:-60px;pointer-events:none; }
  .bpc-scan { position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(96,165,250,.4),transparent);animation:scanMove 5s linear infinite; }
  @keyframes scanMove { from{top:0}to{top:100%} }

  .bpc-container { max-width:1280px;margin:0 auto;padding:0 32px; }
  @media(max-width:640px) { .bpc-container{padding:0 16px;} }

  /* Layout */
  .bpc-layout { display:flex;gap:28px;align-items:flex-start; }
  @media(max-width:1024px) { .bpc-layout{flex-direction:column;} }

  /* Component card */
  .bpc-comp-card {
    background:#fff;border-radius:16px;padding:20px;
    border:1.5px solid #f1f5f9;
    box-shadow:0 2px 10px rgba(0,0,0,.04);
    transition:all .25s ease;
    animation:cardIn .45s ease both;
  }
  @keyframes cardIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none} }
  .bpc-comp-card:hover { box-shadow:0 8px 24px rgba(59,130,246,.1);border-color:#bfdbfe; }
  .bpc-comp-selected { border-color:#bfdbfe!important;background:linear-gradient(135deg,#fafeff,#f0f9ff)!important; }

  .bpc-comp-icon { width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#eff6ff,#dbeafe);flex-shrink:0; }
  .bpc-comp-icon-active { background:linear-gradient(135deg,#3b82f6,#06b6d4)!important; }

  /* Buttons */
  .bpc-select-btn {
    display:inline-flex;align-items:center;gap:6px;
    background:linear-gradient(135deg,#1d4ed8,#3b82f6);
    color:#fff;border:none;border-radius:9px;padding:8px 16px;
    font-size:13px;font-weight:700;cursor:pointer;
    font-family:'Syne',sans-serif;transition:all .25s;
    box-shadow:0 2px 8px rgba(59,130,246,.3);
  }
  .bpc-select-btn:hover { transform:translateY(-1px);box-shadow:0 6px 16px rgba(59,130,246,.4); }
  .bpc-change-btn { background:linear-gradient(135deg,#475569,#64748b)!important;box-shadow:0 2px 8px rgba(100,116,139,.3)!important; }
  .bpc-change-btn:hover { box-shadow:0 6px 16px rgba(100,116,139,.35)!important; }

  .bpc-remove-btn {
    width:34px;height:34px;border-radius:8px;
    background:#fff5f5;border:1.5px solid #fecaca;
    color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:all .2s;flex-shrink:0;
  }
  .bpc-remove-btn:hover { background:#fee2e2;transform:scale(1.05); }

  /* Summary sidebar */
  .bpc-summary {
    width:300px;flex-shrink:0;
    background:#fff;border-radius:16px;
    border:1.5px solid #f1f5f9;
    box-shadow:0 4px 20px rgba(0,0,0,.07);
    position:sticky;top:88px;overflow:hidden;
  }
  @media(max-width:1024px) { .bpc-summary{width:100%;position:static;} }

  /* CTA buttons in sidebar */
  .bpc-primary-btn {
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    background:linear-gradient(135deg,#1d4ed8,#3b82f6,#0ea5e9);
    background-size:200% 200%;color:#fff;padding:12px 20px;border-radius:11px;
    font-weight:700;font-size:14px;font-family:'Syne',sans-serif;
    border:none;cursor:pointer;transition:all .35s;
  }
  .bpc-primary-btn:hover:not(:disabled) { background-position:right center;transform:translateY(-2px);box-shadow:0 10px 24px rgba(59,130,246,.4); }
  .bpc-primary-btn:disabled { opacity:.45;cursor:not-allowed;transform:none; }

  .bpc-outline-btn {
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    background:#fff;border:1.5px solid #e2e8f0;color:#374151;
    padding:11px 20px;border-radius:11px;font-weight:600;font-size:14px;
    font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;
  }
  .bpc-outline-btn:hover:not(:disabled) { border-color:#3b82f6;color:#3b82f6;background:#eff6ff; }
  .bpc-outline-btn:disabled { opacity:.4;cursor:not-allowed; }

  /* My builds grid */
  .bpc-builds-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px; }

  /* Dialog product card */
  .bpc-dialog-card {
    background:#fff;border:1.5px solid #f1f5f9;border-radius:14px;padding:16px;
    cursor:pointer;transition:all .2s;
  }
  .bpc-dialog-card:hover { border-color:#3b82f6;box-shadow:0 8px 20px rgba(59,130,246,.15);transform:translateY(-2px); }

  /* Spinner */
  .bpc-spin { border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin .7s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;