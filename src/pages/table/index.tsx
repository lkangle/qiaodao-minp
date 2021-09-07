import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import Calendar from '../../components/Calendar'
import { ControlMethod } from '../../utils/typings'
import TimeLine from '../../components/TimeLine'
import { RECORD_TASKS } from '../../utils/mock'

const Index = () => {
  const control = {} as ControlMethod
  const [date, updateDate] = useState(new Date())

  useEffect(() => {
    console.log('date', date)
  }, [date])

  function getStatistics(year: number, month: number) {
    console.log('年份', year, '月份', month)
    return (
      <View style={{lineHeight: '40Px'}}>统计内容</View>
    )
  }

  return (
    <View>
      <Calendar
        value={date}
        onChange={updateDate}
        controlMethods={control}
        statContent={getStatistics}
      />
      <View style={{marginTop: '20Px'}}>
        <TimeLine tasks={RECORD_TASKS} />
      </View>
    </View>
  )
}

export default Index;
