
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category, Template, PagedResponse } from "../vouchr";
import { capitalize, path, vouchrAxois } from '../vouchr/util';

export class CategoryService {
    public listCategories(): Observable<Array<Category> | undefined> {
        return vouchrAxois.get<PagedResponse<Category>>(path.categories)
            .pipe(
                map(response => {
                    const { items } = response.data;
                    items?.forEach(item => item.title = capitalize(item.title))
                    return items;
                })
            )

    }
}

export class TemplateService {
    public listTemplates(categoryId: number): Observable<Array<Template> | undefined> {
        return vouchrAxois
            .get<PagedResponse<Template>>(path.templates(categoryId))
            .pipe(
                map(response => {
                    const { items } = response.data;
                    items?.forEach(item => item.headerText = capitalize(item.headerText))
                    return items;
                })
            )

    }
}
