import { Axios } from 'axios-observable';
import { AxiosObservable } from 'axios-observable/dist/axios-observable.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { api, baseUrl, defaultHeaders } from "../model";
import { Category, Template } from "../model/model";

export class CategoryService {
    constructor(private apiService: ApiService) { }
    public listCategories(headers?: { [name: string]: string }): Observable<Array<Category>> {
        return this.apiService
            .get([baseUrl, api.categories].join('/'), { ...defaultHeaders, ...headers })
            .pipe(
                map(response => response.data.items)
            )

    }
}

export class TemplateService {
    constructor(private apiService: ApiService) { }
    public listTemplates(categoryId: number, headers?: { [name: string]: string }): Observable<Array<Template>> {
        return this.apiService
            .get([baseUrl, api.templates(categoryId)].join('/'), { ...defaultHeaders, ...headers })
            .pipe(
                map(response => response.data)
            )

    }
}

export class ApiService {
    public post(url: string, data: any, headers?: { [name: string]: string }): Observable<any> {
        const payload = JSON.stringify(data);
        console.log(`request sent to url ${url}`);
        console.log(`request sent with payload ${payload}`);
        console.log(`request sent with headers ${headers}`);
        return Axios.post(url, payload, {
            headers: headers
        })
    }

    public get(url: string, headers?: { [name: string]: string }): AxiosObservable<any> {
        console.log(`request sent to url ${url}`);
        console.log(`request sent with headers ${headers}`);
        return Axios.get(url, {
            headers: headers
        })
    }
}