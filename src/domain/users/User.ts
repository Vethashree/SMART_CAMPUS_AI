export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
}
