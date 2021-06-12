require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms :body'));

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id).then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = request.body

  const updatedPerson = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, updatedPerson).then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
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
    next(error)
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(response => {
    console.log('person saved!')
    res.json(person)
  })
  
})

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    res.send('Phonebook has info for ' + persons.length + ' people' + '<br/><br/>' + new Date())
  })
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
  
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})