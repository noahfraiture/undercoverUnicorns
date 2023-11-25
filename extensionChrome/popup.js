document.addEventListener("DOMContentLoaded", function () {
  // Fetch and display cumulative time
  chrome.storage.sync.get("pageLoaded").then((result) => {
    const pageLoaded = result.pageLoaded 
    document.getElementById("pageLoaded").innerText = pageLoaded;
  });
});
