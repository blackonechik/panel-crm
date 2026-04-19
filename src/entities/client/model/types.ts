export type Client = {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  username: string | null;
  city: string | null;
  company: string | null;
  source: string | null;
  consentAccepted: boolean;
  tags: string[];
};
