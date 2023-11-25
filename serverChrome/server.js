const express = require('express')

const app = express()
const port = 3000

// string: List
let messageQueue = new Map()

app.use(express.json())


app.post('/sendMessage', (req, res) => {
  const message = req.body.message
  const user = req.body.user
  let lastList = messageQueue.get(user)
  if (!lastList) {
    lastList = []
    messageQueue.set(user, lastList)
  }
  lastList.push(message) // TODO : does it push well ?
  console.log("New message to the queue: " + message)
  res.sendStatus(200)
})

app.get('/getMessages', (req, res) => {
  const user = req.query.user
  console.log("User " + user + " is querying for messages")

  if (!messageQueue.has(user)) {
    messageQueue.set(user, [])
  }

  let queue = messageQueue.get(user)
  const waitForMessage = () => {
    if (queue.length > 0) {
      res.json({ message: queue.shift() }) // TODO : does it pop well ?
      console.log("Query served for user " + user)
    } else {
      setTimeout(waitForMessage, 1000)
    }
  }
  waitForMessage();
})

app.listen(port, () => console.log(`Server listening on port ${port}`))
