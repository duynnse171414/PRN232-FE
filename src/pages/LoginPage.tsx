import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  Cpu,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Monitor,
  Package,
} from "lucide-react";

/* ─── Particle Canvas ─────────────────────────────── */
const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
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
        particles.slice(i + 1).forEach((q) => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(99,179,237,${0.12 * (1 - d / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
};

/* ─── Main Page ───────────────────────────────────── */
export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        let isAdmin = false;
        const savedUserRaw = localStorage.getItem("auth_user");
        if (savedUserRaw) {
          try {
            const savedUser = JSON.parse(savedUserRaw);
            isAdmin = savedUser?.role?.toLowerCase() === "admin";
          } catch {
            isAdmin = false;
          }
        }

        toast.success("Login successful!");
        navigate(isAdmin ? "/admin" : "/");
      } else toast.error("Invalid email or password");
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .lp-root { font-family: 'DM Sans', sans-serif; }

        .lp-bg {
          position: fixed;
          top: 64px; left: 0; right: 0; bottom: 0;
          z-index: 0;
          background: linear-gradient(135deg, #0b1120 0%, #0f2044 45%, #071528 100%);
          overflow: hidden;
        }
        .lp-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .lp-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .lp-orb1 { width:500px;height:500px;background:rgba(59,130,246,.18);top:-120px;left:-150px;animation:driftA 10s ease-in-out infinite alternate; }
        .lp-orb2 { width:400px;height:400px;background:rgba(6,182,212,.14);bottom:-80px;right:-100px;animation:driftB 13s ease-in-out infinite alternate; }
        .lp-orb3 { width:260px;height:260px;background:rgba(139,92,246,.12);top:35%;left:48%;animation:driftA 8s ease-in-out infinite alternate; }
        @keyframes driftA { to { transform: translate(50px,35px); } }
        @keyframes driftB { to { transform: translate(-35px,-50px); } }

        .lp-float { position:absolute;font-size:22px;pointer-events:none;user-select:none;animation:floatUD 5s ease-in-out infinite;filter:drop-shadow(0 0 7px rgba(96,165,250,.55)); }
        @keyframes floatUD { 0%,100%{transform:translateY(0) rotate(0deg);opacity:.6}50%{transform:translateY(-20px) rotate(6deg);opacity:1} }

        .lp-scan { position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(96,165,250,.45),transparent);animation:scanMove 5s linear infinite; }
        @keyframes scanMove { from{top:0}to{top:100%} }

        .lp-content {
          position: relative; z-index: 10;
          min-height: calc(100vh - 64px);
          display: flex; align-items: stretch;
        }

        /* Left panel */
        .lp-left {
          width: 360px; flex-shrink: 0;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 48px 32px; gap: 28px;
        }
        @media(max-width:900px) { .lp-left { display: none; } }

        /* Right panel */
        .lp-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 40px 24px;
        }

        /* Card */
        .lp-card {
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,0.96);
          border-radius: 24px; padding: 40px;
          box-shadow: 0 30px 70px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.08);
          animation: cardIn .7s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none} }

        /* Input */
        .lp-input {
          font-family: 'DM Sans', sans-serif;
          width: 100%; padding: 11px 14px 11px 42px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 14px; color: #0f172a; background: #f8fafc; outline: none;
          transition: all .25s;
        }
        .lp-input:focus { border-color:#3b82f6;background:#fff;box-shadow:0 0 0 3px rgba(59,130,246,.12),0 4px 12px rgba(59,130,246,.1); }
        .lp-input::placeholder { color: #94a3b8; }

        /* Button */
        .lp-btn {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
          width: 100%; padding: 13px; border: none; border-radius: 12px; cursor: pointer; color: #fff;
          background: linear-gradient(135deg,#1d4ed8,#3b82f6,#0ea5e9);
          background-size: 200% 200%;
          transition: all .35s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: .3px;
        }
        .lp-btn:hover:not(:disabled) { background-position:right center;transform:translateY(-2px);box-shadow:0 10px 28px rgba(59,130,246,.45); }
        .lp-btn:disabled { opacity: .65; cursor: not-allowed; }

        /* Badge */
        .lp-badge {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
          border-radius: 14px; padding: 13px 16px; backdrop-filter: blur(12px);
          transition: all .3s;
        }
        .lp-badge:hover { background:rgba(255,255,255,.13);transform:translateX(6px); }

        /* Recent activity item */
        .lp-activity {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px; padding: 10px 13px;
          transition: all .3s;
        }
        .lp-activity:hover { background: rgba(255,255,255,.1); }

        .lp-spin { width:18px;height:18px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* Stagger */
        .lp-row { opacity:0;animation:rowIn .45s ease forwards; }
        .lp-row:nth-child(1){animation-delay:.1s}
        .lp-row:nth-child(2){animation-delay:.18s}
        .lp-row:nth-child(3){animation-delay:.26s}
        .lp-row:nth-child(4){animation-delay:.34s}
        .lp-row:nth-child(5){animation-delay:.42s}
        .lp-row:nth-child(6){animation-delay:.50s}
        .lp-row:nth-child(7){animation-delay:.58s}
        @keyframes rowIn { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none} }

        .ring-outer { animation: rotateSlow 12s linear infinite; }
        .ring-inner { animation: rotateSlow 7s linear infinite reverse; }
        @keyframes rotateSlow { to { transform: rotate(360deg); } }

        .glow-p { animation: glowPulse 3s ease-in-out infinite; }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(59,130,246,.35)}50%{box-shadow:0 0 45px rgba(59,130,246,.7)} }

        /* Social login btn */
        .lp-social {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px; border: 1.5px solid #e2e8f0; border-radius: 10px;
          background: #f8fafc; font-size: 13px; font-weight: 500; color: #374151;
          cursor: pointer; transition: all .2s; font-family: 'DM Sans', sans-serif;
        }
        .lp-social:hover { background: #fff; border-color: #3b82f6; color: #3b82f6; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,.1); }

        /* Divider */
        .lp-divider { display:flex;align-items:center;gap:12px;margin:18px 0; }
        .lp-divider::before,.lp-divider::after { content:'';flex:1;height:1px;background:#e2e8f0; }
      `}</style>

      {/* ── Fixed dark background ── */}
      <div className="lp-bg">
        <div className="lp-grid" />
        <ParticleCanvas />
        <div className="lp-scan" />
        <div className="lp-orb lp-orb1" />
        <div className="lp-orb lp-orb2" />
        <div className="lp-orb lp-orb3" />
        {[
          { e: "💻", s: { top: "10%", left: "3%", animationDelay: "0s" } },
          { e: "🖥️", s: { top: "6%", right: "4%", animationDelay: "1.2s" } },
          { e: "⚡", s: { top: "38%", left: "2%", animationDelay: "2s" } },
          { e: "🔧", s: { top: "62%", left: "5%", animationDelay: ".7s" } },
          { e: "💾", s: { bottom: "15%", left: "8%", animationDelay: "1.8s" } },
          { e: "🎮", s: { top: "48%", right: "3%", animationDelay: "2.4s" } },
          { e: "📱", s: { bottom: "10%", right: "6%", animationDelay: ".4s" } },
          { e: "🔌", s: { top: "24%", right: "22%", animationDelay: "3s" } },
          {
            e: "🖱️",
            s: { bottom: "28%", right: "18%", animationDelay: "1.5s" },
          },
          { e: "🔋", s: { top: "15%", left: "22%", animationDelay: "2.8s" } },
        ].map(({ e, s }, i) => (
          <div key={i} className="lp-float" style={s as React.CSSProperties}>
            {e}
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="lp-root lp-content">
        {/* LEFT — branding panel */}
        <div className="lp-left">
          {/* CPU graphic */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              paddingTop: 16,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 170,
                height: 170,
                marginBottom: 20,
              }}
            >
              <div
                className="ring-outer"
                style={{
                  position: "absolute",
                  inset: 0,
                  border: "2px dashed rgba(96,165,250,.35)",
                  borderRadius: "50%",
                }}
              />
              <div
                className="ring-inner"
                style={{
                  position: "absolute",
                  inset: 18,
                  border: "1px solid rgba(96,165,250,.22)",
                  borderRadius: "50%",
                }}
              />
              <div
                className="glow-p"
                style={{
                  position: "absolute",
                  inset: 35,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle,rgba(59,130,246,.25) 0%,transparent 70%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Cpu size={52} color="#60a5fa" strokeWidth={1.5} />
              </div>
              {[0, 72, 144, 216, 288].map((deg, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 9,
                    height: 9,
                    background: i % 2 === 0 ? "#3b82f6" : "#06b6d4",
                    borderRadius: "50%",
                    top: "50%",
                    left: "50%",
                    boxShadow: `0 0 10px ${i % 2 === 0 ? "#3b82f6" : "#06b6d4"}`,
                    transform: `rotate(${deg}deg) translateX(76px) translateY(-4.5px)`,
                    animation: "rotateSlow 10s linear infinite",
                    transformOrigin: "-71px 4.5px",
                  }}
                />
              ))}
            </div>

            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.25,
                marginBottom: 8,
              }}
            >
              Welcome Back
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#60a5fa,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Tech Explorer
              </span>
            </h2>
            <p
              style={{
                color: "rgba(148,163,184,.85)",
                fontSize: 13.5,
                maxWidth: 230,
                lineHeight: 1.65,
              }}
            >
              Sign in to access your orders, wishlist and exclusive member deals
            </p>
          </div>

          {/* Recent activity */}
          <div>
            <div
              style={{
                color: "rgba(148,163,184,.6)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".8px",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              What awaits you
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                {
                  icon: "📦",
                  label: "Track your orders",
                  sub: "Real-time delivery updates",
                },
                {
                  icon: "❤️",
                  label: "Your wishlist",
                  sub: "Saved items ready to buy",
                },
                {
                  icon: "🏷️",
                  label: "Member deals",
                  sub: "Exclusive discounts for you",
                },
                {
                  icon: "🔧",
                  label: "PC Builder",
                  sub: "Your saved configurations",
                },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="lp-activity">
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        color: "rgba(148,163,184,.7)",
                        fontSize: 11,
                        marginTop: 1,
                      }}
                    >
                      {sub}
                    </div>
                  </div>
                  <ArrowRight size={13} color="rgba(148,163,184,.4)" />
                </div>
              ))}
            </div>
          </div>

          {/* Feature badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              {
                icon: Zap,
                label: "Lightning Fast Delivery",
                sub: "Same day shipping available",
              },
              {
                icon: Shield,
                label: "Secure Checkout",
                sub: "256-bit SSL encryption",
              },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="lp-badge">
                <div
                  style={{
                    background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                    borderRadius: 8,
                    padding: 6,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color="#fff" />
                </div>
                <div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    {label}
                  </div>
                  <div
                    style={{
                      color: "rgba(148,163,184,.72)",
                      fontSize: 11,
                      marginTop: 1,
                    }}
                  >
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stars */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              justifyContent: "center",
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="#fbbf24" color="#fbbf24" />
            ))}
            <span
              style={{
                color: "rgba(148,163,184,.65)",
                fontSize: 11,
                marginLeft: 4,
              }}
            >
              Trusted by 50,000+ customers
            </span>
          </div>
        </div>

        {/* RIGHT — form card */}
        <div className="lp-right">
          <div className="lp-card">
            {/* Logo */}
            <div
              className="lp-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <div
                className="glow-p"
                style={{
                  background: "linear-gradient(135deg,#1d4ed8,#06b6d4)",
                  borderRadius: 10,
                  padding: 8,
                }}
              >
                <Cpu size={22} color="#fff" />
              </div>
              <span
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: "#0f172a",
                }}
              >
                TechStore
              </span>
            </div>

            {/* Heading */}
            <div className="lp-row" style={{ marginBottom: 28 }}>
              <h1
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 25,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 4,
                  letterSpacing: "-.4px",
                }}
              >
                Welcome Back 👋
              </h1>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="lp-row" style={{ marginBottom: 14 }}>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 5,
                  }}
                >
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={15}
                    color={focused === "email" ? "#3b82f6" : "#94a3b8"}
                    style={{
                      position: "absolute",
                      left: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      transition: "color .25s",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    required
                    className="lp-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lp-row" style={{ marginBottom: 8 }}>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 5,
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={15}
                    color={focused === "password" ? "#3b82f6" : "#94a3b8"}
                    style={{
                      position: "absolute",
                      left: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      transition: "color .25s",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    required
                    className="lp-input"
                    style={{ paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me + forgot */}
              <div
                className="lp-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      accentColor: "#3b82f6",
                      width: 15,
                      height: 15,
                      cursor: "pointer",
                    }}
                  />
                  <span
                    style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}
                  >
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  style={{
                    fontSize: 13,
                    color: "#3b82f6",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "opacity .2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = ".7")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <div className="lp-row">
                <button type="submit" disabled={loading} className="lp-btn">
                  {loading ? (
                    <>
                      <span className="lp-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <ChevronRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div
              className="lp-row lp-divider"
              style={{ color: "#94a3b8", fontSize: 12 }}
            >
              or continue with
            </div>

            {/* Social buttons */}
            <div
              className="lp-row"
              style={{ display: "flex", gap: 10, marginBottom: 4 }}
            >
              <button className="lp-social">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button className="lp-social">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

            {/* Sign up link */}
            <div
              className="lp-row"
              style={{
                textAlign: "center",
                marginTop: 20,
                paddingTop: 18,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span style={{ color: "#64748b", fontSize: 14 }}>
                Don't have an account?{" "}
              </span>
              <Link
                to="/signup"
                style={{
                  color: "#3b82f6",
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Sign up →
              </Link>
            </div>

            <div
              className="lp-row"
              style={{ textAlign: "center", marginTop: 10 }}
            >
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                🔒 Secured with 256-bit SSL encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
