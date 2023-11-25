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
  lastList.push(message) // TODO : does it push well ?
  console.log("New message to the queue")
  res.sendStatus(200)
})

app.get('/getMessages', (req, res) => {
  const user = req.query.user
  let queue = messageQueue.get(user)
  const waitForMessage = () => {
    if (queue.length > 0) {
      console.log("A message has been query")
      res.json({ message: queue.shift() }) // TODO : does it pop well ?
    } else {
      setTimeout(waitForMessage, 1000)
    }
  }
  waitForMessage();
})

app.listen(port, () => console.log(`Server listening on port ${port}`))
