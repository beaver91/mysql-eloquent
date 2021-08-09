import mysql from 'mysql2/promise';
import { IndexSignature, ConnectionProperties } from './types';
/**
 * `boolean` is EXISTS
 */
declare type WhereValueCondition = string | number | boolean | object;
declare type OrderTypes = 'asc' | 'desc';
export default class MysqlEloquent<T extends IndexSignature> {
    private static pool;
    private whereCondition;
    private fields;
    private _offset;
    private _limit;
    private _orderBy;
    protected static connectionProperties: ConnectionProperties;
    protected databaseName: string;
    protected tableName: string;
    protected primaryKey: string;
    constructor(connectionProperties?: ConnectionProperties | undefined);
    private static connect;
    static getPool(): Promise<mysql.Pool>;
    /**
     * select
     * @param fields string | string[]
     * @returns
     */
    select(fields: string | string[]): this;
    /**
     * where
     * @param key string
     * @param condition whereValueCondition
     * @returns this
     */
    where(key: string, condition: WhereValueCondition): this;
    /**
     * set offset
     * @param offset number
     * @returns
     */
    offset(offset: number): this;
    /**
     * set limit
     * @param limit number
     * @returns
     */
    limit(limit: number): this;
    /**
     * set orderby
     * @param field string
     * @param order OrderTypes
     * @returns
     */
    orderBy(field: string, order: OrderTypes): this;
    /**
     * 모든 `whereCondition`을 초기화합니다.
     * @returns this
     */
    clear(): this;
    /**
     * get
     * @param instantLimit
     * @returns
     */
    get(instantLimit?: number | undefined): Promise<any[]>;
    /**
     * first row
     * @returns
     */
    first(): Promise<any>;
    /**
     * 현재 `where` 조건에 걸려있는 값들을 리턴합니다.
     * @returns Array<whereValueCondition>
     */
    getConditonValues(): Array<WhereValueCondition>;
    /**
     * Inserts
     * @param massive
     */
    inserts(massive: Array<T>): Promise<void>;
    /**
     * update
     * @param update T
     */
    update(update: T): Promise<[mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader, mysql.FieldPacket[]]>;
    /**
     * Upserts
     * @param massive
     * @param key `ON DUPLICATE KEY UPDATE`에 걸릴 조건 키명
     * @param options 어떤 필드들이 업데이트 될 것인지
     */
    upserts(massive: Array<T>, key: string, options: Array<string>): Promise<void>;
    /**
     * makeInsertQuery
     * @param queryType
     * @param datas
     * @param key
     * @param options
     * @returns string
     */
    private makeInsertQuery;
    private getWhereStatement;
    private makeSelectQuery;
    /**
     * makeUpdateParts
     * @param options
     * @returns string
     */
    private makeUpdateParts;
    /**
     * backQuotes
     * @param value
     * @param index
     * @returns string
     */
    private backQuotes;
}
export {};
//# sourceMappingURL=MysqlEloquent.d.ts.map