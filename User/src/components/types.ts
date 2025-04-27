export interface User {
  id: number | string; // Allow string for MongoDB _id
  name: string;
  surname: string;
  age: string;
  mobile: string;
  email: string;
  image: string | null;
}
