import { TEXT_BUFFER_SIZE, TYPING_SPEED } from '../consts';

class TypeWritter {
    bufferSize: number;
    speed: number;
    listeners: Array<(payload: { text: string; isTyping: boolean }) => void>;
    isTyping: boolean;
    text: string;
    buffer: string;
    pendingText: string;
    timer: any;
    refId: number | null;
    constructor(options: { bufferSize?: number; speed?: number } = {}) {
        const {
            bufferSize = TEXT_BUFFER_SIZE,
            speed = TYPING_SPEED
        } = options;
        this.bufferSize = bufferSize;
        this.speed = speed;
        this.listeners = [];
        this.isTyping = false;
        this.text = "";
        this.buffer = "";
        this.pendingText = "";
        this.timer = null;
        this.refId = null;
    }
    // 添加内容到缓冲区
    append(text) {
        this.buffer += text;
        if (!this.isTyping) {
            this.start();
        }
    }
    start() {
        this.isTyping = true;

        this.timer = setInterval(() => {

            try {
                // 如果缓冲区已经没有了，代表全都输出完毕，再检查一下是否还有未打的字
                if (this.buffer.length === 0) {
                    if (this.pendingText.length > 0) {
                        this.flushAndStop();
                    } else {
                        this.stop();
                    }

                    return;
                }
                // 按照指定大小分割
                const takCount = Math.min(this.bufferSize, this.buffer.length);
                this.pendingText += this.buffer.slice(0, takCount);
                this.buffer = this.buffer.slice(takCount);

                if (!this.refId) {
                    // 启动
                    this.refId = requestAnimationFrame(() => {
                        this.flush();
                        this.refId = null;
                    })
                }
            } catch (error) {
                this.stop()
                throw new Error(error.message)
            }

        }, this.speed)

    }
    // 更新内容到面板上
    flush() {
        if (this.pendingText.length === 0) return;
        const textAdd = this.pendingText;
        this.text = this.text + textAdd;
        this.pendingText = "";
        this.notify()
    }

    stop() {
        this.isTyping = false;
        this.notify()
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.refId) {
            cancelAnimationFrame(this.refId);
            this.refId = null;
        }
    }

    flushAndStop() {
        if (this.pendingText.length === 0) return;
        const textAdd = this.pendingText;
        this.text = this.text + textAdd;
        this.pendingText = "";
        this.stop()

    }

    subscribe(callback){
        this.listeners.push(callback)
        return ()=>{
            this.listeners = this.listeners.filter((cb)=>cb !== callback)
        }
    }
    notify(){
        this.listeners.forEach((cb)=>cb({text:this.text,isTyping:this.isTyping}))
    }
}

export default TypeWritter;