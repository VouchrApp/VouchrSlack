import { Category, Template } from "../vouchr/model";

export class BlockKitBuilder {
    public readonly CATEGORY_BLOCK: string = 'select_category';
    public createCategoryBlock(categories: Array<Category> = []): object {
        const options = categories.map(category => ({
            "text": {
                "type": "plain_text",
                "text": `${category.title}`,
                "emoji": true,
            },
            "value": `${category.id}`
        }));

        return {
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Pick a category"
                    },
                    "accessory": {
                        "type": "static_select",
                        "action_id": `${this.CATEGORY_BLOCK}`,
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a category"
                        },
                        "options": options,
                    },
                }
            ]
        }
    }

    public createTemplateBlock(templates: Array<Template>): any {
        return {
            "ok": true,
            "stuff": "This is good"
        };
    }
}