import { useParams } from "react-router-dom"
import ProductGrid from "../components/products/ProductGrid"
import { products } from "../data/product"

export default function Category() {
  const { categoryName } = useParams()

  const filteredProducts = products.filter(
    (product) => product.category === categoryName
  )

  return (
    <div style={{ padding: "60px 40px" }}>
      <h2>{categoryName?.toUpperCase()} Products</h2>

      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <p>No products found.</p>
      )}
    </div>
  )
}