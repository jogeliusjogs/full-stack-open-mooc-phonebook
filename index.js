const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms :body'));

let phone_records = [
  {
    id: 1,
    name: "Jogelius Jogs",
    number: "123456789"
  },
  {
    id: 2,
    name: "Hugh Jass",
    number: "666777888"
  },
  {
    id: 3,
    name: "Al Cohol",
    number: "534876098"
  }
]

function getRandomInt() {
  const max = 1000000
  return Math.floor(Math.random() * Math.floor(max));
}

const generateId = () => {
  return getRandomInt()
}

app.get('/api/persons', (req, res) => {
  res.json(phone_records)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const phone_record = phone_records.find(record => record.id === id)
  
  if (phone_record) {
    res.json(phone_record)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  phone_records = phone_records.filter(record => record.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  var error = null
  if (!body.name) {
    error = 'name is missing'
  } else if (!body.number) {
    error = 'number is missing'
  } else if (phone_records.findIndex(rec => rec.name === body.name) >= 0) {
    error = 'name has already been added'
  }

  if (error != null) {
    return res.status(400).json({ 
      error: error
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  phone_records = phone_records.concat(person)
  res.json(person)
})

app.get('/info', (req, res) => {
    res.send('Phonebook has info for ' + phone_records.length + ' people' + '<br/><br/>' + new Date())
  })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})