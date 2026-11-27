export interface Book {
  readonly id: number;
  readonly userId: number;
  title: string;
  isbn: string;
  publishedYear: number | null;
  available: boolean;
  finishedAt: string | null;
  createdAt: string;
}

export type NewBook = Omit<Book, 'id' | 'createdAt'>;

export interface FinishedByMonth {
  month: string;
  count: number;
}
