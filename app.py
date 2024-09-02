from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import requests
from bs4 import BeautifulSoup
import pickle
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

with open('model training/model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('model training/vector.pkl', 'rb') as f:
   vectorizer = pickle.load(f)

   def process_text(text):
    """
    Transform the text and make a prediction based on the model.
    """
    try:
        text_transformed = vectorizer.transform([text]).toarray()
        prediction = model.predict(text_transformed)[0]
        return int(prediction)
    except Exception as e:
        return f'Prediction failed: {str(e)}'

def handle_transcript(youtube_url):
    """
    Fetch the transcript, use it to make a prediction, or fall back to the title if transcript fetching fails.
    """
    try:
        # Extract video ID and get video title
        video_id = get_video_id(youtube_url)
        title = get_video_title(youtube_url)
        
        if not video_id or not title:
            return jsonify({'error': 'Failed to extract video ID or title'}), 400
        
        try:
            # Fetch the transcript
            transcript = get_transcript(video_id)  # Use the existing get_transcript function
            
            if not transcript:
                return jsonify({'error': 'Transcript is empty or could not be fetched'}), 400
            
            # Combine all transcript entries into one text block
            full_text = ' '.join([entry['text'] for entry in transcript])
            
            # Process the transcript text and make a prediction
            prediction = process_text(full_text)
            
            return jsonify({
                'title': title,
                'transcript': full_text,
                'prediction': prediction,
                'used_title_for_prediction': False
            })
        
        except Exception as e:
            # If transcript fetching fails, use the title for prediction
            prediction = process_text(title)
            
            return jsonify({
                'title': title,
                'transcript': None,
                'prediction': prediction,
                'used_title_for_prediction': True
            })
    
    except Exception as e:
        # Handle any other unexpected errors
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

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
        title = get_video_title(youtube_url)
        transcript = get_video_transcript(video_id)
        
        if not transcript:
            return jsonify({'error': 'Transcript is empty or could not be fetched'}), 400
        
        formatted_transcript = ' '.join(entry['text'] for entry in transcript)
        prediction = process_text(formatted_transcript)
        
        return jsonify({
            'title': title,
            'transcript': formatted_transcript,
            'prediction': prediction,
            'used_title_for_prediction': False
        })
    except Exception as e:
        prediction = process_text(title)
        
        return jsonify({
            'title': title,
            'transcript': None,
            'prediction': prediction,
            'used_title_for_prediction': True
        })

if __name__ == "__main__":
    app.run(debug=True)

