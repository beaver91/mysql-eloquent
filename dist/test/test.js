"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var MysqlEloquent_1 = __importDefault(require("../lib/MysqlEloquent"));
main();
function main() {
    var model = new MysqlEloquent_1.default();
    var result = model.table('beaver.data24_raw_mdcin').where('id', 1000, '>').get();
}
