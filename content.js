chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract") {
    sendLogToPopup("Extracting images...");
    const images = Array.from(
      document.querySelectorAll("img.preso-view.page-view")
    );
    const dataUrls = images.map((img) => img.dataset.url);
    sendLogToPopup("Found " + dataUrls.length + " images");

    fetchImages(dataUrls);
    sendLogToPopup("Fetching images...");
  } else {
    console.log("Received unknown action:", request.action);
  }
});

async function fetchImages(urls) {
  const directUrls = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, { credentials: "include" });
      const data = await response.json();
      if (data.directImageUrl) {
        directUrls.push(data.directImageUrl);
      }
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
    }
  }

  // Send the directUrls to the background script
  chrome.runtime.sendMessage({ action: "processUrls", urls: directUrls });
}

function sendLogToPopup(message, ...args) {
  const msg = message + " " + args.join(" ");
  console.log("Sending log to popup:", msg);
  chrome.runtime.sendMessage({ type: "log", content: msg });
}
