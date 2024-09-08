document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length === 0) {
      document.getElementById('transcript').textContent = 'No active tab found.';
      return;
    }

    let activeTab = tabs[0];
    let activeTabURL = activeTab.url;

    if (activeTabURL.includes('youtube.com/watch') || activeTabURL.includes('youtu.be')) {
      fetchTranscript(activeTabURL);
      // Inject overlay into the YouTube page
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: createOverlay
        
      });
      // Muting the youtube video
      chrome.tabs.update(activeTab.id, { muted: true });
      
    } else {
      document.getElementById('transcript').textContent = 'This is not a YouTube video URL.';
    }
  });
});
function fetchTranscript(url) {
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
      //document.getElementById('title').textContent = title;
      document.getElementById('transcript').textContent = data.transcript;
      document.getElementById('download').style.display = 'block';
      document.getElementById('download').onclick = function() {
        downloadTranscript(title, data.transcript);
      };
    } else {
      // If transcript doesn't exist, handle this case
      console.log("No transcript available, displaying only title.");
      //document.getElementById('title').textContent = title;
      document.getElementById('transcript').textContent = ""; // Clear any existing transcript text
      document.getElementById('download').style.display = 'none'; // Hide the download button
    }
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
    console.log("YouTube video detected, adding overlay.");

    let overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '70%';
    overlay.style.height = '80%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.color = 'white';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontSize = '24px';
    overlay.style.zIndex = '100000';

    let contentDiv = document.createElement('div');
    contentDiv.style.textAlign = 'center';

    let paragraph = document.createElement('p');
    paragraph.textContent = "This video may trigger eating disorder .....";

    let button = document.createElement('button');
    button.textContent = "Dismiss";
    button.style.padding = '10px 20px';
    button.style.fontSize = '18px';
    button.style.cursor = 'pointer';

    button.addEventListener('click', function() {
      overlay.remove();
    });

    contentDiv.appendChild(paragraph);
    contentDiv.appendChild(button);
    overlay.appendChild(contentDiv);
    document.body.appendChild(overlay);

    console.log("Overlay added to the page");
  }
}
function muteAudio(){

}