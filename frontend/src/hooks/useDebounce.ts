import { useRef, useEffect, useCallback } from "react"
import { debounce } from "@utils/debounce"

export const useDebounce = (fn, debounceOpts) => {
    const debounceRef = useRef(null)

    useEffect(() => {
        debounceRef.current = debounce(fn, debounceOpts)

    }, [fn, debounceOpts])

    const call = useCallback((...args) => { debounceRef.current(...args) }, [debounceRef.current])

    return call
}
