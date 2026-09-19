from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/components/PublicLayout.tsx')
s=p.read_text()
needle='<div><p className="text-[10px] font-bold tracking-[.15em] text-[#ffb000]">{t.layout.transparency}</p><div className="mt-3 grid gap-2 text-sm text-white/75"><span>{t.layout.legal}</span><span>{t.layout.privacy}</span><span>{t.layout.data}</span></div></div>'
replacement='''<div><p className="text-[10px] font-bold tracking-[.15em] text-[#ffb000]">{t.layout.transparency}</p><div className="mt-3 grid gap-2 text-sm text-white/75"><span>{t.layout.legal}</span><span>{t.layout.privacy}</span><span>{t.layout.data}</span></div></div><div><p className="text-[10px] font-bold tracking-[.15em] text-[#ffb000]">CONTACT ICX</p><div className="mt-3 grid gap-2 text-sm leading-6 text-white/75"><a href="mailto:icxps.sale@outlook.com">icxps.sale@outlook.com</a><a href="tel:+40745437748">Représentant légal : +40 745 437 748</a><a href="tel:+40753413765">Opérations et coordination : +40 753 413 765</a><Link href="/chat" className="mt-2 inline-flex items-center gap-2 font-semibold text-[#ffb000]"><MessageCircle size={15}/> Chat d’orientation IA</Link></div></div>'''
if needle not in s: raise SystemExit('footer contact insertion point not found')
p.write_text(s.replace(needle,replacement,1))
