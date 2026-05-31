import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CyberNewsHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        
        # Custom API route for fetching Google News RSS feed securely
        if parsed_url.path == '/api/news':
            query_params = urllib.parse.parse_qs(parsed_url.query)
            q = query_params.get('q', ['cybersécurité'])[0]
            
            try:
                # Format Google News search RSS URL
                encoded_q = urllib.parse.quote(q)
                url = f"https://news.google.com/rss/search?q={encoded_q}&hl=fr&gl=FR&ceid=FR:fr"
                
                # Fetch XML directly using a normal browser User-Agent
                req = urllib.request.Request(
                    url, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
                )
                
                with urllib.request.urlopen(req, timeout=8) as response:
                    xml_data = response.read()
                
                # Parse XML tree
                root = ET.fromstring(xml_data)
                items = []
                
                for item in root.findall('.//item'):
                    title = item.find('title').text if item.find('title') is not None else ''
                    link = item.find('link').text if item.find('link') is not None else ''
                    pubDate = item.find('pubDate').text if item.find('pubDate') is not None else ''
                    description = item.find('description').text if item.find('description') is not None else ''
                    
                    # Resolve source name
                    source_name = 'Google News'
                    source_elem = item.find('source')
                    if source_elem is not None:
                        source_name = source_elem.text
                    
                    items.append({
                        'title': title,
                        'link': link,
                        'pubDate': pubDate,
                        'description': description,
                        'source': source_name
                    })
                
                # Send JSON response back
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response_payload = json.dumps({'status': 'ok', 'items': items}, ensure_ascii=False)
                self.wfile.write(response_payload.encode('utf-8'))
                
            except Exception as e:
                # Handle any retrieval or parsing errors elegantly
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                err_payload = json.dumps({'status': 'error', 'message': str(e)}, ensure_ascii=False)
                self.wfile.write(err_payload.encode('utf-8'))
        else:
            # Fallback to serving regular static files (HTML, CSS, JS)
            super().do_GET()

if __name__ == '__main__':
    # Allow port reuse to avoid "address already in use" errors on quick restarts
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), CyberNewsHandler) as httpd:
        print(f"Ghost-Monitor backend listening on http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            sys.exit(0)
