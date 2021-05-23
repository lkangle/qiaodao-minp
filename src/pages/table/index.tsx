import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import Calendar from '../../components/Calendar'
import { ControlMethod } from '../../utils/typings'

const Index = () => {
  const control = {} as ControlMethod
  const [date, updateDate] = useState(new Date())

  useEffect(() => {
    console.log('date', date)
  }, [date])

  return (
    <View>
      <Calendar
        value={date}
        onChange={updateDate}
        controlMethods={control}
      />
    </View>
  )
}

export default Index;
