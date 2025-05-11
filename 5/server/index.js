const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/products', (req, res) => {
  res.json([
    { id: 1, name: 'Stół', price: 200 },
    { id: 2, name: 'Krzesło', price: 100 }
  ])
})

app.post('/payments', (req, res) => {
  console.log('Płatność otrzymana:', req.body)
  res.status(200).send('OK')
})

app.listen(3000, () => console.log('Server działa na porcie 3000'))
