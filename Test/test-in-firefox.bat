rem Configure Firefox to run without CORS-security before
rem Go into "about:config" and search and set
rem content.cors.disable=>true
rem network.cors_preflight.authorization_covered_by_wildcard=>false
rem security.fileuri.strict_origin_policy => false

set URI="file:///%cd%/index.html"
"C:\Program Files\Mozilla Firefox\firefox.exe" %URI%
