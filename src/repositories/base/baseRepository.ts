import { Model, Document } from 'mongoose';
class BaseRepository<T extends Document> {
    private model: Model<T>;
    constructor(model: Model<T>) {
        this.model = model;
      }
      async create(data: T): Promise<T> {
        const document = new this.model(data);
        return document.save();
      }
      async findOne(condition: object): Promise<T | null> {
        return this.model.findOne(condition).exec();
      }
      async findAll(): Promise<T[]> {
        return this.model.find().exec();
      }
      async update(id: string, data: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
      }
      async delete(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id).exec();
      }
      async findWithCondition(condition: object): Promise<T[]> {
        return this.model.find(condition).exec();
      }
}

export default BaseRepository;