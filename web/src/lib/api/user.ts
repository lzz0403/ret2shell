import type { User } from "$lib/models/user";
import { api, api_root } from ".";

export async function getUserInfo (id: number) {
    return (await api.get(`${api_root}/user/${id}`)).data as User
}
