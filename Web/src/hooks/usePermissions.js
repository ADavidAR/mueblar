import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPermitsForUrl } from '../services/authService'

const NO_PERMS = { loading: true, access: false, create: false, canDelete: false, modify: false }

export function usePermissions(endpoint) {
  const navigate = useNavigate()
  const [state, setState] = useState(NO_PERMS)

  useEffect(() => {
    let cancelled = false
    getPermitsForUrl(endpoint)
      .then((data) => {
        if (!cancelled) setState({
          loading:   false,
          access:    data.access,
          create:    data.create,
          canDelete: data.delete,
          modify:    data.modify,
        })
      })
      .catch(() => {
        if (!cancelled) navigate('/login', { replace: true })
      })
    return () => { cancelled = true }
  }, [endpoint, navigate])

  return state
}
