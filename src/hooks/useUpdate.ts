import { useEffect, useRef } from 'react'

function useUpdate(callback: VoidFunction, deps: any[] = []) {
  const first = useRef(true)

  useEffect(function () {
    if (first.current) {
      first.current = false
      return
    }
    return callback.apply(this)
  }, deps)
}

export default useUpdate
