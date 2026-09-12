export const debounce = (fn, options: { isImmediate?: boolean; interval: number }) => {
    const { isImmediate = false, interval = 1000 } = options
    let timer = null
    return function (...args) {
        if (timer) clearTimeout(timer)
            
        if (isImmediate) {
            const canExecute = !timer
            timer = setTimeout(() => {
                timer = null
            }, interval)
            if (canExecute) {
                fn(...args)
            }
        } else {
            timer = setTimeout(() => {
                timer = null
                fn(...args)
            }, interval)
        }




    }
}