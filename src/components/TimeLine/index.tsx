import React from 'react'
import { Text, View } from '@tarojs/components'
import { Task, TaskStatus } from '../../utils/typings'
import Line from './Line'
import './index.less'

interface Props {
  tasks: Task[]
  renderCardBody?: (task: Task) => React.ReactNode
}

const TimeLine: React.FC<Props> = (props) => {
  const { tasks, renderCardBody } = props
  const length = tasks.length

  function getCardBody(task: Task): React.ReactNode {
    if (renderCardBody) {
      return renderCardBody(task)
    }

    return (
      <View className='card-body__normal'>
        <View className='title'>{task.name}</View>
        <Text className='subtitle'>
          {task.content ? task.content : `打卡时间: ${task.markTime}`}
        </Text>
      </View>
    )
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

export default TimeLine
