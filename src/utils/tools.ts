const weekMap = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

export function getWeekDate(): string {
  let now = new Date()
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
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
