import { useEffect, useState } from 'react'
import { getTime } from '../utils/tools'

function useTime(): [string, Date] {
  const [date, updateDate] = useState(new Date())
  useEffect(() => {
    let fd = setInterval(() => {
      updateDate(new Date())
    }, 1000)
    return () => {
      clearInterval(fd)
    }
  }, [])

  return [getTime(date), date]
}

export default useTime
