from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/pages/Partnership.tsx')
s=p.read_text()
s=s.replace('import { FileUp,  RequestDocumentSpace } from "@/pages/ServiceRequest";', 'import { RequestDocumentSpace } from "@/pages/ServiceRequest";')
s=s.replace('import { ArrowRight, CheckCircle2, Handshake, Loader2 } from "lucide-react";', 'import { ArrowRight, CheckCircle2, FileUp, Handshake, Loader2 } from "lucide-react";')
s=s.replace('const [request, setRequest] = useState<{ reference: string; uploadToken: string } | null>(null);\n  const submit = trpc.request.submit.useMutation({ onSuccess: (data) => setRequest(data) });', '''const [request, setRequest] = useState<{ reference: string; uploadToken: string } | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const upload = trpc.request.uploadDocument.useMutation();
  const submit = trpc.request.submit.useMutation({ onSuccess: async (data) => { setRequest(data); for (const file of attachments) { const mimeType = file.type as "application/pdf" | "image/jpeg" | "image/png"; const base64Content = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); }); await upload.mutateAsync({ ...data, documentType: "other", fileName: file.name, mimeType, base64Content }); } setAttachments([]); } });''')
s=s.replace('className="rounded-xl border border-dashed border-[#b88429]/50 bg-[#fffaf0] p-4 text-sm dark:bg-[#1d2730]"/>', 'onChange={(e) => setAttachments(Array.from(e.target.files ?? []).filter((file) => file.size <= 4 * 1024 * 1024 && ["application/pdf", "image/jpeg", "image/png"].includes(file.type)).slice(0, 20))} className="rounded-xl border border-dashed border-[#b88429]/50 bg-[#fffaf0] p-4 text-sm dark:bg-[#1d2730]"/>')
s=s.replace('<button disabled={submit.isPending}', '<button disabled={submit.isPending || upload.isPending}')
p.write_text(s)
