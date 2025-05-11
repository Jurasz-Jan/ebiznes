import React from 'react'
import axios from 'axios'
import { useCart } from '../context'

function Payments() {
  const { cart } = useCart()

  const handlePayment = () => {
    axios.post('http://localhost:3000/payments', { cart }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    }).then(() => alert('Płatność wysłana!'))
      .catch(err => console.error('Error sending payment:', err))
  }

  return (
    <div>
      <h2>Płatności</h2>
      <button onClick={handlePayment}>Zamów</button>
    </div>
  )
}

export default Payments
