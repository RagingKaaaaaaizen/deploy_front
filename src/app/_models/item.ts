import { Role } from './role';
import { Category } from './category'
export interface Item {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  // Optionally, include category name when API expands it later
  categoryName?: string;
}
