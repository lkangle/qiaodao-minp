import React from 'react'
import { Image, View } from '@tarojs/components'
import Tea from './tea.png'

const MarkEmpty: React.FC = () => {
  return (
    <View style={{
      width: "100%",
      textAlign: "center",
      marginTop: "270rpx"
    }}
    >
      <Image style={{
        width: "145rpx",
        height: "145rpx"
      }} src={Tea}
      />
      <View style={{
        fontSize: ".85rem",
        color: "#a2a6aa",
        marginTop: 10
      }}
      >暂无签到项目，等待有需要时在进行签到</View>
    </View>
  )
}

export default MarkEmpty
