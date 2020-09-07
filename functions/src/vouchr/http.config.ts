import Axios from "axios-observable";
import { config } from "dotenv";
import { resolve } from "path"

config({ path: resolve(__dirname, "../../.env") });
const pageSize = 10

const params: { [name: string]: any } = {
    'cid': process.env.CID,
    'pageSize': pageSize
}

export const vouchrAxois = Axios.create({
    baseURL: 'https://beta.vouchrsdk.com/api/v4',
    timeout: 4000,
    headers: {
        'Accept': 'application/json'
    }
});

vouchrAxois.interceptors.request.use(config => {
    const { url } = config

    const queryParams = Object.keys(params).map(id => [id, params[id]].join('=')).join('&')
    config.url = url?.concat(`?${queryParams}`)

    const completeUrl = [config.baseURL, config.url].join('/');
    console.log(`request url ${completeUrl}`);
    return config;
});

vouchrAxois.interceptors.response.use(response => {
    console.log(response);
    return response;
})

export const path = {
    categories: 'template/categories',
    templates: (id: number) => `template/categories/${id}/items`
};
