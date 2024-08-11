import { z } from 'zod';
import { Schema } from '../api/Schema.js';
import { TextFormData } from '../forms/TextComponentForm.js';
import { ButtonFormData } from '../forms/ButtonComponentForm.js';
import { ImageFormData } from '../forms/ImageComponentForm.js';
import { StackFormData } from '../forms/StackComponentForm.js';
import { PaginationButtonFormData } from '../forms/PaginationButtonForm.js';

export type ComponentType = z.infer<typeof Schema.ElementSchema>;
export type FormComponentData = TextFormData | ButtonFormData | ImageFormData | StackFormData | PaginationButtonFormData;