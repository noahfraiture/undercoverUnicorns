const express = require('express')
const fetch = require('node-fetch')

const app = express()
const port = 3000
const server_port = 5000

// string: List
let chromeQueue = new Map()
let vscodeQueue = new Map()

app.use(express.json())


app.post('/sendMessage/chrome', (req, res) => {
  const message = req.body.message
  const user = req.body.user
  let lastList = chromeQueue.get(user)
  if (!lastList) {
    lastList = []
    chromeQueue.set(user, lastList)
  }
  lastList.push(message)
  console.log("New message to the chromeQueue: " + message)
  res.sendStatus(200)
})

app.post('/sendMessage/vscode', (req, res) => {
  const message = req.body.message
  const user = req.body.user
  let lastList = vscodeQueue.get(user)
  if (!lastList) {
    lastList = []
    vscodeQueue.set(user, lastList)
  }
  lastList.push(message)
  console.log("New message to the vscodeQueue: " + message)
  res.sendStatus(200)
})

app.post('/addScore', (req, res) => {
  const user = req.body.user
  const score = req.body.score
  console.log("New score for user " + user + ": " + score)
  res.sendStatus(200)

  // Send score to the server
  fetch('http://localhost:' + server_port + '/score', {
    method: 'post',
    body: JSON.stringify({
      user: user,
      score: score
    }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => console.log(res.status))
})

app.get('/getMessages/chrome', (req, res) => {
  const user = req.query.user
  console.log("User " + user + " is querying for chrome messages")

  if (!chromeQueue.has(user)) {
    chromeQueue.set(user, [])
  }

  let queue = chromeQueue.get(user)
  const waitForMessage = () => {
    if (queue.length > 0) {
      res.json({ message: queue.shift() })
      console.log("Query chrome served for user " + user)
    } else {
      setTimeout(waitForMessage, 1000)
    }
  }
  waitForMessage();
})

app.get('/getMessages/vscode', (req, res) => {
  const user = req.query.user
  console.log("User " + user + " is querying for vscode messages")

  if (!vscodeQueue.has(user)) {
    vscodeQueue.set(user, [])
  }

  let queue = vscodeQueue.get(user)
  const waitForMessage = () => {
    if (queue.length > 0) {
      res.json({ message: queue.shift() })
      console.log("Query vscode served for user " + user)
    } else {
      setTimeout(waitForMessage, 1000)
    }
  }
  waitForMessage();
})

app.listen(port, () => console.log(`Server listening on port ${port}`))

