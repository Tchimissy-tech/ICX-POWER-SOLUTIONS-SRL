import PublicLayout from "@/components/PublicLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { ArrowRight, BadgeCheck, Building2, Globe2, Plane, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

const categories = [
  { icon: Plane, fr: ["Compagnies de voyage", "Créer des parcours fiables pour les voyageurs, étudiants, délégations et missions professionnelles.", "/images/affiliations-network.jpg"], en: ["Travel companies", "Build reliable pathways for travellers, students, delegations and professional missions.", "/images/affiliations-network.jpg"] },
  { icon: ShoppingBag, fr: ["Marques & distribution", "Développer la représentation, la visibilité et la distribution de marques sur des marchés ciblés.", "/images/partnership-trade-expansion.jpg"], en: ["Brands & distribution", "Develop representation, visibility and distribution for brands in selected markets.", "/images/partnership-trade-expansion.jpg"] },
  { icon: Globe2, fr: ["Plateformes de vente", "Explorer des affiliations avec des marketplaces, plateformes de services et réseaux numériques.", "/images/consulting-startup-innovation.jpg"], en: ["Sales platforms", "Explore affiliations with marketplaces, service platforms and digital networks.", "/images/consulting-startup-innovation.jpg"] },
  { icon: Building2, fr: ["Agences & opérateurs", "Relier les opérateurs locaux, cabinets et prestataires capables d’exécuter une mission vérifiée.", "/images/consulting-governance-cooperation.jpg"], en: ["Agencies & operators", "Connect local operators, firms and providers able to deliver a verified assignment.", "/images/consulting-governance-cooperation.jpg"] },
] as const;

export default function Affiliations() {
  const { locale } = useLocale();
  const french = locale === "fr";
  return <PublicLayout>
    <section className="relative overflow-hidden bg-[#07131f] px-5 py-24 text-white lg:px-10">
      <img src="/images/affiliations-network.jpg" alt={french ? "Réseau d’affiliations internationales" : "International affiliation network"} className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="relative mx-auto max-w-[1360px]"><p className="text-[10px] font-bold tracking-[.2em] text-[#e5bd69]">{french ? "AFFILIATIONS" : "AFFILIATIONS"}</p><h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[.94] tracking-[-.05em] sm:text-7xl">{french ? "Construire des affiliations utiles, vérifiables et durables." : "Build useful, verifiable and durable affiliations."}</h1><p className="mt-7 max-w-2xl text-base leading-7 text-white/70">{french ? "ICX ouvre un parcours distinct pour les compagnies de voyage, marques, plateformes de vente, agences et opérateurs qui souhaitent explorer une affiliation commerciale ou opérationnelle." : "ICX provides a dedicated path for travel companies, brands, sales platforms, agencies and operators exploring a commercial or operational affiliation."}</p><Link href="/partnership" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#d8a94a] px-5 py-3 text-[11px] font-black tracking-[.1em] text-[#07131f]">{french ? "Proposer une affiliation" : "Propose an affiliation"}<ArrowRight size={15}/></Link></div>
    </section>
    <section className="px-5 py-16 lg:px-10"><div className="mx-auto max-w-[1360px]"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{categories.map(({ icon: Icon, fr, en }) => { const item = french ? fr : en; return <article key={item[0]} className="group overflow-hidden rounded-3xl border border-[#173149]/10 bg-white dark:border-white/10 dark:bg-[#102337]"><img src={item[2]} alt={item[0]} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"/><div className="p-6"><Icon className="text-[#b88429]" size={25}/><h2 className="mt-8 text-xl font-semibold">{item[0]}</h2><p className="mt-3 text-sm leading-6 text-[#63717d] dark:text-white/60">{item[1]}</p></div></article>; })}</div></div></section>
    <section className="bg-[#e6ece8] px-5 py-16 dark:bg-[#132b32] lg:px-10"><div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><BadgeCheck className="text-[#b88429]" size={34}/><h2 className="mt-6 font-serif text-4xl leading-none">{french ? "Un processus simple, sans promesse implicite." : "A simple process, with no implied promise."}</h2></div><div className="grid gap-4 sm:grid-cols-3">{(french ? ["Présenter l’organisation", "Qualifier le modèle", "Valider le cadre"] : ["Present the organisation", "Qualify the model", "Validate the framework"]).map((step, index) => <div key={step} className="rounded-2xl bg-white p-5 dark:bg-[#102337]"><span className="font-serif text-3xl text-[#b88429]">0{index + 1}</span><h3 className="mt-8 font-semibold">{step}</h3><p className="mt-2 text-xs leading-5 text-[#63717d] dark:text-white/60">{french ? "Une étape documentée avant la suivante." : "A documented step before the next one."}</p></div>)}</div></div></section>
  </PublicLayout>;
}

// This page intentionally keeps affiliations separate from confirmed partnerships: the distinction is part of the user journey.
export { categories };
