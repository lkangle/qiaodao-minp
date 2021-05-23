import React from 'react'
import { Image, View } from '@tarojs/components'

const MarkEmpty: React.FC = () => {
  return (
    <View style={{
      width: "100%",
      textAlign: "center",
      marginTop: "270rpx"
    }}
    >
      <Image style={{
        width: "150rpx",
        height: "150rpx"
      }} src={require("./tea.png")}
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
