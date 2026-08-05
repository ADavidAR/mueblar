import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { User } from '../../components/ui/icons'
import { getRole, createRole, updateRole } from '../../services/roleService'

/**
 * Catálogo de módulos del sistema que se pueden habilitar por rol. El
 * `key` de cada uno coincide con el id_modulo real de la base de datos.
 */
const MODULES = [
  { key: 1, label: 'Categoria' },
  { key: 2, label: 'Roles y Permisos' },
  { key: 3, label: 'Usuarios' },
  { key: 4, label: 'Productos y Variaciones' },
  { key: 5, label: 'Tipo Atributos' },
  { key: 6, label: 'Atributos' },
  { key: 7, label: 'Bitacoras' },
]

/**
 * Las 4 acciones de la matriz de permisos, con el bit correspondiente
 * en el esquema que usa el backend (GET=8, POST=4, DELETE=2, PUT=1).
 */
const ACTIONS = [
  { key: 'access', label: 'Acceso',    bit: 8 },
  { key: 'create', label: 'Crear',     bit: 4 },
  { key: 'delete', label: 'Eliminar',  bit: 2 },
  { key: 'modify', label: 'Modificar', bit: 1 },
]

/**
 * Estado inicial de la matriz de permisos: los 7 módulos con sus 4
 * acciones en `false`. Se usa tanto al crear un rol nuevo como al
 * limpiar la matriz con "Limpiar".
 */
const permissionsInitial = MODULES.map((m) => ({
  id: m.key,
  access: false,
  create: false,
  delete: false,
  modify: false,
}))

/**
 * Interruptor visual tipo switch, reutilizado en toda la matriz de
 * permisos y en el toggle de "Modificable".
 *
 * @param {boolean} checked estado actual del interruptor
 * @param {Function} onChange se llama con el nuevo valor al hacer click
 * @param {boolean} disabled si es true, el interruptor no responde a clicks
 */
