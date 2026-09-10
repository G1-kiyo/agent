import request, { cancelRequest,DATA_TYPE } from "./request";

export const newsApi = {

    cancelToken: null,

    /**
     * 查找资讯
     * @param {string} query - 查询词
     * @returns {Promise} 查询结果
     */
    search: async function (query,thread_id,checkpoint_id) {
        const config = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query,thread_id,checkpoint_id })
        }
        this.cancelToken = cancelRequest(config)
        const response = await request.request('/news/search',config,{needLoading:false,dataType:DATA_TYPE.STREAM})
        return response
    },
    /**
     * 取消查找资讯
     */
    cancelSearch: function (){
        this.cancelToken && this.cancelToken()
    },

}