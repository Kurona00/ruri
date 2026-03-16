import os
import json
import requests
from bs4 import BeautifulSoup

def main():
    USERNAME = os.environ.get("TEST_ACC_USERNAME")
    PASSWORD = os.environ.get("TEST_ACC_PASSWORD")

    if not USERNAME or not PASSWORD:
        print("Error: Credentials not found in environment variables.")
        return

    session = requests.Session()
    login_url = "https://www.the-joi-database.com/login"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        r = session.get(login_url, headers=headers)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        token_input = soup.find('input', {'name': '_token'})
        token = token_input['value'] if token_input else ''
        
        login_data = {
            '_token': token,
            'username': USERNAME,
            'password': PASSWORD
        }
        
        # Log in
        r_log = session.post(login_url, data=login_data, headers=headers)
        
        # Navigate to profile
        profile_url = "https://www.the-joi-database.com/profile/93c6c5709e3ae1178bbc775c"
        r_prof = session.get(profile_url, headers=headers)
        
        if r_prof.status_code != 200:
            print(f"Error: Failed to fetch profile. Status code: {r_prof.status_code}")
            return
            
        soup_prof = BeautifulSoup(r_prof.text, 'html.parser')
        thumbnails = soup_prof.find_all('asis-video-thumbnail')
        
        videos = []
        for t in thumbnails[:3]:
            video_id = t.get('video-id')
            thumbnail = t.get('thumbnail')
            
            parent = t.parent
            title = "Latest Transmission"
            if parent:
                h6 = parent.find('h6')
                if h6 and h6.get('title'):
                    title = h6.get('title')
                elif h6:
                    title = h6.text.strip()
                    
            videos.append({
                'title': title,
                'thumbnail': thumbnail,
                'url': f'https://www.the-joi-database.com/watch/{video_id}'
            })
            
        if videos:
            output_path = os.path.join(os.path.dirname(__file__), 'assets', 'latest_videos.json')
            
            # Ensure assets directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(videos, f, indent=2, ensure_ascii=False)
            print(f"Successfully scraped {len(videos)} videos and updated assets/latest_videos.json")
        else:
            print("No videos found to scrape.")

    except Exception as e:
        print(f"An error occurred during scraping: {str(e)}")

if __name__ == "__main__":
    main()
