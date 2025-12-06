// models/user.model.ts
export type User = {
  uid: string;
  email: string;
  displayName?: string;
  role?: string;
};

export type CreateUserDto = {
  email: string;
  password: string;
  displayName?: string;
  role?: string;
};

export type DeleteUserDto = {
  uid: string;
};
