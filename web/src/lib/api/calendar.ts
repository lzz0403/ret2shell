import { api, api_root } from '.'

export async function getCalendarList(startTime: number, endTime: number) {
    return await api.GET(`${api_root}/calendar?start_time=${startTime}&end_time=${endTime}`)
}
