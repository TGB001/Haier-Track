import axios from "axios";

const BASE_URL = "https://tgbhydz-rc.isvjcloud.com";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.succeed === "true" || data.code === 0) {
      return data;
    }
    throw new Error(data.message || "查询失败");
  },
  (error) => {
    if (error.response) {
      throw new Error(error.response.data?.message || "请求失败");
    } else if (error.request) {
      throw new Error("网络错误，请检查网络连接");
    } else {
      throw new Error(error.message || "请求失败");
    }
  },
);

export const zuhegouApi = {
  queryProductCount: async (params) => {
    const response = await api.get("/haier/query_count", {
      params: {
        module_id: params.module_Id,
        skuId: params.skuId,
        type: params.type,
        ...(params.duration && {
          start_time: params.duration.start_time,
          end_time: params.duration.end_time,
        }),
      },
    });
    return response;
  },

  queryProductPins: async (params) => {
    const response = await api.get("/haier/query_pins", {
      params: {
        module_id: params.module_Id,
        skuId: params.skuId,
        type: params.type,
        ...(params.duration && {
          start_time: params.duration.start_time,
          end_time: params.duration.end_time,
        }),
      },
    });
    return response;
  },

  queryUserProducts: async (params) => {
    const response = await api.get("/haier/query_skus", {
      params: {
        module_id: params.module_Id,
        pin: params.pin,
        type: params.type,
        ...(params.duration && {
          start_time: params.duration.start_time,
          end_time: params.duration.end_time,
        }),
      },
    });
    return response;
  },
};
