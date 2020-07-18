import { Category } from "../model/model.category";
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
            subscriber.complete();
        })
    }

}