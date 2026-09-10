import request, { cancelRequest, DATA_TYPE } from "./request";

export const discussionApi = {
    cancelToken: null,
    /**
       * 创建新讨论话题
       * @param {Object} - title-标题 category-分类 desc-描述
       * @returns {Promise} - 创建结果
       */
    create: async (discussionInfo) => {
        const response = await request.request("/discussion/create", {
            method: "POST",
            body: JSON.stringify(discussionInfo),
            headers: {
                "Content-Type": "application/json"
            }
        })

        return response
    },

    /**
       * 获取种类列表
       * @returns {Promise} - 种类列表
       */
    categories: async () => {
        const response = await request.request(`/discussion/categories`, { method: 'GET' }, { needLoading: false })

        return response
    },

    /**
       * 获取reaction列表
       * @returns {Promise} - reaction列表
       */
    reactions: async () => {
        const response = await request.request(`/discussion/reactions`, { method: 'GET' }, { needLoading: false })

        return response
    },

    /**
       * 获取话题列表
       * @param {Object} - 
       *    category-种类 
       *    sortby-排序字段
       *    search_title-查询话题标题
       *    page_size-页面大小
       *    page_num-页码
       * @returns {Promise} - 话题列表
       */
    discussionList: async ({ category, sortby, search_title, page_size, page_num }) => {
        const response = await request.request("/discussion/discussions", {
            method: "POST",
            body: JSON.stringify({ category, sortby, search_title, page_size, page_num }),
            headers: {
                "Content-Type": "application/json"
            }
        }, { needLoading: false })

        return response
    },

    /**
       * 话题详情查询
       * @param {string} - 话题id
       * @returns {Promise} - 详情结果
       */
    detail: async (topicId) => {
        const response = await request.request(topicId ? `/discussion/detail?discussion_id=${topicId}` : "/discussion/detail",
            { method: 'GET' },
            { needLoading: false }
        )

        return response
    },
    /**
       * 获取消息列表
       * @param {Object} - 
       *    discussion_id-话题id
       *    page_size-页面大小
       *    page_num-页码
       * @returns {Promise} - 话题列表
       */
    messageList: async ({ discussion_id, page_size, last_message_id }) => {
        const response = await request.request("/discussion/messages", {
            method: "POST",
            body: JSON.stringify({ discussion_id, page_size, last_message_id }),
            headers: {
                "Content-Type": "application/json"
            }
        }, { needLoading: false })

        return response
    },
    /**
       * 发送消息
       * @param {string} discussion_id - 话题id
       * @param {string} content - 消息内容
       * @returns {Promise} - 响应结果
    */
    sendMessage: async ({ discussion_id, content }) => {
        const response = await request.request("/discussion/send_message", {
            method: "POST",
            body: JSON.stringify({ discussion_id, content }),
            headers: { "Content-Type": "application/json" }
        }, { needLoading: false })

        return response
    },
    /**
       * 回复消息
       * @param {string} message_id - 消息id
       * @param {string} content - 消息内容
       * @returns {Promise} - 响应结果
    */
    replyMessage: async ({ discussion_id, message_id, content }) => {
        const response = await request.request("/discussion/reply_message", {
            method: "POST",
            body: JSON.stringify({ discussion_id, message_id, content }),
            headers: { "Content-Type": "application/json" }
        }, { needLoading: false })

        return response
    },
    /**
       * react消息
       * @param {string} message_id - 消息id
       * @param {number} type - 表情类型
       * @param {string} content - 表情内容
       * @returns {Promise} - 响应结果
    */
    reactMessage: async ({ discussion_id, message_id, type, content, operate_type }) => {
        const response = await request.request("/discussion/react_message", {
            method: "POST",
            body: JSON.stringify({ discussion_id, message_id, type, content, operate_type }),
            headers: { "Content-Type": "application/json" }
        }, { needLoading: false })

        return response
    },
    /**
       * AI辩论生成
       * @param {string} - 话题id
       * @returns {Promise} - 辩论结果
       */
    ai_debate: async (topicId) => {
        const response = await request.request(`/discussion/generate_ai_debate?discussion_id=${topicId}`,
            { method: 'GET' },
            { needLoading: false }
        )

        return response
    },

    /**
      * 分叉话题
      * @param {string} type - 类型 1-有discussion 2-无discussion
      * @param {string} discussion_id - 话题id
      * @param {string} content - 话题内容
      * @returns {Promise} - 分叉结果
    */
    fork: async ({type,discussion_id,content}) => {
        const response = await request.request("/discussion/fork", {
            method: "POST",
            body: JSON.stringify({type,discussion_id,content}),
            headers: {
                "Content-Type": "application/json"
            }
        })

        return response
    },


}