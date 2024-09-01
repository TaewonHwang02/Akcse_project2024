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
    } else {
      document.getElementById('transcript').textContent = 'This is not a YouTube video URL.';
    }
  });
});

function fetchTranscript(url) {
  fetch('http://127.0.0.1:5000/transcript', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      document.getElementById('transcript').textContent = 'Error: ' + data.error;
      document.getElementById('title').textContent = ''; // Clear title in case of error
      document.getElementById('download').style.display = 'none';
    } else {
      document.getElementById('title').textContent = data.title;
      document.getElementById('transcript').textContent = data.transcript || 'Transcript not available';
      
      // Display prediction
      const predictionElement = document.createElement('p');
      predictionElement.id = 'prediction';
      predictionElement.textContent = 'Prediction: ' + (data.prediction !== undefined ? data.prediction : 'Not available');
      document.body.appendChild(predictionElement);
      
      // Handle download
      document.getElementById('download').style.display = 'block';
      document.getElementById('download').onclick = function() {
        downloadTranscript(data.title, data.transcript);
      };
    }
  })
  .catch(error => {
    document.getElementById('transcript').textContent = 'Error: ' + error;
    document.getElementById('title').textContent = ''; // Clear title in case of error
    document.getElementById('download').style.display = 'none';
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
