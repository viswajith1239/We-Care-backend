"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseRepository {
    constructor(model) {
        this._model = model;
    }
    async create(data) {
        const document = new this._model(data);
        return document.save();
    }
    async findOne(condition) {
        return this._model.findOne(condition).exec();
    }
    async findAll() {
        return this._model.find().exec();
    }
    async update(id, data) {
        return this._model.findByIdAndUpdate(id, data, { new: true }).exec();
    }
    async delete(id) {
        return this._model.findByIdAndDelete(id).exec();
    }
    async findWithCondition(condition) {
        return this._model.find(condition).exec();
    }
}
exports.default = BaseRepository;
