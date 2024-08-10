import { z } from 'zod';
import { Schema } from '../api/Schema.js';

export type ComponentType = z.infer<typeof Schema.ElementSchema>;