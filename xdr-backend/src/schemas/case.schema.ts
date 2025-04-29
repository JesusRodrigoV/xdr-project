import { z } from 'zod';

export const createCaseSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  severity: z.number().min(1).max(4),
  startDate: z.number().optional(),
  tags: z.array(z.string()).optional(),
  flag: z.boolean().optional()
});

export const addObservableSchema = z.object({
  dataType: z.string().min(1),
  data: z.string().min(1),
  message: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tlp: z.number().min(0).max(3),
  ioc: z.boolean()
});
