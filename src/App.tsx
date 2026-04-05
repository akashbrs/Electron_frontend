import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { useAuthStore } from "./store/authStore"
import { useCartStore } from "./store/cartStore"

import Navbar from "./components/layout/Navbar"


import Home from "./pages/Home"
import Shop from "./pages/Shop"
import Cart from "./pages/Cart"
import ProductDetail from "./pages/ProductDetail"
import ElectronPayment from "./pages/ElectronPayment"
import Auth from "./pages/Auth"

export default function App() {

  const location = useLocation()
  const { fetchProfile, isAuthenticated } = useAuthStore()
  const { fetchCart } = useCartStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
      fetchCart()
    }
  }, [isAuthenticated, fetchProfile, fetchCart])

  return (
    <>
      {/* Hide navbar on auth page */}
      {location.pathname !== "/auth" && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<ElectronPayment />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>


    </>
  )
}