function ToggleSwitch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-copper' : 'bg-neutral-700'
      } disabled:opacity-40`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

/**
 * Determina si un toggle de acción (crear/eliminar/modificar) debe
 * verse deshabilitado. Solo aplica cuando el módulo todavía no tiene
 * acceso — no tendría sentido poder crear sin poder ni siquiera entrar.
 *
 * @param {string} actionKey acción a evaluar (access, create, delete o modify)
 * @param {object} modulePermission permisos actuales del módulo evaluado
 * @returns {boolean} true si el interruptor debe estar deshabilitado
 */
function isActionDisabled(actionKey, modulePermission) {
  return actionKey !== 'access' && !modulePermission?.access
}

/**
 * Página para crear o editar un rol del sistema. En modo edición carga
 * los datos existentes según el id de la ruta; en modo creación arranca
 * con la matriz de permisos vacía.
 */
export function AdminRoleFromPage() {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(routeId)

  const [roleName, setRoleName] = useState('')
  const [editable, setEditable] = useState(true)
  const [permissions, setPermissions] = useState(permissionsInitial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Actualiza el permiso de un módulo específico. Si se apaga el
   * acceso, también apaga crear/eliminar/modificar para ese mismo
   * módulo, para no dejar guardado un estado contradictorio.
   *
   * @param {number} moduleKey id del módulo que se está modificando
   * @param {string} actionKey acción a cambiar (access, create, delete o modify)
   * @param {boolean} value nuevo valor del interruptor
   */
  function toggleAction(moduleKey, actionKey, value) {
    setPermissions((prev) =>
      prev.map((item) => {
        if (item.id !== moduleKey) return item

        if (actionKey === 'access') {
          return value
            ? { ...item, access: true }
            : { ...item, access: false, create: false, delete: false, modify: false }
        }

        if (!item.access) return item

        return { ...item, [actionKey]: value }
      })
    )
  }

  /**
   * Activa las 4 acciones en todos los módulos de la matriz a la vez.
   */
  function handleSelectAll() {
    setPermissions(
      MODULES.map((m) => ({ id: m.key, access: true, create: true, delete: true, modify: true }))
    )
  }

  /**
   * Apaga las 4 acciones en todos los módulos, dejando la matriz en
   * su estado inicial.
   */
  function handleClearAll() {
    setPermissions(permissionsInitial)
  }

  /**
   * Descarta la edición actual y vuelve al listado de roles.
   */
  function handleCancel() {
    navigate('/view/roles-management')
  }

  /**
   * En modo edición, trae el rol existente del backend y llena el
   * formulario con sus datos (nombre, modificable, matriz de permisos).
   */
  useEffect(() => {
    let cancelled = false
    if (isEdit) {
      getRole(routeId)
        .then((role) => {
          if (cancelled) return
          setRoleName(role.name)
          setEditable(role.editable)
          setPermissions(Array.from(new Map(role.permissions.map((p) => [p.id, p])).values()))
        })
        .catch(() => { /* selectores quedan vacíos si falla */ })
    }
    return () => { cancelled = true }
  }, [isEdit, routeId])

  /**
   * Valida el nombre del rol y envía la matriz de permisos al backend,
   * usando updateRole en modo edición o createRole en modo creación.
   */
  async function handleSave() {
    if (!roleName.trim()) {
      setError('El nombre del rol es obligatorio.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: roleName.trim(),
        editable,
        permissions,
      }
      if (isEdit) {
        await updateRole(routeId, payload)
      } else {
        await createRole(payload)
      }
      navigate('/view/roles-management')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Roles">
      {/* ── Encabezado ── */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-neutral-500">
            Gestión de Personal <span className="text-neutral-700">/</span> Roles{' '}
            <span className="text-neutral-700">/</span>{' '}
            <span className="text-copper">{isEdit ? 'Editar' : 'Crear nuevo'} Rol</span>
          </p>
          <h1 className="font-display text-3xl text-white">{isEdit ? 'Editar' : 'Crear nuevo'} Rol</h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500">
            Define las capacidades y límites de acceso para los miembros de tu
            equipo artístico y logístico. Este perfil determinará las
            herramientas visuales y de gestión que estarán disponibles para
            el usuario.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-neutral-700 px-5 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-copper px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* ── Información básica ── */}
        <div className="h-fit rounded-2xl border border-neutral-800 bg-neutral-800/40 p-5">
          <div className="mb-5 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-copper/15 text-copper-light">
                <User className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-sm font-medium text-white">
                Información
                <br />
                Básica
              </h2>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-copper">
                Modificable
              </p>
              <ToggleSwitch checked={editable} onChange={setEditable} />
            </div>
          </div>

          <label className="mb-1 block text-[11px] uppercase tracking-widest text-neutral-500">
            Nombre del Rol
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="e.g., Editor de Catálogo"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-copper/50 focus:outline-none"
          />
        </div>

        {/* ── Matriz de permisos ── */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-800/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Matriz de Permisos</h2>
            <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest">
              <button type="button" onClick={handleSelectAll} className="text-copper-light hover:text-copper">
                Seleccionar Todo
              </button>
              <button type="button" onClick={handleClearAll} className="text-neutral-500 hover:text-neutral-300">
                Limpiar
              </button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-neutral-500">
                <th className="pb-3 font-normal">Módulo de Sistema</th>
                {ACTIONS.map((a) => (
                  <th key={a.key} className="pb-3 text-center font-normal">
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod) => {
                const permisoEncontrado = permissions.find((p) => p.id === mod.key)
                return (
                  <tr key={mod.key} className="border-t border-neutral-800">
                    <td className="py-4 pr-4">
                      <p className="font-medium text-white">{mod.label}</p>
                    </td>
                    {ACTIONS.map((a) => (
                      <td key={a.key} className="py-4 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            checked={permisoEncontrado?.[a.key] ?? false}
                            onChange={(value) => toggleAction(mod.key, a.key, value)}
                            disabled={isActionDisabled(a.key, permisoEncontrado)}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="mt-6 flex gap-3 rounded-xl border border-neutral-800 bg-black/20 p-4">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-copper/15 text-copper-light">
              !
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                Nota de Seguridad
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                Los permisos de "Eliminar" son críticos y deben otorgarse
                únicamente a administradores de alto nivel. Una vez eliminado
                un activo del catálogo, la recuperación requiere intervención
                del equipo de base de datos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
