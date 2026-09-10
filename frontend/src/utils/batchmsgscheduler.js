
class BatchMsgScheduler {

    constructor() {
        this.pendingMessages = []
        this.cb = null
        this.isRendering = false
    }
    on(cb) {
        this.cb = cb
    }
    add(messages) {

        if (Array.isArray(messages)) {
            this.pendingMessages.push(...messages)
        } else {
            this.pendingMessages.push(messages)
        }

        if (!this.isRendering) {
            this.isRendering = true
            requestAnimationFrame(() => {
                this.render()
            })
        }
    }
    render() {
        const pms = this.pendingMessages
        if (this.cb && pms.length > 0) {
            this.cb(pms)
        }
        this.pendingMessages = []
        this.isRendering = false
    }

}

export default BatchMsgScheduler