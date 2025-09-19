export interface BaseRepository {
  create(data: unknown): Promise<unknown>;
  findById(id: number): Promise<unknown>;
}
