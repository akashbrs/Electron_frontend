import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCartStore } from "../store/cartStore"

type PayTab = "card" | "upi" | "cod"
type UpiApp = "GPay" | "PhonePe" | "Paytm" | "BHIM" | null

interface AddressForm {
  fname: string; lname: string; addr: string
  city: string; pin: string; state: string; phone: string
}
interface CardForm {
  number: string; holder: string; expiry: string; cvv: string
}

const STATES = ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Telangana", "Gujarat", "Rajasthan", "West Bengal"]
const UPI_APPS: { id: UpiApp; label: string; icon: string }[] = [
  { id: "GPay", label: "Google Pay", icon: "G" },
  { id: "PhonePe", label: "PhonePe", icon: "₱" },
  { id: "Paytm", label: "Paytm", icon: "P" },
  { id: "BHIM", label: "BHIM", icon: "🔵" },
]

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN")

function inp(err = false): React.CSSProperties {
  return { width: "100%", padding: "11px 14px", border: `1.5px solid ${err ? "#C0392B" : "#E2E2DC"}`, borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, background: "#FAFAF8", color: "#1A1A1A", outline: "none" }
}

function Label({ text }: { text: string }) {
  return <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A7A72", marginBottom: 6 }}>{text}</label>
}

function CardPreview({ number, holder, expiry }: { number: string; holder: string; expiry: string }) {
  const raw = number.replace(/\s/g, "")
  const brand = raw[0] === "4" ? "VISA" : raw[0] === "5" ? "MASTERCARD" : (raw.startsWith("34") || raw.startsWith("37")) ? "AMEX" : "VISA"
  const display = raw.padEnd(16, "•").match(/.{1,4}/g)!.join(" ")
  return (
    <div style={{ background: "linear-gradient(135deg,#1a1a1a,#2c2c2c)", borderRadius: 14, padding: "22px 24px", color: "#fff", marginBottom: 22, position: "relative", overflow: "hidden", minHeight: 140 }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,160,23,.25) 0%,transparent 70%)" }} />
      <div style={{ width: 36, height: 28, background: "linear-gradient(135deg,#D4A017,#F2C84B)", borderRadius: 5, marginBottom: 20 }} />
      <div style={{ fontFamily: "monospace", fontSize: 17, letterSpacing: "0.22em", marginBottom: 16, color: "rgba(255,255,255,.9)" }}>{display}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 3 }}>Card Holder</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{holder.toUpperCase() || "YOUR NAME"}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 3 }}>Expires</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{expiry || "MM/YY"}</div>
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, opacity: .9 }}>{brand}</div>
      </div>
    </div>
  )
}

function Confetti() {
  const colors = ["#D4A017", "#F2C84B", "#2E8B5A", "#1A1A1A", "#C0392B", "#3B82F6", "#fff"]
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", top: "-10px", left: `${Math.random() * 100}%`, width: 6 + Math.random() * 6, height: 6 + Math.random() * 6, borderRadius: Math.random() > 0.5 ? "50%" : 2, background: colors[Math.floor(Math.random() * colors.length)], animation: `epFall ${1 + Math.random() * 1.2}s ease-in ${Math.random() * 0.8}s forwards` }} />
      ))}
    </div>
  )
}

