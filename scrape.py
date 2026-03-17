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
    # The site uses an AJAX API for login
    login_api_url = "https://www.the-joi-database.com/api/account_signing/login"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://www.the-joi-database.com',
        'Referer': 'https://www.the-joi-database.com/login'
    }
    
    try:
        # Establish cookies
        session.get("https://www.the-joi-database.com/login", headers=headers)
        
        login_data = {
            'username': USERNAME,
            'password': PASSWORD,
            'remme': 'on'
        }
        
        # Log in via AJAX API
        r_log = session.post(login_api_url, data=login_data, headers=headers)
        
        if r_log.status_code != 200:
            print(f"Error: Login failed with status {r_log.status_code}")
            return
            
        # Navigate to profile
        profile_url = "https://www.the-joi-database.com/profile/93c6c5709e3ae1178bbc775c"
        r_prof = session.get(profile_url, headers=headers)
        
        if r_prof.status_code != 200:
            print(f"Error: Failed to fetch profile. Status code: {r_prof.status_code}")
            return
            
        soup_prof = BeautifulSoup(r_prof.text, 'html.parser')
        thumbnails = soup_prof.find_all('asis-video-thumbnail')
        
        videos = []
        for t in thumbnails:
            video_id = t.get('video-id')
            thumbnail = t.get('thumbnail')
            
            # Find the title which is in a sibling link h6
            parent = t.parent
            title = "Latest Transmission"
            if parent:
                # Look for h6 with title attribute or text
                h6 = parent.find('h6')
                if h6 and h6.get('title'):
                    title = h6.get('title')
                elif h6:
                    title = h6.text.strip()
            
            # Only add if we have ID and thumbnail
            if video_id and thumbnail:
                videos.append({
                    'title': title,
                    'thumbnail': thumbnail,
                    'url': f'https://www.the-joi-database.com/watch/{video_id}'
                })
        
        # Sort or filter to get only unique videos, taking the top 3
        seen_urls = set()
        unique_videos = []
        for v in videos:
            if v['url'] not in seen_urls:
                unique_videos.append(v)
                seen_urls.add(v['url'])
        
        # Take the absolute top 3 latest
        final_videos = unique_videos[:3]
            
        if final_videos:
            output_path = os.path.join(os.path.dirname(__file__), 'assets', 'latest_videos.json')
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(final_videos, f, indent=2, ensure_ascii=False)
            print(f"Successfully scraped {len(final_videos)} videos (including hidden ones) and updated assets/latest_videos.json")
        else:
            print("No videos found to scrape.")

    except Exception as e:
        print(f"An error occurred during scraping: {str(e)}")

if __name__ == "__main__":
    main()
