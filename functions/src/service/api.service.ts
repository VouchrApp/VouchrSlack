import { Axios } from 'axios-observable';
import { AxiosObservable } from 'axios-observable/dist/axios-observable.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { api, baseUrl, defaultHeaders } from "../vouchr";
import { Category, Template } from "../vouchr/model";
import dotenv from 'dotenv';

dotenv.config();

export class CategoryService {
    constructor(private apiService: ApiService) { }
    public listCategories(): Observable<Array<Category>> {
        return this.apiService
            .get([baseUrl, api.categories].join('/'), defaultHeaders)
            .pipe(
                map(response => response.data.items)
            )

    }
}

export class TemplateService {
    constructor(private apiService: ApiService) { }
    public listTemplates(categoryId: number,): Observable<Array<Template>> {
        const allHeaders = { 'Content-Type': 'application/json', ...defaultHeaders };
        return this.apiService
            .get([baseUrl, api.templates(categoryId)].join('/'), allHeaders)
            .pipe(
                map(response => response.data)
            )

    }
}

export class ApiService {
    public post(url: string, data: any, headers?: { [name: string]: string }): Observable<any> {
        return Axios.post(url, JSON.stringify(data), {
            headers: headers
        })
    }

    public get(url: string, headers?: { [name: string]: string }): AxiosObservable<any> {
        return Axios.get(url, {
            headers: headers
        })
    }
}