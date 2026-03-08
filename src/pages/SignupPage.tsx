import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Cpu, User, Mail, Phone, Lock, Eye, EyeOff, ChevronRight, Zap, Shield, Truck, Star } from 'lucide-react';

/* ─── Particle Background ─────────────────────────── */
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

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(99,179,237,${0.12 * (1 - d / 130)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        });
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${p.alpha})`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};

/* ─── Main Page ───────────────────────────────────── */
export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [focused, setFocused] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) { toast.error('Please fill in all fields'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const success = await signup(name, email, phone, password);
      if (success) { toast.success('Account created successfully!'); navigate('/'); }
      else toast.error('Failed to create account');
    } catch { toast.error('Signup failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .sp-root { font-family:'DM Sans',sans-serif; }

        /* ── Dark background fills entire viewport below navbar ── */
        .sp-bg {
          position: fixed;
          /* push below a typical 64px navbar */
          top: 64px; left: 0; right: 0; bottom: 0;
          z-index: 0;
          background: linear-gradient(135deg, #0b1120 0%, #0f2044 45%, #071528 100%);
          overflow: hidden;
        }
        .sp-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .sp-orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none;
        }
        .sp-orb1 { width:500px;height:500px;background:rgba(59,130,246,.18);top:-120px;left:-150px;animation:driftA 10s ease-in-out infinite alternate; }
        .sp-orb2 { width:400px;height:400px;background:rgba(6,182,212,.14);bottom:-80px;right:-100px;animation:driftB 13s ease-in-out infinite alternate; }
        .sp-orb3 { width:260px;height:260px;background:rgba(139,92,246,.12);top:35%;left:48%;animation:driftA 8s ease-in-out infinite alternate; }
        @keyframes driftA{to{transform:translate(50px,35px)}}
        @keyframes driftB{to{transform:translate(-35px,-50px)}}

        .sp-float{position:absolute;font-size:22px;pointer-events:none;user-select:none;animation:floatUD 5s ease-in-out infinite;filter:drop-shadow(0 0 7px rgba(96,165,250,.55));}
        @keyframes floatUD{0%,100%{transform:translateY(0) rotate(0deg);opacity:.6}50%{transform:translateY(-20px) rotate(6deg);opacity:1}}

        .sp-scan{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(96,165,250,.45),transparent);animation:scanMove 5s linear infinite;}
        @keyframes scanMove{from{top:0}to{top:100%}}

        /* ── Layout ── */
        .sp-content{
          position:relative; z-index:10;
          /* fill height below navbar */
          min-height: calc(100vh - 64px);
          display:flex; align-items:stretch;
        }

        /* Left panel */
        .sp-left{
          width:360px;flex-shrink:0;
          display:flex;flex-direction:column;justify-content:space-between;
          padding:48px 32px;gap:28px;
        }
        @media(max-width:900px){.sp-left{display:none}}

        /* Right panel */
        .sp-right{
          flex:1;display:flex;align-items:center;justify-content:center;
          padding:40px 24px;
        }

        /* Card */
        .sp-card{
          width:100%;max-width:460px;
          background:rgba(255,255,255,0.96);
          border-radius:24px;padding:40px;
          box-shadow:0 30px 70px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.08);
          animation:cardIn .7s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes cardIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}

        /* Inputs */
        .sp-input{
          font-family:'DM Sans',sans-serif;
          width:100%;padding:11px 14px 11px 42px;
          border:1.5px solid #e2e8f0;border-radius:12px;
          font-size:14px;color:#0f172a;background:#f8fafc;outline:none;
          transition:all .25s;
        }
        .sp-input:focus{border-color:#3b82f6;background:#fff;box-shadow:0 0 0 3px rgba(59,130,246,.12),0 4px 12px rgba(59,130,246,.1);}
        .sp-input::placeholder{color:#94a3b8;}

        /* Button */
        .sp-btn{
          font-family:'Syne',sans-serif;font-weight:700;font-size:15px;
          width:100%;padding:13px;border:none;border-radius:12px;cursor:pointer;color:#fff;
          background:linear-gradient(135deg,#1d4ed8,#3b82f6,#0ea5e9);
          background-size:200% 200%;
          transition:all .35s ease;
          display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:.3px;
        }
        .sp-btn:hover:not(:disabled){background-position:right center;transform:translateY(-2px);box-shadow:0 10px 28px rgba(59,130,246,.45);}
        .sp-btn:disabled{opacity:.65;cursor:not-allowed;}

        /* Badge */
        .sp-badge{
          display:flex;align-items:center;gap:12px;
          background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
          border-radius:14px;padding:13px 16px;backdrop-filter:blur(12px);
          transition:all .3s;
        }
        .sp-badge:hover{background:rgba(255,255,255,.13);transform:translateX(6px);}

        .sp-spin{width:18px;height:18px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* Stagger */
        .sp-row{opacity:0;animation:rowIn .45s ease forwards;}
        .sp-row:nth-child(1){animation-delay:.1s}
        .sp-row:nth-child(2){animation-delay:.18s}
        .sp-row:nth-child(3){animation-delay:.26s}
        .sp-row:nth-child(4){animation-delay:.34s}
        .sp-row:nth-child(5){animation-delay:.42s}
        .sp-row:nth-child(6){animation-delay:.50s}
        .sp-row:nth-child(7){animation-delay:.58s}
        .sp-row:nth-child(8){animation-delay:.66s}
        @keyframes rowIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}

        .ring-outer{animation:rotateSlow 12s linear infinite}
        .ring-inner{animation:rotateSlow 7s linear infinite reverse}
        @keyframes rotateSlow{to{transform:rotate(360deg)}}

        .glow-p{animation:glowPulse 3s ease-in-out infinite}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(59,130,246,.35)}50%{box-shadow:0 0 45px rgba(59,130,246,.7)}}
      `}</style>

      {/* ── Fixed dark BG (covers everything below navbar) ── */}
      <div className="sp-bg">
        <div className="sp-grid" />
        <ParticleCanvas />
        <div className="sp-scan" />
        <div className="sp-orb sp-orb1" />
        <div className="sp-orb sp-orb2" />
        <div className="sp-orb sp-orb3" />
        {[
          { e:'💻', s:{top:'10%',left:'3%',animationDelay:'0s'} },
          { e:'🖥️', s:{top:'6%',right:'4%',animationDelay:'1.2s'} },
          { e:'⚡', s:{top:'38%',left:'2%',animationDelay:'2s'} },
          { e:'🔧', s:{top:'62%',left:'5%',animationDelay:'.7s'} },
          { e:'💾', s:{bottom:'15%',left:'8%',animationDelay:'1.8s'} },
          { e:'🎮', s:{top:'48%',right:'3%',animationDelay:'2.4s'} },
          { e:'📱', s:{bottom:'10%',right:'6%',animationDelay:'.4s'} },
          { e:'🔌', s:{top:'24%',right:'22%',animationDelay:'3s'} },
          { e:'🖱️', s:{bottom:'28%',right:'18%',animationDelay:'1.5s'} },
          { e:'🔋', s:{top:'15%',left:'22%',animationDelay:'2.8s'} },
        ].map(({ e, s }, i) => (
          <div key={i} className="sp-float" style={s as React.CSSProperties}>{e}</div>
        ))}
      </div>

      {/* ── Scrollable content layer ── */}
      <div className="sp-root sp-content">

        {/* LEFT — branding */}
        <div className="sp-left">
          {/* CPU graphic */}
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',paddingTop:16 }}>
            <div style={{ position:'relative',width:170,height:170,marginBottom:20 }}>
              <div className="ring-outer" style={{ position:'absolute',inset:0,border:'2px dashed rgba(96,165,250,.35)',borderRadius:'50%' }}/>
              <div className="ring-inner" style={{ position:'absolute',inset:18,border:'1px solid rgba(96,165,250,.22)',borderRadius:'50%' }}/>
              <div className="glow-p" style={{ position:'absolute',inset:35,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,.25) 0%,transparent 70%)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Cpu size={52} color="#60a5fa" strokeWidth={1.5}/>
              </div>
              {[0,72,144,216,288].map((deg,i) => (
                <div key={i} style={{ position:'absolute',width:9,height:9,
                  background:i%2===0?'#3b82f6':'#06b6d4',borderRadius:'50%',
                  top:'50%',left:'50%',
                  boxShadow:`0 0 10px ${i%2===0?'#3b82f6':'#06b6d4'}`,
                  transform:`rotate(${deg}deg) translateX(76px) translateY(-4.5px)`,
                  animation:'rotateSlow 10s linear infinite',
                  transformOrigin:'-71px 4.5px',
                }}/>
              ))}
            </div>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:'#fff',lineHeight:1.25,marginBottom:8 }}>
              Build Your Dream<br/>
              <span style={{ background:'linear-gradient(90deg,#60a5fa,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
                PC Setup
              </span>
            </h2>
            <p style={{ color:'rgba(148,163,184,.85)',fontSize:13.5,maxWidth:230,lineHeight:1.65 }}>
              Join thousands of tech enthusiasts shopping for premium components
            </p>
          </div>

          {/* Stats */}
          <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
            {[{n:'50K+',l:'Members'},{n:'10K+',l:'Products'},{n:'4.9★',l:'Rating'}].map(({n,l}) => (
              <div key={l} style={{ flex:1,textAlign:'center',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,padding:'12px 6px',backdropFilter:'blur(10px)' }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:'#60a5fa' }}>{n}</div>
                <div style={{ fontSize:11,color:'rgba(148,163,184,.75)',marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Feature badges */}
          <div style={{ display:'flex',flexDirection:'column',gap:9 }}>
            {[
              { icon:Zap, label:'Lightning Fast Delivery', sub:'Same day shipping available' },
              { icon:Shield, label:'Warranty Protected', sub:'2-year coverage on all parts' },
              { icon:Truck, label:'Free Returns', sub:'30-day hassle-free returns' },
            ].map(({icon:Icon,label,sub}) => (
              <div key={label} className="sp-badge">
                <div style={{ background:'linear-gradient(135deg,#3b82f6,#06b6d4)',borderRadius:8,padding:6,flexShrink:0 }}>
                  <Icon size={14} color="#fff"/>
                </div>
                <div>
                  <div style={{ color:'#fff',fontSize:13,fontWeight:600 }}>{label}</div>
                  <div style={{ color:'rgba(148,163,184,.72)',fontSize:11,marginTop:1 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stars */}
          <div style={{ display:'flex',alignItems:'center',gap:5,justifyContent:'center' }}>
            {[...Array(5)].map((_,i) => <Star key={i} size={12} fill="#fbbf24" color="#fbbf24"/>)}
            <span style={{ color:'rgba(148,163,184,.65)',fontSize:11,marginLeft:4 }}>Trusted by 50,000+ customers</span>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="sp-right">
          <div className="sp-card">

            {/* Logo */}
            <div className="sp-row" style={{ display:'flex',alignItems:'center',gap:10,marginBottom:22 }}>
              <div className="glow-p" style={{ background:'linear-gradient(135deg,#1d4ed8,#06b6d4)',borderRadius:10,padding:8 }}>
                <Cpu size={22} color="#fff"/>
              </div>
              <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:'#0f172a' }}>TechStore</span>
            </div>

            {/* Heading */}
            <div className="sp-row" style={{ marginBottom:26 }}>
              <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:25,fontWeight:800,color:'#0f172a',marginBottom:4,letterSpacing:'-.4px' }}>
                Create Account
              </h1>
              <p style={{ color:'#64748b',fontSize:14 }}>Join TechStore and start building your dream setup</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Text fields */}
              {[
                { id:'name', label:'Full Name', type:'text', ph:'John Doe', val:name, set:setName, Icon:User },
                { id:'email', label:'Email', type:'email', ph:'john@example.com', val:email, set:setEmail, Icon:Mail },
                { id:'phone', label:'Phone', type:'tel', ph:'0901234567', val:phone, set:setPhone, Icon:Phone },
              ].map(({ id, label, type, ph, val, set, Icon }) => (
                <div key={id} className="sp-row" style={{ marginBottom:13 }}>
                  <label htmlFor={id} style={{ display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:5 }}>{label}</label>
                  <div style={{ position:'relative' }}>
                    <Icon size={15} color={focused===id?'#3b82f6':'#94a3b8'}
                      style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',transition:'color .25s',pointerEvents:'none' }}/>
                    <input id={id} type={type} placeholder={ph} value={val}
                      onChange={e => set(e.target.value)}
                      onFocus={() => setFocused(id)} onBlur={() => setFocused('')}
                      required className="sp-input"/>
                  </div>
                </div>
              ))}

              {/* Password fields */}
              {[
                { id:'password', label:'Password', val:password, set:setPassword, show:showPw, toggle:() => setShowPw(p => !p) },
                { id:'confirmPassword', label:'Confirm Password', val:confirmPassword, set:setConfirmPassword, show:showCpw, toggle:() => setShowCpw(p => !p) },
              ].map(({ id, label, val, set, show, toggle }) => (
                <div key={id} className="sp-row" style={{ marginBottom:13 }}>
                  <label htmlFor={id} style={{ display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:5 }}>{label}</label>
                  <div style={{ position:'relative' }}>
                    <Lock size={15} color={focused===id?'#3b82f6':'#94a3b8'}
                      style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',transition:'color .25s',pointerEvents:'none' }}/>
                    <input id={id} type={show?'text':'password'} placeholder="••••••••" value={val}
                      onChange={e => set(e.target.value)}
                      onFocus={() => setFocused(id)} onBlur={() => setFocused('')}
                      required className="sp-input" style={{ paddingRight:42 }}/>
                    <button type="button" onClick={toggle}
                      style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:0,display:'flex',alignItems:'center' }}>
                      {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
              ))}

              {/* Terms */}
              <div className="sp-row" style={{ display:'flex',alignItems:'flex-start',gap:10,margin:'5px 0 16px' }}>
                <input type="checkbox" id="terms" required
                  style={{ marginTop:3,accentColor:'#3b82f6',width:15,height:15,flexShrink:0,cursor:'pointer' }}/>
                <label htmlFor="terms" style={{ fontSize:13,color:'#64748b',lineHeight:1.5,cursor:'pointer' }}>
                  I agree to the{' '}
                  <a href="#" style={{ color:'#3b82f6',textDecoration:'none',fontWeight:500 }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" style={{ color:'#3b82f6',textDecoration:'none',fontWeight:500 }}>Privacy Policy</a>
                </label>
              </div>

              {/* Submit */}
              <div className="sp-row">
                <button type="submit" disabled={loading} className="sp-btn">
                  {loading
                    ? <><span className="sp-spin"/>Creating account...</>
                    : <>Create Account <ChevronRight size={17}/></>}
                </button>
              </div>
            </form>

            {/* Sign in */}
            <div className="sp-row" style={{ textAlign:'center',marginTop:18,paddingTop:16,borderTop:'1px solid #f1f5f9' }}>
              <span style={{ color:'#64748b',fontSize:14 }}>Already have an account? </span>
              <Link to="/login" style={{ color:'#3b82f6',fontWeight:600,fontSize:14,textDecoration:'none' }}>Sign in →</Link>
            </div>

            <div className="sp-row" style={{ textAlign:'center',marginTop:10 }}>
              <span style={{ fontSize:11,color:'#94a3b8' }}>🔒 Your data is encrypted and securely stored</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}