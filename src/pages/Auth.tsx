import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "../store/authStore";

// ── Types ────────────────────────────────────────────────────────────────────
interface LoginForm { email: string; password: string }
interface RegisterForm { name: string; email: string; password: string; confirm: string }
type View = "login" | "register"

// ── Validation ───────────────────────────────────────────────────────────────
function validateLogin(f: LoginForm) {
    const e: Partial<LoginForm> = {}
    if (!f.email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email"
    if (!f.password) e.password = "Password is required"
    else if (f.password.length < 6) e.password = "Min. 6 characters"
    return e
}
function validateRegister(f: RegisterForm) {
    const e: Partial<RegisterForm> = {}
    if (!f.name.trim()) e.name = "Full name is required"
    if (!f.email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email"
    if (!f.password) e.password = "Password is required"
    else if (f.password.length < 6) e.password = "Min. 6 characters"
    if (!f.confirm) e.confirm = "Please confirm your password"
    else if (f.confirm !== f.password) e.confirm = "Passwords do not match"
    return e
}

// ── Background crystal shards ────────────────────────────────────────────────
function Shards() {
    const shards = [
        { w: 320, h: 320, top: "-8%", left: "-6%", rot: "15deg", op: 0.06 },
        { w: 200, h: 200, top: "65%", left: "78%", rot: "-22deg", op: 0.05 },
        { w: 260, h: 260, top: "40%", left: "82%", rot: "8deg", op: 0.04 },
        { w: 180, h: 180, top: "80%", left: "10%", rot: "30deg", op: 0.05 },
        { w: 140, h: 140, top: "18%", left: "60%", rot: "-10deg", op: 0.04 },
    ]
    return (

        <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            {shards.map((s, i) => (
                <div key={i} style={{
                    position: "absolute",
                    width: s.w, height: s.h,
                    top: s.top, left: s.left,
                    transform: `rotate(${s.rot})`,
                    background: `linear-gradient(135deg, rgba(255,255,255,${s.op * 0.6}) 0%, rgba(180,185,200,${s.op * 0.25}) 100%)`,
                    border: `1px solid rgba(255,255,255,${s.op * 0.9})`,
                    borderRadius: 24,
                    backdropFilter: "blur(2px)",
                    animation: `shardDrift ${14 + i * 3}s ease-in-out ${-i * 2}s infinite alternate`,
                }} />
            ))}
            {/* gold accent glow top-right */}
            <div style={{
                position: "absolute", width: 500, height: 500,
                top: "-12%", right: "-8%",
                background: "radial-gradient(circle, rgba(196,158,48,0.14) 0%, transparent 65%)",
                animation: "shardDrift 20s ease-in-out infinite alternate",
            }} />
            {/* subtle bottom-left glow */}
            <div style={{
                position: "absolute", width: 400, height: 400,
                bottom: "-10%", left: "-6%",
                background: "radial-gradient(circle, rgba(196,158,48,0.09) 0%, transparent 65%)",
                animation: "shardDrift 25s ease-in-out -8s infinite alternate",
            }} />
        </div>
    )
}

// ── Eye icon ─────────────────────────────────────────────────────────────────
function Eye({ open, toggle }: { open: boolean; toggle: () => void }) {
    return (
        <button onClick={toggle} type="button" style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            color: open ? "#C49E30" : "rgba(255,255,255,0.28)",
            transition: "color 0.2s",
            lineHeight: 0,
        }}>
            {open
                ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
            }
        </button>
    )
}

