import { useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Bot, MessageCircle, Send, Sparkles, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string; failed?: boolean };

const copy = {
  fr: { title: "Bonjour, je suis l’assistant ICX", online: "Orientation autonome", intro: "Je peux expliquer les parcours, proposer une checklist et vous aider à formuler la prochaine étape, sans vous renvoyer systématiquement vers un contact.", placeholder: "Écrivez votre question…", send: "Envoyer", close: "Fermer le chat", open: "Ouvrir le chat ICX", retry: "Réessayer", prompts: ["Étudier à l’étranger", "Permis de travail", "Mines et ressources", "Créer une affiliation"], fallback: "Voici une méthode autonome : 1) précisez le pays et l’objectif ; 2) rassemblez les sources et documents officiels ; 3) comparez les conditions ; 4) préparez une demande structurée. Je peux détailler chacune de ces étapes.", disclaimer: "Orientation générale — aucune promesse d’emploi, de permis, d’admission ou de partenariat." },
  en: { title: "Hello, I’m the ICX assistant", online: "Autonomous guidance", intro: "I can explain pathways, suggest a checklist and help define the next step without sending you to a contact by default.", placeholder: "Write your question…", send: "Send", close: "Close chat", open: "Open ICX chat", retry: "Try again", prompts: ["Study abroad", "Work permits", "Mining and resources", "Create an affiliation"], fallback: "Here is an autonomous method: 1) define the country and objective; 2) gather official sources and documents; 3) compare conditions; 4) prepare a structured request. I can detail each step.", disclaimer: "General guidance — no promise of employment, permit, admission or partnership." },
  ro: { title: "Bună, sunt asistentul ICX", online: "Orientare autonomă", intro: "Pot explica traseele și pașii următori fără să vă trimit automat către un contact.", placeholder: "Scrieți întrebarea…", send: "Trimite", close: "Închide chatul", open: "Deschide chatul ICX", retry: "Încearcă din nou", prompts: ["Studii în străinătate", "Permise de muncă", "Mine și resurse", "Afiliere"], fallback: "Metodă autonomă: definiți țara și obiectivul, verificați sursele oficiale, comparați condițiile și pregătiți cererea.", disclaimer: "Răspuns orientativ — fără promisiuni." },
  pt: { title: "Olá, sou o assistente ICX", online: "Orientação autónoma", intro: "Posso explicar os percursos e os próximos passos sem o encaminhar automaticamente para um contacto.", placeholder: "Escreva a sua pergunta…", send: "Enviar", close: "Fechar chat", open: "Abrir chat ICX", retry: "Tentar novamente", prompts: ["Estudar no exterior", "Permissões de trabalho", "Minas e recursos", "Afiliação"], fallback: "Método autónomo: defina o país e objetivo, verifique fontes oficiais, compare condições e prepare o pedido.", disclaimer: "Resposta indicativa — sem promessas." },
  ar: { title: "مرحباً، أنا مساعد ICX", online: "إرشاد مستقل", intro: "يمكنني شرح المسارات وقائمة الخطوات دون إحالتك تلقائياً إلى جهة اتصال.", placeholder: "اكتب سؤالك…", send: "إرسال", close: "إغلاق المحادثة", open: "فتح محادثة ICX", retry: "إعادة المحاولة", prompts: ["الدراسة في الخارج", "تصاريح العمل", "المناجم والموارد", "إنشاء انتساب"], fallback: "طريقة مستقلة: حدد البلد والهدف، راجع المصادر الرسمية، قارن الشروط، وجهز طلباً منظماً.", disclaimer: "إجابة إرشادية — دون وعود." },
} as const;

