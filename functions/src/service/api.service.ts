
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { path, vouchrAxois, Category, Template } from "../vouchr";

export class CategoryService {
    public listCategories(): Observable<Array<Category>> {
        return vouchrAxois.get(path.categories)
            .pipe(
                map(response => response.data.items)
            )

    }
}

export class TemplateService {
    public listTemplates(categoryId: number): Observable<Array<Template>> {
        return vouchrAxois
            .get(path.templates(categoryId))
            .pipe(
                map(response => response.data)
            )

    }
}
