import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Cpu, Monitor, Zap, Shield, Truck, Star, ChevronRight, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Product } from '../types';
import { productService } from '../services/productService';

/* ─── Particle Canvas ─────────────────────────────── */
const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 0.5, alpha: Math.random() * 0.45 + 0.1,
    }));
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = `rgba(147,197,253,${0.1*(1-d/120)})`; ctx.lineWidth=0.7; ctx.stroke(); }
        });
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(147,197,253,${p.alpha})`; ctx.fill();
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>canvas.width) p.vx*=-1;
        if(p.y<0||p.y>canvas.height) p.vy*=-1;
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none' }}/>;
};

/* ─── Scroll reveal hook ─────────────────────────── */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.hp-reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('hp-revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
};

/* ─── Floating tech tags ─────────────────────────── */
const floatItems = [
  { label:'RTX 4090', top:'18%', left:'5%', delay:'0s' },
  { label:'Core i9', top:'52%', left:'3%', delay:'1.3s' },
  { label:'DDR5 RAM', top:'78%', left:'6%', delay:'2.1s' },
  { label:'NVMe SSD', top:'15%', right:'4%', delay:'.7s' },
  { label:'4K Display', top:'60%', right:'3%', delay:'1.8s' },
  { label:'RGB Build', top:'85%', right:'7%', delay:'2.7s' },
];

/* ─── Category icon map ──────────────────────────── */
const catIcons: Record<string, string> = {
  CPU:'🔲', GPU:'🎮', RAM:'💾', SSD:'💿', Motherboard:'🔌',
  PSU:'⚡', Case:'🗄️', Cooling:'❄️', Monitor:'🖥️', Keyboard:'⌨️',
  Mouse:'🖱️', Headset:'🎧', default:'🔧',
};

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  useReveal();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productResult, categoryResult] = await Promise.allSettled([
          productService.getProducts({ page: 1, pageSize: 20 }),
          productService.getCategories(),
        ]);
        if (productResult.status === 'fulfilled') setProducts(productResult.value || []);
        if (categoryResult.status === 'fulfilled') setCategories(categoryResult.value || []);
      } catch {}
    };
    loadData();
  }, []);

  const featuredProducts = useMemo(() => {
    const discounted = products.filter(p => p.originalPrice && p.originalPrice > p.price);
    return (discounted.length > 0 ? discounted : products).slice(0, 4);
  }, [products]);

  const popularProducts = useMemo(
    () => [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4),
    [products]
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --blue-deep: #0b1120;
          --blue-mid: #0f2044;
          --blue-brand: #3b82f6;
          --blue-light: #60a5fa;
          --cyan: #06b6d4;
        }

        .hp-root { font-family: 'DM Sans', sans-serif; }

        /* ── Hero ── */
        .hp-hero {
          position: relative; overflow: hidden; min-height: 90vh;
          background: linear-gradient(135deg, var(--blue-deep) 0%, var(--blue-mid) 50%, #071a3e 100%);
          display: flex; align-items: center;
        }
        .hp-hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(59,130,246,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.07) 1px, transparent 1px);
          background-size: 52px 52px;
        }
        .hp-hero-orb1 { position:absolute;width:600px;height:600px;border-radius:50%;background:rgba(59,130,246,.14);filter:blur(90px);top:-150px;left:-150px;animation:orbDrift1 12s ease-in-out infinite alternate; }
        .hp-hero-orb2 { position:absolute;width:450px;height:450px;border-radius:50%;background:rgba(6,182,212,.1);filter:blur(80px);bottom:-100px;right:-80px;animation:orbDrift2 10s ease-in-out infinite alternate; }
        .hp-hero-orb3 { position:absolute;width:280px;height:280px;border-radius:50%;background:rgba(139,92,246,.08);filter:blur(60px);top:30%;left:40%;animation:orbDrift1 8s ease-in-out infinite alternate; }
        @keyframes orbDrift1 { to { transform: translate(60px, 40px); } }
        @keyframes orbDrift2 { to { transform: translate(-40px, -60px); } }

        .hp-scan { position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(96,165,250,.4),transparent);animation:scanLine 5s linear infinite;pointer-events:none; }
        @keyframes scanLine { from{top:0}to{top:100%} }

        /* Floating tech tags */
        .hp-tag {
          position: absolute; padding: 6px 14px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(96,165,250,.25);
          border-radius: 20px; color: rgba(147,197,253,.9); font-size: 12px; font-weight: 600;
          backdrop-filter: blur(10px); pointer-events: none; white-space: nowrap;
          animation: tagFloat 5s ease-in-out infinite;
          font-family: 'DM Sans', sans-serif;
        }
        @media(max-width:768px) { .hp-tag { display: none; } }
        @keyframes tagFloat { 0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)} }

        /* Hero content */
        .hp-hero-inner {
          position: relative; z-index: 10;
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
          width: 100%;
        }
        @media(max-width:768px) { .hp-hero-inner { grid-template-columns:1fr; gap:32px; } }

        .hp-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(59,130,246,.15); border: 1px solid rgba(59,130,246,.3);
          border-radius: 20px; padding: 6px 14px; margin-bottom: 20px;
          animation: fadeInUp .6s ease both;
        }
        .hp-hero-badge span { font-size: 12px; font-weight: 600; color: #93c5fd; letter-spacing: .4px; text-transform: uppercase; }

        .hp-hero-h1 {
          font-family: 'Syne', sans-serif; font-size: clamp(40px, 5vw, 68px); font-weight: 800;
          color: #fff; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 20px;
          animation: fadeInUp .7s ease .1s both;
        }
        .hp-hero-h1 .grad {
          background: linear-gradient(90deg, #60a5fa, #06b6d4, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-size: 200% 100%; animation: shimmer 4s ease infinite;
        }
        @keyframes shimmer { 0%,100%{background-position:0%}50%{background-position:100%} }

        .hp-hero-sub {
          font-size: 18px; color: rgba(148,163,184,.85); line-height: 1.7; margin-bottom: 36px;
          max-width: 480px; animation: fadeInUp .7s ease .2s both;
        }

        .hp-hero-btns { display:flex;gap:14px;flex-wrap:wrap;animation:fadeInUp .7s ease .3s both; }

        .hp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6, #0ea5e9);
          background-size: 200% 200%; color: #fff;
          padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px;
          font-family: 'Syne', sans-serif; border: none; cursor: pointer; text-decoration: none;
          transition: all .35s ease; letter-spacing: .3px;
        }
        .hp-btn-primary:hover { background-position:right center; transform:translateY(-2px); box-shadow:0 12px 30px rgba(59,130,246,.45); }

        .hp-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; border: 1.5px solid rgba(255,255,255,.25); color: #fff;
          padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px;
          font-family: 'Syne', sans-serif; cursor: pointer; text-decoration: none;
          transition: all .3s ease;
        }
        .hp-btn-outline:hover { border-color:rgba(255,255,255,.6);background:rgba(255,255,255,.07);transform:translateY(-2px); }

        /* Hero stats */
        .hp-stats { display:flex;gap:32px;margin-top:40px;animation:fadeInUp .7s ease .4s both; }
        .hp-stat-val { font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#fff; }
        .hp-stat-lbl { font-size:12px;color:rgba(148,163,184,.7);margin-top:2px; }

        /* Hero image */
        .hp-hero-img {
          position: relative; animation: fadeInRight .9s ease .2s both;
        }
        @keyframes fadeInRight { from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none} }
        .hp-hero-img img,.hp-hero-img .img-wrap {
          border-radius: 20px; box-shadow: 0 40px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.06);
          width: 100%; aspect-ratio: 4/3; object-fit: cover;
        }
        .hp-hero-img::before {
          content: ''; position: absolute; inset: -2px; border-radius: 22px;
          background: linear-gradient(135deg, rgba(59,130,246,.4), rgba(6,182,212,.2), transparent);
          z-index: -1; filter: blur(1px);
        }
        /* Floating badge on image */
        .hp-img-badge {
          position: absolute; bottom: -16px; left: 24px;
          background: rgba(15,32,68,.95); border: 1px solid rgba(59,130,246,.3);
          border-radius: 14px; padding: 12px 18px;
          backdrop-filter: blur(20px); display: flex; align-items: center; gap: 10px;
          box-shadow: 0 8px 30px rgba(0,0,0,.4);
        }
        .hp-img-badge2 {
          position: absolute; top: -16px; right: 24px;
          background: rgba(15,32,68,.95); border: 1px solid rgba(6,182,212,.3);
          border-radius: 14px; padding: 10px 16px;
          backdrop-filter: blur(20px); display: flex; align-items: center; gap: 8px;
          box-shadow: 0 8px 30px rgba(0,0,0,.4);
        }

        /* Orbiting CPU visual */
        .hp-cpu-ring { animation: rotateSlow 15s linear infinite; }
        .hp-cpu-ring-r { animation: rotateSlow 8s linear infinite reverse; }
        @keyframes rotateSlow { to{transform:rotate(360deg)} }
        .glow-pulse { animation: glowP 3s ease-in-out infinite; }
        @keyframes glowP { 0%,100%{box-shadow:0 0 20px rgba(59,130,246,.3)}50%{box-shadow:0 0 50px rgba(59,130,246,.65)} }

        /* ── Sections ── */
        .hp-section { padding: 80px 0; }
        .hp-section-alt { padding: 80px 0; background: #f8fafc; }
        .hp-container { max-width: 1280px; margin: 0 auto; padding: 0 32px; }

        /* Section heading */
        .hp-section-head { display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px; }
        .hp-section-title { font-family:'Syne',sans-serif;font-size:32px;font-weight:800;color:#0f172a;letter-spacing:-.5px; }
        .hp-section-title span { background:linear-gradient(90deg,#3b82f6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .hp-view-all {
          display:inline-flex;align-items:center;gap:6px;color:#3b82f6;font-weight:600;font-size:14px;
          text-decoration:none;padding:8px 16px;border:1.5px solid #dbeafe;border-radius:10px;
          transition:all .2s;
        }
        .hp-view-all:hover { background:#eff6ff;border-color:#3b82f6;transform:translateX(2px); }

        /* ── Feature cards ── */
        .hp-feature-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:20px; }
        @media(max-width:900px){ .hp-feature-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:500px){ .hp-feature-grid{grid-template-columns:1fr} }

        .hp-feat-card {
          background: #fff; border-radius: 18px; padding: 28px 24px;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 2px 12px rgba(0,0,0,.05);
          transition: all .3s ease; cursor: default;
          position: relative; overflow: hidden;
        }
        .hp-feat-card::before {
          content:''; position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,#3b82f6,#06b6d4);
          transform:scaleX(0);transform-origin:left;
          transition:transform .3s ease;
        }
        .hp-feat-card:hover { transform:translateY(-6px);box-shadow:0 20px 40px rgba(59,130,246,.12);border-color:#dbeafe; }
        .hp-feat-card:hover::before { transform:scaleX(1); }
        .hp-feat-icon { width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;background:linear-gradient(135deg,#eff6ff,#dbeafe); }
        .hp-feat-title { font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#0f172a;margin-bottom:6px; }
        .hp-feat-sub { font-size:13.5px;color:#64748b;line-height:1.6; }

        /* ── Category grid ── */
        .hp-cat-grid { display:grid;grid-template-columns:repeat(5,1fr);gap:16px; }
        @media(max-width:900px){ .hp-cat-grid{grid-template-columns:repeat(3,1fr)} }
        @media(max-width:500px){ .hp-cat-grid{grid-template-columns:repeat(2,1fr)} }

        .hp-cat-card {
          background:#fff;border-radius:16px;padding:22px 16px;text-align:center;
          border:1.5px solid #f1f5f9;
          box-shadow:0 2px 8px rgba(0,0,0,.04);
          text-decoration:none;transition:all .3s;
          display:flex;flex-direction:column;align-items:center;gap:10px;
        }
        .hp-cat-card:hover { transform:translateY(-5px);box-shadow:0 16px 35px rgba(59,130,246,.13);border-color:#bfdbfe; }
        .hp-cat-icon { font-size:32px;filter:drop-shadow(0 2px 6px rgba(59,130,246,.2));transition:transform .3s; }
        .hp-cat-card:hover .hp-cat-icon { transform:scale(1.15) rotate(5deg); }
        .hp-cat-name { font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#374151;transition:color .2s; }
        .hp-cat-card:hover .hp-cat-name { color:#3b82f6; }

        /* ── Product grid ── */
        .hp-prod-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:20px; }
        @media(max-width:1024px){ .hp-prod-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:500px){ .hp-prod-grid{grid-template-columns:1fr} }

        /* ── CTA Banner ── */
        .hp-cta {
          position: relative; overflow: hidden; border-radius: 24px;
          background: linear-gradient(135deg, #0b1120 0%, #0f2044 60%, #071528 100%);
          padding: 60px 48px; display: flex; align-items: center; justify-content: space-between; gap: 32px;
        }
        @media(max-width:768px){ .hp-cta{flex-direction:column;text-align:center;padding:40px 28px;} }
        .hp-cta-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.06) 1px,transparent 1px);background-size:44px 44px; }
        .hp-cta-orb1 { position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(59,130,246,.15);filter:blur(60px);top:-80px;left:-80px; }
        .hp-cta-orb2 { position:absolute;width:250px;height:250px;border-radius:50%;background:rgba(6,182,212,.1);filter:blur(60px);bottom:-60px;right:-60px; }

        /* ── Scroll reveal ── */
        .hp-reveal { opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease; }
        .hp-revealed { opacity:1;transform:none; }

        /* Stagger children */
        .hp-stagger > *:nth-child(1) { transition-delay:.05s }
        .hp-stagger > *:nth-child(2) { transition-delay:.12s }
        .hp-stagger > *:nth-child(3) { transition-delay:.19s }
        .hp-stagger > *:nth-child(4) { transition-delay:.26s }
        .hp-stagger > *:nth-child(5) { transition-delay:.33s }
        .hp-stagger > *:nth-child(6) { transition-delay:.40s }
        .hp-stagger > *:nth-child(7) { transition-delay:.47s }
        .hp-stagger > *:nth-child(8) { transition-delay:.54s }
        .hp-stagger > *:nth-child(9) { transition-delay:.61s }
        .hp-stagger > *:nth-child(10) { transition-delay:.68s }

        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none} }

        /* Hot deals label */
        .hp-hot { display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#fef3c7,#fed7aa);border:1px solid #fbbf24;border-radius:8px;padding:4px 12px;font-size:12px;font-weight:700;color:#92400e;margin-bottom:8px; }
      `}</style>

      <div className="hp-root">

        {/* ── HERO ─────────────────────────────────────── */}
        <section className="hp-hero">
          <div className="hp-hero-grid" />
          <ParticleCanvas />
          <div className="hp-scan" />
          <div className="hp-hero-orb1" />
          <div className="hp-hero-orb2" />
          <div className="hp-hero-orb3" />

          {/* Floating tags */}
          {floatItems.map((t, i) => (
            <div key={i} className="hp-tag" style={{ top:t.top, left:t.left, right:t.right, animationDelay:t.delay } as React.CSSProperties}>
              {t.label}
            </div>
          ))}

          <div className="hp-hero-inner">
            {/* Left copy */}
            <div>
              <div className="hp-hero-badge">
                <Sparkles size={13} color="#93c5fd"/>
                <span>Premium PC Components</span>
              </div>

              <h1 className="hp-hero-h1">
                Build Your<br/>
                <span className="grad">Dream PC</span>
              </h1>

              <p className="hp-hero-sub">
                Premium computer components and custom builds. Get the performance you deserve — from GPU to chassis.
              </p>

              <div className="hp-hero-btns">
                <Link to="/build-pc" className="hp-btn-primary">
                  Build Your PC <ArrowRight size={17}/>
                </Link>
                <Link to="/products" className="hp-btn-outline">
                  Browse Products
                </Link>
              </div>

              <div className="hp-stats">
                {[{v:'50K+',l:'Happy Customers'},{v:'10K+',l:'Products'},{v:'4.9★',l:'Avg. Rating'}].map(({v,l}) => (
                  <div key={l}>
                    <div className="hp-stat-val">{v}</div>
                    <div className="hp-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — image */}
            <div className="hp-hero-img hidden md:block">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1733945761533-727f49908d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb21wdXRlciUyMHNldHVwfGVufDF8fHx8MTc2ODQ0OTM5MXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Gaming Setup"
                className="img-wrap"
                style={{ width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'20px' } as React.CSSProperties}
              />
              {/* Floating info badge */}
              <div className="hp-img-badge">
                <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#3b82f6,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Cpu size={18} color="#fff"/>
                </div>
                <div>
                  <div style={{ color:'#fff',fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif" }}>i9-14900K</div>
                  <div style={{ color:'rgba(148,163,184,.8)',fontSize:11 }}>Latest Gen CPU</div>
                </div>
              </div>
              <div className="hp-img-badge2">
                <div style={{ width:8,height:8,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 8px #22c55e' }}/>
                <span style={{ color:'#86efac',fontSize:12,fontWeight:600 }}>In Stock • Ships Today</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────── */}
        <section className="hp-section-alt">
          <div className="hp-container">
            <div className="hp-feature-grid hp-reveal hp-stagger">
              {[
                { icon:Zap, title:'Fast Shipping', sub:'Free shipping on orders over $50', color:'#3b82f6' },
                { icon:Shield, title:'2-Year Warranty', sub:'Full coverage on all products', color:'#06b6d4' },
                { icon:Cpu, title:'Expert Support', sub:'24/7 technical help available', color:'#8b5cf6' },
                { icon:Monitor, title:'Custom Builds', sub:'Personalized PC configurations', color:'#f59e0b' },
              ].map(({ icon:Icon, title, sub, color }) => (
                <div key={title} className="hp-feat-card hp-reveal">
                  <div className="hp-feat-icon">
                    <Icon size={24} color={color}/>
                  </div>
                  <div className="hp-feat-title">{title}</div>
                  <div className="hp-feat-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ───────────────────────────────── */}
        <section className="hp-section">
          <div className="hp-container">
            <div className="hp-section-head hp-reveal">
              <h2 className="hp-section-title">Shop by <span>Category</span></h2>
            </div>
            <div className="hp-cat-grid hp-stagger">
              {categories.slice(0, 10).map(cat => (
                <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`} className="hp-cat-card hp-reveal">
                  <span className="hp-cat-icon">{catIcons[cat.name] || catIcons.default}</span>
                  <span className="hp-cat-name">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOT DEALS ────────────────────────────────── */}
        <section className="hp-section-alt">
          <div className="hp-container">
            <div className="hp-section-head hp-reveal">
              <div>
                <div className="hp-hot">🔥 Limited Time</div>
                <h2 className="hp-section-title">Hot <span>Deals</span></h2>
              </div>
              <Link to="/products" className="hp-view-all">View All <ChevronRight size={15}/></Link>
            </div>
            <div className="hp-prod-grid hp-stagger">
              {featuredProducts.map(p => (
                <div key={p.id} className="hp-reveal">
                  <ProductCard product={p}/>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── POPULAR ──────────────────────────────────── */}
        <section className="hp-section">
          <div className="hp-container">
            <div className="hp-section-head hp-reveal">
              <div>
                <div className="hp-hot" style={{ background:'linear-gradient(135deg,#ede9fe,#ddd6fe)',borderColor:'#8b5cf6',color:'#5b21b6' }}>⭐ Top Rated</div>
                <h2 className="hp-section-title">Popular <span>Products</span></h2>
              </div>
              <Link to="/products" className="hp-view-all">View All <ChevronRight size={15}/></Link>
            </div>
            <div className="hp-prod-grid hp-stagger">
              {popularProducts.map(p => (
                <div key={p.id} className="hp-reveal">
                  <ProductCard product={p}/>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ───────────────────────────────── */}
        <section className="hp-section">
          <div className="hp-container">
            <div className="hp-cta hp-reveal">
              <div className="hp-cta-grid" />
              <div className="hp-cta-orb1" />
              <div className="hp-cta-orb2" />
              <ParticleCanvas />

              <div style={{ position:'relative',zIndex:2 }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:800,color:'#fff',lineHeight:1.15,marginBottom:12 }}>
                  Ready to Build Your<br/>
                  <span style={{ background:'linear-gradient(90deg,#60a5fa,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
                    Dream Setup?
                  </span>
                </div>
                <p style={{ color:'rgba(148,163,184,.85)',fontSize:15,maxWidth:480,lineHeight:1.7 }}>
                  Use our PC Builder to configure the perfect machine for gaming, streaming, or professional work.
                </p>
              </div>

              <div style={{ position:'relative',zIndex:2,display:'flex',gap:14,flexShrink:0,flexWrap:'wrap' }}>
                <Link to="/build-pc" className="hp-btn-primary" style={{ fontSize:16,padding:'15px 32px' }}>
                  Start Building <ArrowRight size={18}/>
                </Link>
                <Link to="/products" className="hp-btn-outline" style={{ fontSize:16,padding:'15px 32px' }}>
                  View Products
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}