export interface Book {
  readonly id: number;
  title: string;
  isbn: string;
  publishedYear: number | null;
  available: boolean;
  createdAt: string;
}

export type NewBook = Omit<Book, 'id' | 'createdAt'>;
