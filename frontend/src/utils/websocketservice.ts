import { refreshAccessToken, getAccessToken } from "../api"
class WebsocketService {
    static instance

    websocketUrl = "ws://localhost:3000/websocket/discussion"

    listeners = {
        "open": [],
        "message": [],
        "error": [],
        "close": []
    }
    ws = null
    retryCount = 0
    maxRetry = 5
    basicDelay = 1000
    // 重试定时器
    retryTimer = null
    // 验证token定时器
    validateTimer = null

    heartbeatTimer = null
    heartbeatDelay = 60 * 1000
    serverResponseDetectTimer = null
    serverResponseDelay = 1000
    lastPongTime = 0


    static getInstance() {
        if (!WebsocketService.instance) {
            WebsocketService.instance = new WebsocketService()
        }
        return WebsocketService.instance
    }

    initializeWebsocket() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            if (this.retryTimer) {
                clearTimeout(this.retryTimer)
                this.retryTimer = null
            }
            this.retryCount = 0
            return;
        }
        this.ws = new WebSocket(this.websocketUrl)
        console.log("websocket>>>", this.ws)
        this.ws.addEventListener("open", () => {
            const token = getAccessToken()
            const msg = { "event": "validatetoken", "payload": { "token": token } }
            this.send(JSON.stringify(msg))
            this.emit("open", {})
        })
        this.ws.addEventListener("message", (e) => {
            const data = JSON.parse(e.data)
            console.log("message", data)
            if (Array.isArray(data)) {
                const eventPayloadMap = {}
                data.forEach((d) => {
                    const event = d?.event || "message"
                    const payload = d?.payload || {}
                    if (event in eventPayloadMap) {
                        eventPayloadMap[event].push(payload)
                    } else {
                        eventPayloadMap[event] = [payload]
                    }
                })
                console.log("payloadmap", eventPayloadMap)
                for (const [key, value] of Object.entries(eventPayloadMap)) {
                    this.emit(key, value)
                }
            } else {
                const event = data?.event || "message"
                const payload = data?.payload || {}
                if (event === "validatetoken") {
                    this.refreshWebsocketToken(payload)
                } else if (event === "heartbeat") {
                    this.lastPongTime = Date.now()
                    this.startHeartbeatDetect()
                } else {
                    this.emit(event, payload)
                }

            }

        })
        this.ws.addEventListener("error", (error) => {
            this.emit("error", error)
            this.retryConnect()
        })
        this.ws.addEventListener("close", (event) => {
            if (event.code === 1011) this.retryConnect()
            // this.emit("open")
        })
    }
    on(event, cb) {
        if (event in this.listeners) {
            this.listeners[event].push(cb)
        } else {
            this.listeners[event] = [cb]
        }
        console.log("listener", this.listeners)
    }
    emit(event, payload) {
        const cbList = this.listeners[event]
        console.log("emit", event, payload)
        if (Array.isArray(cbList) && cbList.length > 0) {
            cbList.forEach((cb) => cb(payload))
        }
    }
    off(event, cb) {
        if (event in this.listeners) {
            this.listeners[event] = this.listeners[event].filter((item) => cb !== item)
        }
    }
    send(msg) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(msg)
        }
    }
    retryConnect() {
        if (this.retryCount >= this.maxRetry) return
        if (this.retryTimer) {
            clearTimeout(this.retryTimer)
            this.retryTimer = null
        }
        const delay = this.basicDelay * Math.pow(2, this.retryCount)
        this.retryCount++
        this.retryTimer = setTimeout(() => {
            console.log("settimeout")
            this.initializeWebsocket()
        }, delay)
    }
    refreshWebsocketToken(payload) {
        if (this.validateTimer) {
            clearTimeout(this.validateTimer)
            this.validateTimer = null
        }
        const delay = new Date(payload.expired_at).getTime() - new Date().getTime() - 60 * 1000
        this.validateTimer = setTimeout(async () => {
            const newToken = await refreshAccessToken()
            const msg = { "event": "validatetoken", "payload": { "token": newToken } }
            this.send(JSON.stringify(msg))
        }, delay)
    }
    startHeartbeatDetect() {
        if (this.heartbeatTimer) {
            clearTimeout(this.heartbeatTimer)
            this.heartbeatTimer = null
        }

        this.heartbeatTimer = setTimeout(() => {
            this.send(JSON.stringify({ "event": "heartbeat" }))

            if (this.serverResponseDetectTimer) {
                clearTimeout(this.serverResponseDetectTimer)
                this.serverResponseDetectTimer = null
            }
            this.serverResponseDetectTimer = setTimeout(() => {
                if (Date.now() - this.lastPongTime > this.heartbeatDelay + this.serverResponseDelay) {
                    this.ws.close()
                }
            }, this.serverResponseDelay)
        }, this.heartbeatDelay)

    }

}

export default WebsocketService