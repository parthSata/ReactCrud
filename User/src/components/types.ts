export interface User {
  id: string; // Use string for MongoDB _id
  name: string;
  surname: string;
  age: string;
  mobile: string;
  email: string;
  image: string | null;
}