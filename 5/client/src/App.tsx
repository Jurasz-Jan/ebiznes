import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Products from './components/Products'
import Payments from './components/Payments'
import Cart from './components/Cart'
import { CartProvider } from './context'



function App() {
  return (
    <CartProvider>
      <nav>
        <Link to="/">Produkty</Link> | 
        <Link to="/cart">Koszyk</Link> | 
        <Link to="/payments">Płatności</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payments" element={<Payments />} />
      </Routes>
    </CartProvider>
  )
}

export default App
