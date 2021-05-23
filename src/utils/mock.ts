import { Task, TaskStatus, TaskType } from './typings'

export const AVATAR_URL = 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTItxLDSM19Lrs7dibdkAVicU3zyShbcOCiafshIYAZ0u2OQzUbG4eZtZVoXQPnptwdcWrNrvNiaxeocnQ/132'

export const TASKS: Task[] = [
  {
    name: '上课',
    type: TaskType.LOCATION,
    status: TaskStatus.DONE,
    markTime: "08:27:18",
    markLocation: "明德楼"
  },
  {
    name: '上课',
    type: TaskType.ALL,
    status: TaskStatus.PROGRESS
  },
  {
    name: '下课',
    type: TaskType.LOCATION,
    status: TaskStatus.UN_PLAYED
  }
]
