import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Check,
  CheckCircle2,
  FileCheck2,
  FileText,
  Inbox,
  Loader2,
  Mail,
  Send,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const staff = new Set([
  "admin",
  "super_admin",
  "administrator",
  "admissions_manager",
  "sourcing_manager",
  "real_estate_manager",
  "partnership_manager",
  "editor",
  "agent",
]);

export default function Admin() {
  const { user, loading } = useAuth();
  const allowed = Boolean(user && staff.has(user.role));

  const metrics = trpc.admin.metrics.useQuery(undefined, { enabled: allowed });
  const users = trpc.admin.users.useQuery(undefined, { enabled: allowed });
  const applications = trpc.admin.applications.useQuery(undefined, { enabled: allowed });
  const requests = trpc.admin.requests.useQuery(undefined, { enabled: allowed });
  const documents = trpc.admin.documents.useQuery(undefined, { enabled: allowed });
  const providerStatus = trpc.admin.providerStatus.useQuery(undefined, { enabled: allowed });

  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const documentUrl = trpc.admin.documentUrl.useQuery(
    { id: selectedDocument ?? 0 },
    { enabled: Boolean(selectedDocument), refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (documentUrl.data?.url) {
      window.open(documentUrl.data.url, "_blank", "noopener,noreferrer");
      setSelectedDocument(null);
    }
  }, [documentUrl.data]);

  const userStatus = trpc.admin.updateUserStatus.useMutation({
    onSuccess: () => {
      users.refetch();
      toast.success("Statut du compte mis à jour");
    },
  });

  const requestStatus = trpc.admin.updateRequestStatus.useMutation({
    onSuccess: () => {
      requests.refetch();
      toast.success("Statut de la demande mis à jour");
    },
  });

  const documentStatus = trpc.admin.updateDocumentStatus.useMutation({
    onSuccess: () => {
      documents.refetch();
      toast.success("Statut du document mis à jour");
    },
  });

  const applicationStatus = trpc.admin.updateApplicationStatus.useMutation({
    onSuccess: () => {
      applications.refetch();
      toast.success("Statut du dossier mis à jour");
    },
  });

  const testEmail = trpc.admin.testNotification.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Notification envoyée (${data.provider}) vers icxps.sale@outlook.com`);
      } else {
        toast.error(`Alerte non délivrée: ${data.warning || "Erreur"}`);
      }
    },
  });

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin text-[#b88429]" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      {!allowed ? (
        <div className="grid min-h-[70vh] place-items-center text-center">
          <div>
            <ShieldCheck className="mx-auto text-[#b88429]" size={34} />
            <h1 className="mt-5 text-2xl font-semibold">Accès réservé à l’équipe ICX</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre rôle ne permet pas d’ouvrir l’espace d’administration.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[.17em] text-[#b88429]">
                CENTRE D'OPÉRATIONS & NOTIFICATIONS ICX
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Gestion des comptes, alertes et téléversements
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Toutes les notifications et dossiers sont transmis automatiquement vers{" "}
                <strong className="text-foreground">icxps.sale@outlook.com</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#e6ece8] px-3 py-1 text-[10px] font-bold text-[#426052] dark:bg-[#173149] dark:text-white">
                RÔLE : {user?.role}
              </span>
            </div>
          </div>

          {/* Email Provider & Dispatch Status Card */}
          <section className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#b88429]/15 text-[#b88429]">
                  <Mail size={20} />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Fournisseur d'e-mail & Réception automatique</h2>
                  <p className="text-xs text-muted-foreground">
                    Destinataire configuré :{" "}
                    <span className="font-semibold text-foreground">
                      {providerStatus.data?.targetRecipient || "icxps.sale@outlook.com"}
                    </span>{" "}
                    · Fournisseur actif :{" "}
                    <span className="font-bold text-[#b88429] uppercase">
                      {providerStatus.data?.activeProvider || "Simulation sécurisée"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={testEmail.isPending}
                  onClick={() => testEmail.mutate()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#d8a94a] px-4 py-2 text-xs font-bold text-[#07131f] hover:opacity-90 disabled:opacity-50"
                >
                  {testEmail.isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Tester l'envoi d'alerte Outlook
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Resend API</span>
                  {providerStatus.data?.resendConfigured ? (
                    <span className="text-green-600 flex items-center gap-1 font-bold">
                      <CheckCircle2 size={13} /> Actif
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Clé non définie</span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Variables: RESEND_API_KEY, RESEND_FROM
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>SendGrid API</span>
                  {providerStatus.data?.sendgridConfigured ? (
                    <span className="text-green-600 flex items-center gap-1 font-bold">
                      <CheckCircle2 size={13} /> Actif
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Clé non définie</span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Variables: SENDGRID_API_KEY, SENDGRID_FROM
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>SMTP Outlook / TLS</span>
                  {providerStatus.data?.smtpConfigured ? (
                    <span className="text-green-600 flex items-center gap-1 font-bold">
                      <CheckCircle2 size={13} /> Actif
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Identifiants non définis</span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Variables: OUTLOOK_SMTP_USER, OUTLOOK_SMTP_PASS
                </p>
              </div>
            </div>

            {providerStatus.data?.notes.map((note, index) => (
              <p key={index} className="mt-3 text-xs leading-5 text-muted-foreground">
                ℹ️ {note}
              </p>
            ))}
          </section>

          {/* Metric Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={Users} label="Comptes enregistrés" value={users.data?.length} />
            <Metric icon={FileText} label="Dossiers d'études" value={applications.data?.length} />
            <Metric icon={Inbox} label="Demandes de services" value={requests.data?.length} />
            <Metric icon={FileCheck2} label="Documents & Fichiers" value={documents.data?.length} />
          </div>

          {/* User Account Approval Section */}
          <section className="mt-8 rounded-2xl border bg-card p-6 text-card-foreground">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Approbation des comptes utilisateurs</h2>
                <p className="text-xs text-muted-foreground">
                  Chaque création de compte génère un e-mail avec liens d'approbation et apparaît ici.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {users.data?.length ? (
                users.data.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/45 p-4"
                  >
                    <div>
                      <p className="font-semibold">{item.name || "Sans nom"}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.email || "Email non renseigné"} · Rôle : {item.role} · Inscrit le{" "}
                        {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          item.accountStatus === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"
                            : item.accountStatus === "rejected"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {item.accountStatus}
                      </span>
                      <button
                        onClick={() => userStatus.mutate({ id: item.id, accountStatus: "approved" })}
                        className="inline-flex items-center gap-1 rounded-full bg-[#15803d] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                        title="Approuver le compte"
                      >
                        <Check size={14} /> Approuver
                      </button>
                      <button
                        onClick={() => userStatus.mutate({ id: item.id, accountStatus: "rejected" })}
                        className="inline-flex items-center gap-1 rounded-full bg-[#b91c1c] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                        title="Refuser le compte"
                      >
                        <X size={14} /> Refuser
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <Empty />
              )}
            </div>
          </section>

          {/* Service Requests Section */}
          <section className="mt-6 rounded-2xl border bg-card p-6 text-card-foreground">
            <h2 className="font-semibold text-lg">Demandes de services & Interactions</h2>
            <p className="text-xs text-muted-foreground">
              Sourcing, partenariats, orientation et prises de rendez-vous reçus sur le site.
            </p>
            <div className="mt-4 grid gap-3">
              {requests.data?.length ? (
                requests.data.slice(0, 30).map((item) => (
                  <div key={item.id} className="rounded-xl bg-muted/45 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#b88429]">{item.reference}</span>
                          <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold uppercase">
                            {item.type}
                          </span>
                        </div>
                        <p className="mt-1 font-semibold">{item.requesterName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.email} {item.organization ? `· ${item.organization}` : ""}{" "}
                          {item.country ? `· ${item.country}` : ""}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Reçue le {new Date(item.createdAt).toLocaleString("fr-FR")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            requestStatus.mutate({
                              id: item.id,
                              status: e.target.value as
                                | "received"
                                | "analysis"
                                | "in_progress"
                                | "waiting"
                                | "closed",
                            })
                          }
                          className="rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold"
                        >
                          <option value="received">Reçue (received)</option>
                          <option value="analysis">En analyse</option>
                          <option value="in_progress">En traitement</option>
                          <option value="waiting">En attente de retour</option>
                          <option value="closed">Traitée / Clôturée</option>
                        </select>
                        <a
                          href={`mailto:${item.email}?subject=ICX%20POWER%20SOLUTIONS%20-%20Votre%20demande%20${item.reference}`}
                          className="inline-flex items-center gap-1 rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                        >
                          <Mail size={13} /> Répondre
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Empty />
              )}
            </div>
          </section>

          {/* Uploaded Documents Section */}
          <section className="mt-6 rounded-2xl border bg-card p-6 text-card-foreground">
            <h2 className="font-semibold text-lg">Documents téléversés par les utilisateurs</h2>
            <p className="text-xs text-muted-foreground">
              Tous les fichiers téléversés sur les pages du site (CV, passeports, diplômes, dossiers de partenariat).
            </p>
            <div className="mt-4 grid gap-3">
              {documents.data?.length ? (
                documents.data.slice(0, 30).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/45 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        Demande #{item.requestId} · {item.mimeType} ·{" "}
                        {(item.byteSize / (1024 * 1024)).toFixed(2)} Mo · Téléversé le{" "}
                        {new Date(item.uploadedAt).toLocaleString("fr-FR")}
                      </p>
                      <button
                        onClick={() => setSelectedDocument(item.id)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#000091] hover:underline"
                      >
                        <ExternalLink size={12} /> Télécharger / Consulter le fichier
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          item.validationStatus === "accepted"
                            ? "bg-green-100 text-green-800"
                            : item.validationStatus === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.validationStatus}
                      </span>
                      <button
                        onClick={() => documentStatus.mutate({ id: item.id, validationStatus: "accepted" })}
                        className="rounded-full bg-[#15803d] p-2 text-white hover:opacity-90"
                        title="Accepter le document"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => documentStatus.mutate({ id: item.id, validationStatus: "rejected" })}
                        className="rounded-full bg-[#b91c1c] p-2 text-white hover:opacity-90"
                        title="Refuser le document"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <Empty />
              )}
            </div>
          </section>

          {/* Applications dossiers */}
          <section className="mt-6 rounded-2xl border bg-card p-6 text-card-foreground">
            <h2 className="font-semibold text-lg">Dossiers d’études candidats</h2>
            <div className="mt-4 grid gap-3">
              {applications.data?.length ? (
                applications.data.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/45 p-4"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-[#b88429]">{item.reference}</p>
                      <p className="font-semibold">
                        {item.destination} · {item.studyLevel}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.field}</p>
                    </div>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        applicationStatus.mutate({
                          id: item.id,
                          status: e.target.value as any,
                        })
                      }
                      className="rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="RECEIVED">RECEIVED</option>
                      <option value="VERIFICATION">VERIFICATION</option>
                      <option value="MISSING_DOCUMENTS">MISSING_DOCUMENTS</option>
                      <option value="COMPLETE">COMPLETE</option>
                      <option value="SUBMISSION">SUBMISSION</option>
                      <option value="PENDING_RESPONSE">PENDING_RESPONSE</option>
                      <option value="ADMITTED">ADMITTED</option>
                      <option value="NOT_ADMITTED">NOT_ADMITTED</option>
                    </select>
                  </div>
                ))
              ) : (
                <Empty />
              )}
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: number;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 text-card-foreground shadow-sm">
      <Icon className="text-[#b88429]" size={20} />
      <p className="mt-7 text-3xl font-semibold">{value ?? "—"}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground">Aucun élément à afficher pour le moment.</p>;
}
