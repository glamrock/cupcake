    #!/usr/bin/env python
    
    import BaseHTTPServer
    import getopt
    import socket
    import sys
    
    ADDR = ["", 8080]
    
    def usage(f = sys.stdout):
        print >> f, "Usage: %s [ADDRESS [PORT]]" % sys.argv[0]
    
    class Handler(BaseHTTPServer.BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/":
                self.send_response(200)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                print >> self.wfile, """\
    <!DOCTYPE html>
    <body bgcolor=dodgerblue>
    <img src="x.png" width=200 height=200>
    </body>
    """
                return
            if self.path == "/x.png":
                self.send_response(302)
                self.send_header("Content-type", "image/png")
                self.send_header("Location", "x.html")
                self.end_headers()
                return
            if self.path == "/x.html":
                self.send_response(200)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                print >> self.wfile, """\
    <!DOCTYPE html>
    <body bgcolor=slateblue>
    Inner HTML.
    </body>
    """
    
            self.send_response(404)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            print >> self.wfile, """\
    <!DOCTYPE html>
    Not found.
    """
    
    class Server(BaseHTTPServer.HTTPServer):
        allow_reuse_address = True
    
    opts, args = getopt.gnu_getopt(sys.argv[1:], "h", ["help"])
    for o, a in opts:
        if o == "-h" or o == "--help":
            usage()
            sys.exit(0)
    
    if len(args) >= 1:
        ADDR[0] = args[0]
    if len(args) >= 2:
        ADDR[1] = args[1]
    if len(args) >= 3:
        usage(sys.stderr)
        os.exit(1)
    
    server = Server(tuple(ADDR), Handler)
    print "Listening on %s:%d." % (server.server_name, server.server_port)
    server.serve_forever()
