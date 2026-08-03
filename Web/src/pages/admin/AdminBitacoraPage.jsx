import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import AccessDenied from '../../components/admin/AccessDenied'
import { Plus, Pencil, Trash } from '../../components/ui/icons'
import { usePermissions } from '../../hooks/usePermissions'
import { getLogs } from '../../services/logService'


function resolveLogValue(raw) {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/*
  Dibuja un objeto/array como una lista de "llave: valor", una por
  línea — en vez de JSON crudo con llaves, comillas y comas. Si un
  valor es a su vez un objeto, se llama a sí misma para dibujarlo
  anidado, con una sangría (borde izquierdo) para que se note el nivel.
*/
function KeyValueList({ data }) {
  if (data === null || data === undefined) {
    return <span className="text-neutral-500">—</span>
  }

  if (typeof data !== 'object') {
    return <span className="text-neutral-200">{String(data)}</span>
  }

  const entries = Array.isArray(data)
    ? data.map((value, index) => [index, value])
    : Object.entries(data)

  if (entries.length === 0) {
    return <span className="text-neutral-500">—</span>
  }

  return (
    <div className="space-y-1">
      {entries.map(([key, value]) => (
        <div key={key}>
          <span className="text-copper-light">{key}</span>
          <span className="text-neutral-600">: </span>
          {value !== null && typeof value === 'object' ? (
            <div className="ml-3 mt-1 border-l border-neutral-800 pl-3">
              <KeyValueList data={value} />
            </div>
          ) : (
            <span className="break-words text-neutral-200">{String(value)}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function ValuePanel({ label, value }) {
  const resolved = resolveLogValue(value)

  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-widest text-neutral-500">
        {label}
      </p>
      <div className="max-h-64 overflow-auto rounded-lg border border-neutral-800 bg-black/30 p-3 font-mono text-xs leading-relaxed">
        {resolved === null ? (
          <span className="text-neutral-500">—</span>
        ) : typeof resolved === 'object' ? (
          <KeyValueList data={resolved} />
        ) : (
          <span className="whitespace-pre-wrap break-words text-neutral-200">
            {String(resolved)}
          </span>
        )}
      </div>
    </div>
  )
}


function LogDetailModal({ open, log, onClose }) {
  if (!open || !log) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl text-white">Detalle del Log</h2>
            <p className="mt-1 text-xs text-neutral-500">{log.creationDate}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-neutral-800 bg-black/20 p-4 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-500">Usuario</p>
            <p className="mt-1 text-white">{log.userFullName}</p>
            <p className="text-xs text-neutral-500">{log.userEmail}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-500">Tabla / Operación</p>
            <p className="mt-1 text-white">{log.tableName}</p>
            <p className="text-xs text-neutral-500">{log.operationName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ValuePanel label="Valor anterior" value={log.oldValue} />
          <ValuePanel label="Valor nuevo" value={log.newValue} />
        </div>
      </div>
    </div>
  )
}



const PAGE_SIZE = 10
export default function AdminBitacoraPage() {
  const { loading: permsLoading, access, create, canDelete, modify } = usePermissions('/view/reports')

  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [dateFilter, setDateFilter] = useState(null)
  const [operationName, setOperationName] = useState(null)
  const [tableNameFilter, setTableNameFilter] = useState(null)
  const [page, setPage] = useState(0)


  const [viewDataLog, setViewDataLog] = useState(null)
  const [viewDataLogId, setViewDataLogId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQ, setSearchQ] = useState('')






  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [logsRes] = await Promise.all([getLogs({
          limit: PAGE_SIZE,
          page: page,
          tableName: tableNameFilter,
          operationName: operationName,
          date: dateFilter,
        })])
        if (!cancelled) {
          setLogs(Array.isArray(logsRes) ? logsRes : [])

          setError(null)

        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, fetchKey])

  async function handleSearch({ table, date, operation }) {

    const t = table !== undefined ? table.target.value : tableNameFilter
    const d = date !== undefined ? date.target.value : dateFilter
    const o = operation !== undefined ? operation.target.value : operationName

    setTableNameFilter(t)
    setDateFilter(d)
    setOperationName(o)

    
    setLoading(true)

    try {
      const res = await getLogs({
        limit: PAGE_SIZE,
        page: 0,
        tableName: t,
        operationName: o,
        date: d,
      })
      setLogs(Array.isArray(res) ? res : [])
      setError(null)
    } catch (err) { setError(err.message) }
    finally {
      setLoading(false)
      setPage(0)
    }
  }









  if (!permsLoading && !access) return <AccessDenied />

  return (
    <AdminLayout title="Bitacoras">

      <section className="rounded-2xl border border-neutral-800 bg-neutral-800/40 p-6">
        <div className="mb-5 flex items-center justify-between gap-4">

          <h2 className="font-display text-xl text-white">Bitacoras</h2>
        </div>
       <div className="mb-5 flex flex-wrap items-center justify-left gap-4">
  <div className="flex items-center gap-3">
    <input
      type="date"
      value={dateFilter}
      onChange={(e) => handleSearch({ date: e })}
      className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-4 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
    />
  </div>
  
  <div className="flex items-center gap-3">
    <select 
      id="opciones"
      className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-4 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
      onChange={(e) => handleSearch({ operation: e })}
      name="opciones"
    >
      <option value="" disabled selected>Selecciona una opción</option>
      <option value="Creacion">Creacion</option>
      <option value="Modificacion">Modificacion</option>
      <option value="Delete">Eliminacion</option>
    </select>
  </div>

  <div className="flex items-center gap-3">
    <input
      type="search"
      placeholder="Buscar tabla..."
      value={tableNameFilter}
      onChange={(e) => handleSearch({ table: e })}
      className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-4 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
    />
  </div>
</div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-[11px] uppercase tracking-widest text-neutral-500">
              <th className="pb-3 pr-4">Usuario</th>
              <th className="pb-3 pr-4">Tabla</th>
              <th className="pb-3 pr-4">Fecha/Hora</th>


            </tr>
          </thead>
          <tbody>
            {(permsLoading || loading) ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-neutral-500">
                  Cargando...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-neutral-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                viewDataLogId === l.logId ? (
                  <tr
                    key={l.logId}
                    onClick={() => setViewDataLog(l)}
                    className="cursor-pointer border-b border-neutral-800 hover:bg-neutral-800/40"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-white">{l.userFullName}</p>
                    </td>
                    <td className="py-3 pr-4 text-neutral-300">{l.tableName}</td>
                    <td className="py-3 pr-4 text-neutral-400">{l.creationDate}</td>
                  </tr>


                ) :
                  (
                    <tr key={l.logIdid}
                      onClick={() => setViewDataLogId(l.logId)}
                      className="border-b border-neutral-800 hover:bg-neutral-800/40">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-white">
                          {l.userFullName}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-neutral-300">{l.tableName}</td>
                      <td className="py-3 pr-4 text-neutral-400">
                        {l.creationDate}
                      </td>
                      <td className="py-3 pr-4">

                      </td>

                    </tr>
                  )))
            )}
          </tbody>
        </table>

        <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
          <span>Mostrando {logs.length} entradas</span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex h-7 w-7 items-center justify-center rounded border border-neutral-700 text-neutral-400 disabled:opacity-40 hover:border-copper hover:text-copper-light"
            >
              ‹
            </button>
            <span className="flex h-7 w-7 items-center justify-center rounded border border-copper bg-copper/10 text-copper-light">
              {page + 1}
            </span>
            <button
              disabled={logs.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-neutral-700 text-neutral-400 disabled:opacity-40 hover:border-copper hover:text-copper-light"
            >
              ›
            </button>
          </div>
        </div>
      </section>
      <LogDetailModal
        open={viewDataLog !== null}
        log={viewDataLog}
        onClose={() => setViewDataLog(null)}
      />

    </AdminLayout>
  )
}
