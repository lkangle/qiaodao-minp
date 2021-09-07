import React from 'react'
import { Button, Text, View } from '@tarojs/components'
import { Task, TaskStatus } from '../../utils/typings'
import useTime from '../../hooks/useTime'
import TimeLine from '../TimeLine'
import './task.less'

interface Props {
  tasks: Task[]
}

const MarkTask: React.FC<Props> = (props) => {
  const { tasks } = props
  const [time] = useTime()

  const doOnMark = (task) => {
    console.log('task:', task)
  }

  const getCardBody = (task: Task) => {
    const status = task.status
    if (status === TaskStatus.DONE) {
      return (
        <View className='card-body__done'>
          <View className='title'>{task.name}</View>
          <Text className='subtitle'>打卡时间: {task.markTime}</Text>
        </View>
      )
    }
    if (status === TaskStatus.PROGRESS) {
      return (
        <View className='card-body__progress'>
          <View className='title'>{task.name}</View>
          <View className='time'>{time}</View>
          <Button
            className='btn'
            type='primary'
            onClick={() => doOnMark(task)}
          >打卡签到</Button>
        </View>
      )
    }
    if (status === TaskStatus.UN_PLAYED) {
      return (
        <View className='card-body__unplay'>
          {task.name}
        </View>
      )
    }
  }

  return (
    <View className='mark-task'>
      <TimeLine tasks={tasks} renderCardBody={getCardBody} />
    </View>
  )
}

export default MarkTask
