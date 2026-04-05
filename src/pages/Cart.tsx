import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCartStore } from "../store/cartStore"
import { products } from "../data/product"

export default function Cart() {
    const { cart, removeItem, updateItemQuantity, clearCartData, addToCart } = useCartStore()
    const items = cart?.items || []
    const navigate = useNavigate()
    const [coupon, setCoupon] = useState("")
    const [couponApplied, setCouponApplied] = useState(false)
    const [couponError, setCouponError] = useState("")

    const applyCoupon = () => {
        if (coupon.toUpperCase() === "ELECTRON10") {
            setCouponApplied(true); setCouponError("")
        } else {
            setCouponApplied(false); setCouponError("Invalid coupon code")
        }
    }

    const subtotal = items.reduce((s, i) => s + (i.discountedPrice || 0) * i.quantity, 0)
    const originalTotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0)
    const totalSaved = originalTotal - subtotal
    const couponDiscount = couponApplied ? Math.round(subtotal * 0.1) : 0
    const delivery = subtotal > 50000 ? 0 : items.length > 0 ? 499 : 0
    const grandTotal = subtotal - couponDiscount + delivery
    const totalItems = items.reduce((s, i) => s + i.quantity, 0)

    const recommended = products
        .filter(p => !items.find(i => String(i.id) === String(p.id)))
        .slice(0, 4)

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        /* ── ROOT ── */
        .cart {
          background: #eef1f6;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          color: #1a1d26;
          padding-top: 66px;
        }

        /* ── TOPBAR ── */
        .cart__topbar {
          background: #ffffff;
          border-bottom: 1.5px solid #e4eaf2;
          padding: 0 40px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 4px rgba(15,17,23,0.05);
        }
        .cart__topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cart__topbar-left h1 {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f1117;
          margin: 0;
          letter-spacing: -0.4px;
        }
        .cart__topbar-count {
          background: rgba(200,160,48,0.1);
          color: #a07818;
          border: 1px solid rgba(200,160,48,0.25);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          padding: 4px 11px;
          border-radius: 20px;
        }
        .cart__continue {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          color: #4a4f60;
          text-decoration: none;
          padding: 9px 18px;
          border: 1.5px solid #e4eaf2;
          border-radius: 10px;
          background: #fff;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .cart__continue:hover {
          border-color: #c8a030;
          color: #c8a030;
          background: rgba(200,160,48,0.04);
        }

        /* ── PAGE GRID ── */
        .cart__page {
          max-width: 1380px;
          margin: 0 auto;
          padding: 24px 40px 80px;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
          align-items: start;
        }

        /* ── LEFT ── */
        .cart__left {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Select bar */
        .cart__selbar {
          background: #fff;
          border: 1.5px solid #e4eaf2;
          border-radius: 12px;
          padding: 13px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cart__selbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cart__cb { width: 17px; height: 17px; cursor: pointer; accent-color: #c8a030; }
        .cart__sellabel { font-size: 13.5px; font-weight: 600; color: #1a1d26; }
        .cart__selcount  { font-size: 12px; color: #9298a8; }
        .cart__clearall {
          font-size: 12.5px;
          font-weight: 600;
          color: #9298a8;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: color 0.2s;
          padding: 0;
        }
        .cart__clearall:hover { color: #e63946; }

        /* ── ITEM CARD ── */
        .cart__item {
          background: #fff;
          border: 1.5px solid #e4eaf2;
          border-radius: 16px;
          padding: 20px 22px;
          display: grid;
          grid-template-columns: 92px 1fr auto;
          gap: 18px;
          align-items: center;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .cart__item:hover {
          border-color: rgba(200,160,48,0.3);
          box-shadow: 0 4px 20px rgba(15,17,23,0.07);
        }

        /* Image */
        .cart__item-img-wrap {
          background: linear-gradient(135deg, #f8fafc, #f0f4f8);
          border-radius: 12px;
          height: 92px;
          width: 92px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          border: 1.5px solid #f0f4f8;
          flex-shrink: 0;
          overflow: hidden;
        }
        .cart__item-img-wrap img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          filter: drop-shadow(0 3px 8px rgba(15,17,23,0.1));
          transition: transform 0.3s;
        }
        .cart__item:hover .cart__item-img-wrap img { transform: scale(1.06); }

        /* Info */
        .cart__item-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .cart__item-name {
          font-size: 14.5px;
          font-weight: 700;
          color: #0f1117;
          line-height: 1.35;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cart__item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cart__item-offtag {
          font-size: 10.5px;
          font-weight: 700;
          color: #1a8a4a;
          background: #edfaf3;
          border: 1px solid #c6f0d8;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .cart__item-color-row {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: #6b7080;
        }
        .cart__item-cdot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #4a4f60;
          border: 1px solid #ddd;
        }
        .cart__item-delivery {
          font-size: 12px;
          color: #6b7080;
        }
        .cart__item-delivery b { color: #1a8a4a; }

        /* Item buttons */
        .cart__item-btns {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 2px;
        }
        .cart__item-rm {
          font-size: 12px;
          font-weight: 600;
          color: #9298a8;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          padding: 0;
          transition: color 0.2s;
        }
        .cart__item-rm:hover { color: #e63946; }
        .cart__item-sep { width: 1px; height: 12px; background: #e4eaf2; }
        .cart__item-sl {
          font-size: 12px;
          font-weight: 600;
          color: #c8a030;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          padding: 0;
          transition: opacity 0.2s;
        }
        .cart__item-sl:hover { opacity: 0.7; }

        /* Right col: price + stepper */
        .cart__item-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-shrink: 0;
        }
        .cart__item-pricewrap { text-align: right; }
        .cart__item-price {
          font-size: 20px;
          font-weight: 800;
          color: #0f1117;
          letter-spacing: -0.5px;
          display: block;
        }
        .cart__item-mrp {
          font-size: 11.5px;
          color: #9298a8;
          display: block;
          margin-top: 2px;
        }

        /* Qty stepper */
        .cart__step {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1.5px solid #e4eaf2;
          border-radius: 9px;
          overflow: hidden;
        }
        .cart__step button {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #4a4f60;
          font-family: 'Outfit', sans-serif;
          transition: background 0.2s, color 0.2s;
        }
        .cart__step button:hover { background: #e4eaf2; color: #1a1d26; }
        .cart__step span {
          min-width: 38px;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
          color: #1a1d26;
          border-left: 1px solid #e4eaf2;
          border-right: 1px solid #e4eaf2;
          line-height: 34px;
        }

        /* ── EMPTY ── */
        .cart__empty {
          background: #fff;
          border: 1.5px solid #e4eaf2;
          border-radius: 20px;
          padding: 80px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
        }
        .cart__empty-icon { font-size: 56px; opacity: 0.3; }
        .cart__empty h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1a1d26;
          margin: 0;
        }
        .cart__empty p { font-size: 13px; color: #6b7080; margin: 0; }
        .cart__empty-cta {
          margin-top: 8px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #d4a820, #c8a030);
          border: none;
          border-radius: 11px;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(200,160,48,0.3);
          transition: opacity 0.2s, box-shadow 0.2s;
        }
        .cart__empty-cta:hover {
          opacity: 0.9;
          box-shadow: 0 6px 22px rgba(200,160,48,0.4);
        }

        /* ── RIGHT PANEL ── */
        .cart__right {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: sticky;
          top: 86px;
        }

        /* Coupon */
        .cart__coupon {
          background: #fff;
          border: 1.5px solid #e4eaf2;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cart__coupon-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6b7080;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cart__coupon-row { display: flex; gap: 8px; }
        .cart__coupon input {
          flex: 1;
          height: 40px;
          padding: 0 13px;
          background: #f0f4f8;
          border: 1.5px solid #e4eaf2;
          border-radius: 9px;
          font-size: 13px;
          font-family: 'Outfit', sans-serif;
          color: #1a1d26;
          outline: none;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: border-color 0.25s, background 0.25s;
        }
        .cart__coupon input:focus {
          border-color: #c8a030;
          background: #fff;
        }
        .cart__coupon input::placeholder {
          text-transform: none;
          letter-spacing: 0;
          color: #9298a8;
        }
        .cart__coupon-btn {
          height: 40px;
          padding: 0 18px;
          background: #1a1d26;
          border: none;
          border-radius: 9px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .cart__coupon-btn:hover { background: #c8a030; }
        .cart__coupon-ok  { font-size: 12px; font-weight: 600; color: #1a8a4a; }
        .cart__coupon-err { font-size: 12px; font-weight: 600; color: #e63946; }
        .cart__coupon-hint { font-size: 11.5px; color: #9298a8; }
        .cart__coupon-hint b { color: #c8a030; }

        /* Price box */
        .cart__pricebox {
          background: #fff;
          border: 1.5px solid #e4eaf2;
          border-radius: 14px;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .cart__pricebox-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6b7080;
          margin-bottom: 14px;
        }
        .cart__prow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f4f6f8;
          font-size: 13.5px;
        }
        .cart__prow:last-of-type { border-bottom: none; }
        .cart__plabel { color: #4a4f60; font-weight: 400; }
        .cart__pval   { color: #1a1d26; font-weight: 600; }
        .cart__pval--g { color: #1a8a4a; font-weight: 700; }
        .cart__pdivider {
          height: 1.5px;
          background: #e4eaf2;
          margin: 10px 0;
        }
        .cart__ptotal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
        }
        .cart__ptlabel { font-size: 14px; font-weight: 700; color: #0f1117; }
        .cart__ptval   {
          font-size: 22px;
          font-weight: 800;
          color: #0f1117;
          letter-spacing: -0.5px;
        }
        .cart__psaving {
          margin-top: 12px;
          padding: 10px 14px;
          background: #edfaf3;
          border: 1px solid #c6f0d8;
          border-radius: 9px;
          text-align: center;
          font-size: 12.5px;
          font-weight: 600;
          color: #1a8a4a;
        }

        /* Checkout */
        .cart__checkout {
          width: 100%;
          height: 52px;
          background: linear-gradient(135deg, #d4a820, #c8a030);
          border: none;
          border-radius: 13px;
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 5px 18px rgba(200,160,48,0.35);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.3px;
        }
        .cart__checkout:hover {
          opacity: 0.9;
          box-shadow: 0 7px 24px rgba(200,160,48,0.45);
        }
        .cart__checkout:active { transform: scale(0.98); }
        .cart__checkout:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Trust */
        .cart__trust {
          background: #fff;
          border: 1.5px solid #e4eaf2;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cart__trust-row {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12.5px;
          color: #4a4f60;
          font-weight: 500;
        }

        /* ── RECOMMENDED ── */
        .cart__rec {
          max-width: 1380px;
          margin: 8px auto 0;
          padding: 0 40px 80px;
        }
        .cart__rec h2 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f1117;
          margin: 0 0 16px;
          letter-spacing: -0.3px;
        }
        .cart__rec h2 span { color: #c8a030; }
        .cart__rec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .cart__rec-card {
          background: #fff;
          border: 1.5px solid #e4eaf2;
          border-radius: 14px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .cart__rec-card:hover {
          transform: translateY(-4px);
          border-color: rgba(200,160,48,0.35);
          box-shadow: 0 10px 28px rgba(15,17,23,0.08);
        }
        .cart__rec-imgzone {
          background: linear-gradient(135deg, #f8fafc, #f0f4f8);
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          border-bottom: 1.5px solid #f0f4f8;
        }
        .cart__rec-imgzone img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 10px rgba(15,17,23,0.1));
          transition: transform 0.3s;
        }
        .cart__rec-card:hover .cart__rec-imgzone img { transform: scale(1.06); }
        .cart__rec-body { padding: 12px 14px 14px; }
        .cart__rec-name {
          font-size: 12.5px;
          font-weight: 500;
          color: #1a1d26;
          margin: 0 0 6px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cart__rec-price {
          font-size: 15px;
          font-weight: 800;
          color: #0f1117;
          margin-bottom: 8px;
        }
        .cart__rec-addbtn {
          width: 100%;
          height: 33px;
          background: transparent;
          border: 1.5px solid #c8a030;
          border-radius: 7px;
          color: #c8a030;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: background 0.2s, color 0.2s;
        }
        .cart__rec-addbtn:hover { background: #c8a030; color: #fff; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .cart__page { grid-template-columns: 1fr; }
          .cart__right { position: static; }
          .cart__rec-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .cart__topbar { padding: 0 16px; }
          .cart__page   { padding: 16px 16px 60px; }
          .cart__item   { grid-template-columns: 72px 1fr; gap: 12px; }
          .cart__item-right {
            grid-column: 1 / -1;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          .cart__rec { padding: 0 16px 60px; }
          .cart__rec-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

            <div className="cart">

                {/* ── TOPBAR ── */}
                <div className="cart__topbar">
                    <div className="cart__topbar-left">
                        <h1>My Cart</h1>
                        <span className="cart__topbar-count">{totalItems} ITEMS</span>
                    </div>
                    <Link to="/shop" className="cart__continue">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                        Continue Shopping
                    </Link>
                </div>

                {/* ── PAGE ── */}
                <div className="cart__page">

                    {/* LEFT */}
                    <div className="cart__left">

                        {items.length > 0 && (
                            <div className="cart__selbar">
                                <div className="cart__selbar-left">
                                    <input type="checkbox" className="cart__cb" defaultChecked />
                                    <span className="cart__sellabel">Select All</span>
                                    <span className="cart__selcount">({items.length} item{items.length !== 1 ? "s" : ""})</span>
                                </div>
                                <button className="cart__clearall" onClick={clearCartData}>
                                    Remove All
                                </button>
                            </div>
                        )}

                        {items.length === 0 ? (
                            <div className="cart__empty">
                                <div className="cart__empty-icon">🛒</div>
                                <h2>Your cart is empty</h2>
                                <p>Browse our collection and add something you love</p>
                                <Link to="/shop" className="cart__empty-cta">
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            items.map(item => (
                                <div key={item.id} className="cart__item">

                                    {/* Image */}
                                    <div className="cart__item-img-wrap">
                                        <img src={item.image} alt={item.name} />
                                    </div>

                                    {/* Info */}
                                    <div className="cart__item-info">
                                        <h3 className="cart__item-name">{item.name}</h3>

                                        <div className="cart__item-meta">
                                            <span className="cart__item-offtag">{item.discount}% off applied</span>
                                            {item.color && (
                                                <div className="cart__item-color-row">
                                                    <div className="cart__item-cdot" />
                                                    {item.color}
                                                </div>
                                            )}
                                        </div>

                                        <div className="cart__item-delivery">
                                            🚚 <b>Free delivery</b> by Tomorrow
                                        </div>

                                        <div className="cart__item-btns">
                                            <button
                                                className="cart__item-rm"
                                                onClick={() => removeItem(String(item.id))}
                                            >
                                                Remove
                                            </button>
                                            <div className="cart__item-sep" />
                                            <button className="cart__item-sl">
                                                Save for Later
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price + Qty */}
                                    <div className="cart__item-right">
                                        <div className="cart__item-pricewrap">
                                            <span className="cart__item-price">
                                                ₹{((item.discountedPrice || 0) * item.quantity).toLocaleString()}
                                            </span>
                                            <span className="cart__item-mrp">
                                                M.R.P <s>₹{((item.price || 0) * item.quantity).toLocaleString()}</s>
                                            </span>
                                        </div>

                                        <div className="cart__step">
                                            <button onClick={() => updateItemQuantity(String(item.id), item.quantity - 1)}>−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateItemQuantity(String(item.id), item.quantity + 1)}>+</button>
                                        </div>
                                    </div>

                                </div>
                            ))
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="cart__right">

                        {/* Coupon */}
                        <div className="cart__coupon">
                            <div className="cart__coupon-title">🏷️ Apply Coupon</div>
                            <div className="cart__coupon-row">
                                <input
                                    placeholder="Enter coupon code"
                                    value={coupon}
                                    onChange={e => {
                                        setCoupon(e.target.value)
                                        setCouponError("")
                                        setCouponApplied(false)
                                    }}
                                />
                                <button className="cart__coupon-btn" onClick={applyCoupon}>
                                    Apply
                                </button>
                            </div>
                            {couponApplied && (
                                <div className="cart__coupon-ok">✓ ELECTRON10 applied — 10% off!</div>
                            )}
                            {couponError && (
                                <div className="cart__coupon-err">✗ {couponError}</div>
                            )}
                            <div className="cart__coupon-hint">
                                Try <b>ELECTRON10</b> for 10% off
                            </div>
                        </div>

                        {/* Price breakdown */}
                        <div className="cart__pricebox">
                            <div className="cart__pricebox-title">Price Details</div>

                            <div className="cart__prow">
                                <span className="cart__plabel">
                                    Price ({items.reduce((s, i) => s + i.quantity, 0)} items)
                                </span>
                                <span className="cart__pval">₹{originalTotal.toLocaleString()}</span>
                            </div>

                            <div className="cart__prow">
                                <span className="cart__plabel">Discount</span>
                                <span className="cart__pval--g">− ₹{totalSaved.toLocaleString()}</span>
                            </div>

                            {couponApplied && (
                                <div className="cart__prow">
                                    <span className="cart__plabel">Coupon (ELECTRON10)</span>
                                    <span className="cart__pval--g">− ₹{couponDiscount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="cart__prow">
                                <span className="cart__plabel">Delivery</span>
                                <span className={delivery === 0 ? "cart__pval--g" : "cart__pval"}>
                                    {delivery === 0 ? "FREE" : `₹${delivery}`}
                                </span>
                            </div>

                            <div className="cart__pdivider" />

                            <div className="cart__ptotal">
                                <span className="cart__ptlabel">Total Amount</span>
                                <span className="cart__ptval">₹{grandTotal.toLocaleString()}</span>
                            </div>

                            {(totalSaved + couponDiscount) > 0 && (
                                <div className="cart__psaving">
                                    🎉 You're saving ₹{(totalSaved + couponDiscount).toLocaleString()} on this order!
                                </div>
                            )}
                        </div>

                        {/* Checkout button — navigates to /checkout */}
                        <button
                            className="cart__checkout"
                            disabled={items.length === 0}
                            onClick={() => navigate("/checkout")}
                        >
                            Proceed to Checkout →
                        </button>

                        {/* Trust badges */}
                        <div className="cart__trust">
                            {[
                                ["🔒", "100% Secure Payments"],
                                ["✅", "Genuine Products Only"],
                                ["🔄", "Easy 10-Day Returns"],
                                ["🚚", "Free Delivery on ₹50,000+"],
                            ].map(([icon, text]) => (
                                <div key={text} className="cart__trust-row">
                                    <span>{icon}</span>
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* ── RECOMMENDED ── */}
                {recommended.length > 0 && (
                    <div className="cart__rec">
                        <h2>You might also <span>like</span></h2>
                        <div className="cart__rec-grid">
                            {recommended.map(p => {
                                const dp = Math.round(p.price * 0.85)
                                return (
                                    <Link
                                        to={`/product/${p.id}`}
                                        key={p.id}
                                        className="cart__rec-card"
                                    >
                                        <div className="cart__rec-imgzone">
                                            <img src={p.image} alt={p.name} />
                                        </div>
                                        <div className="cart__rec-body">
                                            <p className="cart__rec-name">{p.name}</p>
                                            <div className="cart__rec-price">₹{dp.toLocaleString()}</div>
                                            <button
                                                className="cart__rec-addbtn"
                                                onClick={e => {
                                                    e.preventDefault()
                                                    addToCart(String(p.id), 1)
                                                }}
                                            >
                                                + Add to Cart
                                            </button>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}

            </div>
        </>
    )
}