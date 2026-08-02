import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { validateEmail, validatePassword, validateName } from '../../services/validator'
import { getUser, createUser, updateUser } from '../../services/userAdminService'
import { getRoles } from '../../services/roleService'

// El rol "Cliente" (id 2) no se puede asignar desde este panel —
// ServiceUser.java lo rechaza explícitamente tanto al crear como al
// editar, así que ni siquiera lo mostramos como opción.
const CLIENT_ROLE_ID = 2

function FormField({ label, ...inputProps }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] uppercase tracking-widest text-neutral-500">
        {label}
      </label>
      <input
        {...inputProps}
        className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-white placeholder:text-neutral-600 focus:border-copper/50 focus:outline-none"
      />
    </div>
  )
}

//Componente que hace de switch
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

export function AdminUserFromPage() {
// En caso de que la ventana se use para editar el usuario pasamos el parametro id de lo que se va a modificar 
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(routeId)
//usamos usestate para almacenar los paraetros que se van a crear o modificar 
  const [firstName, setFirstName]   = useState('')
  const [lastName, setLastName]     = useState('')
  const [email, setEmail]           = useState('')
  const [roleId, setRoleId]         = useState('')
  
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  // Solo importa en modo edición: al crear, el backend siempre habilita
  // al usuario sin importar lo que se mande, así que este estado no se
  // muestra ni se usa en modo creación.

  const [enabled, setEnabled]       = useState(true)
  //use state para manejar errores de carga o de campos faltantes 
  const [roles, setRoles]     = useState([])
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving]   = useState(false)


  //se cargan los roles para poder seleccionarlos y ponercelos a los usuarios
  useEffect(() => {
    getRoles({ limit: 100 })
      .then((res) => setRoles(Array.isArray(res) ? res : []))
      .catch(() => setRoles([]))
  }, [])


  //En caso de edicicon detecta el useStatate de si la pagina se usa para editar(isEdit)
  // y trae de la base los datos del usuario que se va a editar,
  //  y se los asigna a los useState de los parametros correspondientes.
  useEffect(() => {
    let cancelled = false

    if (isEdit) {
      getUser(routeId)
        .then((user) => {
          if (cancelled) return
          // UserSummaryResponseDTO usa nombre/apellido (el campo viene en español de la base), no
          // firstName/lastName como el resto de tu backend.
          setFirstName(user.nombre ?? '')
          setLastName(user.apellido ?? '')
          setEmail(user.email ?? '')
          setRoleId(user.role?.id ?? '')
          setEnabled(user.enabled)
          console.log(user.enabled)
          setPassword(user.password)
          setConfirm(user.password)
          // No hay campo "enabled" en la respuesta del backend todavía —
          // se deja en true por defecto, sin poder reflejar el valor real.
        })
        .catch((err) => setErrors({ server: err.message }))
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    return () => { cancelled = true }
  }, [routeId, isEdit])

  
//validamos si no hay campos vacios 
  function validate() {
    const newErrors = {}

    const firstNameError = validateName(firstName)
    if (firstNameError) newErrors.firstName = firstNameError

    const lastNameError = validateName(lastName)
    if (lastNameError) newErrors.lastName = lastNameError

    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError

    if (!roleId) newErrors.roleId = 'Selecciona un rol.'

    // La contraseña es obligatoria tanto al crear como al editar —
    // ver nota sobre el bug de updateUser que no protege contra
    // contraseñas vacías.
    if(!isEdit){
    const passwordError = validatePassword(password)
    if (passwordError) newErrors.password = passwordError

    if (!confirm) newErrors.confirm = 'Confirma la contraseña.'
    else if (password !== confirm) newErrors.confirm = 'Las contraseñas no coinciden.'
    }
    return newErrors
  }

  //accion de cancelar solo regresa a la pagina de usuarios
  function handleCancel() {
    navigate('/view/users-management')
  }


  //accion de guardar cambios
  async function handleSave() {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setSaving(true)
    //crea el json que se enviara para  el usuario
    try {
      
      const payload = {
        name: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role: { id: roleId },
        enabled,
      }
      //en caso de edicion se hara llamara al metodo updateUser y si es crear, se hara al metodo createUser
      if (isEdit) {
        await updateUser(routeId, payload)
      } else {
        await createUser(payload)
      }
      navigate('/view/users-management')
    } catch (err) {
      setErrors({ server: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Usuarios">
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-neutral-500">
          Cargando...
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Usuarios">
      {/* ── Encabezado ── */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-neutral-500">
            Gestión de Personal <span className="text-neutral-700">/</span> Usuarios{' '}
            <span className="text-neutral-700">/</span>{' '}
            <span className="text-copper">{isEdit ? 'Editar' : 'Crear'} Usuario</span>
          </p>
          <h1 className="font-display text-3xl text-white">
            {isEdit ? 'Editar' : 'Crear'} Usuario
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500">
            Define la información personal y los límites de acceso para los
            miembros del equipo. Este perfil determinará las herramientas
            visuales y de gestión que estarán disponibles.
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

      {errors.server && (
        <p className="mb-6 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">
          {errors.server}
        </p>
      )}

      {/* ── Tarjeta principal ── */}
      <div className="grid grid-cols-1 gap-8 rounded-2xl border border-neutral-800 bg-neutral-800/40 p-6 md:grid-cols-[220px_1fr]">
        {/* Columna izquierda: etiqueta de sección + toggle activo (solo al editar) */}
        <div className="flex items-start justify-between gap-4 md:flex-col md:items-start">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-copper/15 text-copper-light">
              💼
            </span>
            <h2 className="text-sm font-medium text-white">
              Información
              <br />
              Básica
            </h2>
          </div>

          {isEdit && (
            <div className="text-right md:mt-8 md:text-left">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-copper">
                Activo
              </p>
              <ToggleSwitch checked={enabled} onChange={setEnabled} />
            </div>
          )}
        </div>

        {/* Columna derecha: el formulario */}
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Nombre"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ej. Ana"
            />
            <FormField
              label="Apellido"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ej. García"
            />
          </div>
          {(errors.firstName || errors.lastName) && (
            <p className="text-xs text-red-400">
              {errors.firstName || errors.lastName}
            </p>
          )}

          <FormField
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ana@mueblar.com"
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}

          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-neutral-500">
              Rol Asignado
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-white focus:border-copper/50 focus:outline-none"
            >
              <option value="" className="bg-neutral-800">
                Seleccionar Rol
              </option>
              {roles
                .filter((r) => String(r.id) !== String(CLIENT_ROLE_ID))
                .map((r) => (
                  <option key={r.id} value={r.id} className="bg-neutral-800">
                    {r.name}
                  </option>
                ))}
            </select>
            {errors.roleId && <p className="mt-1 text-xs text-red-400">{errors.roleId}</p>}
          </div>
                {!isEdit && 
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <FormField
                label={isEdit ? 'Nueva Contraseña' : 'Contraseña'}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>
            <div>
              <FormField
                label="Confirmar Contraseña"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirm && <p className="mt-1 text-xs text-red-400">{errors.confirm}</p>}
            </div>
          </div>
                }
        </div>
      </div>
    </AdminLayout>
  )
}
