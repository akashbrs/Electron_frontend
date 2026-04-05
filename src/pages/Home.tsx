import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import HeroCarousel from "../components/hero/HeroCarousel"
import ProductGrid from "../components/products/ProductGrid"
import CountdownTimer from "../components/ui/CountdownTimer"
import { productService } from "../services/productService"
import type { Product } from "../services/productService"
import { useCartStore } from "../store/cartStore"

export default function Home() {
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts()
        setProducts(data)
      } catch (err) {
        console.error("Failed to fetch products:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const bannerProduct = useMemo(() => products[0] || null, [products])

  const flashSaleProducts = useMemo(() =>
    products.filter(p => (p.id ? true : false)).slice(0, 4).map(p => ({
      ...p, discount: 15,
      discountedPrice: Math.round(p.price - (p.price * 15) / 100)
    })), [products])

  const featuredProducts = useMemo(() => products.slice(4, 10), [products])

  const newArrivals = useMemo(() =>
    [...products].sort((a, b) => 
      // Simplified sort since we don't have createdAt on all products necessarily
      String(b.id).localeCompare(String(a.id))
    ).slice(0, 6), [products])

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#eef1f6" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #c8a030", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        .hp { background: #eef1f6; min-height: 100vh; color: #1a1d26; font-family: 'Outfit', sans-serif; }

        .hp__page { max-width: 1380px; margin: 0 auto; padding: 0 40px 120px; }

        .hp__section { padding: 64px 0 0; }

        /* ── HEADER CARD (shared by all sections) ── */
        .hp__hcard {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 22px 28px;
          background: #ffffff;
          border: 1.5px solid #e4eaf2;
          border-radius: 16px;
          box-shadow: 0 1px 6px rgba(15,17,23,0.05);
          margin-bottom: 24px;
        }
        .hp__hcard-left { display: flex; flex-direction: column; gap: 6px; }
        .hp__hcard-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }

        /* Badge */
        .hp__badge {
          width: fit-content; font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          padding: 4px 12px; border-radius: 20px;
        }
        .hp__badge--amber { background: rgba(200,160,48,0.1); color: #a07818; border: 1px solid rgba(200,160,48,0.28); }
        .hp__badge--red   { background: rgba(220,50,50,0.08); color: #c02020; border: 1px solid rgba(220,50,50,0.2); }
        .hp__badge--dark  { background: rgba(26,29,38,0.06);  color: #363a48; border: 1px solid rgba(26,29,38,0.14); }

        /* Title */
        .hp__htitle {
          font-size: clamp(1.5rem, 2.8vw, 2.4rem);
          font-weight: 300; letter-spacing: -0.8px;
          line-height: 1.05; margin: 0; color: #1a1d26;
        }
        .hp__htitle b { font-weight: 800; }
        .hp__htitle b.gold  { color: #c8a030; }
        .hp__htitle b.red   { color: #c8282e; }
        .hp__htitle b.dark  { color: #1a1d26; }

        .hp__hsub { font-size: 13px; color: #6b7080; margin: 0; }

        /* See all */
        .hp__see-all {
          font-size: 13px; font-weight: 600; color: #4a4f60;
          text-decoration: none; white-space: nowrap;
          padding: 8px 16px; border-radius: 9px;
          border: 1.5px solid #e4eaf2;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .hp__see-all:hover { border-color: #c8a030; color: #c8a030; background: rgba(200,160,48,0.05); }

        /* Timer (inline inside the card) */
        .hp__timer-wrap { display: flex; align-items: center; gap: 10px; }
        .hp__timer-ends { font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #9298a8; text-transform: uppercase; white-space: nowrap; }
        .hp__timer-box {
          background: #fff5f5;
          border: 1.5px solid rgba(200,40,46,0.22);
          border-radius: 10px; padding: 8px 16px;
          font-family: 'DM Mono', monospace;
          font-size: 15px; font-weight: 600; color: #c8282e;
          white-space: nowrap;
        }

        /* ── SPOTLIGHT ── */
        .hp__spotlight {
          display: grid; grid-template-columns: 1fr 1.2fr;
          background: #fff; border: 1.5px solid #e4eaf2;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(15,17,23,0.08);
          transition: box-shadow 0.3s;
        }
        .hp__spotlight:hover { box-shadow: 0 8px 40px rgba(15,17,23,0.12), 0 0 0 1.5px rgba(200,160,48,0.3); }
        .hp__sp-imgzone {
          background: linear-gradient(135deg, #f0f4f8, #e8eef6);
          display: flex; align-items: center; justify-content: center;
          padding: 52px; min-height: 340px;
          border-right: 1.5px solid #f0f4f8; position: relative; overflow: hidden;
        }
        .hp__sp-imgzone::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(ellipse at 50% 110%, rgba(200,160,48,0.12) 0%, transparent 65%);
        }
        .hp__sp-imgzone img {
          max-height: 240px; max-width: 100%; object-fit: contain;
          position: relative; z-index:1;
          filter: drop-shadow(0 12px 32px rgba(15,17,23,0.14));
          transition: transform 0.5s cubic-bezier(.22,.68,0,1.2);
        }
        .hp__spotlight:hover .hp__sp-imgzone img { transform: scale(1.05) translateY(-8px); }
        .hp__sp-body { padding: 44px 48px; display: flex; flex-direction: column; gap: 16px; justify-content: center; }
        .hp__sp-tag {
          width:fit-content; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase;
          color:#c8a030; background:rgba(200,160,48,0.08); border:1px solid rgba(200,160,48,0.22);
          padding:4px 12px; border-radius:6px;
        }
        .hp__sp-name { font-size: clamp(1.2rem,2.4vw,1.9rem); font-weight:700; color:#0f1117; margin:0; line-height:1.3; }
        .hp__sp-price { font-size:2.2rem; font-weight:800; color:#0f1117; letter-spacing:-1.5px; }
        .hp__sp-emi { font-size:12.5px; color:#6b7080; margin-top:4px; }
        .hp__sp-perks { list-style:none; margin:0; padding:10px 0 0; border-top:1px solid #f0f4f8; display:flex; flex-direction:column; gap:8px; }
        .hp__sp-perks li { font-size:13.5px; color:#363a48; display:flex; gap:8px; }
        .hp__sp-check { color:#c8a030; font-weight:700; flex-shrink:0; }
        .hp__sp-actions { display:flex; gap:12px; margin-top:8px; }
        .hp__btn-cart {
          flex:1; height:46px; background:transparent;
          border:2px solid #c8a030; border-radius:11px;
          color:#c8a030; font-size:14px; font-weight:700;
          cursor:pointer; font-family:'Outfit',sans-serif;
          transition:background 0.2s, box-shadow 0.2s;
        }
        .hp__btn-cart:hover { background:rgba(200,160,48,0.07); box-shadow:0 3px 14px rgba(200,160,48,0.2); }
        .hp__btn-buy {
          flex:1; height:46px;
          background:linear-gradient(135deg,#d4a820,#c8a030);
          border:none; border-radius:11px;
          color:#fff; font-size:14px; font-weight:700;
          cursor:pointer; font-family:'Outfit',sans-serif;
          box-shadow:0 4px 16px rgba(200,160,48,0.35);
          transition:opacity 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .hp__btn-buy:hover { opacity:0.9; box-shadow:0 6px 22px rgba(200,160,48,0.45); }
        .hp__btn-buy:active { transform:scale(0.97); }

        /* TRUST BAR */
        .hp__trust {
          display:grid; grid-template-columns:repeat(4,1fr); gap:16px;
          margin-top:72px; padding:28px 32px;
          background:#fff; border:1.5px solid #e4eaf2;
          border-radius:18px; box-shadow:0 1px 6px rgba(15,17,23,0.05);
        }
        .hp__trust-item { display:flex; align-items:center; gap:14px; }
        .hp__trust-icon { font-size:26px; }
        .hp__trust-title { font-size:13.5px; font-weight:700; color:#1a1d26; }
        .hp__trust-sub { font-size:12px; color:#6b7080; margin-top:2px; }

        /* BRAND STRIP */
        .hp__brands {
          display:flex; justify-content:space-between; align-items:center;
          padding:28px 0; margin-top:40px;
          border-top:1.5px solid #e4eaf2; border-bottom:1.5px solid #e4eaf2; gap:12px;
        }
        .hp__brand {
          font-size:10px; font-weight:700; letter-spacing:4px; color:#bcc1ce;
          cursor:default; white-space:nowrap; transition:color 0.3s, letter-spacing 0.3s;
        }
        .hp__brand:hover { color:#c8a030; letter-spacing:6px; }

        @media(max-width:960px){
          .hp__spotlight{grid-template-columns:1fr}
          .hp__sp-imgzone{border-right:none; border-bottom:1.5px solid #f0f4f8}
          .hp__trust{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:600px){
          .hp__page{padding:0 16px 80px}
          .hp__hcard{flex-direction:column; align-items:flex-start}
          .hp__hcard-right{flex-wrap:wrap}
          .hp__trust{grid-template-columns:1fr; padding:20px}
          .hp__brands{flex-wrap:wrap; justify-content:center; gap:10px}
        }
    .hp__timer-box,
    .hp__timer-box * {
      color: #c8282e !important;
      font-family: 'DM Mono', monospace !important;
      font-weight: 600 !important;
    }
      `}</style>

      <div className="hp">
        <HeroCarousel />

        <div className="hp__page">

          {/* ── MOST WANTED ── */}
          <section className="hp__section">
            <div className="hp__hcard">
              <div className="hp__hcard-left">
                <span className="hp__badge hp__badge--amber">🔥 Trending Now</span>
                <h2 className="hp__htitle">Most <b className="gold">Wanted</b></h2>
                <p className="hp__hsub">The device everyone is talking about right now</p>
              </div>
              <div className="hp__hcard-right">
                <a href="/shop" className="hp__see-all">View all →</a>
              </div>
            </div>

            {bannerProduct && (
              <div className="hp__spotlight">
                <div className="hp__sp-imgzone">
                  <img src={bannerProduct.image} alt={bannerProduct.name} />
                </div>
                <div className="hp__sp-body">
                  <span className="hp__sp-tag">★ Editor's Pick</span>
                  <h3 className="hp__sp-name">{bannerProduct.name}</h3>
                  <div>
                    <div className="hp__sp-price">₹{bannerProduct.price.toLocaleString()}</div>
                    <div className="hp__sp-emi">No Cost EMI from ₹{Math.round(bannerProduct.price / 12).toLocaleString()}/mo</div>
                  </div>
                  <ul className="hp__sp-perks">
                    {["Free delivery within 2 business days", "1 Year manufacturer warranty", "10-day hassle-free replacement", "Secure checkout — 100% safe"].map(p => (
                      <li key={p}><span className="hp__sp-check">✓</span>{p}</li>
                    ))}
                  </ul>
                  <div className="hp__sp-actions">
                    <button className="hp__btn-cart" onClick={() => addToCart(String(bannerProduct.id), 1)}>Add to Cart</button>
                    <button className="hp__btn-buy" onClick={() => {
                      addToCart(String(bannerProduct.id), 1)
                      navigate("/cart")
                    }}>Buy Now</button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── FLASH SALE ── */}
          <section className="hp__section">
            <div className="hp__hcard">
              <div className="hp__hcard-left">
                <span className="hp__badge hp__badge--red">⚡ Limited Time</span>
                <h2 className="hp__htitle">Flash <b className="red">Sale</b></h2>
                <p className="hp__hsub">Grab it before stock runs out</p>
              </div>
              <div className="hp__hcard-right">
                <div className="hp__timer-wrap">
                  <span className="hp__timer-ends">Ends in</span>
                  <div className="hp__timer-box">
                    <CountdownTimer hours={2} />
                  </div>
                </div>
                <a href="/shop" className="hp__see-all">View all →</a>
              </div>
            </div>
            <ProductGrid products={flashSaleProducts} />
          </section>

          {/* ── FEATURED ── */}
          <section className="hp__section">
            <div className="hp__hcard">
              <div className="hp__hcard-left">
                <span className="hp__badge hp__badge--dark">⭐ Hand Picked</span>
                <h2 className="hp__htitle">Featured <b className="dark">Products</b></h2>
                <p className="hp__hsub">Curated by our experts — best value for money</p>
              </div>
              <div className="hp__hcard-right">
                <a href="/shop" className="hp__see-all">View all →</a>
              </div>
            </div>
            <ProductGrid products={featuredProducts} />
          </section>

          {/* ── NEW ARRIVALS ── */}
          <section className="hp__section">
            <div className="hp__hcard">
              <div className="hp__hcard-left">
                <span className="hp__badge hp__badge--dark">🆕 Just Landed</span>
                <h2 className="hp__htitle">New <b className="gold">Arrivals</b></h2>
                <p className="hp__hsub">Fresh tech, straight from the box</p>
              </div>
              <div className="hp__hcard-right">
                <a href="/shop" className="hp__see-all">View all →</a>
              </div>
            </div>
            <ProductGrid products={newArrivals} />
          </section>

          {/* ── TRUST BAR ── */}
          <div className="hp__trust">
            {[
              { icon: "🚚", title: "Free Delivery", sub: "On orders above ₹499" },
              { icon: "🔄", title: "Easy Returns", sub: "10-day replacement policy" },
              { icon: "🔒", title: "Secure Payments", sub: "100% safe & encrypted" },
              { icon: "🎧", title: "24 / 7 Support", sub: "Always here for you" },
            ].map(item => (
              <div key={item.title} className="hp__trust-item">
                <span className="hp__trust-icon">{item.icon}</span>
                <div>
                  <div className="hp__trust-title">{item.title}</div>
                  <div className="hp__trust-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── BRANDS ── */}
          <div className="hp__brands">
            {["SAMSUNG", "APPLE", "SONY", "ASUS", "DELL", "LG", "MICROSOFT", "BOSE"].map(b => (
              <span key={b} className="hp__brand">{b}</span>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}