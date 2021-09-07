import React from 'react'
import { View } from '@tarojs/components'

interface Props {
  active?: boolean
  top?: boolean
  bottom?: boolean
}

const Point: React.FC<Props> = (props) => {
  const {active} = props;
  return (
    <View className='step-point' style={{
      backgroundColor: active ? "#3370ff" : "#bebebe"
    }}
    />
  )
}

const noBorder = {
  border: 'none'
}

const Line: React.FC<Props> = (props) => {
  const {active, top, bottom} = props

  return (
    <View className='card-line'>
      <View className='line__top' style={
        top ? noBorder : {}
      }
      />
      <Point active={active} />
      <View className='line__bottom' style={
        bottom ? noBorder : {}
      }
      />
    </View>
  )
}

export default Line
