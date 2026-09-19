from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/pages/ServiceRequest.tsx')
s=p.read_text()
s=s.replace('type Kind = "work" | "real-estate" | "commerce" | "mandates";', 'type Kind = "study" | "work" | "real-estate" | "commerce" | "mandates";')
needle='const copy: Record<Kind, Record<string, Record<string, string> | string[]>> = {\n'
insert='''const copy: Record<Kind, Record<string, Record<string, string> | string[]>> = {
  study: {
    fr: { eyebrow: "ÉTUDIER À L’ÉTRANGER", title: "Parlez à un responsable ICX de votre projet d’études.", intro: "Choisissez librement vos universités et programmes. ICX peut vous orienter, vous assister et vous aider à préparer les demandes d’admission, sous réserve d’un contrat de prestation.", choice: "Destination souhaitée", choice1: "France", choice2: "Autre destination", details: "Niveau, domaine, universités ou programmes envisagés", docs: "CV, relevés, diplôme et passeport si disponibles", response: "Premier retour indicatif sous 3 à 5 jours ouvrés.", submit: "CONTACTER ICX POUR MES ÉTUDES", success: "Votre demande d’orientation a été reçue.", successBody: "Un responsable ICX pourra vous répondre pour préciser votre projet et les prochaines étapes. La décision d’admission appartient toujours à l’université.", request: "DEMANDE D’ORIENTATION", titleForm: "Décrivez votre projet d’études", appointment: "Demander un rendez-vous d’orientation" },
    en: { eyebrow: "STUDY ABROAD", title: "Speak with an ICX manager about your study project.", intro: "Choose your universities and programmes freely. ICX may guide and assist you with admission requests, subject to a service agreement.", choice: "Preferred destination", choice1: "France", choice2: "Another destination", details: "Level, subject, universities or programmes considered", docs: "CV, transcripts, diploma and passport if available", response: "Indicative first response within 3–5 business days.", submit: "CONTACT ICX ABOUT MY STUDIES", success: "Your guidance request was received.", successBody: "An ICX manager may contact you to clarify your project and next steps. Admission decisions always belong to the university.", request: "GUIDANCE REQUEST", titleForm: "Describe your study project", appointment: "Request a guidance appointment" },
  },
'''
s=s.replace(needle,insert)
p.write_text(s)

p=Path('/home/ubuntu/work2/client/src/App.tsx')
s=p.read_text().replace('<Route path="/study" component={Study}/>', '<Route path="/study" component={Study}/><Route path="/study/contact" component={ServiceRequest}/>')
p.write_text(s)

p=Path('/home/ubuntu/work2/client/src/pages/Study.tsx')
s=p.read_text().replace('href="/dossier"', 'href="/study/contact"').replace('{copy.fileButton}', '{locale === "fr" ? "CONTACTER ICX" : "CONTACT ICX"}')
s=s.replace('const { t } = useLocale();', 'const { locale, t } = useLocale();')
p.write_text(s)
