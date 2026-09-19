from pathlib import Path
p = Path('/home/ubuntu/work2/client/src/lib/content.ts')
s = p.read_text()
start = s.index('export const featuredInstitutions: Institution[] = [')
end = s.index('export const applicationTimeline', start)
new = '''export const featuredInstitutions: Institution[] = [
  inst("universite-bordeaux", "Université de Bordeaux", "France", "Bordeaux", "https://www.u-bordeaux.com/", "https://www.u-bordeaux.com/Study/international-students", "Université française référencée pour orienter les candidats vers ses informations officielles internationales."),
  inst("universite-libre-bruxelles", "Université libre de Bruxelles", "Belgique", "Bruxelles", "https://www.ulb.be/", "https://www.ulb.be/en/studies", "Université belge référencée pour orienter les candidats vers ses informations officielles d’études."),
  inst("moscow-state-university", "M. V. Lomonosov Moscow State University", "Russie", "Moscou", "https://www.msu.ru/en/", "https://openday.msu.ru/en/admissions", "Université russe référencée pour orienter les candidats vers les procédures officielles pour étudiants étrangers."),
  inst("peking-university", "Peking University", "Chine", "Beijing", "https://english.pku.edu.cn/", "https://isd.pku.edu.cn/en/", "Université chinoise référencée pour orienter les candidats vers sa division officielle des étudiants internationaux."),
];
'''
p.write_text(s[:start] + new + s[end:])
