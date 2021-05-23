import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import './calendar.less'
import { CalendarItem, ControlMethod } from '../../utils/typings'
import {
  calcDateTupleArray,
  equalDate,
  plusMonth,
  formatDate
} from '../../utils/tools'
import useUpdate from '../../hooks/useUpdate'

const weekHeader = ["日", "一", "二", "三", "四", "五", "六"]

function getItemClass(item: CalendarItem, selected: Date, now: Date): string {
  let cls: string[] = ['calendar-item']
  if (item.current) {
    if (equalDate(item.date, selected)) {
      cls.push("calendar-item__selected")
    } else if (equalDate(item.date, now)) {
      cls.push("calendar-item__current")
    }
  }
  return cls.join(' ')
}

interface Props {
  value?: Date
  onChange?: (value: Date) => void
  control?: boolean
  controlMethods?: ControlMethod
}

const Calendar: React.FC<Props> = (props) => {
  const {
    control = true,
    value,
    onChange,
    controlMethods
  } = props
  const now = useRef(new Date())
  // 显示的月份
  const [showYm, updateShowYm] = useState({
    year: now.current.getFullYear(),
    month: now.current.getMonth()
  })
  const [data, updateData] = useState<CalendarItem[][]>(() => {
    return calcDateTupleArray(showYm.year, showYm.month + 1)
  })
  const [selected, setSelected] = useState(value || now.current)

  useUpdate(() => {
    updateData(calcDateTupleArray(showYm.year, showYm.month + 1))
  }, [showYm])

  useEffect(() => {
    value && setSelected(value)
  }, [value])

  const onItemClick = (item: CalendarItem) => {
    if (item) {
      if (onChange) {
        onChange(item.date)
      } else {
        setSelected(item.date)
      }
    }
  }

  const _plusMonth = (month: number) => {
    updateShowYm(prev => {
      return {
        year: prev.year,
        month: prev.month + month
      }
    })
    setSelected(prev => plusMonth(prev, month))
  }

  const nextMonth = useCallback(() => {
    _plusMonth(1)
  }, [])

  const prevMonth = useCallback(() => {
    _plusMonth(-1)
  }, [])

  const backToday = useCallback(() => {
    updateShowYm({year: now.current.getFullYear(), month: now.current.getMonth()})
    setSelected(now.current)
  }, [])

  useEffect(() => {
    if (controlMethods) {
      controlMethods.nextMonth = nextMonth
      controlMethods.prevMonth = prevMonth
      controlMethods.backToday = backToday
    }
  }, [controlMethods, nextMonth, prevMonth, backToday])

  return (
    <View className='calendar-box'>
      {control && (
        <View className='calendar-control'>
          <View onClick={backToday} className='back'>
            <Text className='back-text'>TD</Text>
          </View>
          <View className='pn'>
            <Text
              className='pn-text'
              onClick={prevMonth}
            >&lt;</Text>
            <View>{formatDate(selected).substring(0, 7)}</View>
            <Text
              className='pn-text'
              onClick={nextMonth}
            >&gt;</Text>
          </View>
        </View>
      )}
      <View className='calendar-header'>
        {weekHeader.map((item, idx) => (
          <View key={idx} className='calendar-header__item'>{item}</View>
        ))}
      </View>
      <View className='calendar-content'>
        {data.map(((dates, fidx) => (
          <View key={fidx} className='calendar-date'>
            {dates.map((item, idx) => (
              <View
                key={idx}
                onClick={() => onItemClick(item)}
                className={getItemClass(item, selected, now.current)}
              >
                {item.day}
              </View>
            ))}
          </View>
        )))}
      </View>
    </View>
  )
}

export default Calendar
