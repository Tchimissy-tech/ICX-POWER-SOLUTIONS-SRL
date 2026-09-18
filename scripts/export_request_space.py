from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/pages/ServiceRequest.tsx')
s=p.read_text()
s=s.replace('function RequestDocumentSpace(', 'export function RequestDocumentSpace(', 1)
p.write_text(s)
