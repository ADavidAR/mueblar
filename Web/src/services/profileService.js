import request from './request'

export const getProfile = () => {
 
  return request('/api/profile')
}
