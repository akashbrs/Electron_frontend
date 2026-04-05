import { Link } from "react-router-dom"
import { useCartStore } from "../../store/cartStore"

interface Product {
  id: number | string
  name: string
  price: number
  image: string
  discount?: number
  discountedPrice?: number
  rating?: number
  reviewCount?: number
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const { addToCart } = useCartStore()

  return (
    <>
      <div className="pg__grid">
        {products.map((p, i) => {
          const discount        = p.discount ?? 15
          const discountedPrice = p.discountedPrice ?? Math.round(p.price - (p.price * discount) / 100)
          const saved           = p.price - discountedPrice
          const reviewCount     = p.reviewCount ?? Math.floor(((Number(p.id) * 137) % 800) + 50)

          return (
            <article
              key={p.id}
              className="pg__card"
              style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }}
            >
              {discount > 0 && (
                <span className="pg__disc">−{discount}%</span>
              )}

              {/* ONLY the image zone is clickable as a link */}
              <Link to={`/product/${p.id}`} className="pg__img-link">
                <div className="pg__img-zone">
                  <img src={p.image} alt={p.name} className="pg__img" loading="lazy" />
                  <div className="pg__glow" />
                </div>
              </Link>

              <div className="pg__body">

                {/* Name also links to product */}
                <Link to={`/product/${p.id}`} className="pg__name-link">
                  <h3 className="pg__name">{p.name}</h3>
                </Link>

                <div className="pg__rating">
                  <div className="pg__stars">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="11" height="11" viewBox="0 0 24 24"
                        fill={(p.rating ?? 4) >= s ? "#c8a030" : "none"}
                        stroke="#c8a030" strokeWidth="2.2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <span className="pg__count">({reviewCount})</span>
                </div>

                <div className="pg__price-block">
                  <span className="pg__price">₹{discountedPrice.toLocaleString()}</span>
                  <span className="pg__mrp">M.R.P <s>₹{p.price.toLocaleString()}</s></span>
                </div>

                <span className="pg__save">You save ₹{saved.toLocaleString()}</span>

                <div className="pg__actions">
                  <button
                    className="pg__btn-cart"
                    onClick={() => {
                      addToCart(String(p.id), 1)
                    }}
                  >
                    Add to Cart
                  </button>

                  <button
                    className="pg__btn-buy"
                    onClick={() => {
                      addToCart(String(p.id), 1)
                    }}
                  >
                    Buy Now
                  </button>
                </div>

              </div>
            </article>
          )
        })}
      </div>

      <style>{`
        @keyframes pgFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pg__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 18px;
        }

        .pg__card {
          position: relative;
          background: #ffffff;
          border: 1.5px solid #e4eaf2;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          animation: pgFadeUp 0.45s ease both;
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.2),
                      box-shadow 0.35s ease, border-color 0.3s;
        }
        .pg__card:hover {
          transform: translateY(-6px);
          border-color: rgba(200,160,48,0.45);
          box-shadow: 0 16px 48px rgba(15,17,23,0.11),
                      0 0 0 1px rgba(200,160,48,0.12);
        }

        .pg__disc {
          position: absolute;
          top: 12px; left: 12px; z-index: 2;
          background: #e63946; color: #fff;
          font-size: 10px; font-weight: 700;
          padding: 3px 9px; border-radius: 5px;
        }

        /* Image link — full width, no underline */
        .pg__img-link {
          display: block;
          text-decoration: none;
        }

        .pg__img-zone {
          position: relative;
          background: linear-gradient(135deg, #f8fafc, #f0f4f8);
          height: 192px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border-bottom: 1.5px solid #f0f4f8;
          overflow: hidden;
          transition: background 0.3s;
        }
        .pg__img-link:hover .pg__img-zone {
          background: linear-gradient(135deg, #f0f4f8, #e8eef6);
        }
        .pg__img-zone::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 110%,
            rgba(200,160,48,0.09) 0%, transparent 65%);
          opacity: 0; transition: opacity 0.4s;
        }
        .pg__img-link:hover .pg__img-zone::after { opacity: 1; }

        .pg__img {
          max-height: 100%; max-width: 100%;
          object-fit: contain;
          filter: drop-shadow(0 6px 16px rgba(15,17,23,0.1));
          transition: transform 0.45s cubic-bezier(.22,.68,0,1.2);
          position: relative; z-index: 1;
        }
        .pg__img-link:hover .pg__img { transform: scale(1.07) translateY(-4px); }

        .pg__glow {
          position: absolute; bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 55%; height: 18px;
          background: rgba(200,160,48,0.18);
          filter: blur(14px); border-radius: 50%;
          opacity: 0; transition: opacity 0.4s;
        }
        .pg__img-link:hover .pg__glow { opacity: 1; }

        .pg__body {
          padding: 14px 16px 18px;
          display: flex; flex-direction: column;
          gap: 8px; flex: 1;
        }

        /* Name link */
        .pg__name-link { text-decoration: none; }
        .pg__name {
          font-size: 13.5px; font-weight: 500;
          color: #1a1d26; line-height: 1.45; margin: 0;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          transition: color 0.2s;
        }
        .pg__name-link:hover .pg__name { color: #c8a030; }

        .pg__rating { display: flex; align-items: center; gap: 5px; }
        .pg__stars  { display: flex; gap: 1px; }
        .pg__count  { font-size: 11.5px; color: #9298a8; }

        .pg__price-block {
          display: flex; align-items: baseline;
          flex-wrap: wrap; gap: 7px; margin-top: 2px;
        }
        .pg__price {
          font-size: 20px; font-weight: 800;
          color: #0f1117; letter-spacing: -0.5px;
          font-family: 'Outfit', sans-serif;
        }
        .pg__mrp { font-size: 11.5px; color: #9298a8; }

        .pg__save {
          width: fit-content;
          font-size: 11px; font-weight: 600;
          color: #1a8a4a; background: #edfaf3;
          border: 1px solid #c6f0d8;
          padding: 2px 9px; border-radius: 5px;
        }

        .pg__actions { display: flex; gap: 8px; margin-top: 6px; }

        .pg__btn-cart {
          flex: 1; height: 37px;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          border: 1.5px solid #c8a030; border-radius: 9px;
          color: #c8a030; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .pg__btn-cart:hover {
          background: rgba(200,160,48,0.08);
          box-shadow: 0 2px 10px rgba(200,160,48,0.2);
        }

        .pg__btn-buy {
          flex: 1; height: 37px;
          background: linear-gradient(135deg, #d4a820, #c8a030);
          border: none; border-radius: 9px;
          color: #fff; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          box-shadow: 0 3px 10px rgba(200,160,48,0.3);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .pg__btn-buy:hover {
          opacity: 0.9;
          box-shadow: 0 5px 18px rgba(200,160,48,0.4);
        }
        .pg__btn-buy:active { transform: scale(0.97); }
      `}</style>
    </>
  )
}