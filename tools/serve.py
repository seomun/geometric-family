"""로컬 테스트 서버(저장소 루트, 포트 8765): python tools/serve.py
python -m http.server 는 접속 대기열(backlog)이 5라서 페이지가 스크립트 십여 개를 동시에 요청하면 가끔 ERR_CONNECTION_REFUSED 가 나
smoke 가 「UK is not defined」·「콘솔 오류」로 흔들린다(RC3 에서 확인). 대기열을 크게 잡은 서버를 쓴다."""
import http.server, socketserver, os, sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
class S(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
S(('127.0.0.1', port), H).serve_forever()
