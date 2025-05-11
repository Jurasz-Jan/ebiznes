import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useCart } from '../context'

interface Product {
  id: number
  name: string
  price: number
}

function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const { addToCart } = useCart()

  useEffect(() => {
    axios.get<Product[]>('http://localhost:3000/products', {
      headers: { 'Access-Control-Allow-Origin': '*' }
    }).then(res => setProducts(res.data))
  }, [])

  return (
    <div>
      <h2>Produkty</h2>
      {products.map(p => (
        <div key={p.id}>
          {p.name} - {p.price} zł
          <button onClick={() => addToCart(p)}>Dodaj do koszyka</button>
        </div>
      ))}
    </div>
  )
}

export default Products