// ── Input field with floating label ──────────────────────────────────────────
function Field({
    label, type = "text", value, onChange, error, delay = 0, rightSlot,
}: {
    label: string; type?: string; value: string
    onChange: (v: string) => void; error?: string
    delay?: number; rightSlot?: React.ReactNode
}) {
    const [focused, setFocused] = useState(false)
    const [visible, setVisible] = useState(false)
    useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])

    const lifted = focused || value.length > 0

    return (
        <div style={{
            marginBottom: 18,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.5s cubic-bezier(.22,1,.36,1), transform 0.5s cubic-bezier(.22,1,.36,1)",
        }}>
            <div style={{ position: "relative" }}>
                {/* floating label */}
                <label style={{
                    position: "absolute", left: 15,
                    top: lifted ? 8 : "50%",
                    transform: lifted ? "translateY(0) scale(0.76)" : "translateY(-50%) scale(1)",
                    transformOrigin: "left",
                    fontSize: 13.5, fontWeight: 500,
                    color: focused ? "#C49E30" : "rgba(255,255,255,0.38)",
                    transition: "all 0.22s cubic-bezier(.22,1,.36,1)",
                    pointerEvents: "none", zIndex: 2,
                    letterSpacing: "0.03em",
                    fontFamily: "'DM Sans', sans-serif",
                }}>{label}</label>

                <input
                    type={type} value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: "100%",
                        paddingTop: lifted ? 21 : 14,
                        paddingBottom: lifted ? 7 : 14,
                        paddingLeft: 15,
                        paddingRight: rightSlot ? 46 : 15,
                        background: focused ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${error ? "#D04040" :
                            focused ? "#C49E30" :
                                "rgba(255,255,255,0.12)"
                            }`,
                        borderRadius: 11,
                        color: "#F0F0F2",
                        fontSize: 14.5,
                        fontFamily: "'DM Sans', sans-serif",
                        outline: "none",
                        transition: "all 0.22s ease",
                        boxSizing: "border-box",
                        caretColor: "#C49E30",
                        boxShadow: focused
                            ? "0 0 0 3px rgba(196,158,48,0.18), 0 2px 12px rgba(0,0,0,0.3)"
                            : "0 1px 4px rgba(0,0,0,0.25)",
                    }}
                />
                {rightSlot && (
                    <div style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", zIndex: 3 }}>
                        {rightSlot}
                    </div>
                )}
            </div>
            {error && (
                <div style={{
                    marginTop: 5, fontSize: 11.5, color: "#D04040",
                    fontFamily: "'DM Sans', sans-serif",
                    paddingLeft: 4, letterSpacing: "0.02em",
                    animation: "errShake 0.28s ease",
                }}>{error}</div>
            )}
        </div>
    )
}

// ── Submit button ─────────────────────────────────────────────────────────────
function SubmitBtn({ label, loading, onClick, delay }: {
    label: string; loading: boolean; onClick: () => void; delay: number
}) {
    const [hovered, setHovered] = useState(false)
    const [visible, setVisible] = useState(false)
    useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={loading}
            style={{
                width: "100%", padding: "14.5px 0",
                background: hovered && !loading
                    ? "linear-gradient(135deg, #D4A820 0%, #B8880E 50%, #D4A820 100%)"
                    : "linear-gradient(135deg, #C49E30 0%, #A07820 100%)",
                backgroundSize: "200% 100%",
                border: "none", borderRadius: 11,
                color: "#fff",
                fontSize: 13, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.12em", textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: visible ? 1 : 0,
                transform: visible
                    ? (hovered && !loading ? "translateY(-2px)" : "translateY(0)")
                    : "translateY(12px)",
                transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
                boxShadow: hovered && !loading
                    ? "0 8px 28px rgba(196,158,48,0.42), 0 2px 8px rgba(0,0,0,0.1)"
                    : "0 3px 14px rgba(196,158,48,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
        >
            {loading ? (
                <>
                    <div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Processing…
                </>
            ) : label}
        </button>
    )
}

// ── Strength bar ─────────────────────────────────────────────────────────────
function StrengthBar({ pw }: { pw: string }) {
    if (!pw) return null
    const weak = pw.length < 6
    const strong = pw.length >= 10 && /[A-Z]/.test(pw) && /\d/.test(pw)
    const color = weak ? "#D04040" : strong ? "#3A8A5A" : "#C49E30"
    const width = weak ? "28%" : strong ? "100%" : "62%"
    const label = weak ? "WEAK" : strong ? "STRONG" : "MODERATE"
    return (
        <div style={{ marginTop: -10, marginBottom: 16, paddingLeft: 2 }}>
            <div style={{ height: 3, background: "rgba(255,255,255,0.10)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width, background: color, borderRadius: 4, transition: "width 0.45s ease, background 0.45s ease" }} />
            </div>
            <div style={{ fontSize: 10, marginTop: 4, color, letterSpacing: "0.1em", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>{label}</div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AuthPage() {
    const [view, setView] = useState<View>("login")
    const { login, register } = useAuthStore()
    const navigate = useNavigate()
    const [sliding, setSliding] = useState(false)
    const [slideDir, setSlideDir] = useState<"left" | "right">("left")

    // login
    const [lf, setLf] = useState<LoginForm>({ email: "", password: "" })
    const [le, setLe] = useState<Partial<LoginForm>>({})
    const [lPw, setLPw] = useState(false)
    const [lLoad, setLLoad] = useState(false)
    const [lDone, setLDone] = useState(false)

    // register
    const [rf, setRf] = useState<RegisterForm>({ name: "", email: "", password: "", confirm: "" })
    const [re, setRe] = useState<Partial<RegisterForm>>({})
    const [rPw, setRPw] = useState(false)
    const [rCf, setRCf] = useState(false)
    const [rLoad, setRLoad] = useState(false)
    const [rDone, setRDone] = useState(false)

    const switchView = (to: View) => {
        if (sliding || to === view) return
        setSlideDir(to === "register" ? "left" : "right")
        setSliding(true)
        setTimeout(() => { setView(to); setSliding(false) }, 440)
    }

    const handleLogin = async () => {
        const err = validateLogin(lf); setLe(err)
        if (Object.keys(err).length) return
        setLLoad(true)
        try {
            await login({ email: lf.email, password: lf.password })
            setLLoad(false)
            setLDone(true)
            setTimeout(() => navigate("/"), 1200)
        } catch (e) {
            const error = e as Error;
            setLLoad(false)
            // Show API error on the relevant field (or globally if preferred)
            setLe({ email: error.message || "Login failed" })
        }
    }
    const handleRegister = async () => {
        const err = validateRegister(rf); setRe(err)
        if (Object.keys(err).length) return
        setRLoad(true)
        try {
            await register({
                full_name: rf.name,
                email: rf.email,
                password: rf.password,
                confirm_password: rf.confirm
            })
            setRLoad(false)
            setRDone(true)
            setTimeout(() => navigate("/"), 1200)
        } catch (e) {
            const error = e as Error;
            setRLoad(false)
            setRe({ email: error.message || "Registration failed" })
        }
    }

    // sliding panel style
    const panel = (isActive: boolean): React.CSSProperties => ({
        position: "absolute", inset: 0,
        padding: "60px 44px 48px",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
        opacity: sliding ? (isActive ? 0 : 1) : (isActive ? 1 : 0),
        transform: sliding
            ? `translateX(${isActive ? (slideDir === "left" ? "60px" : "-60px") : "0"})`
            : `translateX(${isActive ? "0" : (slideDir === "left" ? "60px" : "-60px")})`,
        transition: "opacity 0.44s cubic-bezier(.77,0,.18,1), transform 0.44s cubic-bezier(.77,0,.18,1)",
        pointerEvents: isActive ? "auto" : "none",
    })

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes shardDrift {
          0%   { transform: rotate(var(--r,15deg)) translateY(0px) scale(1); }
          100% { transform: rotate(var(--r,15deg)) translateY(-18px) scale(1.04); }
        }
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes errShake   { 0%,100%{transform:translateX(0)} 30%{transform:translateX(-4px)} 70%{transform:translateX(4px)} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardIn     { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes lineDraw   { from{width:0} to{width:100%} }
        @keyframes successPop { 0%{transform:scale(.5) rotate(-20deg);opacity:0} 70%{transform:scale(1.12) rotate(4deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes tickDraw   { to { stroke-dashoffset: 0; } }

        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 100px #2A2C32 inset !important;
          -webkit-text-fill-color: #F0F0F2 !important;
          caret-color: #C49E30;
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(196,158,48,0.25); border-radius: 3px; }
      `}</style>

            {/* ── Page wrapper ── */}
            {/* ── Page wrapper ── */}
            <div style={{
                minHeight: "100vh",
                width: "100%",
                background: "linear-gradient(160deg, #28292F 0%, #222428 40%, #1C1E22 70%, #26272D 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                position: "relative",
                fontFamily: "'DM Sans', sans-serif",
            }}>

                {/* ELECTRON LOGO TOP LEFT */}
                <Link
                    to="/"
                    style={{
                        position: "absolute",
                        top: 28,
                        left: 34,
                        zIndex: 50,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <img src="/Navbar.png" alt="ELECTRON" style={{ height: 26, width: "auto" }} />
                </Link>
                <Shards />

                {/* noise texture overlay */}
                <div style={{
                    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.035,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat", backgroundSize: "128px 128px",
                }} />

                {/* ── Card ── */}
                <div style={{
                    position: "relative", zIndex: 10,
                    width: "100%", maxWidth: 448,
                    animation: "cardIn 0.65s cubic-bezier(.22,1,.36,1) both",
                }}>

                    {/* top gold rule */}
                    <div style={{
                        height: 2.5,
                        background: "linear-gradient(90deg, transparent 0%, #C49E30 30%, #E8C84A 55%, #C49E30 75%, transparent 100%)",
                        borderRadius: "2px 2px 0 0",
                        animation: "lineDraw 0.9s 0.2s cubic-bezier(.22,1,.36,1) both",
                    }} />

                    {/* card body */}
                    <div style={{
                        background: "rgba(38,40,46,0.94)",
                        backdropFilter: "blur(32px) saturate(180%)",
                        WebkitBackdropFilter: "blur(32px) saturate(180%)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderTop: "none",
                        borderRadius: "0 0 18px 18px",
                        boxShadow: [
                            "0 2px 0 rgba(196,158,48,0.08)",
                            "0 24px 64px rgba(0,0,0,0.55)",
                            "0 6px 20px rgba(0,0,0,0.3)",
                            "inset 0 1px 0 rgba(255,255,255,0.05)",
                        ].join(", "),
                        overflow: "hidden",
                        position: "relative",
                    }}>

                        {/* inner top shimmer */}
                        <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: 1,
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                            zIndex: 10,
                        }} />

                        {/* ── Tab bar ── */}
                        <div style={{
                            display: "flex",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(20,22,26,0.5)",
                        }}>
                            {(["login", "register"] as View[]).map(v => (
                                <button key={v} onClick={() => switchView(v)} style={{
                                    flex: 1, padding: "17px 0",
                                    background: "none", border: "none",
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: 14, fontWeight: view === v ? 600 : 400,
                                    letterSpacing: "0.14em", textTransform: "uppercase",
                                    color: view === v ? "#F0F0F2" : "rgba(255,255,255,0.35)",
                                    cursor: "pointer",
                                    transition: "color 0.3s ease",
                                    position: "relative",
                                }}>
                                    {v === "login" ? "Sign In" : "Register"}
                                    {view === v && (
                                        <div style={{
                                            position: "absolute", bottom: 0, left: "18%", right: "18%", height: 2,
                                            background: "linear-gradient(90deg, transparent, #C49E30, transparent)",
                                            borderRadius: 2,
                                        }} />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* ── Sliding panels ── */}
                        <div style={{ position: "relative", overflow: "hidden", minHeight: 540 }}>

                            {/* ── LOGIN PANEL ── */}
                            <div style={panel(view === "login")}>
                                {lDone ? (
                                    <SuccessState
                                        title="Welcome back"
                                        sub="You've signed in successfully."
                                    />
                                ) : (
                                    <>
                                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                                            <img src="/Logo.png" alt="ELECTRON" style={{ height: 65, width: "auto" }} />
                                        </div>
                                        <Heading
                                            title="Sign in"
                                            sub="Enter your credentials to access your account"
                                        />

                                        <Field label="Email address" type="email" value={lf.email}
                                            onChange={v => setLf(f => ({ ...f, email: v }))}
                                            error={le.email} delay={120} />

                                        <Field label="Password" type={lPw ? "text" : "password"} value={lf.password}
                                            onChange={v => setLf(f => ({ ...f, password: v }))}
                                            error={le.password} delay={210}
                                            rightSlot={<Eye open={lPw} toggle={() => setLPw(s => !s)} />} />

                                        <div style={{
                                            textAlign: "right", marginTop: -10, marginBottom: 26,
                                            opacity: 0, animation: "fadeUp 0.45s 0.32s cubic-bezier(.22,1,.36,1) forwards",
                                        }}>
                                            <button style={{
                                                background: "none", border: "none", color: "#A07820",
                                                fontSize: 12, cursor: "pointer", letterSpacing: "0.04em",
                                                fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
                                                transition: "color 0.2s",
                                            }}
                                                onMouseEnter={e => (e.currentTarget.style.color = "#C49E30")}
                                                onMouseLeave={e => (e.currentTarget.style.color = "#A07820")}>
                                                Forgot password?
                                            </button>
                                        </div>

                                        <SubmitBtn label="Sign In" loading={lLoad} onClick={handleLogin} delay={310} />

                                        <SwitchLink
                                            text="Don't have an account?"
                                            cta="Register"
                                            onClick={() => switchView("register")}
                                            delay={400}
                                        />
                                    </>
                                )}
                            </div>

                            {/* ── REGISTER PANEL ── */}
                            <div style={panel(view === "register")}>
                                {rDone ? (
                                    <SuccessState
                                        title="Account created"
                                        sub="Welcome aboard. Your journey starts here."
                                    />
                                ) : (
                                    <>
                                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                                            <img src="/Logo.png" alt="ELECTRON" style={{ height: 65, width: "auto" }} />
                                        </div>
                                        <Heading
                                            title="Create account"
                                            sub="Fill in the details below to get started"
                                        />

                                        <Field label="Full name" value={rf.name}
                                            onChange={v => setRf(f => ({ ...f, name: v }))}
                                            error={re.name} delay={110} />

                                        <Field label="Email address" type="email" value={rf.email}
                                            onChange={v => setRf(f => ({ ...f, email: v }))}
                                            error={re.email} delay={190} />

                                        <Field label="Password" type={rPw ? "text" : "password"} value={rf.password}
                                            onChange={v => setRf(f => ({ ...f, password: v }))}
                                            error={re.password} delay={270}
                                            rightSlot={<Eye open={rPw} toggle={() => setRPw(s => !s)} />} />

                                        <StrengthBar pw={rf.password} />

                                        <Field label="Confirm password" type={rCf ? "text" : "password"} value={rf.confirm}
                                            onChange={v => setRf(f => ({ ...f, confirm: v }))}
                                            error={re.confirm} delay={350}
                                            rightSlot={<Eye open={rCf} toggle={() => setRCf(s => !s)} />} />

                                        <SubmitBtn label="Create Account" loading={rLoad} onClick={handleRegister} delay={430} />

                                        <SwitchLink
                                            text="Already have an account?"
                                            cta="Sign in"
                                            onClick={() => switchView("login")}
                                            delay={510}
                                        />
                                    </>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* bottom wordmark */}
                    <div style={{
                        display: "flex", justifyContent: "center", alignItems: "center", marginTop: 18, opacity: 0.3
                    }}>
                        <img src="/Navbar.png" alt="ELECTRON" style={{ height: 14, width: "auto" }} />
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Heading({ title, sub }: { title: string; sub: string }) {
    return (
        <div style={{ marginBottom: 28, textAlign: "center" }}>
            <div style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 30, fontWeight: 400, color: "#F0F0F2",
                letterSpacing: "0.01em", marginBottom: 5,
                opacity: 0, animation: "fadeUp 0.45s 0.05s cubic-bezier(.22,1,.36,1) forwards",
            }}>{title}</div>
            <div style={{
                fontSize: 12.5, color: "rgba(255,255,255,0.38)", letterSpacing: "0.03em",
                fontWeight: 400,
                opacity: 0, animation: "fadeUp 0.45s 0.12s cubic-bezier(.22,1,.36,1) forwards",
            }}>{sub}</div>

            {/* decorative rule */}
            <div style={{
                marginTop: 18, height: 1,
                background: "linear-gradient(90deg, transparent 0%, #C49E30 30%, rgba(196,158,48,0.15) 50%, #C49E30 70%, transparent 100%)",
                animation: "lineDraw 0.8s 0.25s cubic-bezier(.22,1,.36,1) both",
            }} />
        </div>
    )
}

function SwitchLink({ text, cta, onClick, delay }: {
    text: string; cta: string; onClick: () => void; delay: number
}) {
    const [visible, setVisible] = useState(false)
    useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
    return (
        <div style={{
            textAlign: "center", marginTop: 22,
            fontSize: 13, color: "rgba(255,255,255,0.35)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>
            {text}{" "}
            <button onClick={onClick} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#A07820", fontWeight: 600, fontSize: 13,
                fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.02em",
                transition: "color 0.2s",
                textDecoration: "underline", textDecorationColor: "rgba(160,120,32,0.3)",
            }}
                onMouseEnter={e => (e.currentTarget.style.color = "#C49E30")}
                onMouseLeave={e => (e.currentTarget.style.color = "#A07820")}>
                {cta} →
            </button>
        </div>
    )
}

function SuccessState({ title, sub }: { title: string; sub: string }) {
    return (
        <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 14, textAlign: "center", padding: "40px 0",
        }}>
            {/* animated tick circle */}
            <div style={{
                width: 72, height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#C49E30,#E8C84A)",
                display: "grid", placeItems: "center",
                boxShadow: "0 8px 28px rgba(196,158,48,0.35)",
                animation: "successPop 0.5s cubic-bezier(.34,1.56,.64,1) both",
            }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"
                        style={{
                            strokeDasharray: 28,
                            strokeDashoffset: 28,
                            animation: "tickDraw 0.4s 0.35s ease forwards",
                        }}
                    />
                </svg>
            </div>
            <div style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 26, fontWeight: 500, color: "#F0F0F2",
                letterSpacing: "0.02em",
                opacity: 0, animation: "fadeUp 0.4s 0.45s ease forwards",
            }}>{title}</div>
            <div style={{
                fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65,
                opacity: 0, animation: "fadeUp 0.4s 0.55s ease forwards",
            }}>{sub}</div>
            <div style={{
                marginTop: 6, fontSize: 11, color: "#C49E30",
                letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
                opacity: 0, animation: "fadeUp 0.4s 0.65s ease forwards",
            }}>Redirecting…</div>
        </div>
    )
}