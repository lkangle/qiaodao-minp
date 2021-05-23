import React from 'react'
import { Image, View, Text } from '@tarojs/components'
import "./user.less"

interface Props {
  realName?: string
  nickName: string
  avatarUrl?: string
  markInfo?: string
}

function getSecondName(name?: string) {
  return name?.substr(1, 2) || "匿名"
}

const UserInfo: React.FC<Props> = (props) => {
  const { avatarUrl, nickName, realName, markInfo } = props
  const name = realName || nickName

  return (
    <View className='user-info'>
      <View className='avatar'>
        {avatarUrl && <Image className='img-ava' src={avatarUrl} />}
        {
          !avatarUrl &&
          <View className='word-ava'>
            <Text>{getSecondName(name)}</Text>
          </View>
        }
      </View>
      <View className='info'>
        <View className='info-title'>你好，{name}</View>
        <Text className='info-subtitle'>{markInfo || '暂无签到任务'}</Text>
      </View>
    </View>
  )
}

export default UserInfo
