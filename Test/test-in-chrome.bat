rem Run Chrome without CORS-security 
rem https://simplelocalize.io/blog/posts/what-is-cors/

set URI="file:///%cd%/index.html"
set
"C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C://chrome-dev-disabled-security" --disable-web-security --disable-site-isolation-trials %URI%
