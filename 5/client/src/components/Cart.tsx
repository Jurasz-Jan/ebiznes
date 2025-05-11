import React from 'react'
import { useCart } from '../context'

interface Product {
  id: number
  name: string
  price: number
}

function Cart() {
  const { cart } = useCart()

  return (
    <div>
      <h2>Koszyk</h2>
      {cart.length === 0 ? (
        <p>Koszyk jest pusty.</p>
      ) : (
        cart.map((item: Product, index: number) => (
          <div key={index}>
            {item.name} - {item.price} zł
          </div>
        ))
      )}
    </div>
  )
}

export default Cart
