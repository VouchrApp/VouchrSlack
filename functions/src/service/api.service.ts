import { Category, Template } from "../model/model.category";
import { Observable } from 'rxjs';

export class CategoryService {

    public listCategories(): Observable<Array<Category>> {
        return new Observable(subscriber => {
            const categories = [{
                id: 1,
                title: "Birthday",
                categoryType: "DEFAULT"
            },
            {
                id: 2,
                title: "GIF Stories",
                categoryType: "CUSTOM"
            },
            {
                id: 3,
                title: "Shared Bills",
                categoryType: "CUSTOM"
            },
            {
                id: 4,
                title: "Stay Safe",
                categoryType: "CUSTOM"
            }];
            subscriber.next(categories)
            setTimeout(() => subscriber.complete, 3000);
        })
    }

}


export class TemplateService {

    public listTemplates(categoryId: number): Observable<Array<Template>> {
        return new Observable(subscriber => {
            const templates = [
                {
                    id: 1,
                    headerText: "sample header",
                    foregroundImage: "some message"

                }
            ]
            subscriber.next(templates);
            setTimeout(() => subscriber.complete, 3000);
        });
    }
}