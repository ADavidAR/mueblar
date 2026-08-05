import { useEffect, useState } from 'react'
import {useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { User } from '../../components/ui/icons'
import { getRole,createRole,updateRole } from '../../services/roleService'


/*
 Cada módulo agrupa varios patrones de ruta bajo un mismo conjunto de 4
  interruptores (Acceso/Crear/Eliminar/Modificar).
*/
const MODULES = [
  {
    key: 1,
    label: 'Categoria',
    
   
  },
  {
    key: 2,
    label: 'Roles y Permisos',
   
   
  },
  {
    key: 3,
    label: 'Usuarios',
    

  },
  {
    key: 4,
    label: 'Productos y Variaciones',
    

  },
  {
    key: 5,
    label: 'Tipo Atributos',
    
   
  },
  {
    key: 6,
    label: 'Atributos',
    
   
  },
  {
    key: 7,
    label: 'Bitácoras',
    
   
  }
]

// Mismos bits que usa el backend (GET=8, POST=4, DELETE=2, PUT=1),
// pero aquí mapeados a las etiquetas de la matriz en pantalla.
const ACTIONS = [
  { key: 'access',    label: 'Acceso',    bit: 8 },
  { key: 'create',   label: 'Crear',     bit: 4 },
  { key: 'delete', label: 'Eliminar',  bit: 2 },
  { key: 'modify',    label: 'Modificar', bit: 1 },
]

const permissionsInitial = MODULES.map((m) => ({
  id: m.key,
  access: false,
  create: false,
  delete: false,
  modify: false
}));



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



export function AdminRoleFromPage() {
  //se definien los estamos para que determinan si la pagina sera para editar o crear un nuevo role
  const {id:routeId}=useParams()
  const navigate = useNavigate()
  const isEdit= Boolean(routeId)

  //aqui los datos almacenados que seran cargados en caso de edicion o llenados en caso de creacion
  const [roleName, setRoleName] = useState('')
  const [editable, setEditable] = useState(true)
  const [permissions, setPermissions] = useState(permissionsInitial )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

 
  function toggleAction(moduleKey, actionKey, value) {
    
  setPermissions((prev) =>
    prev.map((item) =>
      item.id === moduleKey
        ? { ...item, [actionKey]: value } // Si es el módulo, actualizamos la propiedad
        : item                            // Si no, lo dejamos igual
    )
    
  );
 
}

  function handleSelectAll() {
    
  const all = MODULES.map((m) => ({
  id: m.key,
  access: true,
  create: true,
  delete: true,
  modify: true
}))
    setPermissions(all)
  }

  function handleClearAll() {
    setPermissions(permissionsInitial)
  }

  function handleCancel() {
    navigate('/view/roles-management')
  }
//en caso de ser edicion carga los datos 
  useEffect(()=>{
    let cancelled = false
    if(isEdit){
       async function loadRefs() {
         try {
           const role = await Promise.all([
             getRole(routeId)
             
           ])
           if (!cancelled ) {
            setRoleName(role[0].name)
             setEditable(role[0].editable)
             setPermissions(Array.from(new Map(role[0].permissions.map((p) => [p.id, p])).values()))
             
           }
           var x=Array.from(new Map(role[0].permissions.map((p) => [p.id, p])).values())
           console.log(x)
           console.log(x.filter((p)=>p.id===1)[0][ACTIONS[0].key])
         } catch { /* selectores quedan vacíos si falla */ }
       }
       loadRefs()
      }
       return () => { cancelled = true }
},[])


// guarda los datos
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
        editable:editable,
        permissions: permissions,
      }
     //en caso de editar llamamos a la funcion que edtar role y si es crear pues a la de creacion de rol
      if(isEdit){
        await updateRole(routeId,payload)
      }
      else{
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
            <span className="text-copper">{isEdit?("Editar"):("Crear nuevo") }  Rol</span>
          </p>
          <h1 className="font-display text-3xl text-white">{isEdit?("Editar"):("Crearr nuevo") } Rol</h1>
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
            <div className="flex items-center gap-2">
              
              <h2 className="text-sm font-medium text-white">Matriz de Permisos</h2>
            </div>
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
              {MODULES.map((mod) => (
                <tr key={mod.key} className="border-t border-neutral-800">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                     
                      <div>
                        <p className="font-medium text-white">{mod.label}</p>
                        
                      </div>
                    </div>
                  </td>
                  {
                    
                   ACTIONS.map((a) => {
                    const permisoEncontrado = permissions.find((p) => p.id === mod.key);
                   
                   
                    return (

                   <td key={a.key} className="py-4 text-center">
                      <div className="flex justify-center">
                        <ToggleSwitch
                          checked={permisoEncontrado?.[a.key]}
                          onChange={(value) => toggleAction(mod.key, a.key, value)}
                        />
                      </div>
                    </td>
                      )})
                  }
                </tr>
              ))}
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
