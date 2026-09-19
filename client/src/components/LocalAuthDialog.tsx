import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Mode = "signIn" | "signUp";
export default function LocalAuthDialog({ mode, onModeChange, open, onOpenChange }: { mode: Mode; onModeChange: (mode: Mode) => void; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [error, setError] = useState("");
  const challenge = trpc.auth.localChallenge.useQuery(undefined, { enabled: open });
  const utils = trpc.useUtils();
  const register = trpc.auth.localRegister.useMutation({ onSuccess: () => { void utils.auth.me.invalidate(); onOpenChange(false); toast.success("Compte ICX créé. Vous êtes connecté."); } });
  const login = trpc.auth.localLogin.useMutation({ onSuccess: () => { void utils.auth.me.invalidate(); onOpenChange(false); toast.success("Connexion ICX réussie."); } });
  useEffect(() => { if (open) { setError(""); setChallengeAnswer(""); setPassword(""); setConfirmation(""); } }, [open, mode]);
  const pending = register.isPending || login.isPending;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (!challenge.data) { setError("La vérification anti-robot n’est pas prête. Rechargez-la."); return; }
    if (mode === "signUp" && password !== confirmation) { setError("Les deux mots de passe ne correspondent pas."); return; }
    try {
      if (mode === "signUp") await register.mutateAsync({ email, password, name, challengeId: challenge.data.id, challengeAnswer });
      else await login.mutateAsync({ email, password, challengeId: challenge.data.id, challengeAnswer });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Une erreur est survenue."); }
  };
  const refresh = () => { void challenge.refetch(); setChallengeAnswer(""); };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{mode === "signUp" ? "Créer un compte ICX" : "Se connecter à ICX"}</DialogTitle><DialogDescription>{mode === "signUp" ? "Créez un compte indépendant de Manus pour accéder à votre espace sécurisé." : "Utilisez l’adresse e-mail et le mot de passe de votre compte ICX."}</DialogDescription></DialogHeader><form onSubmit={submit} className="grid gap-4">
    {mode === "signUp" && <label className="grid gap-2 text-sm font-semibold">Nom complet<input required minLength={2} maxLength={180} value={name} onChange={e => setName(e.target.value)} className="rounded-xl border px-3 py-3 font-normal" autoComplete="name" /></label>}
    <label className="grid gap-2 text-sm font-semibold">Adresse e-mail<input required type="email" maxLength={320} value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl border px-3 py-3 font-normal" autoComplete="email" /></label>
    <label className="grid gap-2 text-sm font-semibold">Mot de passe<input required type="password" minLength={12} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl border px-3 py-3 font-normal" autoComplete={mode === "signUp" ? "new-password" : "current-password"} />{mode === "signUp" && <span className="text-xs font-normal text-muted-foreground">12 caractères minimum, avec majuscule, minuscule, chiffre et symbole.</span>}</label>
    {mode === "signUp" && <label className="grid gap-2 text-sm font-semibold">Confirmer le mot de passe<input required type="password" minLength={12} maxLength={128} value={confirmation} onChange={e => setConfirmation(e.target.value)} className="rounded-xl border px-3 py-3 font-normal" autoComplete="new-password" /></label>}
    <div className="rounded-xl border bg-muted/30 p-3"><div className="flex items-center justify-between gap-3"><label className="text-sm font-semibold">Je ne suis pas un robot</label><input aria-label="Je ne suis pas un robot" type="checkbox" required className="h-5 w-5 accent-[#000091]" /></div><div className="mt-3 flex items-center gap-2"><span className="text-sm">{challenge.data?.question ?? "Préparation…"}</span><input required inputMode="numeric" value={challengeAnswer} onChange={e => setChallengeAnswer(e.target.value)} className="w-20 rounded-lg border px-2 py-2 text-center" aria-label="Réponse anti-robot" /><button type="button" onClick={refresh} className="text-xs underline">Nouvelle question</button></div></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button disabled={pending || challenge.isLoading} className="rounded-full bg-[#d8a94a] px-5 py-3 text-sm font-bold text-[#07131f]">{pending ? "Traitement…" : mode === "signUp" ? "Créer mon compte" : "Se connecter"}</button>
    <button type="button" onClick={() => onModeChange(mode === "signUp" ? "signIn" : "signUp")} className="text-sm underline">{mode === "signUp" ? "J’ai déjà un compte ICX" : "Créer un nouveau compte ICX"}</button>
  </form></DialogContent></Dialog>;
}
