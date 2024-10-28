# Akcse_project2024

This project aims to detect (using a ML model) videos that trigger eating disorders and censor the content (video and audio) so that individuals with eating disorders can safely enjoy Youtube content.
The current version is limited to English language videos, and relies on video transcript to detect triggering factors.

## Installation & Python App

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TaewonHwang02/Akcse_project2024.git
   cd your-repo-name
   ```
   

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

This will install:

Flask: A lightweight web application framework.
Flask-CORS: To handle Cross-Origin Resource Sharing (CORS) for Flask.
YouTube Transcript API: To fetch transcripts from YouTube.
BeautifulSoup (bs4): A library for parsing HTML and XML.
scikit-learn: A machine learning library for Python.

3. **Run the Application**:
Navigate to the extension directory and run the app:
```bash
python app.py
```

## To View the Extension in Action
1. **Chrome Extension**:
Navigate to [Chrome Extensions](chrome://extensions/) and enable "Developer Mode"

2. **Load Extension**:
Click the "Load Unpacked" button and load the "extension" folder from your cloned repository.

### Now you should have your extension added! 



