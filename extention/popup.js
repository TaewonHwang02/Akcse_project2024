document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length === 0) {
      document.getElementById('transcript').textContent = 'No active tab found.';
      return;
    }

    let activeTab = tabs[0];
    let activeTabURL = activeTab.url;

    if (activeTabURL.includes('youtube.com/watch') || activeTabURL.includes('youtu.be')) {
      // Pass activeTab.id into fetchTranscript
      fetchTranscript(activeTabURL, activeTab.id);
    } else {
      document.getElementById('transcript').textContent = 'This is not a YouTube video URL.';
    }
  });
});

// Modified fetchTranscript to accept tabId
function fetchTranscript(url, tabId) {
  console.log('fetchTranscript function called with URL:', url);

  fetch('http://127.0.0.1:5000/transcript', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
  .then(response => {
    console.log('Fetch response received:', response);
    return response.json();
  })
  .then(data => {
    console.log("Response data:", data);
    const title = data.title; //|| data.video?.title;
    document.getElementById('title').textContent = title;
    if (data.transcript) {
      // If transcript exists, handle it here
      console.log("Transcript available, displaying title and transcript.");
      document.getElementById('transcript').textContent = data.transcript;
      document.getElementById('download').style.display = 'block';
      document.getElementById('download').onclick = function() {
        downloadTranscript(title, data.transcript);
      };
    } else {
      console.log("No transcript available, displaying only title.");
      document.getElementById('transcript').textContent = ""; // Clear any existing transcript text
      document.getElementById('download').style.display = 'none'; // Hide the download button
    }

    const predictionElement = document.createElement('p');
    predictionElement.id = 'prediction';
    if (data.prediction === 1) {
      predictionElement.textContent = 'Attention: the video you have clicked on likely contains Eating Disorder triggering content.';
      chrome.scripting.executeScript({
        target: { tabId: tabId }, // Use tabId passed to this function
        func: createOverlay
      });
      // Mute the YouTube video
      chrome.tabs.update(tabId, { muted: true });
    } else if (data.prediction === 0) {
      predictionElement.textContent = 'Safe video';
    } else {
      predictionElement.textContent = 'Prediction not available';
    }
    document.body.appendChild(predictionElement);
  })
  .catch(error => {
    console.error('Fetch error:', error);
    document.getElementById('transcript').textContent = 'Error: ' + error;
    document.getElementById('title').textContent = 'Failed to retrieve data';
  });
}

function downloadTranscript(title, transcript) {
  let blob = new Blob([transcript], { type: 'text/plain' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = `${title}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createOverlay() {
  if (window.location.href.includes('youtube.com/watch')) {
    console.log("Attention: the video you have clicked on likely contains Eating Disorder triggering content.");

    // Select the YouTube video element
    let videoElement = document.querySelector('video');

    if (videoElement) {
      // Get the position and dimensions of the video
      let videoRect = videoElement.getBoundingClientRect();

      let overlay = document.createElement('div');
      overlay.style.position = 'absolute';  // Use 'absolute' positioning relative to the video element
      overlay.style.top = `${videoRect.top}px`;
      overlay.style.left = `${videoRect.left}px`;
      overlay.style.width = `${videoRect.width}px`;
      overlay.style.height = `${videoRect.height}px`;
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      overlay.style.color = 'white';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.fontSize = '24px';
      overlay.style.zIndex = '100000';  // High z-index to ensure it appears over the video
      overlay.style.pointerEvents = 'none';  // Disable pointer events on the overlay itself

      let contentDiv = document.createElement('div');
      contentDiv.style.textAlign = 'center';
      contentDiv.style.pointerEvents = 'auto';  // Enable pointer events only on the content div

      let paragraph = document.createElement('p');
      paragraph.innerHTML = "<h3>Sensitive Content Ahead</h3> <br> Themes of eating disorders are present. If this is difficult for you, know that your feelings are valid, and that you're not alone";

      let button = document.createElement('button');
      button.textContent = "Dismiss";
      button.style.padding = '10px 20px';
      button.style.fontSize = '18px';
      button.style.cursor = 'pointer';
      button.style.zIndex = '100001';  // Ensure button appears above overlay
      button.style.pointerEvents = 'auto';  // Ensure button is clickable

      button.addEventListener('click', function() {
        // Show a confirmation dialog
        let isSure = confirm("Are you sure you want to dismiss this message and unmute the video?");

        // If the user confirms
        if (isSure) {
          // Remove the overlay
          overlay.remove();

          // Send message to unmute the tab
          chrome.runtime.sendMessage({ action: 'unmuteTab' });
          console.log("Sending message to unmute the tab.");
        }
      });

      contentDiv.appendChild(paragraph);
      contentDiv.appendChild(button);
      overlay.appendChild(contentDiv);
      
      // Append overlay to body or video container
      document.body.appendChild(overlay);

      console.log("Overlay added to fit the video.");
    } else {
      console.log("Video element not found.");
    }
  }
}
