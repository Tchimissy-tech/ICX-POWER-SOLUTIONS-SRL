from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/index.css')
s=p.read_text().replace('--font-serif: "Inter", Arial, sans-serif;', '--font-serif: Georgia, "Times New Roman", serif;')
p.write_text(s)
p=Path('/home/ubuntu/work2/client/src/components/PublicLayout.tsx')
s=p.read_text()
needle='<p className="mt-4 max-w-sm text-sm leading-6 text-white/65">{t.layout.footerDescription}</p>'
replacement=needle+'<p className="mt-3 max-w-sm text-xs leading-5 text-white/45">{locale === "fr" ? "Une première orientation ici, puis une vraie personne de l’équipe ICX pour les décisions importantes." : "A first orientation here, then a real member of the ICX team for important decisions."}</p>'
if needle in s and replacement not in s: s=s.replace(needle,replacement,1)
p.write_text(s)
