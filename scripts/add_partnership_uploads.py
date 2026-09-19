from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/pages/Partnership.tsx')
s=p.read_text()
s=s.replace('import PublicLayout from "@/components/PublicLayout";', 'import PublicLayout from "@/components/PublicLayout";\nimport { RequestDocumentSpace } from "@/pages/ServiceRequest";')
s=s.replace('const { t } = useLocale();', 'const { locale, t } = useLocale();')
s=s.replace('const [sent, setSent] = useState(false);', 'const [request, setRequest] = useState<{ reference: string; uploadToken: string } | null>(null);')
s=s.replace('const submit = trpc.request.submit.useMutation({ onSuccess: () => setSent(true) });', 'const submit = trpc.request.submit.useMutation({ onSuccess: (data) => setRequest(data) });')
s=s.replace('{sent ? <div className="rounded-3xl bg-[#102337] p-10 text-center text-white"><CheckCircle2 className="mx-auto text-[#e5bd69]" size={34}/><h2 className="mt-5 text-2xl font-semibold">{copy.successTitle}</h2><p className="mt-3 text-sm leading-6 text-white/65">{copy.successBody}</p></div> : <form', '{request ? <RequestDocumentSpace request={request} locale={locale} text={(key) => key === "successBody" ? copy.successBody : copy.successTitle}/> : <form')
p.write_text(s)
