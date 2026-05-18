export type KintanaPublicEvent = {
  id: string;
  slug: string;
  name: string;
  date: string;
  city: string | null;
  country: string | null;
  imageUrl: string | null;
  ticketUrl: string;
  embedUrl: string;
};

export type KintanaPublicFormSummary = {
  id: string;
  slug: string;
  kind: string;
  title: string;
};

export type KintanaFormField = {
  id: string;
  type: "text" | "email" | "textarea";
  label: string;
  required?: boolean;
};

export type KintanaPublicFormSchema = {
  id: string;
  title: string;
  kind: string;
  fields: KintanaFormField[];
  successMessage: string | null;
  redirectUrl: string | null;
};
