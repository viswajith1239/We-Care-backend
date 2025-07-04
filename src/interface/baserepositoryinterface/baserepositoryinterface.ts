export interface IBaseRepository<T> {
  create(data: T): Promise<T>;
  findOne(condition: object): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<T | null>;
  findWithCondition(condition: object): Promise<T[]>;
}
