import { Category } from "../model/model.category";

export class BlockKitBuilder {
    public createCategoryBlock(categories: Array<Category>): any {
        const options = categories.map(category => ({
            "text": {
                "type": "plain_text",
                "text": `${category.title}`,
                "emoji": true,
            },
            "value": `${category.id}`
        }))

        return {
            blocks: [{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Pick a category"
                },
                "accessory": {
                    "type": "static_select",
                    "action_id": "select_category_action",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select a category"
                    },
                    "options": options
                }
            }]
        }
    }
}