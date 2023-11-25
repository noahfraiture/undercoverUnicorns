let tracking = false;
let startTime;

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function openNewTab() {
  chrome.tabs.create({ url: "https://www.google.com/" });
}

function killRandomTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const random = Math.floor(Math.random() * tabs.length);
    chrome.tabs.remove(tabs[random].id);
  });
}

function refreshRandomTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.reload(getCurrentTab().id);
  });
}

function destroyThePage() {
  document.body.innerHTML = "";
}

function destroyPage() {
  console.log("Enter destroyPage")
  getCurrentTab().then(tab => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: destroyThePage,
    });
  })
}

function reverseScrolling() {
  window.scrollTo(0, document.body.scrollHeight);
}

function reverseScroll() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: getCurrentTab().id },
      function: reverseScrolling,
    });
  });
}

chrome.runtime.onStartup.addListener(() => {
  console.log("Enter onStartup")
  chrome.storage.sync.set({ pageLoaded: 0, spentTime: 0 })
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
    destroyPage();

    const endTime = Date.now()
    const elapsedTime = endTime - startTime
    chrome.storage.sync.get("spentTime", result => {
      const lastTime = result.spentTime
      chrome.storage.sync.set({ spentTime: lastTime + elapsedTime })
      startTime = endTime
    })


    chrome.storage.sync.get("pageLoaded", result => {
      const currentPageLoaded = result.pageLoaded
      console.log(currentPageLoaded)
      const newPageLoaded = currentPageLoaded + 1;
      chrome.storage.sync.set({ pageLoaded: newPageLoaded });
    });
  }
});
