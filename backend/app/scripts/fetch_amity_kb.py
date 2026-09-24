import urllib.request
import ssl
from bs4 import BeautifulSoup

urls = [
    "https://amity.edu/lucknow/about-us.aspx",
    "https://amity.edu/lucknow/about-faculty.aspx",
    "https://amity.edu/lucknow/about-academia.aspx",
    "https://amity.edu/lucknow/institute.aspx"
]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

kb_content = "# AMITY UNIVERSITY LUCKNOW - KNOWLEDGE BASE\n\n"

for url in urls:
    try:
        print(f"Fetching {url}...")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, context=ctx).read().decode("utf-8", errors="ignore")
        soup = BeautifulSoup(html, "html.parser")
        
        # Remove scripts and styles
        for script in soup(["script", "style", "nav", "footer"]):
            script.decompose()
            
        text = soup.get_text(separator='\n')
        # clean up empty lines
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        
        kb_content += f"## SOURCE: {url}\n\n"
        kb_content += "\n".join(lines) + "\n\n"
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")

with open("amity_kb.txt", "w", encoding="utf-8") as f:
    f.write(kb_content)
print("Finished writing to amity_kb.txt")
