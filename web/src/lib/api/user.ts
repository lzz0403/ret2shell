import type { Institute } from '$lib/models/institute'
import type { User } from '$lib/models/user'
import { api, api_root } from '.'

export async function getUserInfo(id: number) {
  return (await api.get(`${api_root}/user/${id}`)).data as User
}

export async function getInstituteList() {
  return (await api.get(`${api_root}/user/institute`)).data as Institute[]
}
