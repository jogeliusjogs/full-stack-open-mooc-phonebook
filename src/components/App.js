import React, { useState, useEffect } from 'react'
import personService from './../services/persons'

const Notification = (props) => {
  const notificationStyle = {
    color: 'green',
    background: 'lightgrey',
    fontSize: 16,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }
  if (props.message === null || props.message === '') {
    return null
  }

  return (
    <div style={notificationStyle}>
      {props.message}
    </div>
  )
}

const PersonForm = (props) => {
  return (
    <form onSubmit={props.addPerson}>
      <div>
        name: <input value={props.newName} onChange={props.handleNameInputChange}></input>
      </div>
      <div>
        number: <input value={props.newNumber} onChange={props.handleNumberInputChange}></input>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Filter = (props) => {
  return (
    <div>
      filter shown with: <input value={props.nameFilter} onChange={props.handleNameFilterChange}></input>
    </div>
  )
}

const Person = (props) => {
  const removePersonOnConfirm = () => {
    let result = window.confirm('Delete ' + props.name + ' ?')
    if (result) {
      props.removePerson(props.id)
    }
  }
  return (
    <div>
      <p>{props.name} {props.number}</p><button onClick={() => removePersonOnConfirm()}>delete</button>
    </div>
  )
}

const Persons = (props) => {
  return (
    props.persons.map(person => {
      let personNameLowerCase = person.name.toLocaleLowerCase()
      let nameFilterLowerCase = props.nameFilter.toLocaleLowerCase()

      if (personNameLowerCase.indexOf(nameFilterLowerCase) >= 0) {
        return (
          <Person key={person.id} id={person.id} name={person.name} number={person.number} removePerson={props.removePerson}/>
        )
      }
      return (null)
    })
  )
}

const App = () => {
  const [ persons, setPersons] = useState([])
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber ] = useState('')
  const [ nameFilter, setNameFilter] = useState('')
  const [ notificationMessage, setNotificationMessage] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(response => {
        setPersons(response)
      })
  }, [])

  const timeoutNotificationMessage = () => {
    setTimeout(() => {
      setNotificationMessage(null)
    }, 5000)
  }

  const addPerson = (event) => {
    event.preventDefault()
    const newPersonObject = {name : newName, number : newNumber}
    let existingPersonWithSameNameIndex = persons.findIndex(person =>
      person.name.localeCompare(newPersonObject.name) === 0)
    if (existingPersonWithSameNameIndex < 0) {
      personService
        .create(newPersonObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          setNotificationMessage('Added ' + returnedPerson.name)
          timeoutNotificationMessage()
        })
        .catch(error => {
          console.log(error.response.data)
          setNotificationMessage(error.response.data.error)
          timeoutNotificationMessage()
        })
    } else {
      let replaceOldPhoneNumber = window.confirm(newName + ' is already added to phonebook, replace the old number with a new one?')
      if (replaceOldPhoneNumber) {
        personService
          .update(persons[existingPersonWithSameNameIndex].id, newPersonObject)
          .then(updatedPerson => {
            let personsUpdated = [...persons]
            personsUpdated[existingPersonWithSameNameIndex] = updatedPerson
            setPersons(personsUpdated)
            setNewName('')
            setNewNumber('')
            setNotificationMessage('Updated phone number for ' + updatedPerson.name)
            timeoutNotificationMessage()
          })
      }
    }
  }

  const removePerson = (id) => {
    let index = persons.findIndex(person => person.id === id)
    personService
      .remove(id)
      .then(() => {  
        if (index > -1) {
          let personsCopy = [...persons]
          let removedPersonName = personsCopy[index].name
          personsCopy.splice(index, 1)
          setPersons(personsCopy)
          setNotificationMessage('Removed ' + removedPersonName)
          timeoutNotificationMessage()
        }
      })
      .catch(() => {
        setNotificationMessage('Information of ' + persons[index].name + ' has already been removed from the server')
        timeoutNotificationMessage()
        setPersons(persons.filter(person => person.id !== id))
      })
  }

  const handleNameInputChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberInputChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleNameFilterChange = (event) => {
    setNameFilter(event.target.value)
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notificationMessage}/>
      <Filter nameFilter={nameFilter} handleNameFilterChange={handleNameFilterChange}/>
      <h3>add a new</h3>
      <PersonForm 
        addPerson={addPerson}
        newName={newName}
        handleNameInputChange={handleNameInputChange}
        newNumber={newNumber}
        handleNumberInputChange={handleNumberInputChange}/>
      <h3>Numbers</h3>
      <Persons persons={persons} nameFilter={nameFilter} removePerson={removePerson}/>
    </div>
  )

}

export default App