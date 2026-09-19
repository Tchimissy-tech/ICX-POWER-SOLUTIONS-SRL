from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/components/PublicLayout.tsx')
s=p.read_text()
if 'import FloatingAssistant' not in s:
    s=s.replace('import { toast } from "sonner";', 'import { toast } from "sonner";\nimport FloatingAssistant from "@/components/FloatingAssistant";')
s=s.replace('fixed bottom-5 right-5 z-40 rounded-full bg-[#000091]', 'fixed bottom-5 left-24 z-40 rounded-full bg-[#000091]')
if '<FloatingAssistant/>' not in s:
    s=s.replace('<footer className=', '<FloatingAssistant/><footer className=', 1)
p.write_text(s)
