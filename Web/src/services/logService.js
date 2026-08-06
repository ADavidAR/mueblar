import request from './request'

 
// ── Logs ───────────────────────────────────────────────────────────────────
 
/*
  page es el NÚMERO de página (empieza en 0), no una cantidad de registros
  a saltar — coincide con como Spring arma PageRequest.of(page, limit)
  del lado del backend. No confundir con "offset".
 
  tableName, operationName y date son opcionales: solo se agregan a la URL
  si el usuario realmente los proporcionó.
*/
export const getLogs = ({ limit, page, tableName, operationName, date } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined)  params.set('limit', limit)
  if (page !== undefined)   params.set('page', page)
  if (tableName)             params.set('tableName', tableName)
  if (operationName)         params.set('operationName', operationName)
  // date debe venir como string "YYYY-MM-DD" — el value de un
  // <input type="date"> ya viene exactamente en ese formato.
  if (date)                  params.set('date', date)
 
  const qs = params.toString()
  return request(`/api/logs${qs ? `?${qs}` : ''}`)
}
