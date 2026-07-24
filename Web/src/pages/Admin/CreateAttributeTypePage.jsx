  import { useNavigate } from 'react-router-dom'
  import { useState, useEffect, useCallback } from 'react'
  import { useAuth, hasPermission } from '../../context/AuthContext'
  import AdminLayout from '../../components/layout/AdminLayout'
  import { Plus, Pencil, Trash, Search } from '../../components/ui/icons'
  import Button from '../../components/ui/Button'
  import Field from '../../components/ui/Field'
  import {
    getProducts,
    searchProducts,
    deleteProduct,
    getAttributeTypes,
    getAttributes,
    createAttributeType
  } from '../../services/productService'


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






  export default function CreateAttributeTypePage() {

    
    const navigate = useNavigate()
    const { user } = useAuth()
    const canCreateProduct = hasPermission(user?.permissions, '/api/products', 'POST')
    const [id, setId_Mod] = useState('')
    const [description, setDescription_Mod] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)


    function handleDiscard() {
      navigate('/view/inventory')
    }

    function handleSaveAttributeType() {
      
      if(!id.trim()){
        setError('El nombre del tipo de atributo es obligatorio.')
        return
      }
      if(!description.trim()){
        setError('La descripción es obligatoria.')
        return
      }
      setSaving(true)
      setError(null)
      try {
        createAttributeType({
          id:id.trim(),
          description:description.trim()
        })
      console.log(description)
        navigate('/view/inventory')
      } catch (error) {
        setError(error.message)
        
      }finally{
        setSaving(false)
      }
      console.log("hola")
    }

    

    return (
      <AdminLayout title="Inventario" searchPlaceholder="Buscar catálogo...">
        <div className="flex min-h-[70vh] items-center justify-center px-6 ">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="font-display text-3xl text-white ">
                Nuevo Tipo de Atributo
              </h1>
              <span className="mx-auto mt-3 block h-0.5 w-10 rounded-full bg-copper" />
            </div>
            
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-neutral-500">
              Nombre de Tipo Atributo
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId_Mod(e.target.value)}
              placeholder="Ej: Color"
              className="mb-4 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-copper/50 focus:outline-none"
            />
<label className="mb-1 block text-[11px] uppercase tracking-widest text-neutral-500">
              Descripción Modificada
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription_Mod(e.target.value)}
              placeholder="Descripción (opcional)"
              className="mb-6 w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-white placeholder:text-neutral-600 focus:border-copper/50 focus:outline-none"
            />

            {error && (
              <p className="mb-4 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-neutral-800 pt-6">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-300"
                >
                  × Descartar cambios
                </button>

                <button
                  type="button"
                  onClick={handleSaveAttributeType}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-full bg-copper px-6 py-2.5 text-sm font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'} →
                </button>
            </div>
          </div>
        </div>  

      </AdminLayout>
    )
  }
