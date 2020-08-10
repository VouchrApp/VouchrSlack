export const baseUrl = 'https://beta.vouchrsdk.com/api/v4';

export const defaultHeaders: { [name: string]: string } = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

export const api = {
    categories: 'template/categories',
    templates: (id: number) => `template/categories/${id}/items`
};
