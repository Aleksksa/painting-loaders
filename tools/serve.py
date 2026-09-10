#!/usr/bin/env python3
"""Static server for the gallery that also accepts PUT, so render-stills.html
can write the pre-rendered stills straight back into the repo.

    python3 tools/serve.py            # then open http://localhost:8000/

PUT is deliberately narrow: only paths under stills/, only .webp, no traversal.
Nothing else about this server is special — for just looking at the gallery,
any static server (or opening gallery.html directly) works fine.
"""
import functools
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Never cache during development. Without this the browser happily runs a
        # stale style-*.js against a freshly edited page and the mismatch is very
        # hard to see.
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def do_PUT(self):
        rel = self.path.lstrip('/')
        target = os.path.normpath(os.path.join(ROOT, rel))
        ok = (target.startswith(os.path.join(ROOT, 'stills') + os.sep)
              and target.endswith('.webp'))
        if not ok:
            self.send_error(403, 'PUT is only allowed for stills/*.webp')
            return
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, 'wb') as fh:
            fh.write(body)
        self.send_response(204)
        self.end_headers()
        sys.stderr.write('wrote %s (%d bytes)\n' % (rel, len(body)))


if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    handler = functools.partial(Handler, directory=ROOT)
    with socketserver.TCPServer(('127.0.0.1', PORT), handler) as srv:
        print('serving %s at http://localhost:%d/' % (ROOT, PORT), flush=True)
        srv.serve_forever()
