import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fallbackCopy } from "@/lib/content";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { LocaleProvider, useLocale } from "./contexts/LocaleContext";
import { ThemeProvider } from "./contexts/ThemeContext";
const Admin = lazy(() => import("./pages/Admin"));
const Chat = lazy(() => import("./pages/Chat"));
const ExpertiseInternationale = lazy(() => import("./pages/ExpertiseInternationale"));
const Consulting = lazy(() => import("./pages/Consulting"));
const StrategicPartnerships = lazy(() => import("./pages/StrategicPartnerships"));
const Dossier = lazy(() => import("./pages/Dossier"));
const Home = lazy(() => import("./pages/Home"));
const InstitutionDetail = lazy(() => import("./pages/InstitutionDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Partners = lazy(() => import("./pages/Partners"));
const Partnership = lazy(() => import("./pages/Partnership"));
const ServiceRequest = lazy(() => import("./pages/ServiceRequest"));
const Services = lazy(() => import("./pages/Services"));
const Sourcing = lazy(() => import("./pages/Sourcing"));
const Study = lazy(() => import("./pages/Study"));
const Universities = lazy(() => import("./pages/Universities"));
const WorkPermits = lazy(() => import("./pages/WorkPermits"));
function LoadingScreen() { const { locale } = useLocale(); return <div className="grid min-h-screen place-items-center bg-[#000091] text-white">{fallbackCopy[locale].loading}</div>; }
function Router() { return <Suspense fallback={<LoadingScreen/>}><Switch><Route path="/" component={Home}/><Route path="/chat" component={Chat}/><Route path="/expertise-internationale" component={ExpertiseInternationale}/><Route path="/consulting" component={Consulting}/><Route path="/partnerships-strategiques" component={StrategicPartnerships}/><Route path="/study" component={Study}/><Route path="/study/contact" component={ServiceRequest}/><Route path="/universities" component={Universities}/><Route path="/universities/:slug" component={InstitutionDetail}/><Route path="/services" component={Services}/><Route path="/services/:kind" component={ServiceRequest}/><Route path="/sourcing" component={Sourcing}/><Route path="/work-permits" component={WorkPermits}/><Route path="/work-permits/contact" component={ServiceRequest}/><Route path="/partners" component={Partners}/><Route path="/partnership" component={Partnership}/><Route path="/dossier" component={Dossier}/><Route path="/admin" component={Admin}/><Route path="/404" component={NotFound}/><Route component={NotFound}/></Switch></Suspense>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><LocaleProvider><TooltipProvider><Toaster/><Router/></TooltipProvider></LocaleProvider></ThemeProvider></ErrorBoundary>; }
