import React from 'react'
import { Button, Text, View } from '@tarojs/components'
import './task.less'
import { Task, TaskStatus } from '../../utils/typings'
import Line from './Line'
import useTime from '../../hooks/useTime'

interface Props {
  tasks: Task[]
}

const MarkTask: React.FC<Props> = (props) => {
  const { tasks } = props
  const length = tasks.length
  const [time] = useTime()

  const doOnMark = (task) => {
    console.log('task:', task)
  }

  const getCardBody = (task: Task) => {
    const status = task.status
    if (status === TaskStatus.DONE) {
      return (
        <View className='card-body__done'>
          <View>{task.name}</View>
          <Text>打卡时间: {task.markTime}</Text>
        </View>
      )
    }
    if (status === TaskStatus.PROGRESS) {
      return (
        <View className='card-body__progress'>
          <View>{task.name}</View>
          <View className='time'>{time}</View>
          <View>
            <Button
              type='primary'
              onClick={() => doOnMark(task)}
            >打卡签到</Button>
          </View>
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
    <View>
      {
        tasks.map((task, index) => {
          return (
            <View className='card' key={index}>
              <Line
                active={task.status === TaskStatus.PROGRESS}
                top={index === 0}
                bottom={index === length - 1}
              />
              {getCardBody(task)}
            </View>
          )
        })
      }
    </View>
  )
}

export default MarkTask
