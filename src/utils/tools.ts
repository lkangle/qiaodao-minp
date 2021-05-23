import { CalendarItem } from './typings'

const weekMap = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

export function getWeekDate(): string {
  let now = new Date()
  let year = now.getFullYear();
  let month = padStart(now.getMonth() + 1);
  let day = padStart(now.getDate());
  let week = weekMap[now.getDay()];

  return `${year}.${month}.${day} ${week}`
}

export function padStart(value: any, v = "0"): string {
  return String(value).padStart(2, v)
}

export function getTime(date?: Date): string {
  let now = date || new Date()
  let hours = padStart(now.getHours())
  let minutes = padStart(now.getMinutes())
  let seconds = padStart(now.getSeconds())
  return `${hours}:${minutes}:${seconds}`
}

export function formatDate(date?: Date, space = '.'): string {
  if (!date) date = new Date()
  let year = date.getFullYear();
  let month = padStart(date.getMonth() + 1);
  let day = padStart(date.getDate());

  return `${year}${space}${month}${space}${day}`
}

function getMaxDays(year = 2021, month = 5): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 计算出来日历数组
 */
export function calcDateTupleArray(year = 2021, month = 5): CalendarItem[][] {
  let date = new Date(year, month - 1)
  let start = date.getDay()
  let days = getMaxDays(year, month)
  let weeks = Math.ceil((days + start) / 7)
  let result: any[] = []
  let count = 1
  for (let i = 0; i < weeks; i++) {
    let week: any[] = []
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < start) {
        week[j] = {}
      } else if (count <= days) {
        let day = count++
        week[j] = {
          day,
          date: new Date(year, month - 1, day),
          current: true
        }
      } else {
        week[j] = {}
      }
    }
    result[i] = week
  }
  return result
}

export function equalDate(d1: Date, d2: Date): boolean {
  if (!d1 || !d2) return false
  return formatDate(d1) === formatDate(d2)
}

export function plusMonth(date: Date, num: number) {
  let year = date.getFullYear()
  let month = date.getMonth()
  let day = date.getDate()
  let days = getMaxDays(year, month + num + 1)

  return new Date(year, month + num, Math.min(day, days))
}
