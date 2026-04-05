import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { productService } from "../services/productService"
import type { Product } from "../services/productService"
import { useCartStore } from "../store/cartStore"

const categories = ["All", "Smartphones", "Laptops", "Audio"]

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
]

export default function Shop() {
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [sortBy, setSortBy] = useState("featured")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        let data: Product[]
        if (search.trim()) {
          // SQL Injection entry point: passing raw search term to API
          data = await productService.searchProducts(search)
        } else {
          data = await productService.getAllProducts()
        }
        setProducts(data)
      } catch (err) {
        console.error("Failed to fetch products:", err)
      } finally {
        setLoading(false)
      }
    }
    
    // Debounce search slightly for better UX, but still vulnerable
    const timer = setTimeout(loadProducts, 300)
    return () => clearTimeout(timer)
  }, [search])

  const filtered = useMemo(() => {
    let list = [...products]

    // Local filtering for category and sort (Backend could also do this)

    if (activeCategory !== "All") {
      list = list.filter(p => {
        const categoryMap: Record<string, string> = {
          "Smartphones": "phones",
          "Laptops": "laptops",
          "Audio": "audio"
        }
        return p.category === categoryMap[activeCategory]
      })
    }

    switch (sortBy) {
      case "price_asc": list.sort((a, b) => a.price - b.price); break
      case "price_desc": list.sort((a, b) => b.price - a.price); break
      case "newest":
        list.sort((a, b) => String(b.id).localeCompare(String(a.id))); break
    }

    return list
  }, [search, activeCategory, sortBy])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .sp {
          background: #eef1f6;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          color: #1a1d26;
          padding-top: 66px;
        }

        /* ── PAGE HEADER ── */
        .sp__header {
          background: #ffffff;
          border-bottom: 1.5px solid #e4eaf2;
          padding: 32px 40px 0;
        }
        .sp__header-inner {
          max-width: 1380px;
          margin: 0 auto;
        }
        .sp__header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .sp__title-block h1 {
          font-size: 1.8rem; font-weight: 800;
          color: #0f1117; margin: 0; letter-spacing: -0.5px;
        }
        .sp__title-block p {
          font-size: 13px; color: #6b7080; margin: 4px 0 0;
        }

        .sp__controls {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }

        /* Search */
        .sp__search {
          display: flex; align-items: center; gap: 10px;
          background: #f0f4f8; border: 1.5px solid #e4eaf2;
          border-radius: 10px; padding: 0 16px;
          height: 42px; width: 280px; cursor: text;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
        }
        .sp__search:focus-within {
          border-color: #c8a030;
          box-shadow: 0 0 0 3px rgba(200,160,48,0.1);
          background: #fff;
        }
        .sp__search svg { color: #9298a8; flex-shrink: 0; }
        .sp__search input {
          flex: 1; border: none; outline: none;
          background: transparent; font-size: 13.5px;
          font-family: 'Outfit', sans-serif; color: #1a1d26;
        }
        .sp__search input::placeholder { color: #9298a8; }

        /* Sort */
        .sp__sort {
          display: flex; align-items: center; gap: 8px;
        }
        .sp__sort-label {
          font-size: 11px; font-weight: 700; color: #9298a8;
          text-transform: uppercase; letter-spacing: 1.5px; white-space: nowrap;
        }
        .sp__sort select {
          height: 42px; padding: 0 36px 0 14px;
          background: #fff; border: 1.5px solid #e4eaf2;
          border-radius: 10px; font-size: 13.5px;
          font-family: 'Outfit', sans-serif; color: #1a1d26;
          outline: none; cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%236b7080' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          transition: border-color 0.25s;
        }
        .sp__sort select:focus { border-color: #c8a030; }

        /* Category tabs */
        .sp__cats {
          display: flex; gap: 0;
          overflow-x: auto; scrollbar-width: none;
        }
        .sp__cats::-webkit-scrollbar { display: none; }
        .sp__cat {
          padding: 12px 20px;
          font-size: 13.5px; font-weight: 500;
          color: #6b7080; border: none;
          background: transparent; cursor: pointer;
          white-space: nowrap;
          font-family: 'Outfit', sans-serif;
          border-bottom: 2.5px solid transparent;
          margin-bottom: -1.5px;
          transition: color 0.2s, border-color 0.2s;
        }
        .sp__cat:hover { color: #1a1d26; }
        .sp__cat--active {
          color: #c8a030 !important;
          border-bottom-color: #c8a030 !important;
          font-weight: 700;
        }

        /* ── MAIN ── */
        .sp__main {
          max-width: 1380px;
          margin: 0 auto;
          padding: 28px 40px 80px;
        }

        .sp__results-bar {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .sp__count { font-size: 13px; color: #6b7080; }
        .sp__count strong { color: #1a1d26; font-weight: 700; }

        /* ── GRID ── */
        .sp__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 18px;
        }

        @keyframes spFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── CARD ── */
        .sp__card-link {
          text-decoration: none; color: inherit; display: block;
        }
        .sp__card {
          background: #ffffff;
          border: 1.5px solid #e4eaf2;
          border-radius: 16px; overflow: hidden;
          display: flex; flex-direction: column;
          cursor: pointer; height: 100%;
          animation: spFadeUp 0.4s ease both;
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.2),
                      box-shadow 0.35s ease, border-color 0.3s;
        }
        .sp__card:hover {
          transform: translateY(-6px);
          border-color: rgba(200,160,48,0.45);
          box-shadow: 0 16px 48px rgba(15,17,23,0.11),
                      0 0 0 1px rgba(200,160,48,0.12),
                      0 4px 16px rgba(200,160,48,0.1);
        }

        /* Image zone */
        .sp__img-zone {
          position: relative;
          background: linear-gradient(135deg, #f8fafc, #f0f4f8);
          height: 200px;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          border-bottom: 1.5px solid #f0f4f8;
          overflow: hidden;
          transition: background 0.3s;
        }
        .sp__card:hover .sp__img-zone {
          background: linear-gradient(135deg, #f0f4f8, #e8eef6);
        }
        .sp__img-zone::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 110%,
            rgba(200,160,48,0.09) 0%, transparent 65%);
          opacity: 0; transition: opacity 0.4s;
        }
        .sp__card:hover .sp__img-zone::after { opacity: 1; }

        .sp__img {
          max-height: 100%; max-width: 100%; object-fit: contain;
          filter: drop-shadow(0 6px 16px rgba(15,17,23,0.1));
          transition: transform 0.45s cubic-bezier(.22,.68,0,1.2);
          position: relative; z-index: 1;
        }
        .sp__card:hover .sp__img { transform: scale(1.07) translateY(-4px); }

        /* Discount badge */
        .sp__disc {
          position: absolute; top: 12px; left: 12px; z-index: 2;
          background: #e63946; color: #fff;
          font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
          padding: 3px 9px; border-radius: 5px;
        }

        /* Wishlist */
        .sp__wish {
          position: absolute; top: 10px; right: 10px; z-index: 2;
          width: 32px; height: 32px; border-radius: 50%;
          background: #fff; border: 1.5px solid #e4eaf2;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0;
          transition: opacity 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .sp__card:hover .sp__wish { opacity: 1; }
        .sp__wish:hover {
          border-color: #e63946;
          box-shadow: 0 2px 8px rgba(230,57,70,0.15);
        }
        .sp__wish svg { color: #9298a8; transition: color 0.2s; }
        .sp__wish:hover svg { color: #e63946; }

        /* Body */
        .sp__body {
          padding: 14px 16px 18px;
          display: flex; flex-direction: column;
          gap: 8px; flex: 1;
        }
        .sp__name {
          font-size: 13.5px; font-weight: 500;
          color: #1a1d26; line-height: 1.45; margin: 0;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .sp__rating { display: flex; align-items: center; gap: 5px; }
        .sp__stars  { display: flex; gap: 1px; }
        .sp__rcount { font-size: 11.5px; color: #9298a8; }

        .sp__prices {
          display: flex; align-items: baseline;
          flex-wrap: wrap; gap: 7px; margin-top: 2px;
        }
        .sp__price {
          font-size: 20px; font-weight: 800;
          color: #0f1117; letter-spacing: -0.5px;
        }
        .sp__mrp { font-size: 11.5px; color: #9298a8; }

        .sp__save {
          width: fit-content; font-size: 11px; font-weight: 600;
          color: #1a8a4a; background: #edfaf3;
          border: 1px solid #c6f0d8;
          padding: 2px 9px; border-radius: 5px;
        }

        .sp__actions { display: flex; gap: 8px; margin-top: 6px; }
        .sp__btn-cart {
          flex: 1; height: 37px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: transparent;
          border: 1.5px solid #c8a030; border-radius: 9px;
          color: #c8a030; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .sp__btn-cart:hover {
          background: rgba(200,160,48,0.08);
          box-shadow: 0 2px 10px rgba(200,160,48,0.2);
        }
        .sp__btn-buy {
          flex: 1; height: 37px;
          background: linear-gradient(135deg, #d4a820, #c8a030);
          border: none; border-radius: 9px;
          color: #fff; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          box-shadow: 0 3px 10px rgba(200,160,48,0.3);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .sp__btn-buy:hover {
          opacity: 0.9; box-shadow: 0 5px 18px rgba(200,160,48,0.4);
        }
        .sp__btn-buy:active { transform: scale(0.97); }

        /* Empty */
        .sp__empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 20px; gap: 12px; text-align: center;
        }
        .sp__empty-icon { font-size: 48px; opacity: 0.4; }
        .sp__empty h3 { font-size: 1.1rem; font-weight: 600; color: #4a4f60; margin: 0; }
        .sp__empty p  { font-size: 13px; color: #9298a8; margin: 0; }

        @media (max-width: 768px) {
          .sp__header    { padding: 24px 16px 0; }
          .sp__header-top{ flex-direction: column; align-items: flex-start; }
          .sp__search    { width: 100%; }
          .sp__main      { padding: 20px 16px 60px; }
          .sp__grid      { grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap:12px; }
        }
      `}</style>

      <div className="sp">

        {/* ── HEADER ── */}
        <div className="sp__header">
          <div className="sp__header-inner">
            <div className="sp__header-top">

              <div className="sp__title-block">
                <h1>Shop All Products</h1>
                <p>Explore our full collection of premium electronics</p>
              </div>

              <div className="sp__controls">
                <label className="sp__search">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    placeholder="Search products…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </label>

                <div className="sp__sort">
                  <span className="sp__sort-label">Sort</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    {sortOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Category tabs */}
            <div className="sp__cats">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`sp__cat ${activeCategory === cat ? "sp__cat--active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="sp__main">
          <div className="sp__results-bar">
            <p className="sp__count">
              Showing <strong>{filtered.length}</strong> products
              {activeCategory !== "All" && <> in <strong>{activeCategory}</strong></>}
              {search && (
                <> for <strong dangerouslySetInnerHTML={{ __html: `"${search}"` }}></strong></>
              )}
            </p>
          </div>

          <div className="sp__grid">
            {loading ? (
              <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "center", padding: "40px" }}>
                <div style={{ width: 30, height: 30, border: "3px solid #c8a030", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="sp__empty">
                <div className="sp__empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try a different search term or category</p>
              </div>
            ) : (
              filtered.map((p, i) => {
                const discount = 15
                const discountedPrice = Math.round(p.price - (p.price * discount) / 100)
                const saved = p.price - discountedPrice

                return (
                  <Link
                    to={`/product/${p.id}`}
                    key={p.id}
                    className="sp__card-link"
                    style={{ animationDelay: `${Math.min(i, 12) * 50}ms` }}
                  >
                    <div className="sp__card">

                      <div className="sp__img-zone">
                        <span className="sp__disc">−{discount}%</span>

                        <button
                          className="sp__wish"
                          onClick={e => e.preventDefault()}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>

                        <img src={p.image} alt={p.name} className="sp__img" loading="lazy" />
                      </div>

                      <div className="sp__body">
                        <h3 className="sp__name">{p.name}</h3>

                        <div className="sp__rating">
                          <div className="sp__stars">
                            {[1, 2, 3, 4, 5].map(s => (
                              <svg key={s} width="11" height="11" viewBox="0 0 24 24"
                                fill={4 >= s ? "#c8a030" : "none"}
                                stroke="#c8a030" strokeWidth="2.2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </div>
                          <span className="sp__rcount">
                            ({Math.floor(((Number(p.id) * 137) % 800) + 50)})
                          </span>
                        </div>

                        <div className="sp__prices">
                          <span className="sp__price">₹{discountedPrice.toLocaleString()}</span>
                          <span className="sp__mrp">M.R.P <s>₹{p.price.toLocaleString()}</s></span>
                        </div>

                        <span className="sp__save">
                          You save ₹{saved.toLocaleString()}
                        </span>

                        <div className="sp__actions">
                          <button
                            className="sp__btn-cart"
                            onClick={e => {
                              e.preventDefault()
                              addToCart(String(p.id), 1)
                            }}
                          >
                            Add to Cart
                          </button>
                          <button
                            className="sp__btn-buy"
                            onClick={e => {
                              e.preventDefault()
                              addToCart(String(p.id), 1)
                              navigate("/cart")
                            }}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>

                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

      </div>
    </>
  )
}