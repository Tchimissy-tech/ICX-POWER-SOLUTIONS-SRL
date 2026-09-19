from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/components/PublicLayout.tsx')
s=p.read_text()
if 'const strategicNav' not in s:
    s=s.replace('const nav = [["home", "/"], ["study", "/study"], ["universities", "/universities"], ["services", "/services"], ["workPermits", "/work-permits"], ["partners", "/partners"]] as const;', 'const nav = [["home", "/"], ["study", "/study"], ["universities", "/universities"], ["services", "/services"], ["workPermits", "/work-permits"], ["partners", "/partners"]] as const;\nconst strategicNav = { fr: { expertise: "Expertise internationale", consulting: "Consulting", partnerships: "Partenariats stratégiques" }, en: { expertise: "International expertise", consulting: "Consulting", partnerships: "Strategic partnerships" }, ro: { expertise: "Expertiză internațională", consulting: "Consultanță", partnerships: "Parteneriate strategice" }, pt: { expertise: "Expertise internacional", consulting: "Consultoria", partnerships: "Parcerias estratégicas" }, ar: { expertise: "الخبرة الدولية", consulting: "الاستشارات", partnerships: "الشراكات الاستراتيجية" } } as const;')
needle='</nav><div className="hidden items-center gap-2 lg:flex">'
insert='</nav><div className="hidden items-center gap-3 xl:flex"><Link href="/expertise-internationale" className="text-[11px] font-semibold text-[#b88429] hover:text-[#000091]">{strategicNav[locale].expertise}</Link><Link href="/consulting" className="text-[11px] font-semibold text-[#b88429] hover:text-[#000091]">{strategicNav[locale].consulting}</Link></div><div className="hidden items-center gap-2 lg:flex">'
if needle in s and strategicNav[locale if False else 'fr'] if False else True:
    s=s.replace(needle,insert,1)
needle2='<Link onClick={() => setOpen(false)} href="/dossier" className="text-2xl font-semibold tracking-tight">{t.dossier}</Link>'
replacement2=needle2+'<Link onClick={() => setOpen(false)} href="/expertise-internationale" className="text-2xl font-semibold tracking-tight">{strategicNav[locale].expertise}</Link><Link onClick={() => setOpen(false)} href="/consulting" className="text-2xl font-semibold tracking-tight">{strategicNav[locale].consulting}</Link><Link onClick={() => setOpen(false)} href="/partnerships-strategiques" className="text-2xl font-semibold tracking-tight">{strategicNav[locale].partnerships}</Link>'
if needle2 in s and replacement2 not in s: s=s.replace(needle2,replacement2,1)
p.write_text(s)
