import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import AccessDenied from '../../components/admin/AccessDenied'
import { Plus, Pencil, Trash } from '../../components/ui/icons'
import { usePermissions } from '../../hooks/usePermissions'
import {
  getUsers,
  searchUsers,
  deleteUser,
} from '../../services/userAdminService'
import { useNavigate } from 'react-router-dom'

// componente de boton 
function AddButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-copper px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  )
}
// componente que muestra el estado del usuario
function StatusBadge({ enabled }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        enabled
          ? 'bg-emerald-900/40 text-emerald-400'
          : 'bg-red-900/30 text-red-400'
      }`}
    >
      {enabled ? 'Activo' : 'Suspendido'}
    </span>
  )
}

const PAGE_SIZE = 10



// pagina de usuario
export default function AdminUsersPage() {
  //verifica los permisos
  const { loading: permsLoading, access, create, canDelete, modify } = usePermissions('/view/users-management')
  //useStates para almacenar datos prevnientes de backen y manejo de errores
  const navigate= useNavigate()
  //usuarios del backend
  const [users, setUsers]     = useState([])//lista original traida
  
  const [loading, setLoading] = useState(true)
 
  //filtros paginacion y manejos de errore
  const [nameFilter,setNameFilter] = useState("")
  
  
  const [error, setError]     = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [page, setPage]       = useState(0)
  const[refresh,setRefresh]   =useState(null)

//estados para cuando se realiza borrado
   const [confirmDeleteId, setConfirmDeleteId] = useState(null)
   const [deleting, setDeleting]               = useState(false)

  const [fetchKey, setFetchKey] = useState(0)

  //cargar la data a la hora de cargar la pagina
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await getUsers({ 
          limit: PAGE_SIZE,
           page: page,
          name:searchQ
          })
        if (!cancelled) {
          setUsers(Array.isArray(res) ? res : [])
        
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
  }, [page, fetchKey,refresh])


//funcion para realizar busquedas por nombre
  async function handleSearch(e) {
    const sf =  e!== undefined ? e.target.value : searchQ
         
      
          setSearchQ(sf)
      
          setLoading(true)
      
          try {
            const res = await getUsers({
             limit: PAGE_SIZE,
              page: page,
              name:sf
            })
            setUsers(Array.isArray(res) ? res : [])
            setError(null)
          } catch (err) { setError(err.message) }
          finally {
            setLoading(false)
            setPage(0)
          }
  }
//funcion para confirmar borrado de un usuario
  async function handleDelete(id, name) {
    setDeleting(true)
    if (!confirm(`¿Eliminar el usuario "${name}"?`)) return
    try {
      await deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setConfirmDeleteId(null)
      
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(false)
      setRefresh(refresh? false:true)
    }
  }

  if (!permsLoading && !access) return <AccessDenied />

  return (
    <AdminLayout title="Configuración de Usuarios">

      <section className="rounded-2xl border border-neutral-800 bg-neutral-800/40 p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl text-white">Personal del Sistema</h2>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Buscar usuario..."
              value={searchQ}
              onChange={handleSearch}
              className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-4 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
            />
            {create && <AddButton
            onClick={()=>navigate('/view/users/create')}
            label="Crear Usuario" />}
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
              <th className="pb-3 pr-4">Correo</th>
              <th className="pb-3 pr-4">Rol</th>
              <th className="pb-3 pr-4">Estado</th>
              <th className="pb-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(permsLoading || loading) ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-neutral-500">
                  Cargando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-neutral-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                confirmDeleteId === u.id ? (
                  
                   <tr key={u.id} className="border-b border-neutral-800">
                    <td colSpan={4} className="py-3 ">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-red-400">
                          ¿Estás seguro de eliminar al ususario {' '}
                          <span className="font-medium text-white">" {u.nombre} {u.apellido}"</span>?
                        </p>
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-full border border-neutral-700 px-4 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deleting}
                            className="rounded-full bg-red-700/70 px-4 py-1.5 text-xs text-red-200 transition-opacity hover:bg-red-700 disabled:opacity-50"
                          >
                            {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ):
                (
                <tr key={u.id} className="border-b border-neutral-800 hover:bg-neutral-800/40">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-white">
                      {u.nombre} {u.apellido}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-neutral-300">{u.email ?? u.correo}</td>
                  <td className="py-3 pr-4 text-neutral-400">
                    {u.role?.name ?? u.id_rol ?? '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge enabled={u.enabled !== false && u.habilitado !== false} />
                  </td>
                  <td className="py-3 text-right">
                    {u.role.editable?(
                    <div className="inline-flex gap-1">
                      {modify && (
                        <button
                        onClick={()=>navigate(`/view/users/edit/${u.id}`)} 
                        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-white">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setConfirmDeleteId(u.id)}
                          className="rounded p-1.5 text-neutral-400 hover:bg-red-900/40 hover:text-red-400"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                        ):(
                         
                           <p className="py-3 pr-4 text-neutral-300">
                      Usuario No Editable
                    </p>
                        )}
                  </td>
                </tr>
              )))
            )}
          </tbody>
        </table>

        <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
          <span>Mostrando {users.length} entradas</span>
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
              disabled={users.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-neutral-700 text-neutral-400 disabled:opacity-40 hover:border-copper hover:text-copper-light"
            >
              ›
            </button>
          </div>
        </div>
      </section>

    </AdminLayout>
  )
}
