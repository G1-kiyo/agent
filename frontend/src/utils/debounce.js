export const debounce = (fn, options = {}) => {
    const { isImmediate = false, interval } = options
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