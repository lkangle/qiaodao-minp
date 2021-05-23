export enum TaskType {
  // 定位打开
  LOCATION = 1,
  // 扫码打开
  QRCODE,
  // 定位加扫码打开
  ALL
}

export enum TaskStatus {
  // 已完成
  DONE,
  // 进行中
  PROGRESS,
  // 未开始
  UN_PLAYED
}

export interface Task {
  // 任务名称
  name: string
  // 打开任务类型
  type: TaskType
  // 任务状态
  status: TaskStatus
  // 签到时间
  markTime?: string
  // 签到地点
  markLocation?: string
}

export interface CalendarItem {
  day: number
  date: Date
  current: boolean
}

export interface ControlMethod {
  nextMonth: VoidFunction
  prevMonth: VoidFunction
  backToday: VoidFunction
}