export default function ElectronPayment() {
  const navigate = useNavigate()

  // ─── READ EVERYTHING FROM CART CONTEXT ───────────────────────────────────
  const { cart, clearCartData: clearCart } = useCartStore()
  const items = cart?.items || []

  const subtotal = items.reduce((s, i) => s + (i.discountedPrice || 0) * i.quantity, 0)
  const originalTotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0)
  const totalSaved = originalTotal - subtotal
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)
  const delivery = subtotal > 50000 ? 0 : items.length > 0 ? 499 : 0
  // ─────────────────────────────────────────────────────────────────────────

  const [tab, setTab] = useState<PayTab>("card")
  const [upiApp, setUpiApp] = useState<UpiApp>(null)
  const [upiId, setUpiId] = useState("")
  const [coupon, setCoupon] = useState("")
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [couponApplied, setCouponApplied] = useState(false)
  const [errors, setErrors] = useState<Partial<AddressForm>>({})
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [, setPaidItems] = useState(items)
  const [paidTotal, setPaidTotal] = useState(0)

  const [addr, setAddr] = useState<AddressForm>({ fname: "", lname: "", addr: "", city: "", pin: "", state: "", phone: "" })
  const [card, setCard] = useState<CardForm>({ number: "", holder: "", expiry: "", cvv: "" })

  const couponDiscount = couponApplied ? Math.round(subtotal * 0.10) : 0
  const grandTotal = subtotal - couponDiscount + delivery

  const fmtCard = (v: string) => {
    const raw = v.replace(/\D/g, "").slice(0, 16)
    setCard(c => ({ ...c, number: raw.match(/.{1,4}/g)?.join(" ") ?? raw }))
  }
  const fmtExp = (v: string) => {
    let raw = v.replace(/\D/g, "")
    if (raw.length >= 2) raw = raw.slice(0, 2) + "/" + raw.slice(2, 4)
    setCard(c => ({ ...c, expiry: raw }))
  }

  const validate = () => {
    const e: Partial<AddressForm> = {}
    if (!addr.fname) e.fname = "Required"
    if (!addr.addr) e.addr = "Required"
    if (!addr.city) e.city = "Required"
    if (!addr.pin || addr.pin.length < 6) e.pin = "Enter valid pincode"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "ELECTRON10") {
      if (couponApplied) { setCouponMsg({ text: "✓ Already applied!", ok: true }); return }
      setCouponApplied(true)
      setCouponMsg({ text: "✓ ELECTRON10 applied — extra 10% off!", ok: true })
    } else if (!coupon.trim()) {
      setCouponMsg({ text: "Enter a coupon code.", ok: false })
    } else {
      setCouponMsg({ text: "✗ Invalid code. Try ELECTRON10.", ok: false })
    }
  }

  const pay = () => {
    if (!validate()) return
    // snapshot cart BEFORE clearing
    setPaidItems([...items])
    setPaidTotal(grandTotal)
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setOrderId("ELC-" + Date.now().toString(36).toUpperCase())
      clearCart()
      setSuccess(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }, 2400)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SUCCESS PAGE
  // ══════════════════════════════════════════════════════════════════════════
  if (success) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes epFall{from{transform:translateY(0) rotate(0);opacity:1}to{transform:translateY(110vh) rotate(720deg);opacity:0}}
          @keyframes epPop{from{transform:scale(.78) translateY(24px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
          @keyframes epRing{0%{transform:scale(0) rotate(-180deg)}70%{transform:scale(1.15) rotate(10deg)}100%{transform:scale(1) rotate(0)}}
          @keyframes epSlide{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        `}</style>

        {showConfetti && <Confetti />}

        <div style={{ fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(160deg,#F4F4F0,#EEF1F6)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "52px 48px", maxWidth: 520, width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,.10)", animation: "epPop .5s cubic-bezier(.34,1.56,.64,1) both" }}>

            {/* tick */}
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,#2E8B5A,#45C47A)", display: "grid", placeItems: "center", margin: "0 auto 26px", animation: "epRing .6s .15s cubic-bezier(.34,1.56,.64,1) both", boxShadow: "0 10px 32px rgba(46,139,90,.32)" }}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>

            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 10, animation: "epSlide .4s .35s both" }}>Payment Successful! 🎉</div>
            <div style={{ fontSize: 14, color: "#7A7A72", marginBottom: 32, lineHeight: 1.75, animation: "epSlide .4s .42s both" }}>
              Your order has been confirmed.<br />Get ready for your new tech!
            </div>

            {/* order id */}
            <div style={{ background: "#F4F4F0", borderRadius: 12, padding: "14px 20px", marginBottom: 24, animation: "epSlide .4s .48s both" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9A92", marginBottom: 6 }}>Order ID</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, letterSpacing: "0.1em", color: "#D4A017" }}>{orderId}</div>
            </div>

            {/* total */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: "2px solid #E2E2DC", marginBottom: 6, animation: "epSlide .4s .54s both" }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>Total Paid</span>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22 }}>{fmt(paidTotal)}</span>
            </div>
            <div style={{ fontSize: 12, color: "#2E8B5A", fontWeight: 600, marginBottom: 36, animation: "epSlide .4s .58s both" }}>🚚 Free delivery by Tomorrow</div>

            {/* buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "epSlide .4s .62s both" }}>
              <button onClick={() => navigate("/shop")}
                style={{ width: "100%", padding: 16, background: "#D4A017", border: "none", borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", cursor: "pointer", boxShadow: "0 6px 20px rgba(212,160,23,.38)" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = ".88")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                🛍️ Start Shopping
              </button>
              <button onClick={() => navigate("/")}
                style={{ width: "100%", padding: 14, background: "transparent", border: "1.5px solid #E2E2DC", borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 600, color: "#7A7A72", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1A1A1A"; e.currentTarget.style.color = "#1A1A1A" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E2DC"; e.currentTarget.style.color = "#7A7A72" }}>
                Go to Home
              </button>
            </div>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: "#9A9A92" }}>🔒 Your payment was processed securely</div>
        </div>
      </>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  CHECKOUT PAGE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes epSpin{to{transform:rotate(360deg)}}
        @keyframes epPop{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
        input:focus,select:focus{border-color:#D4A017!important;background:#fff!important;outline:none}
        @media(max-width:768px){.epLayout{grid-template-columns:1fr!important}.epGrid{grid-template-columns:1fr!important}}
      `}</style>

      <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#F4F4F0", minHeight: "100vh", color: "#1A1A1A" }}>

        {/* NAV */}
        <nav style={{ background: "#fff", borderBottom: "1px solid #E2E2DC", padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "0.12em" }}><span style={{ color: "#D4A017" }}>E</span>LECTRON</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
            {[["Cart", "done"], ["Checkout", "active"], ["Confirmation", ""]].map(([l, c], i, a) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: c === "done" ? "#2E8B5A" : c === "active" ? "#1A1A1A" : "#7A7A72", fontWeight: c === "active" ? 700 : 500 }}>{l}</span>
                {i < a.length - 1 && <span style={{ color: "#ccc" }}>›</span>}
              </span>
            ))}
          </div>
        </nav>

        <div className="epLayout" style={{ maxWidth: 1100, margin: "40px auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" }}>

          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ADDRESS */}
            <div style={{ background: "#fff", border: "1px solid #E2E2DC", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "20px 28px", borderBottom: "1px solid #E2E2DC", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#D4A017", color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, display: "grid", placeItems: "center" }}>1</div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Delivery Address</h2>
              </div>
              <div style={{ padding: 28 }}>
                <div className="epGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                  <div><Label text="First Name" /><input style={inp(!!errors.fname)} placeholder="Arjun" value={addr.fname} onChange={e => setAddr(a => ({ ...a, fname: e.target.value }))} />{errors.fname && <span style={{ fontSize: 11, color: "#C0392B" }}>{errors.fname}</span>}</div>
                  <div><Label text="Last Name" /><input style={inp()} placeholder="Mehta" value={addr.lname} onChange={e => setAddr(a => ({ ...a, lname: e.target.value }))} /></div>

                  <div style={{ gridColumn: "span 2" }}>
                    <Label text="Address Line" />
                    <input style={inp(!!errors.addr)} placeholder="Flat 4B, Prestige Tower, MG Road" value={addr.addr} onChange={e => setAddr(a => ({ ...a, addr: e.target.value }))} />
                    {errors.addr && <span style={{ fontSize: 11, color: "#C0392B" }}>{errors.addr}</span>}
                  </div>

                  <div><Label text="City" /><input style={inp(!!errors.city)} placeholder="Bengaluru" value={addr.city} onChange={e => setAddr(a => ({ ...a, city: e.target.value }))} />{errors.city && <span style={{ fontSize: 11, color: "#C0392B" }}>{errors.city}</span>}</div>
                  <div><Label text="Pincode" /><input style={inp(!!errors.pin)} placeholder="560001" maxLength={6} value={addr.pin} onChange={e => setAddr(a => ({ ...a, pin: e.target.value.replace(/\D/g, "") }))} />{errors.pin && <span style={{ fontSize: 11, color: "#C0392B" }}>{errors.pin}</span>}</div>

                  <div>
                    <Label text="State" />
                    <select style={{ ...inp(), appearance: "none" }} value={addr.state} onChange={e => setAddr(a => ({ ...a, state: e.target.value }))}>
                      <option value="">Select State</option>
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><Label text="Phone" /><input style={inp()} placeholder="+91 98765 43210" maxLength={13} value={addr.phone} onChange={e => setAddr(a => ({ ...a, phone: e.target.value }))} /></div>

                </div>
              </div>
            </div>

            {/* PAYMENT */}
            <div style={{ background: "#fff", border: "1px solid #E2E2DC", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "20px 28px", borderBottom: "1px solid #E2E2DC", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#D4A017", color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, display: "grid", placeItems: "center" }}>2</div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Payment Method</h2>
              </div>
              <div style={{ padding: 28 }}>

                {/* tabs */}
                <div style={{ display: "flex", border: "1.5px solid #E2E2DC", borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
                  {(["card", "upi", "cod"] as PayTab[]).map((t, i) => (
                    <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "12px 8px", background: tab === t ? "#1A1A1A" : "#FAFAF8", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: tab === t ? "#fff" : "#7A7A72", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all .2s", borderRight: i < 2 ? "1.5px solid #E2E2DC" : "none" }}>
                      {t === "card" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>}
                      {t === "upi" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>}
                      {t === "cod" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h4" /><circle cx="8" cy="12" r="1" fill="currentColor" /></svg>}
                      {t === "card" ? "Credit / Debit" : t === "upi" ? "UPI" : "Cash on Delivery"}
                    </button>
                  ))}
                </div>

                {/* card */}
                {tab === "card" && (
                  <div>
                    <CardPreview number={card.number} holder={card.holder} expiry={card.expiry} />
                    <div className="epGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div style={{ gridColumn: "span 2" }}><Label text="Card Number" /><input style={inp()} placeholder="1234 5678 9012 3456" maxLength={19} value={card.number} onChange={e => fmtCard(e.target.value)} /></div>
                      <div style={{ gridColumn: "span 2" }}><Label text="Card Holder Name" /><input style={inp()} placeholder="ARJUN MEHTA" value={card.holder} onChange={e => setCard(c => ({ ...c, holder: e.target.value }))} /></div>
                      <div><Label text="Expiry Date" /><input style={inp()} placeholder="MM/YY" maxLength={5} value={card.expiry} onChange={e => fmtExp(e.target.value)} /></div>
                      <div><Label text="CVV" /><input type="password" style={inp()} placeholder="•••" maxLength={3} value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "") }))} /></div>
                    </div>
                  </div>
                )}

                {/* upi */}
                {tab === "upi" && (
                  <div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                      {UPI_APPS.map(a => (
                        <div key={String(a.id)} onClick={() => setUpiApp(a.id)} style={{ flex: 1, padding: "14px 8px", border: `1.5px solid ${upiApp === a.id ? "#D4A017" : "#E2E2DC"}`, borderRadius: 10, textAlign: "center", cursor: "pointer", background: upiApp === a.id ? "#FFF8E8" : "#FAFAF8", fontSize: 11, fontWeight: 600, color: upiApp === a.id ? "#1A1A1A" : "#7A7A72", transition: "all .2s" }}>
                          <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>{a.label}
                        </div>
                      ))}
                    </div>
                    <Label text="UPI ID" />
                    <input style={inp()} placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                  </div>
                )}

                {/* cod */}
                {tab === "cod" && (
                  <div style={{ background: "#F8F8F4", border: "1.5px solid #E2E2DC", borderRadius: 10, padding: 24, textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💵</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Cash on Delivery</div>
                    <p style={{ fontSize: 13, color: "#7A7A72", lineHeight: 1.6 }}>Pay {fmt(grandTotal)} when your order arrives.</p>
                  </div>
                )}

                <button onClick={pay} style={{ width: "100%", padding: 16, background: "#D4A017", border: "none", borderRadius: 10, fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 5px 18px rgba(212,160,23,.35)" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = ".88")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Pay {fmt(grandTotal)} Securely
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: ORDER SUMMARY ─────────────────────────────────────────── */}
          {/* Shows exactly what's in the cart — all items, real prices, real totals */}
          <div style={{ background: "#fff", border: "1px solid #E2E2DC", borderRadius: 14, overflow: "hidden", position: "sticky", top: 80 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E2DC", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1A1A1A", color: "#fff", fontSize: 14, display: "grid", placeItems: "center" }}>📦</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Order Summary</h2>
            </div>

            {/* ── CART ITEMS ── */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E2E2DC", maxHeight: 320, overflowY: "auto" }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: "#7A7A72" }}>Your cart is empty</div>
              ) : items.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F0F0EC" }}>
                  <div style={{ width: 52, height: 52, background: "#F0F0EC", borderRadius: 8, flexShrink: 0, overflow: "hidden" }}>
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#7A7A72" }}>Qty: {item.quantity} · <span style={{ color: "#2E8B5A", fontWeight: 600 }}>{item.discount}% off</span></div>
                  </div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{fmt((item.discountedPrice || 0) * item.quantity)}</div>
                </div>
              ))}
            </div>

            {/* coupon */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E2E2DC", display: "flex", gap: 8 }}>
              <input style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #E2E2DC", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, background: "#FAFAF8", outline: "none" }}
                placeholder="Enter coupon code" value={coupon} onChange={e => setCoupon(e.target.value)} onKeyDown={e => e.key === "Enter" && applyCoupon()} />
              <button onClick={applyCoupon} style={{ padding: "10px 16px", background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 8, fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>APPLY</button>
            </div>
            {couponMsg && <div style={{ padding: "8px 24px 12px", fontSize: 12, color: couponMsg.ok ? "#2E8B5A" : "#C0392B", fontWeight: 500 }}>{couponMsg.text}</div>}

            {/* price breakdown — all computed from live cart */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E2E2DC" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", color: "#7A7A72" }}>
                <span>Price ({totalQty} item{totalQty !== 1 ? "s" : ""})</span>
                <span style={{ color: "#1A1A1A", fontWeight: 500 }}>{fmt(originalTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", color: "#7A7A72" }}>
                <span>Discount</span>
                <span style={{ color: "#2E8B5A", fontWeight: 500 }}>−{fmt(totalSaved)}</span>
              </div>
              {couponApplied && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", color: "#7A7A72" }}>
                  <span>Coupon (ELECTRON10)</span>
                  <span style={{ color: "#2E8B5A", fontWeight: 500 }}>−{fmt(couponDiscount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", color: "#7A7A72" }}>
                <span>Delivery</span>
                <span style={{ color: "#2E8B5A", fontWeight: 500 }}>{delivery === 0 ? "FREE" : fmt(delivery)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "#1A1A1A", paddingTop: 12, marginTop: 4, borderTop: "1px solid #E2E2DC" }}>
                <span>Total Amount</span><span>{fmt(grandTotal)}</span>
              </div>
            </div>

            {(totalSaved + couponDiscount) > 0 && (
              <div style={{ margin: "16px 24px", background: "#EEF8F3", border: "1px solid #C3E8D5", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#2E8B5A", fontWeight: 500, textAlign: "center" }}>
                🎉 You're saving {fmt(totalSaved + couponDiscount)} on this order!
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 14, fontSize: 11, color: "#7A7A72" }}>
              🔒 100% Secure Payments · SSL Encrypted
            </div>
          </div>

        </div>
      </div>

      {/* processing overlay */}
      {processing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,.65)", backdropFilter: "blur(5px)", zIndex: 999, display: "grid", placeItems: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "44px 52px", textAlign: "center", animation: "epPop .3s both" }}>
            <div style={{ width: 52, height: 52, border: "4px solid #E2E2DC", borderTopColor: "#D4A017", borderRadius: "50%", animation: "epSpin .8s linear infinite", margin: "0 auto 20px" }} />
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Processing Payment…</div>
            <div style={{ fontSize: 12, color: "#7A7A72" }}>Please do not close this window</div>
          </div>
        </div>
      )}
    </>
  )
}