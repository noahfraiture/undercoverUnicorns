let tracking = false;
const proxy_url = "http://192.168.60.205:3000/getMessages/chrome";
const proxy_score = "http://192.168.60.205:3000/addScore";
const user = "Noah";
let startTime;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getCurrentTab() { // Sometime getCurrentTab() return undefined idk why
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function openNewTab(url) {
  chrome.tabs.create({ url: url});
}

function killRandomTab() {
  chrome.tabs.query({ currentWindow: true }, async function (tabs) {
    const random = Math.floor(Math.random() * tabs.length);
    const tab = tabs[random];
    while (tab === undefined) { await sleep(1000)}
    chrome.tabs.remove(tab.id);
  });
}

function refreshTab() { 
  getCurrentTab().then(tab => {
    chrome.tabs.reload(tab.id)
  })
}

function destroyThePage() {
  document.body.innerHTML = "";
}

let destroy_counter;

function destroyPage() {
  console.log("Enter destroyPage")
  getCurrentTab().then(tab => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: destroyThePage,
    });
  })
}

function changeTab() {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    const random = Math.floor(Math.random() * tabs.length)
    chrome.tabs.update(tabs[random].id, {active:true, highlighted:true})
  })
}

function pollServer() {
  console.log("Enter pollServer")
  fetch(`${proxy_url}?user=${user}`)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      if (data.message) {
        const message_parts = data.message.split(' ')
        switch (message_parts[0]) {
          case 'destroy':
            destroy_counter = +message_parts[1]
            break;
          case 'killRandomTab':
            for (let i = 0; i < +message_parts[1]; i++) {
              killRandomTab()
            }
            break
          case 'openNewTab':
            openNewTab(message_parts[1])
            break
          case 'refreshTab':
            refreshTab()
            break
          case 'changeTab':
            changeTab()
            break
          default:
            break;
        }
        console.log('Received message from server:', data.message)
      }
      pollServer()
    })
    .catch(async err => {
      console.log('Error polling server. ', err)
      await sleep(2000)
      pollServer()
    })
}

chrome.runtime.onStartup.addListener(() => {
  console.log("Enter onStartup")
  chrome.storage.sync.set({ pageLoaded: 0, spentTime: 0 })
  pollServer()
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "startTracking") {
    tracking = true;
  } else if (request.message === "stopTracking") {
    tracking = false;
  }
});

const batchSize = 10;
let batchCounter = 0;

chrome.webNavigation.onCompleted.addListener(details => {


  if (tracking) {
    if (details.url != "about:blank") {
      console.log(`User visited: ${details.url}`);
    }

    if (destroy_counter) {
      destroyPage()
      destroy_counter--;
    }

    const endTime = Date.now()
    const elapsedTime = endTime - startTime
    chrome.storage.sync.get("spentTime", result => {
      const lastTime = result.spentTime || 0
      chrome.storage.sync.set({ spentTime: lastTime + elapsedTime })
      startTime = endTime
    })


    chrome.storage.sync.get("pageLoaded", result => {
      const currentPageLoaded = result.pageLoaded || 0
      const newPageLoaded = currentPageLoaded + 1;
      chrome.storage.sync.set({ pageLoaded: newPageLoaded });
    });
    batchCounter++;
    if (batchCounter >= batchSize) {
      console.log("Sending count to server...")
      const data = { "user":user, "score":batchCounter }
      console.log(data)
      fetch(proxy_score, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      })
        .then(res => {
          console.log(res.status)
        })
        .catch(err => {
          console.log('Error:', err);
        });
    batchCounter = 0;
    }
  }
});
