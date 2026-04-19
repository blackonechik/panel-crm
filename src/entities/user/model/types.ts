export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
};

export type UserListItem = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  role: { id: string; name: string };
};

export type RoleItem = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
};
