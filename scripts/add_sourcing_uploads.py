from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/pages/Sourcing.tsx')
s=p.read_text()
s=s.replace('import PublicLayout from "@/components/PublicLayout";', 'import PublicLayout from "@/components/PublicLayout";\nimport { RequestDocumentSpace } from "@/pages/ServiceRequest";')
s=s.replace('const [sent, setSent] = useState(false);', 'const [request, setRequest] = useState<{ reference: string; uploadToken: string } | null>(null);')
s=s.replace('const submit = trpc.request.submit.useMutation({ onSuccess: () => setSent(true) });', 'const submit = trpc.request.submit.useMutation({ onSuccess: (data) => setRequest(data) });')
s=s.replace('{sent ? <div className="rounded-3xl bg-[#e6ece8] p-10 text-center dark:bg-[#132b32]"><CheckCircle2 className="mx-auto text-[#6f9a77]" size={32}/><h3 className="mt-5 text-2xl font-semibold">{copy.successTitle}</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#64727b] dark:text-white/65">{copy.successBody}</p></div> : <form', '{request ? <RequestDocumentSpace request={request} locale={locale} text={(key) => key === "successBody" ? copy.successBody : copy.successTitle}/> : <form')
s=s.replace('const { t } = useLocale();', 'const { locale, t } = useLocale();')
p.write_text(s)
