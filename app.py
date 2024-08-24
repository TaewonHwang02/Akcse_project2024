from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import requests
from bs4 import BeautifulSoup
# import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

def get_video_id(url):
    if "v=" in url:
        return url.split("v=")[1]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1]
    return None

def get_video_title(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    video_title = soup.find("title").text
    return video_title

def get_video_transcript(video_id):
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    return transcript

# with open('model.pkl', 'rb') as f:
#     model = pickle.load(f)

# with open('vector.pkl', 'rb') as f:
#    vectorizer = pickle.load(f)

@app.route('/transcript', methods=['POST'])
def get_transcript():
    data = request.get_json()
    youtube_url = data.get('url')
    
    if not youtube_url:
        return jsonify({'error': 'URL is missing'}), 400

    video_id = get_video_id(youtube_url)
    if not video_id:
        return jsonify({'error': 'Failed to extract video ID'}), 400

    try:
        # Get video title
        title = get_video_title(youtube_url)

        # Fetch the transcript
        transcript = get_video_transcript(video_id)

        # Format the transcript
        formatted_transcript = '\n'.join([f"{entry['start']}: {entry['text']}" for entry in transcript])

        return jsonify({'title': title, 'transcript': formatted_transcript})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

