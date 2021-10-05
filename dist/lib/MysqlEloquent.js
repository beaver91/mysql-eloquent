"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var promise_1 = __importDefault(require("mysql2/promise"));
var slimphp_1 = require("slimphp");
var CONNECTION_TIMEOUT = 20;
var DEFAULT_LIMIT = 2000;
var MysqlEloquent = /** @class */ (function () {
    function MysqlEloquent(connectionProperties) {
        if (connectionProperties === void 0) { connectionProperties = undefined; }
        this.whereCondition = new Map();
        this.fields = [];
        this._offset = 0;
        this._limit = DEFAULT_LIMIT;
        this._orderBy = new Map();
        this.databaseName = '';
        this.tableName = '';
        this.primaryKey = 'id';
        if (!slimphp_1.is_undefined(connectionProperties)) {
            MysqlEloquent.connectionProperties = connectionProperties;
        }
        MysqlEloquent.connect();
    }
    MysqlEloquent.connect = function () {
        // <Connection Pool>
        // https://www.npmjs.com/package/mysql2#using-connection-pools
        MysqlEloquent.pool = promise_1.default.createPool({
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
    };
    MysqlEloquent.getPool = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (MysqlEloquent.pool === undefined) {
                    MysqlEloquent.connect();
                }
                return [2 /*return*/, MysqlEloquent.pool];
            });
        });
    };
    /**
     * table name
     * @param tableName
     * @returns
     */
    MysqlEloquent.prototype.table = function (tableName) {
        var _a = tableName.trim().split('.'), db = _a[0], table = _a[1];
        this.databaseName = db;
        this.tableName = table;
        return this;
    };
    /**
     * select
     * @param fields string | string[]
     * @returns
     */
    MysqlEloquent.prototype.select = function (fields) {
        if (!slimphp_1.is_array(fields)) { // is string
            fields = fields.split(',').map(function (v) { return v.trim(); });
        }
        this.fields = fields;
        return this;
    };
    /**
     * where
     * @param key string
     * @param condition WhereValueCondition
     * @param operator WhereConditionOperator
     * @returns this
     */
    MysqlEloquent.prototype.where = function (key, condition, operator) {
        if (operator === void 0) { operator = '='; }
        this.whereCondition.set(key, {
            "cond": operator,
            "value": condition
        });
        return this;
    };
    /**
     * set offset
     * @param offset number
     * @returns
     */
    MysqlEloquent.prototype.offset = function (offset) {
        this._offset = Math.abs(offset);
        return this;
    };
    /**
     * set limit
     * @param limit number
     * @returns
     */
    MysqlEloquent.prototype.limit = function (limit) {
        this._limit = Math.abs(limit);
        return this;
    };
    /**
     * set orderby
     * @param field string
     * @param order OrderTypes
     * @returns
     */
    MysqlEloquent.prototype.orderBy = function (field, order) {
        this._orderBy.set(field, order);
        return this;
    };
    /**
     * 모든 `whereCondition`을 초기화합니다.
     * @returns this
     */
    MysqlEloquent.prototype.clear = function () {
        this.whereCondition.clear();
        return this;
    };
    /**
     * get
     * @param instantLimit
     * @returns
     */
    MysqlEloquent.prototype.get = function (instantLimit) {
        if (instantLimit === void 0) { instantLimit = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var connection, query, condition, _a, rows, columns;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, MysqlEloquent.getPool()];
                    case 1:
                        connection = _b.sent();
                        query = this.makeSelectQuery(instantLimit);
                        condition = this.getConditonValues();
                        return [4 /*yield*/, connection.execute(query, condition)];
                    case 2:
                        _a = _b.sent(), rows = _a[0], columns = _a[1];
                        return [2 /*return*/, Object.values(rows)];
                }
            });
        });
    };
    /**
     * first row
     * @returns
     */
    MysqlEloquent.prototype.first = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(1)];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, rows.length ? rows[0] : null];
                }
            });
        });
    };
    /**
     * 현재 `where` 조건에 걸려있는 값들을 리턴합니다.
     * @returns Array<whereValueCondition>
     */
    MysqlEloquent.prototype.getConditonValues = function () {
        return Array.from(this.whereCondition).map(function (row) { return row[1].value; });
    };
    /**
     * Inserts
     * @param massive
     */
    MysqlEloquent.prototype.inserts = function (massive) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, query, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MysqlEloquent.getPool()];
                    case 1: return [4 /*yield*/, (_a.sent()).getConnection()];
                    case 2:
                        connection = _a.sent();
                        query = this.makeInsertQuery('insert', massive);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, 8, 9]);
                        return [4 /*yield*/, connection.beginTransaction()];
                    case 4:
                        _a.sent();
                        // <Prepared Statement>
                        // https://www.npmjs.com/package/mysql2#using-prepared-statements
                        massive.forEach(function (row) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: 
                                    // If you execute same statement again, it will be picked from a LRU cache
                                    // which will save query preparation time and give better performance
                                    return [4 /*yield*/, connection.execute(query, Object.values(row))];
                                    case 1:
                                        // If you execute same statement again, it will be picked from a LRU cache
                                        // which will save query preparation time and give better performance
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, connection.commit()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 6:
                        err_1 = _a.sent();
                        return [4 /*yield*/, connection.rollback()];
                    case 7:
                        _a.sent();
                        throw err_1;
                    case 8:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * update
     * @param update T
     */
    MysqlEloquent.prototype.update = function (update) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, queries, fields, values, updateFields, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MysqlEloquent.getPool()];
                    case 1:
                        connection = _a.sent();
                        queries = [];
                        queries.push("UPDATE `" + this.tableName + "` SET");
                        fields = Object.keys(update);
                        values = Object.values(update);
                        updateFields = [];
                        fields.forEach(function (field) {
                            updateFields.push("`" + field + "`=?");
                        });
                        queries.push(updateFields.join(', '));
                        queries.push("WHERE " + this.getWhereStatement());
                        return [4 /*yield*/, connection.execute(queries.join(' '), __spreadArray(__spreadArray([], values), this.getConditonValues()))];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Upserts
     * @param massive
     * @param key `ON DUPLICATE KEY UPDATE`에 걸릴 조건 키명
     * @param options 어떤 필드들이 업데이트 될 것인지
     */
    MysqlEloquent.prototype.upserts = function (massive, key, options) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, query, err_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MysqlEloquent.getPool()];
                    case 1: return [4 /*yield*/, (_a.sent()).getConnection()];
                    case 2:
                        connection = _a.sent();
                        query = this.makeInsertQuery('upsert', massive, key, options);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, 8, 9]);
                        return [4 /*yield*/, connection.beginTransaction()];
                    case 4:
                        _a.sent();
                        // <Prepared Statement>
                        massive.forEach(function (row) { return __awaiter(_this, void 0, void 0, function () {
                            var values;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        values = Object.values(row);
                                        // ON DUPLICATE KEY UPDATE `key`={VALUES}
                                        values.push(row[key]);
                                        // After `ON DUPLICATE KEY UPDATE `key`={VALUES}, {...}`
                                        options.forEach(function (field) { return values.push(row[field]); });
                                        return [4 /*yield*/, connection.execute(query, values)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, connection.commit()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 6:
                        err_2 = _a.sent();
                        return [4 /*yield*/, connection.rollback()];
                    case 7:
                        _a.sent();
                        throw err_2;
                    case 8:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * makeInsertQuery
     * @param queryType
     * @param datas
     * @param key
     * @param options
     * @returns string
     */
    MysqlEloquent.prototype.makeInsertQuery = function (queryType, datas, key, options) {
        if (key === void 0) { key = undefined; }
        if (options === void 0) { options = undefined; }
        var queries = [];
        switch (queryType) {
            case 'insert':
            case 'upsert':
                queries.push("INSERT INTO `" + this.tableName + "`(" + Object.keys(datas[0]).map(this.backQuotes).join(', ') + ")");
                var values = Array.from('?'.repeat(Object.values(datas[0]).length));
                queries.push("VALUES (" + values.join(', ') + ")");
                if (queryType == 'upsert' && !slimphp_1.is_undefined(key) && !slimphp_1.is_undefined(options)) {
                    queries.push("ON DUPLICATE KEY UPDATE `" + key + "`=?, " + this.makeUpdateParts(options));
                }
                break;
            default:
        }
        return queries.join(' ');
    };
    MysqlEloquent.prototype.getWhereStatement = function () {
        var conditions = [];
        this.whereCondition.forEach(function (value, key) {
            switch (typeof value) {
                case 'boolean':
                    conditions.push("`" + key + "` IS " + (value ? 'EXISTS' : 'NOT EXISTS'));
                    break;
                default:
                    conditions.push("`" + key + "` " + value.cond + " ?"); // PDO
            }
        });
        return conditions.join(' AND ');
    };
    MysqlEloquent.prototype.makeSelectQuery = function (instantLimit) {
        if (instantLimit === void 0) { instantLimit = undefined; }
        var queries = [];
        queries.push("SELECT " + (this.fields.length ? this.fields.map(this.backQuotes).join(', ') : '*'));
        queries.push("FROM `" + this.databaseName + "`.`" + this.tableName + "`");
        queries.push('WHERE');
        if (!this.whereCondition.size) {
            queries.push('1');
        }
        else {
            queries.push(this.getWhereStatement());
        }
        // offset
        if (instantLimit !== undefined) {
            queries.push("LIMIT " + instantLimit);
        }
        else {
            queries.push("LIMIT " + this._limit + " OFFSET " + this._offset);
        }
        return queries.join(' ');
    };
    /**
     * makeUpdateParts
     * @param options
     * @returns string
     */
    MysqlEloquent.prototype.makeUpdateParts = function (options) {
        return options.map(this.backQuotes).map(function (value) { return value + '=?'; }).join(', ');
    };
    /**
     * backQuotes
     * @param value
     * @param index
     * @returns string
     */
    MysqlEloquent.prototype.backQuotes = function (value, index) {
        return ('`' + value + '`');
    };
    MysqlEloquent.pool = undefined;
    MysqlEloquent.connectionProperties = {
        "host": "127.0.0.1",
        "port": 3306,
        "user": "root",
        "password": "",
        "database": "mysql",
    };
    return MysqlEloquent;
}());
exports.default = MysqlEloquent;
