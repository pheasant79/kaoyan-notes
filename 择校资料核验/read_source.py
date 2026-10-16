import argparse
import io
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from html.parser import HTMLParser


class Page(HTMLParser):
    def __init__(self, base):
        super().__init__(convert_charrefs=True)
        self.base = base
        self.parts = []
        self.links = []
        self.hidden = 0
        self.anchor = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style'):
            self.hidden += 1
        if tag in ('p', 'tr', 'h1', 'h2', 'h3', 'li', 'br', 'div'):
            self.parts.append('\n')
        if tag in ('td', 'th'):
            self.parts.append(' | ')
        if tag == 'a' and attrs.get('href'):
            self.anchor = [urllib.parse.urljoin(self.base, attrs['href']), []]
        if tag in ('iframe', 'embed') and attrs.get('src'):
            self.links.append({'text': tag, 'url': urllib.parse.urljoin(self.base, attrs['src'])})

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.hidden = max(0, self.hidden - 1)
        if tag == 'a' and self.anchor:
            self.links.append({'text': ''.join(self.anchor[1]).strip(), 'url': self.anchor[0]})
            self.anchor = None
        if tag in ('p', 'tr', 'h1', 'h2', 'h3', 'li', 'div'):
            self.parts.append('\n')

    def handle_data(self, text):
        if not self.hidden:
            self.parts.append(text)
            if self.anchor:
                self.anchor[1].append(text)


def read_source(source):
    if source.startswith(('http://', 'https://')):
        request = urllib.request.Request(source, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=40) as response:
            raw = response.read()
            charset = response.headers.get_content_charset()
            final_url = response.url
    else:
        with open(source, 'rb') as stream:
            raw = stream.read()
        charset = None
        final_url = source
    if raw.startswith(b'%PDF'):
        from pypdf import PdfReader
        text = '\n'.join(f'PAGE {i + 1}\n{p.extract_text() or ""}' for i, p in enumerate(PdfReader(io.BytesIO(raw)).pages))
        return text, []
    if raw.startswith(b'PK'):
        with zipfile.ZipFile(io.BytesIO(raw)) as archive:
            root = ET.fromstring(archive.read('word/document.xml'))
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text = '\n'.join(''.join(p.itertext()) for p in root.findall('.//w:p', ns))
        return text, []
    text = raw.decode(charset or 'utf-8', errors='replace')
    page = Page(final_url)
    page.feed(text)
    return ''.join(page.parts), page.links


def main():
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    parser = argparse.ArgumentParser()
    parser.add_argument('source')
    parser.add_argument('--match')
    parser.add_argument('--context', type=int, default=2)
    parser.add_argument('--links', action='store_true')
    args = parser.parse_args()
    text, links = read_source(args.source)
    lines = [re.sub(r'\s+', ' ', line).strip() for line in text.splitlines() if line.strip()]
    if args.match:
        indices = set()
        for index, line in enumerate(lines):
            if re.search(args.match, line, re.I):
                indices.update(range(max(0, index - args.context), min(len(lines), index + args.context + 1)))
        lines = [f'{i + 1}: {lines[i]}' for i in sorted(indices)]
        links = [link for link in links if re.search(args.match, link['text'] + ' ' + link['url'], re.I)]
    print('\n'.join(lines))
    if args.links:
        print(json.dumps(links, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
