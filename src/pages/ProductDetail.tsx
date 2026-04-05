import { useParams, Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { productService } from "../services/productService"
import type { Product } from "../services/productService"
import { useCartStore } from "../store/cartStore"

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart } = useCartStore()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImg, setSelectedImg] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [pincode, setPincode] = useState("")
    const [activeTab, setActiveTab] = useState("overview")
    const [added, setAdded] = useState(false)
    
    // XSS Simulation: Local reviews state that renders dangerously
    const [userReviews, setUserReviews] = useState([
        { user: "Rahul M.", rating: 5, date: "12 Jan 2025", text: "Absolutely love this product. Build quality is top notch and performance is blazing fast. Worth every rupee!" },
        { user: "Priya S.", rating: 4, date: "8 Feb 2025", text: "Great product overall. Delivery was fast and packaging was excellent." },
    ])
    const [newReview, setNewReview] = useState("")

    useEffect(() => {
        if (!id) return
        const fetchProduct = async () => {
            setLoading(true)
            try {
                const data = await productService.getProductDetail(id)
                setProduct(data)
            } catch (err) {
                console.error("Failed to fetch product:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    const handleAddReview = () => {
        if (!newReview.trim()) return
        setUserReviews([...userReviews, {
            user: "Guest User",
            rating: 5,
            date: new Date().toLocaleDateString(),
            text: newReview
        }])
        setNewReview("")
    }

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#eef1f6" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #c8a030", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
    )

    if (!product) return (
        <div style={{ paddingTop: 120, textAlign: "center", fontFamily: "Outfit, sans-serif" }}>
            <h2>Product not found</h2>
            <Link to="/shop">← Back to Shop</Link>
        </div>
    )

    const discount = 15
    const discountedPrice = Math.round(product.price - (product.price * discount) / 100)
    const saved = product.price - discountedPrice
    const related: Product[] = [] // Default to empty for now
    const images = [product.image, product.image, product.image]

    const handleAddToCart = () => {
        addToCart(String(product.id), quantity)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    const handleBuyNow = () => {
        handleAddToCart()
        navigate("/cart")
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        .pd {
          background: #eef1f6;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          color: #1a1d26;
          padding-top: 66px;
        }

        .pd__crumb {
          max-width: 1380px; margin: 0 auto;
          padding: 16px 40px;
          display: flex; align-items: center; gap: 8px;
          font-size: 12.5px; color: #9298a8;
        }
        .pd__crumb a { color: #9298a8; text-decoration: none; transition: color 0.2s; }
        .pd__crumb a:hover { color: #c8a030; }
        .pd__crumb-sep { opacity: 0.4; }
        .pd__crumb-current { color: #1a1d26; font-weight: 500; }

        .pd__main {
          max-width: 1380px; margin: 0 auto;
          padding: 0 40px 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .pd__gallery { display: flex; flex-direction: column; gap: 12px; position: sticky; top: 86px; }

        .pd__main-img {
          background: #ffffff;
          border: 1.5px solid #e4eaf2;
          border-radius: 20px;
          height: 420px;
          display: flex; align-items: center; justify-content: center;
          padding: 40px; overflow: hidden; position: relative;
        }
        .pd__main-img::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 110%, rgba(200,160,48,0.07) 0%, transparent 65%);
        }
        .pd__main-img img {
          max-height: 100%; max-width: 100%;
          object-fit: contain;
          filter: drop-shadow(0 12px 32px rgba(15,17,23,0.12));
          transition: transform 0.4s ease;
          position: relative; z-index: 1;
        }
        .pd__main-img:hover img { transform: scale(1.04); }

        .pd__thumbs { display: flex; gap: 10px; }
        .pd__thumb {
          width: 72px; height: 72px;
          background: #ffffff; border: 1.5px solid #e4eaf2;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          padding: 8px; cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pd__thumb:hover { border-color: #c8a030; }
        .pd__thumb--active {
          border-color: #c8a030 !important;
          box-shadow: 0 0 0 3px rgba(200,160,48,0.12);
        }
        .pd__thumb img { max-height: 100%; max-width: 100%; object-fit: contain; }

        .pd__info { display: flex; flex-direction: column; gap: 20px; }

        .pd__badge-row { display: flex; align-items: center; gap: 8px; }
        .pd__badge {
          font-size: 10px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; padding: 4px 12px; border-radius: 20px;
        }
        .pd__badge--gold {
          background: rgba(200,160,48,0.1); color: #a07818;
          border: 1px solid rgba(200,160,48,0.25);
        }
        .pd__badge--green { background: #edfaf3; color: #1a8a4a; border: 1px solid #c6f0d8; }

        .pd__name {
          font-size: clamp(1.4rem, 2.8vw, 2.2rem);
          font-weight: 800; color: #0f1117;
          line-height: 1.2; margin: 0; letter-spacing: -0.5px;
        }

        .pd__rating-row { display: flex; align-items: center; gap: 10px; }
        .pd__stars { display: flex; gap: 2px; }
        .pd__rating-score { font-size: 13.5px; font-weight: 700; color: #1a1d26; }
        .pd__rating-count { font-size: 13px; color: #9298a8; }
        .pd__rating-div { width: 1px; height: 14px; background: #e4eaf2; }

        .pd__price-block {
          background: #ffffff; border: 1.5px solid #e4eaf2;
          border-radius: 16px; padding: 20px 24px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .pd__price-row { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .pd__price {
          font-size: 2.4rem; font-weight: 800;
          color: #0f1117; letter-spacing: -1.5px;
          font-family: 'Outfit', sans-serif;
        }
        .pd__mrp { font-size: 14px; color: #9298a8; }
        .pd__discount-badge {
          background: #e63946; color: #fff;
          font-size: 12px; font-weight: 700;
          padding: 3px 10px; border-radius: 6px;
        }
        .pd__save { font-size: 13px; font-weight: 600; color: #1a8a4a; }
        .pd__emi {
          font-size: 12.5px; color: #6b7080;
          padding-top: 8px; border-top: 1px solid #f0f4f8;
        }
        .pd__emi span { color: #c8a030; font-weight: 600; }

        .pd__delivery {
          background: #ffffff; border: 1.5px solid #e4eaf2;
          border-radius: 16px; padding: 18px 24px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .pd__delivery-title {
          font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; color: #9298a8;
        }
        .pd__pincode { display: flex; gap: 10px; }
        .pd__pincode input {
          flex: 1; height: 40px; padding: 0 14px;
          background: #f0f4f8; border: 1.5px solid #e4eaf2;
          border-radius: 9px; font-size: 13.5px;
          font-family: 'Outfit', sans-serif; color: #1a1d26; outline: none;
          transition: border-color 0.25s;
        }
        .pd__pincode input:focus { border-color: #c8a030; }
        .pd__pincode input::placeholder { color: #9298a8; }
        .pd__pincode-btn {
          height: 40px; padding: 0 18px;
          background: #1a1d26; border: none; border-radius: 9px;
          color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: background 0.2s;
        }
        .pd__pincode-btn:hover { background: #c8a030; }
        .pd__delivery-info { font-size: 13px; color: #363a48; display: flex; align-items: center; gap: 8px; }

        .pd__qty-row { display: flex; align-items: center; gap: 12px; }
        .pd__qty-label {
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.5px; color: #9298a8;
        }
        .pd__qty {
          display: flex; align-items: center;
          background: #ffffff; border: 1.5px solid #e4eaf2;
          border-radius: 10px; overflow: hidden;
        }
        .pd__qty-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; cursor: pointer;
          font-size: 18px; color: #4a4f60;
          transition: background 0.2s, color 0.2s;
        }
        .pd__qty-btn:hover { background: #f0f4f8; color: #1a1d26; }
        .pd__qty-num {
          min-width: 40px; text-align: center;
          font-size: 14px; font-weight: 700; color: #1a1d26;
          border-left: 1px solid #e4eaf2; border-right: 1px solid #e4eaf2;
          line-height: 36px;
        }

        .pd__actions { display: flex; gap: 12px; }

        .pd__btn-cart {
          flex: 1; height: 50px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          border: 2px solid #c8a030; border-radius: 12px;
          font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: all 0.25s;
        }
        .pd__btn-cart--default {
          background: transparent; color: #c8a030;
        }
        .pd__btn-cart--default:hover {
          background: rgba(200,160,48,0.08);
          box-shadow: 0 4px 16px rgba(200,160,48,0.2);
        }
        .pd__btn-cart--added {
          background: #c8a030; color: #fff;
          border-color: #c8a030;
          box-shadow: 0 4px 16px rgba(200,160,48,0.35);
        }

        .pd__btn-buy {
          flex: 1; height: 50px;
          background: linear-gradient(135deg, #d4a820, #c8a030);
          border: none; border-radius: 12px;
          color: #fff; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          box-shadow: 0 4px 16px rgba(200,160,48,0.35);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .pd__btn-buy:hover { opacity: 0.9; box-shadow: 0 6px 24px rgba(200,160,48,0.45); }
        .pd__btn-buy:active { transform: scale(0.98); }

        .pd__perks { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .pd__perk {
          display: flex; align-items: center; gap: 10px;
          background: #ffffff; border: 1.5px solid #e4eaf2;
          border-radius: 12px; padding: 12px 14px;
        }
        .pd__perk-icon { font-size: 20px; }
        .pd__perk-title { font-size: 12.5px; font-weight: 700; color: #1a1d26; }
        .pd__perk-sub { font-size: 11.5px; color: #6b7080; margin-top: 1px; }

        .pd__tabs-section { max-width: 1380px; margin: 0 auto; padding: 0 40px 40px; }
        .pd__tabs {
          display: flex; background: #fff;
          border-radius: 16px 16px 0 0; padding: 0 24px;
          border: 1.5px solid #e4eaf2; border-bottom: none;
        }
        .pd__tab {
          padding: 14px 20px; font-size: 13.5px; font-weight: 500;
          color: #6b7080; border: none; background: transparent; cursor: pointer;
          border-bottom: 2.5px solid transparent; margin-bottom: -1.5px;
          font-family: 'Outfit', sans-serif; transition: color 0.2s, border-color 0.2s;
        }
        .pd__tab:hover { color: #1a1d26; }
        .pd__tab--active { color: #c8a030 !important; border-bottom-color: #c8a030 !important; font-weight: 700; }
        .pd__tab-content {
          background: #fff; border: 1.5px solid #e4eaf2;
          border-top: none; border-radius: 0 0 16px 16px; padding: 28px 32px;
        }

        .pd__specs { width: 100%; border-collapse: collapse; }
        .pd__specs tr { border-bottom: 1px solid #f0f4f8; }
        .pd__specs tr:last-child { border-bottom: none; }
        .pd__specs td { padding: 12px 16px; font-size: 13.5px; }
        .pd__specs td:first-child { color: #6b7080; font-weight: 500; width: 30%; background: #f8fafc; }
        .pd__specs td:last-child { color: #1a1d26; font-weight: 500; }

        .pd__overview p { font-size: 14px; line-height: 1.8; color: #363a48; margin: 0 0 16px; }
        .pd__overview ul { padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
        .pd__overview ul li { font-size: 13.5px; color: #363a48; line-height: 1.6; }

        .pd__related { max-width: 1380px; margin: 0 auto; padding: 0 40px 80px; }
        .pd__related-title { font-size: 1.4rem; font-weight: 700; color: #0f1117; margin: 0 0 20px; letter-spacing: -0.3px; }
        .pd__related-title span { color: #c8a030; }
        .pd__related-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }

        .pd__rcard {
          background: #fff; border: 1.5px solid #e4eaf2;
          border-radius: 14px; overflow: hidden;
          text-decoration: none; color: inherit;
          display: flex; flex-direction: column;
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .pd__rcard:hover {
          transform: translateY(-5px);
          border-color: rgba(200,160,48,0.4);
          box-shadow: 0 12px 36px rgba(15,17,23,0.1);
        }
        .pd__rcard-img {
          background: linear-gradient(135deg, #f8fafc, #f0f4f8);
          height: 150px; display: flex; align-items: center;
          justify-content: center; padding: 16px; border-bottom: 1.5px solid #f0f4f8;
        }
        .pd__rcard-img img {
          max-height: 100%; max-width: 100%; object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(15,17,23,0.1));
          transition: transform 0.3s;
        }
        .pd__rcard:hover .pd__rcard-img img { transform: scale(1.05); }
        .pd__rcard-body { padding: 12px 14px 16px; }
        .pd__rcard-name {
          font-size: 13px; font-weight: 500; color: #1a1d26;
          margin: 0 0 6px; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .pd__rcard-price { font-size: 16px; font-weight: 800; color: #0f1117; }

        @media (max-width: 960px) {
          .pd__main { grid-template-columns: 1fr; }
          .pd__gallery { position: static; }
          .pd__related-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 600px) {
          .pd__main { padding: 0 16px 40px; }
          .pd__tabs-section { padding: 0 16px 32px; }
          .pd__related { padding: 0 16px 60px; }
          .pd__perks { grid-template-columns: 1fr; }
          .pd__crumb { padding: 12px 16px; }
        }
      `}</style>

            <div className="pd">

                {/* Breadcrumb */}
                <div className="pd__crumb">
                    <Link to="/">Home</Link>
                    <span className="pd__crumb-sep">›</span>
                    <Link to="/shop">Shop</Link>
                    <span className="pd__crumb-sep">›</span>
                    <span className="pd__crumb-current">{product.name}</span>
                </div>

                <div className="pd__main">

                    {/* LEFT — Gallery */}
                    <div className="pd__gallery">
                        <div className="pd__main-img">
                            <img src={images[selectedImg]} alt={product.name} />
                        </div>
                        <div className="pd__thumbs">
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`pd__thumb ${selectedImg === i ? "pd__thumb--active" : ""}`}
                                    onClick={() => setSelectedImg(i)}
                                >
                                    <img src={img} alt="" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — Info */}
                    <div className="pd__info">

                        <div className="pd__badge-row">
                            <span className="pd__badge pd__badge--gold">★ Editor's Pick</span>
                            <span className="pd__badge pd__badge--green">✓ In Stock</span>
                        </div>

                        <h1 className="pd__name">{product.name}</h1>

                        <div className="pd__rating-row">
                            <div className="pd__stars">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <svg key={s} width="16" height="16" viewBox="0 0 24 24"
                                        fill={4 >= s ? "#c8a030" : "none"}
                                        stroke="#c8a030" strokeWidth="2">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                ))}
                            </div>
                            <span className="pd__rating-score">4.0</span>
                            <div className="pd__rating-div" />
                            <span className="pd__rating-count">631 ratings</span>
                            <div className="pd__rating-div" />
                            <span className="pd__rating-count" style={{ color: "#c8a030", fontWeight: 600 }}>
                                2,140 sold
                            </span>
                        </div>

                        <div className="pd__price-block">
                            <div className="pd__price-row">
                                <span className="pd__price">₹{discountedPrice.toLocaleString()}</span>
                                <span className="pd__mrp">M.R.P <s>₹{product.price.toLocaleString()}</s></span>
                                <span className="pd__discount-badge">−{discount}%</span>
                            </div>
                            <span className="pd__save">You save ₹{saved.toLocaleString()} on this order</span>
                            <div className="pd__emi">
                                No Cost EMI from <span>₹{Math.round(discountedPrice / 12).toLocaleString()}/mo</span>
                                &nbsp;· 6 bank offers available
                            </div>
                        </div>

                        <div className="pd__delivery">
                            <span className="pd__delivery-title">Check Delivery</span>
                            <div className="pd__pincode">
                                <input
                                    placeholder="Enter pincode…"
                                    value={pincode}
                                    onChange={e => setPincode(e.target.value)}
                                    maxLength={6}
                                />
                                <button className="pd__pincode-btn">Check</button>
                            </div>
                            <div className="pd__delivery-info">
                                🚚 <span>Free delivery by <strong>Tomorrow</strong> if ordered within 3 hrs</span>
                            </div>
                        </div>

                        <div className="pd__qty-row">
                            <span className="pd__qty-label">Qty</span>
                            <div className="pd__qty">
                                <button className="pd__qty-btn"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                                <span className="pd__qty-num">{quantity}</span>
                                <button className="pd__qty-btn"
                                    onClick={() => setQuantity(q => q + 1)}>+</button>
                            </div>
                        </div>

                        {/* ── CTA BUTTONS with cart logic ── */}
                        <div className="pd__actions">
                            <button
                                className={`pd__btn-cart ${added ? "pd__btn-cart--added" : "pd__btn-cart--default"}`}
                                onClick={handleAddToCart}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5">
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                {added ? "✓ Added to Cart!" : "Add to Cart"}
                            </button>

                            <button className="pd__btn-buy" onClick={handleBuyNow}>
                                Buy Now
                            </button>
                        </div>

                        <div className="pd__perks">
                            {[
                                { icon: "🔄", title: "10 Day Returns", sub: "Hassle-free replacement" },
                                { icon: "🛡️", title: "1 Year Warranty", sub: "Manufacturer warranty" },
                                { icon: "🚚", title: "Free Delivery", sub: "On orders above ₹499" },
                                { icon: "✅", title: "100% Genuine", sub: "Certified authentic product" },
                            ].map(p => (
                                <div key={p.title} className="pd__perk">
                                    <span className="pd__perk-icon">{p.icon}</span>
                                    <div>
                                        <div className="pd__perk-title">{p.title}</div>
                                        <div className="pd__perk-sub">{p.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* TABS */}
                <div className="pd__tabs-section">
                    <div className="pd__tabs">
                        {["overview", "specs", "reviews"].map(tab => (
                            <button
                                key={tab}
                                className={`pd__tab ${activeTab === tab ? "pd__tab--active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="pd__tab-content">
                        {activeTab === "overview" && (
                            <div className="pd__overview">
                                <p>
                                    The <strong>{product.name}</strong> is engineered for those who demand
                                    the very best. Combining cutting-edge technology with premium build
                                    quality, it delivers an unmatched experience in its class.
                                </p>
                                <ul>
                                    <li>Industry-leading performance with the latest generation processor</li>
                                    <li>Stunning display with vivid colours and high refresh rate</li>
                                    <li>All-day battery life with fast charging support</li>
                                    <li>Pro-grade camera system with AI-powered enhancements</li>
                                    <li>Premium build with aerospace-grade materials</li>
                                </ul>
                            </div>
                        )}

                        {activeTab === "specs" && (
                            <table className="pd__specs">
                                <tbody>
                                    {[
                                        ["Brand", product.name.split(" ")[0]],
                                        ["Model", product.name],
                                        ["Price", `₹${discountedPrice.toLocaleString()}`],
                                        ["Availability", "In Stock"],
                                        ["Warranty", "1 Year Manufacturer Warranty"],
                                        ["In the Box", "Device, Charger, Cable, User Manual"],
                                        ["Weight", "~180g"],
                                        ["Colour", "Titanium Black"],
                                    ].map(([key, val]) => (
                                        <tr key={key}><td>{key}</td><td>{val}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === "reviews" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {/* Review Input (XSS Source) */}
                                <div style={{ 
                                    padding: "20px", background: "#fff", 
                                    border: "1.5px dashed #c8a030", borderRadius: "12px",
                                    display: "flex", flexDirection: "column", gap: "12px"
                                }}>
                                    <h4 style={{ margin: 0, fontSize: "14px", color: "#c8a030" }}>Write a Review (XSS Lab)</h4>
                                    <textarea 
                                        placeholder="Enter your review here... <script>alert('XSS')</script>"
                                        value={newReview}
                                        onChange={(e) => setNewReview(e.target.value)}
                                        style={{ 
                                            width: "100%", height: "80px", padding: "12px",
                                            border: "1px solid #e4eaf2", borderRadius: "8px",
                                            fontFamily: "inherit", fontSize: "13px"
                                        }}
                                    />
                                    <button 
                                        onClick={handleAddReview}
                                        style={{ 
                                            alignSelf: "flex-end", padding: "8px 20px",
                                            background: "#c8a030", color: "#fff", border: "none",
                                            borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer"
                                        }}
                                    >
                                        Post Review
                                    </button>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {userReviews.map((r, i) => (
                                        <div key={i} style={{
                                            padding: "18px 20px", background: "#f8fafc",
                                            borderRadius: "12px", border: "1.5px solid #e4eaf2",
                                            display: "flex", flexDirection: "column", gap: "8px"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: "50%",
                                                        background: "linear-gradient(135deg, #c8a030, #d4b840)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        color: "#fff", fontWeight: 800, fontSize: 14
                                                    }}>
                                                        {r.user[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 13.5, color: "#1a1d26" }}>{r.user}</div>
                                                        <div style={{ fontSize: 11.5, color: "#9298a8" }}>{r.date}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", gap: 2 }}>
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <svg key={s} width="13" height="13" viewBox="0 0 24 24"
                                                            fill={r.rating >= s ? "#c8a030" : "none"}
                                                            stroke="#c8a030" strokeWidth="2">
                                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* XSS VULNERABILITY: dangerouslySetInnerHTML */}
                                            <p 
                                                style={{ fontSize: 13.5, color: "#363a48", lineHeight: 1.7, margin: 0 }}
                                                dangerouslySetInnerHTML={{ __html: r.text }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RELATED */}
                <div className="pd__related">
                    <h2 className="pd__related-title">You may also <span>like</span></h2>
                    <div className="pd__related-grid">
                        {related.map(p => (
                            <Link to={`/product/${p.id}`} key={p.id} className="pd__rcard">
                                <div className="pd__rcard-img">
                                    <img src={p.image} alt={p.name} />
                                </div>
                                <div className="pd__rcard-body">
                                    <p className="pd__rcard-name">{p.name}</p>
                                    <div className="pd__rcard-price">
                                        ₹{Math.round(p.price * 0.85).toLocaleString()}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </>
    )
}