export default function FloatingAssistant() {
  const { locale } = useLocale();
  const text = copy[locale];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const chat = trpc.ai.chat.useMutation({
    onSuccess: (answer) => setMessages((current) => [...current, { role: "assistant", content: answer }]),
    onError: () => setMessages((current) => [...current, { role: "assistant", content: text.fallback, failed: true }]),
  });
  useEffect(() => { messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }); }, [messages, chat.isPending]);
  const send = (value: string) => {
    const content = value.trim();
    if (!content || chat.isPending) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next); setInput("");
    chat.mutate({ locale, messages: next.slice(-12).map(({ role, content: message }) => ({ role, content: message })) });
  };
  return <>
    {open && <div className="fixed bottom-24 right-4 z-[70] w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-3xl border border-[#d7dbe5] bg-white shadow-[0_24px_80px_rgba(15,23,42,.24)] dark:border-white/15 dark:bg-[#102337] sm:right-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="bg-[#07131f] px-5 py-4 text-white"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#d8a94a] text-[#07131f]"><Bot size={20}/></div><div><p className="font-semibold">{text.title}</p><p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/65"><span className="h-2 w-2 rounded-full bg-[#7fc68a]"/>{text.online}</p></div></div><button onClick={() => setOpen(false)} aria-label={text.close} className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={18}/></button></div></div>
      <div ref={messagesRef} className="max-h-[390px] min-h-[240px] space-y-3 overflow-y-auto p-4 bg-[#f8fafb] dark:bg-[#0b1c2c]">
        {messages.length === 0 && <div className="rounded-2xl bg-[#e9eef2] p-4 text-sm leading-6 text-[#334554] dark:bg-[#173149] dark:text-white/80"><div className="mb-2 flex items-center gap-2 font-semibold"><Sparkles size={15} className="text-[#b88429]"/> ICX</div>{text.intro}</div>}
        {messages.map((message, index) => <div key={`${index}-${message.content.slice(0, 8)}`} className={cn("flex items-end gap-2", message.role === "user" ? "justify-end" : "justify-start")}><div className={cn("max-w-[84%] rounded-2xl px-3.5 py-2.5 text-sm leading-5", message.role === "user" ? "rounded-br-md bg-[#000091] text-white" : "rounded-bl-md bg-white text-[#293743] shadow-sm dark:bg-[#173149] dark:text-white/85")}>{message.content}{message.failed && <button onClick={() => send(messages.findLast((item) => item.role === "user")?.content || "")} className="mt-2 block font-semibold text-[#000091] underline dark:text-[#e5bd69]">{text.retry}</button>}</div>{message.role === "user" ? <UserRound size={15} className="mb-2 text-[#768492]"/> : <Bot size={15} className="mb-2 text-[#b88429]"/>}</div>)}
        {chat.isPending && <div className="flex items-center gap-2 text-xs text-[#768492]"><Bot size={15} className="text-[#b88429]"/><span className="flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-current"/><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]"/><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]"/></span></div>}
        {messages.length === 0 && <div className="flex flex-wrap gap-2">{text.prompts.map((prompt) => <button key={prompt} onClick={() => send(prompt)} className="rounded-full border border-[#ccd5dd] bg-white px-3 py-2 text-xs font-medium text-[#334554] hover:border-[#000091] dark:border-white/15 dark:bg-[#132b40] dark:text-white/80">{prompt}</button>)}</div>}
      </div>
      <div className="border-t border-[#e1e5e8] bg-white p-3 dark:border-white/10 dark:bg-[#102337]"><form onSubmit={(event) => { event.preventDefault(); send(input); }} className="flex items-center gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={text.placeholder} className="min-w-0 flex-1 rounded-full border border-[#d5dce2] bg-[#f8fafb] px-4 py-2.5 text-sm outline-none focus:border-[#000091] dark:border-white/15 dark:bg-[#0b1c2c]"/><button type="submit" disabled={!input.trim() || chat.isPending} aria-label={text.send} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#000091] text-white disabled:opacity-40"><Send size={16}/></button></form><p className="mt-2 text-center text-[10px] leading-4 text-[#8a969f]">{text.disclaimer}</p></div>
    </div>}
    <button onClick={() => setOpen((value) => !value)} aria-label={open ? text.close : text.open} className={cn("fixed bottom-5 right-4 z-[70] flex items-center gap-2 rounded-full border-4 border-white bg-[#000091] px-4 py-3 text-xs font-bold text-white shadow-[0_10px_35px_rgba(0,0,145,.3)] transition-transform hover:-translate-y-1 dark:border-[#07131f] sm:right-6", open && "bg-[#1e1e23]")}><MessageCircle size={18}/><span className="hidden sm:inline">{open ? text.close : "ICX"}</span>{!open && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#7fc68a]"/>}</button>
  </>;
}
