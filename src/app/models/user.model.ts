export type RemoteUser = {
  // User fields
  id: number;
  username: string;
  email: string;

  // Profile fields
  firstName: string;
  lastName: string;
  dob: string;

  // Base Entity
  active: boolean;

  roles?: string[];
};

export type RegistrationRequest = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};
