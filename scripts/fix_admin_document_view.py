from pathlib import Path
p=Path('/home/ubuntu/work2/client/src/pages/Admin.tsx')
s=p.read_text()
s=s.replace('import { toast } from "sonner";', 'import { toast } from "sonner";\nimport { useEffect, useState } from "react";')
s=s.replace('  const documents = trpc.admin.documents.useQuery(undefined, { enabled: allowed });', '  const documents = trpc.admin.documents.useQuery(undefined, { enabled: allowed });\n  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);\n  const documentUrl = trpc.admin.documentUrl.useQuery({ id: selectedDocument ?? 0 }, { enabled: Boolean(selectedDocument), refetchOnWindowFocus: false });\n  useEffect(() => { if (documentUrl.data?.url) { window.open(documentUrl.data.url, "_blank", "noopener,noreferrer"); setSelectedDocument(null); } }, [documentUrl.data]);')
s=s.replace('const documentUrl = trpc.admin.documentUrl.useQuery({ id: 0 }, { enabled: false });\n  ', '')
s=s.replace('onClick={async () => { const result = await documentUrl.refetch({ throwOnError: false }); if (result.data?.url) window.open(result.data.url, "_blank", "noopener,noreferrer"); }}', 'onClick={() => setSelectedDocument(item.id)}')
p.write_text(s)
