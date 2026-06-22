| No  | Column Name           | Data Type | Nullable | Size | Default | Description                                                            |
| --- | --------------------- | --------- | -------- | ---- | ------- | ---------------------------------------------------------------------- |
| 1   | id                    | INT       | N        |      |         | The primary key                                                        |
| 2   | push_title_1          | NVARCHAR  | Y        | 500  |         |                                                                        |
| 3   | push_msg_1            | NVARCHAR  | Y        | 750  |         |                                                                        |
| 4   | push_title_2          | NVARCHAR  | Y        | 500  |         |                                                                        |
| 5   | push_msg_2            | NVARCHAR  | Y        | 500  |         |                                                                        |
| 6   | web_inbox_subject     | NVARCHAR  | Y        | 500  |         |                                                                        |
| 7   | web_inbox_msg         | NVARCHAR  | Y        | 500  |         |                                                                        |
| 8   | web_inbox_details     | NVARCHAR  | Y        | 100  |         |                                                                        |
| 9   | email_msg             | NVARCHAR  | Y        | MAX  |         |                                                                        |
| 10  | email_auth            | NVARCHAR  | Y        | 100  |         |                                                                        |
| 11  | email_images          | NVARCHAR  | Y        | MAX  |         |                                                                        |
| 12  | email_isHtml          | BIT       | N        |      |         |                                                                        |
| 13  | note                  | NVARCHAR  | Y        | 500  |         |                                                                        |
| 14  | email_subject         | NVARCHAR  | Y        | 500  |         |                                                                        |
| 15  | web_inbox_isHTLM      | BIT       | Y        |      |         |                                                                        |
| 16  | web_inbox_template_id | INT       | Y        |      |         |                                                                        |
| 17  | email_msg_html        | NVARCHAR  | Y        | MAX  |         |                                                                        |
| 18  | sms_msg               | NVARCHAR  | Y        | 200  |         | A message that will be send through SMS channel                        |
| 19  | promo_images          | NVARCHAR  | Y        | 200  |         |                                                                        |
| 20  | language              | NVARCHAR  | N        | 10   | en      | Standard : ISO 639-1 (en,id)                                           |
| 21  | category_title        | NVARCHAR  | N        | 500  |         | The overall category consist of Alert, Promotion, Transaction & Action |
| 22  | sub_category_title    | NVARCHAR  | N        | 500  |         | Certain category have their own sub category title                     |
| 23  | icon_name             | NVARCHAR  | Y        | 500  |         | Each of the sub category have their own unique icon , except promo     |
