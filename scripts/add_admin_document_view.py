from pathlib import Path
p=Path('/home/ubuntu/work2/server/db.ts')
s=p.read_text()
s=s.replace('originalName: serviceRequestDocuments.originalName, mimeType:', 'originalName: serviceRequestDocuments.originalName, fileKey: serviceRequestDocuments.fileKey, mimeType:', 1)
s += '''\nexport async function getAdminDocument(id: number) {\n  const db = await getDb();\n  if (!db) return undefined;\n  const result = await db.select({ id: serviceRequestDocuments.id, fileKey: serviceRequestDocuments.fileKey }).from(serviceRequestDocuments).where(eq(serviceRequestDocuments.id, id)).limit(1);\n  return result[0];\n}\n'''
p.write_text(s)

p=Path('/home/ubuntu/work2/server/routers.ts')
s=p.read_text()
s=s.replace('  listAdminDocuments,', '  listAdminDocuments,\n  getAdminDocument,')
s=s.replace('import { storagePut } from "./storage";', 'import { storageGetSignedUrl, storagePut } from "./storage";')
s=s.replace('    updateDocumentStatus: staffProcedure.input', '    documentUrl: staffProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => { const document = await getAdminDocument(input.id); if (!document) throw new TRPCError({ code: "NOT_FOUND" }); return { url: await storageGetSignedUrl(document.fileKey) }; }),\n    updateDocumentStatus: staffProcedure.input')
p.write_text(s)

p=Path('/home/ubuntu/work2/client/src/pages/Admin.tsx')
s=p.read_text()
s=s.replace('const documentStatus = trpc.admin.updateDocumentStatus.useMutation', 'const documentUrl = trpc.admin.documentUrl.useQuery({ id: 0 }, { enabled: false });\n  const documentStatus = trpc.admin.updateDocumentStatus.useMutation')
s=s.replace('<p className="text-xs text-muted-foreground">Demande #{item.requestId} · {item.mimeType}</p>', '<p className="text-xs text-muted-foreground">Demande #{item.requestId} · {item.mimeType}</p><button onClick={async () => { const result = await documentUrl.refetch({ throwOnError: false }); if (result.data?.url) window.open(result.data.url, "_blank", "noopener,noreferrer"); }} className="mt-2 text-xs font-semibold text-[#000091]">Consulter le fichier</button>')
# replace the fixed disabled query pattern with a per-click direct client call is not supported by refetch params; instead use a small cache id state below.
p.write_text(s)
