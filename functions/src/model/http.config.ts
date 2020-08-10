export const baseUrl = 'https://beta.vouchrsdk.com/api/v4';

export const defaultHeaders: { [name: string]: string } = {
    'X-Vouchr-ClientID': 'e73a3c912a7098a2c763817bf84bda4e',
    'Accept': 'application/json'
};

export const api = {
    categories: 'template/categories',
    templates: (id: number) => `template/categories/${id}/items`
};
