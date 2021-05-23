import React from 'react'
import {
  useDidShow,
  setNavigationBarTitle
} from '@tarojs/taro'
import { View } from '@tarojs/components'
import { getWeekDate } from '../../utils/tools'
import './index.less'
import UserInfo from '../../components/UserInfo/index'
import { AVATAR_URL, TASKS } from '../../utils/mock'
import MarkTask from '../../components/MarkTask'

const Index: React.FC = () => {
  useDidShow(async () => {
    await setNavigationBarTitle({
      title: getWeekDate()
    })
  })

  return (
    <View className='home-box'>
      <UserInfo nickName='李康乐' avatarUrl={AVATAR_URL} />
      <View className='today-task'>
        日常学习考勤
      </View>
      {/*<MarkEmpty />*/}
      <MarkTask tasks={TASKS} />
    </View>
  );
};

export default Index;
