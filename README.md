# mysql-eloquent
MySQL Wrapping library used like Laravel Eloquent

## Installing
Using npm:
```
$ npm install mysql-eloquent
```

Using yarn:
```
$ yarn add mysql-eloquent
```

## Examples

### Select 

**Model.ts file**
```js
import MysqlEloquent from 'mysql-eloquent'

export default class Model<T> extends MysqlEloquent<T>
{
}
```

**MdcinModel.ts file**
```js
import Model from './Model'

interface MdcinItem
{
  ADM_DISPS_SEQ: number; // 행정처분일련번호
  ENTP_NAME: string; // 업소명
  ADDR: string | null; // 업소소재지
  ENTP_NO: number; // 업허가번호
  ITEM_NAME: string; // 제품명
  BEF_APPLY_LAW: string | null; // 위반법명
  EXPOSE_CONT: string; // 위반내용
  ADM_DISPS_NAME: string; // 행정처분명
  LAST_SETTLE_DATE: number | null; // 행정처분일자 (최종확정일자)
  DISPS_TERM_DATE: string; // 행정처분기간
}

export default class MdcinModel extends Model<MdcinItem>
{

}
```

**index.ts file**
```js
import MdcinModel from './MdcinModel'

const model = new MdcinModel()
const historyOne = await model.where('ENTP_NO', 20210811).orderBy('id', 'desc')->fist();
```

### Upserts

```js
import Model from './Model'

interface MdcinItem
{
  ADM_DISPS_SEQ: number; // 행정처분일련번호
  ENTP_NAME: string; // 업소명
  ADDR: string | null; // 업소소재지
  ENTP_NO: number; // 업허가번호
  ITEM_NAME: string; // 제품명
  BEF_APPLY_LAW: string | null; // 위반법명
  EXPOSE_CONT: string; // 위반내용
  ADM_DISPS_NAME: string; // 행정처분명
  LAST_SETTLE_DATE: number | null; // 행정처분일자 (최종확정일자)
  DISPS_TERM_DATE: string; // 행정처분기간
}

export default class MdcinModel extends Model<MdcinItem>
{
  /**
   * handle
   */
  public async do()
  {
    // from json response
    const items: Array<MdcinItem> = this.content.response.body.items.item;

    // upsert massive
    // ON DUPLICATED KEY `ADM_DISPS_SEQ`
    // UPDATE SET [ENTP_NAME, ADDR, ITEM_NAME]
    await this.upserts(items, 'ADM_DISPS_SEQ', ['ENTP_NAME', 'ADDR', 'ITEM_NAME']);

    return true;
  }
}
```
