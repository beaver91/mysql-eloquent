import mysql from 'mysql2/promise';
import { is_array, is_undefined } from 'slimphp';
import { IndexSignature, ConnectionProperties } from './types';

type DBTable = `${string}.${string}`;
type QueryType = 'insert' | 'select' | 'update' | 'delete' | 'upsert';

/**
 * `boolean` is EXISTS
 */
type WhereConditionOperator = '>' | '>=' | '<' | '<=' | '=' | '!=';
type WhereValue = string | number | boolean | object;
type WhereValueObject = {
  "cond": WhereConditionOperator,
  "value": WhereValue
};
type OrderTypes = 'asc' | 'desc';

const CONNECTION_TIMEOUT = 20;
const DEFAULT_LIMIT = 2000;

export default class MysqlEloquent<T extends IndexSignature>
{
  private static pool: mysql.Pool | undefined = undefined;

  private whereCondition: Map<string, WhereValueObject> = new Map<string, WhereValueObject>();
  private fields: string[] = [];
  private _offset: number = 0;
  private _limit: number = DEFAULT_LIMIT;
  private _orderBy: Map<string, OrderTypes> = new Map<string, OrderTypes>();

  protected static connectionProperties: ConnectionProperties = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "mysql",
  };

  protected databaseName: string = '';
  protected tableName: string = '';
  protected primaryKey: string = 'id';

  public constructor(connectionProperties: ConnectionProperties | undefined = undefined)
  {
    if (!is_undefined(connectionProperties)) {
      MysqlEloquent.connectionProperties = connectionProperties as ConnectionProperties;
    }

    MysqlEloquent.connect();
  }

  private static connect(): void
  {
    // <Connection Pool>
    // https://www.npmjs.com/package/mysql2#using-connection-pools
    MysqlEloquent.pool = mysql.createPool({
      "host": process.env.MYSQL_HOST || this.connectionProperties.host,
      "port": parseInt(process.env.MYSQL_PORT || this.connectionProperties.port.toString(), 10),
      "user": process.env.MYSQL_USER || this.connectionProperties.user,
      "password": process.env.MYSQL_PASSWORD || this.connectionProperties.password,
      "database": process.env.MYSQL_DB_NAME || this.connectionProperties.database,
      "waitForConnections": true,
      "connectTimeout": CONNECTION_TIMEOUT,
      "queueLimit": 0,
    });

    // <Connection Promise>
    // https://www.npmjs.com/package/mysql2#using-promise-wrapper
    // MysqlHandler.connection = MysqlHandler.connection || await mysql.createConnection({
    //   "host": process.env.MYSQL_HOST,
    //   "user": process.env.MYSQL_USER,
    //   "password": process.env.MYSQL_PASSWORD,
    //   "database": process.env.MYSQL_DB_NAME,
    // });
  }

  public static async getPool(): Promise<mysql.Pool>
  {
    if (MysqlEloquent.pool === undefined) {
      MysqlEloquent.connect();
    }

    return <mysql.Pool>MysqlEloquent.pool;
  }

  /**
   * table name
   * @param tableName
   * @returns
   */
  public table(tableName: DBTable): this
  {
    const [db, table] = tableName.trim().split('.');

    this.databaseName = db;
    this.tableName = table;

    return this;
  }

  /**
   * select
   * @param fields string | string[]
   * @returns
   */
  public select(fields: string | string[]): this
  {
    if (!is_array(fields)) { // is string
      fields = (fields as string).split(',').map(v => v.trim());
    }

    this.fields = fields as string[];

    return this;
  }

  /**
   * where
   * @param key string
   * @param condition WhereValueCondition
   * @param operator WhereConditionOperator
   * @returns this
   */
  public where(key: string, condition: WhereValue, operator: WhereConditionOperator = '='): this
  {
    this.whereCondition.set(key, {
      "cond": operator,
      "value": condition
    });

    return this;
  }

  /**
   * set offset
   * @param offset number
   * @returns
   */
  public offset(offset: number): this
  {
    this._offset = Math.abs(offset);

    return this;
  }

  /**
   * set limit
   * @param limit number
   * @returns
   */
  public limit(limit: number): this
  {
    this._limit = Math.abs(limit);

    return this;
  }

  /**
   * set orderby
   * @param field string
   * @param order OrderTypes
   * @returns
   */
  public orderBy(field: string, order: OrderTypes): this
  {
    this._orderBy.set(field, order);

    return this;
  }

  /**
   * 모든 `whereCondition`을 초기화합니다.
   * @returns this
   */
  public clear(): this
  {
    this.whereCondition.clear();

    return this;
  }

  /**
   * get
   * @param instantLimit
   * @returns
   */
  public async get(instantLimit: number | undefined = undefined)
  {
    const connection = await MysqlEloquent.getPool();
    const query: string = this.makeSelectQuery(instantLimit);

    const condition: WhereValue[] = this.getConditonValues();
    const [rows, columns] = await connection.execute(query, condition);

    return Object.values(rows);
  }

  /**
   * first row
   * @returns
   */
  public async first()
  {
    const rows = await this.get(1);

    return rows.length ? rows[0] : null;
  }

  /**
   * 현재 `where` 조건에 걸려있는 값들을 리턴합니다.
   * @returns Array<whereValueCondition>
   */
  public getConditonValues(): WhereValue[]
  {
    return Array.from(this.whereCondition).map(row => row[1].value);
  }

  /**
   * Inserts
   * @param massive
   */
  public async inserts(massive: Array<T>)
  {
    const connection = await (await MysqlEloquent.getPool()).getConnection();
    const query = this.makeInsertQuery('insert', massive);

    try {
      await connection.beginTransaction();

      // <Prepared Statement>
      // https://www.npmjs.com/package/mysql2#using-prepared-statements
      massive.forEach(async row => {
        // If you execute same statement again, it will be picked from a LRU cache
        // which will save query preparation time and give better performance
        await connection.execute(query, Object.values(row));
      });

      await connection.commit();

    } catch (err) {
      await connection.rollback();

      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * update
   * @param update T
   */
  public async update(update: Partial<T>)
  {
    const connection = await MysqlEloquent.getPool();
    const queries: string[] = [];

    queries.push(`UPDATE \`${this.tableName}\` SET`);

    const fields: string[] = Object.keys(update);
    const values: Array<WhereValueObject> = Object.values(update);

    const updateFields: string[] = [];

    fields.forEach(field => {
      updateFields.push(`\`${field}\`=?`);
    });

    queries.push(updateFields.join(', '));
    queries.push(`WHERE ${this.getWhereStatement()}`);

    const result = await connection.execute(queries.join(' '), [...values, ...this.getConditonValues()]);

    return result;
  }

  /**
   * Upserts
   * @param massive
   * @param key `ON DUPLICATE KEY UPDATE`에 걸릴 조건 키명
   * @param options 어떤 필드들이 업데이트 될 것인지
   */
  public async upserts(massive: Array<T>, key: string, options: Array<string>)
  {
    const connection = await (await MysqlEloquent.getPool()).getConnection();
    const query = this.makeInsertQuery('upsert', massive, key, options);

    try {
      await connection.beginTransaction();

      // <Prepared Statement>
      massive.forEach(async row => {
        const values: Array<string> = Object.values(row);

        // ON DUPLICATE KEY UPDATE `key`={VALUES}
        values.push(row[key]);

        // After `ON DUPLICATE KEY UPDATE `key`={VALUES}, {...}`
        options.forEach(field => values.push(row[field]));

        await connection.execute(query, values);
      });

      await connection.commit();
    } catch (err) {
      await connection.rollback();

      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * makeInsertQuery
   * @param queryType
   * @param datas
   * @param key
   * @param options
   * @returns string
   */
  private makeInsertQuery(
    queryType: QueryType,
    datas: Array<T>,
    key: string | undefined = undefined,
    options: Array<string> | undefined = undefined,
  ): string
  {
    const queries: Array<string> = [];

    switch (queryType) {
      case 'insert':
      case 'upsert':
        queries.push(`INSERT INTO \`${this.tableName}\`(${Object.keys(datas[0]).map(this.backQuotes).join(', ')})`);

        const values: Array<string> = Array.from('?'.repeat(Object.values(datas[0]).length));

        queries.push(
          `VALUES (${values.join(', ')})`
        );

        if (queryType == 'upsert' && !is_undefined(key) && !is_undefined(options)) {
          queries.push(`ON DUPLICATE KEY UPDATE \`${key}\`=?, ${this.makeUpdateParts(<Array<string>>options)}`);
        }
        break;
      default:
    }

    return queries.join(' ');
  }

  private getWhereStatement(): string
  {
    const conditions: string[] = [];

    this.whereCondition.forEach((value: WhereValueObject, key: string) => {
      switch (typeof value) {
        case 'boolean':
          conditions.push(`\`${key}\` IS ${value ? 'EXISTS' : 'NOT EXISTS'}`);
          break;
        default:
          conditions.push(`\`${key}\` ${value.cond} ?`); // PDO
      }
    });

    return conditions.join(' AND ');
  }

  private makeSelectQuery(instantLimit: number | undefined = undefined): string
  {
    const queries: Array<string> = [];

    queries.push(`SELECT ${this.fields.length ? this.fields.map(this.backQuotes).join(', ') : '*'}`);
    queries.push(`FROM \`${this.databaseName}\`.\`${this.tableName}\``);
    queries.push('WHERE');

    if (!this.whereCondition.size) {
      queries.push('1');
    } else {
      queries.push(this.getWhereStatement());
    }

    // offset
    if (instantLimit !== undefined) {
      queries.push(`LIMIT ${instantLimit}`);
    } else {
      queries.push(`LIMIT ${this._limit} OFFSET ${this._offset}`);
    }

    return queries.join(' ');
  }

  /**
   * makeUpdateParts
   * @param options
   * @returns string
   */
  private makeUpdateParts(options: Array<string>): string
  {
    return options.map(this.backQuotes).map(value => value + '=?').join(', ');
  }

  /**
   * backQuotes
   * @param value
   * @param index
   * @returns string
   */
  private backQuotes(value: string, index: number): string
  {
    return ('`' + value + '`');
  }
}
