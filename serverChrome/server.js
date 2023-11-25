const express = require('express')

const app = express()
const port = 3000

let messageQueue = []

app.use(express.json())


app.post('/sendMessage', (req, res) => {
  messageQueue.push(req.body.message)
  console.log("New message to the queue")
  res.sendStatus(200)
})

app.get('/getMessages', (req, res) => {
  const waitForMessage = () => {
    if (messageQueue.length > 0) {
      console.log("A message has been query")
      res.json({ message: messageQueue.shift() })
    } else {
      setTimeout(waitForMessage, 1000)
    }
  }
  waitForMessage();
})

app.listen(port, () => console.log(`Server listening on port ${port}`))
