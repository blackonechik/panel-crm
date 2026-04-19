import type { Client } from '../../client/model/types';

export type Lead = {
  id: string;
  source: string | null;
  channel: 'TELEGRAM' | 'MAX';
  fullName: string | null;
  phone: string | null;
  email: string | null;
  username: string | null;
  company: string | null;
  comment: string | null;
  interest: string | null;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  client: Client;
  assignedUser: { id: string; name: string } | null;
  chat: { id: string; status: string } | null;
};
