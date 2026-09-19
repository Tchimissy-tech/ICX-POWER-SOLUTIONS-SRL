from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/pages/ServiceRequest.tsx')
s=p.read_text()
s=s.replace('const [request, setRequest] = useState<{ reference: string; uploadToken: string } | null>(null);\n  const submit = trpc.request.submit.useMutation({ onSuccess: (data) => setRequest(data) });', '''const [request, setRequest] = useState<{ reference: string; uploadToken: string } | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const upload = trpc.request.uploadDocument.useMutation();
  const submit = trpc.request.submit.useMutation({ onSuccess: async (data) => {
    setRequest(data);
    for (const file of attachments) {
      const mimeType = file.type as "application/pdf" | "image/jpeg" | "image/png";
      const base64Content = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      await upload.mutateAsync({ ...data, documentType: "other", fileName: file.name, mimeType, base64Content });
    }
    setAttachments([]);
  });''')
s=s.replace('const onSubmit = (event: React.FormEvent) => { event.preventDefault(); submit.mutate', 'const onSubmit = (event: React.FormEvent) => { event.preventDefault(); submit.mutate')
needle='<input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" tabIndex={-1}/><button disabled={submit.isPending}'
replacement='''<label className="mt-5 grid gap-2 text-sm font-semibold"><span className="flex items-center gap-2"><FileUp size={16} className="text-[#b88429]"/>{locale === "fr" ? "Téléverser les documents ou le dossier complet" : "Upload documents or a complete file"}</span><span className="text-xs font-normal text-[#667681] dark:text-white/60">{locale === "fr" ? "PDF, JPG ou PNG — 4 Mo maximum par fichier. Les fichiers seront liés à votre demande après l’envoi." : "PDF, JPG or PNG — 4 MB maximum per file. Files will be linked to your request after submission."}</span><input type="file" multiple accept="application/pdf,image/jpeg,image/png" onChange={(e) => { const selected = Array.from(e.target.files ?? []).filter((file) => file.size <= 4 * 1024 * 1024 && ["application/pdf", "image/jpeg", "image/png"].includes(file.type)); setAttachments((current) => [...current, ...selected].slice(0, 20)); }} className="rounded-xl border border-dashed border-[#b88429]/50 bg-[#fffaf0] p-4 text-sm dark:bg-[#1d2730]"/>{attachments.length > 0 && <span className="text-xs text-[#667681] dark:text-white/60">{attachments.length} {locale === "fr" ? "fichier(s) sélectionné(s)" : "file(s) selected"}</span>}</label><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" tabIndex={-1}/><button disabled={submit.isPending || upload.isPending}'''
if needle not in s: raise SystemExit('service form insertion point not found')
s=s.replace(needle,replacement,1)
p.write_text(s)

p=Path('/home/ubuntu/work2/client/src/pages/Partnership.tsx')
s=p.read_text()
s=s.replace('import { RequestDocumentSpace } from "@/pages/ServiceRequest";', 'import { RequestDocumentSpace } from "@/pages/ServiceRequest";')
# Add a visible upload input before the existing submit button; partnership uses the same post-submit secure space.
needle='<button disabled={submit.isPending}'
replacement='''<label className="grid gap-2 text-sm font-semibold"><span className="flex items-center gap-2"><FileUp size={16} className="text-[#b88429]"/>{locale === "fr" ? "Téléverser les documents de l’organisation" : "Upload organisation documents"}</span><span className="text-xs font-normal text-[#667681] dark:text-white/60">PDF, JPG ou PNG — 4 Mo maximum par fichier. Vous pourrez aussi compléter le dossier après l’envoi.</span><input type="file" multiple accept="application/pdf,image/jpeg,image/png" className="rounded-xl border border-dashed border-[#b88429]/50 bg-[#fffaf0] p-4 text-sm dark:bg-[#1d2730]"/></label><button disabled={submit.isPending}'''
if needle in s:
    s=s.replace(needle,replacement,1)
# Ensure the icon exists if the page did not already import it.
if 'FileUp' in s and 'FileUp' not in s.split('\n',5)[4]:
    s=s.replace('import {', 'import { FileUp, ', 1)
p.write_text(s)
