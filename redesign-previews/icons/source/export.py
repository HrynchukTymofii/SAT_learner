import re
body=open('a5d.body').read()
rect=re.search(r'<rect[^>]*/>',body).group(0)
curve=re.search(r'<path d="M-30[^>]*/>',body).group(0)
dash=re.search(r'<path d="M-?\d+ \d+ L[^>]*/>',body).group(0)
dot=re.search(r'<circle[^>]*/>',body).group(0)
text=re.search(r'<text[^>]*>SAT</text>',body).group(0)
android_text='<g transform="translate(490 560) scale(.95) translate(-512 -512)">'+text+'</g>'
FONT="<style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800');</style>"
def white(s): return re.sub(r'(fill|stroke)="#[0-9A-Fa-f]{6}"', lambda m: f'{m.group(1)}="#FFFFFF"', s)
ext='viewBox="-256 -256 1536 1536"'   # adaptive layers: 108dp canvas, the icon is the middle 72dp
big_bg='<rect x="-256" y="-256" width="1536" height="1536" fill="#0B0A0F"/>'
assets={
 'icon':        ('viewBox="0 0 1024 1024"', body, 1024),
 'adaptive-background': (ext, big_bg+curve+dash+dot, 1024),
 'adaptive-foreground': (ext, android_text, 1024),
 'adaptive-monochrome': (ext, white(curve+dash+dot+android_text), 1024),
 'splash-icon': ('viewBox="0 0 1024 1024"', '<clipPath id="r"><rect width="1024" height="1024" rx="230"/></clipPath><g clip-path="url(#r)">'+body+'</g>', 1024),
 # notification small icon: white silhouette on transparent, SAT + curve only (dashes are too fine at 24dp)
 'notification-icon': ('viewBox="0 0 1024 1024"', white(curve.replace('stroke-width="66"','stroke-width="90"')+android_text), 96),
}
for name,(vb,inner,px) in assets.items():
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" {vb} width="{px}" height="{px}">{FONT}{inner}</svg>'
    open(name+'.html','w').write(f'<html><body style="margin:0;background:transparent">{svg}</body></html>')
    print(name, px)
