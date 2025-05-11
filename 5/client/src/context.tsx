import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext<{
  cart: unknown[]
  addToCart: (item: unknown) => void
} | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<unknown[]>([])

  const addToCart = (item: unknown) => setCart(prev => [...prev, item])

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
