import { Category } from "../model/model.category";
import { Observable } from "rxjs";

export class CategoryService {


    listCategories(): Observable<Array<Category>> {

        [{
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
            id: 3,
            title: "Stay Safe",
            categoryType: "CUSTOM"
        },
        ]
    }

}