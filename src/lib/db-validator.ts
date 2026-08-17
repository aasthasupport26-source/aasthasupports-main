import { z } from "zod";

const UUIDSchema = z.string().uuid();
const EmailSchema = z.string().email();
const PhoneSchema = z.string().regex(/^\+?[1-9]\d{6,14}$/);

export const validateUserId = (id: string) => UUIDSchema.parse(id);
export const validateEmail = (email: string) => EmailSchema.parse(email);
export const validatePhone = (phone: string) => PhoneSchema.parse(phone);

export const sanitizeOrderBy = (field: string, allowed: string[]) => {
  if (!allowed.includes(field)) throw new Error("Invalid order field");
  return field;
};

export const sanitizeLimit = (limit: number, max = 100) => {
  const parsed = z.number().int().min(1).max(max).parse(limit);
  return parsed;
};

export const sanitizeOffset = (offset: number) => {
  return z.number().int().min(0).parse(offset);
};
