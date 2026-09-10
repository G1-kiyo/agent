import request, { cancelRequest, DATA_TYPE } from "./request";

export const knowledgeApi = {
    cancelToken: null,
    /**
       * AI提取文本 
       * @param {FormData} - 上传文件
       * @returns {Promise} - 提取结果
       */
    ai_extract_text: async (formData) => {
        const response = await request.request("/knowledge/ai_extract_text", {
            method: "POST",
            body: formData
        }, { needLoading: false })

        return response
    },

    /**
       * 追踪进度
       * @param {string} - 批次id
       * @returns {Promise} - 进度
       */
    progress: async (batchId) => {
        const response = await request.request(`/knowledge/progress?batch_id=${batchId}`, { method: 'GET' }, { needLoading: false })

        return response
    },

    /**
       * 存储到知识库
       * @param {FormData} - 上传文件
       * @returns {Promise} - 存储结果
       */
    save_to_knowledge_base: async (formData) => {
        const response = await request.request('/knowledge/save_to_knowledge_base', { method: 'POST', body: formData }, { needLoading: false })

        return response
    },

    /**
       * rag查询
       * @param {string} - 查询语句
       * @returns {Response} - 响应流
       */
    rag: async function (query) {
        const config = {
            method: 'POST',
            body: JSON.stringify({ query }),
            headers: { "Content-Type": "application/json" }
        }
        this.cancelToken = cancelRequest(config)
        const response = await request.request('/knowledge/rag', config, { dataType: DATA_TYPE.STREAM, needLoading: false })
        return response
    },
    /**
       * 取消rag查询
       */
    cancelRag: async function () {
        this.cancelToken && this.cancelToken()
    },
    /**
       * 文档查询
       * @param {string} topic - 话题
       * @param {number} pageNum - 页码
       * @param {number} pageSize - 分页数量
       * @returns {Promise} - 响应结果
    */
    docs: async ({ topic, pageNum, pageSize }) => {
        const response = await request.request("/knowledge/docs", {
            method: "POST",
            body: JSON.stringify({
                topic,
                page_num:pageNum,
                page_size:pageSize
            }),
            headers: { "Content-Type": "application/json" }
        }, { needLoading: false })

        return response
    },
    /**
       * 统计信息查询
       * @returns {Promise} - 响应结果
    */
    stats: async () => {
        const response = await request.request("/knowledge/stats", {
            method: "GET",
        })

        return response
    },
    /**
       * 热门话题查询
       * @returns {Promise} - 响应结果
    */
    hotTopics: async () => {
        const response = await request.request("/knowledge/hot_topics", {
            method: "GET",
        })

        return response
    }

}