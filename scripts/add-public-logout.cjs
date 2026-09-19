const fs = require('fs');
const path = '/home/ubuntu/icx-power-notifications/client/src/components/PublicLayout.tsx';
let source = fs.readFileSync(path, 'utf8');

const importOld = 'ArrowUp, ChevronDown, Globe2, Menu, MessageCircle, Moon, Sun, X';
const importNew = 'ArrowUp, ChevronDown, Globe2, LogOut, Menu, MessageCircle, Moon, Sun, X';
if (!source.includes(importOld)) throw new Error('logout icon import target not found');
source = source.replace(importOld, importNew);

const authOld = 'const { theme, toggleTheme } = useTheme(); const { isAuthenticated } = useAuth(); const { locale, setLocale, t } = useLocale();';
const authNew = 'const { theme, toggleTheme } = useTheme(); const { isAuthenticated, logout } = useAuth(); const { locale, setLocale, t } = useLocale();';
if (!source.includes(authOld)) throw new Error('auth hook target not found');
source = source.replace(authOld, authNew);

const branchOld = '{isAuthenticated ? <Link href="/dossier" className="rounded-full bg-[#000091] px-4 py-2 text-[10px] font-bold tracking-[0.07em] text-white">{t.dossier}</Link> : <div className="flex items-center gap-2">';
const branchNew = '{isAuthenticated ? <div className="flex items-center gap-2"><Link href="/dossier" className="rounded-full bg-[#000091] px-4 py-2 text-[10px] font-bold tracking-[0.07em] text-white">{t.dossier}</Link><button type="button" onClick={() => void logout()} className="inline-flex items-center gap-1 rounded-full border border-[#b91c1c]/30 px-3 py-2 text-[10px] font-bold tracking-[0.05em] text-[#b91c1c] hover:bg-[#b91c1c]/10" aria-label="Se déconnecter" title="Se déconnecter"><LogOut size={13}/> Se déconnecter</button></div> : <div className="flex items-center gap-2">';
if (!source.includes(branchOld)) throw new Error('authenticated header branch target not found');
source = source.replace(branchOld, branchNew);

fs.writeFileSync(path, source);
console.log('Public header logout added');
