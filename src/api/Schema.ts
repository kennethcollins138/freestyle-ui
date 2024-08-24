/*
DOCUMENTATION:

Schema Class makes it simple to define different models types of data models.
I have a standard set for each of my components. Expected values and default values from forms make this possible.
Each Element: stacks, buttons, etc.. are defined below.
Schema is set up to support multiple posts without overriding other posts.
As of Devvit Version 0.1, you have a maximum of 500 MB of storage and can pull 5 MB at a time. Can't request more than 1000 commands a second.
AppInstance will be used to handle base post once the Post is created.
Config is used for app settings. Don't have many app settings outside of UI config.
*/


import { z } from 'zod';
import { ALL_ICON_NAMES } from '@devvit/public-api';

export type AppInstance = z.input<(typeof Schema)['appInstance']>;
export type Config = z.input<typeof Schema.configSchema>;
export type PageSchema = z.infer<typeof Schema.PageSchema>;
export type PostSchema = z.infer<typeof Schema.PostSchema>;
export type ElementSchema = z.infer<typeof Schema.ElementSchema>;
export type HomeSchema = z.infer<typeof Schema.HomeSchema>;
export type ImageElementSchema = z.infer<typeof Schema.ImageElementSchema>;

export class Schema {
  static configSchema = z.object({});

  // If user specifies different light/dark modes than default.
  static color = z
    .object({
      light: z.string().min(1),
      dark: z.string().min(1)
    })
    .strict();

  // Text Alignment options used for Text and Stacks
  static textAlignmentOptions = [
    "top start", "top center", "top end", 
    "middle start", "middle center", "middle end", 
    "bottom start", "bottom center", "bottom end", 
    "start top", "start center", "start bottom", 
    "center top", "center center", "center bottom", 
    "end top", "end center", "end bottom",
    "end middle"
  ] as const;
  
  // Gaps and Padding for stacks
  static containerGapOptions = [
    "none", "small", "medium", "large"
  ] as const;
  static containerPaddingOptions = [
    "none", "xsmall", "small", "medium", "large"
  ] as const;

  // Images will hold these value. Actual image stored in Assets folder.
  static ImageElementSchema = z.object({
    id: z.string(),
    type: z.literal('Image'),
    url: z.string(),
    width: z.string(),
    height: z.string(),
    resizeMode: z.enum(['fit', 'fill', 'cover']),
    imageWidth: z.number(),
    imageHeight: z.number(),
    minWidth: z.string().optional(),
    minHeight: z.string().optional(),
    maxWidth: z.string().optional(),
    maxHeight: z.string().optional(),
    order: z.number().optional(),
  });

  // Text Element block giving user access to adding text elements.
  static TextElementSchema = z.object({
    id: z.string(),
    type: z.literal('Text'),
    text: z.string(),
    style: z.enum(['body', 'metadata', 'heading']).optional(),
    size: z.enum(['xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge']).optional(),
    weight: z.enum(['regular', 'bold']).optional(),
    color: z.string().optional(),
    alignment: z.enum(Schema.textAlignmentOptions).optional(),
    outline: z.enum(['none', 'thin', 'thick']).optional(),
    selectable: z.boolean().optional(),
    wrap: z.boolean().optional(),
    overflow: z.enum(['ellipsis', 'clip']).optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    order: z.number().optional(),
  });

  static ButtonElementSchema = z.object({
    id: z.string(),
    type: z.literal('Button'),
    icon: z.enum(ALL_ICON_NAMES).optional(),
    size: z.enum(['small', 'medium', 'large']),
    appearance: z.enum(['secondary', 'primary', 'plain', 'bordered', 'media', 'destructive', 'caution', 'success']),
    isGrow: z.boolean().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    url: z.string().optional(),
    text: z.string(),
    action: z.object({
      type: z.enum(['navigate', 'custom']), // TODO: might change this setup
      targetPageId: z.string().optional(), // Only required for navigate action
      customAction: z.string().optional() // For other types of actions
    }).optional(),
    order: z.number().optional(),
  });

  static PersonalPlugSchema = z.object({
    id: z.string(),
    type: z.literal('PersonalPlug'),
    content: z.string(),
    order: z.number().optional(),
  });

  static VStackSchema = z.object({
    id: z.string(),
    type: z.literal('VStack'),
    children: z.array(z.lazy(() => Schema.ElementSchema)),
    gap: z.enum(Schema.containerGapOptions).optional(),
    alignment: z.enum(Schema.textAlignmentOptions).optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    padding: z.enum(Schema.containerPaddingOptions).optional(),
    backgroundColor: z.string().optional(),
    order: z.number().optional(),
  });

  static HStackSchema = z.object({
    id: z.string(),
    type: z.literal('HStack'),
    children: z.array(z.lazy(() => Schema.ElementSchema)),
    gap: z.enum(Schema.containerGapOptions).optional(),
    alignment: z.enum(Schema.textAlignmentOptions).optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    padding: z.enum(Schema.containerPaddingOptions).optional(),
    backgroundColor: z.string().optional(),
    order: z.number().optional(),
  });

  static ZStackSchema = z.object({
    id: z.string(),
    type: z.literal('ZStack'),
    children: z.array(z.lazy(() => Schema.ElementSchema)),
    gap: z.enum(Schema.containerGapOptions).optional(),
    alignment: z.enum(Schema.textAlignmentOptions).optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    padding: z.enum(Schema.containerPaddingOptions).optional(),
    backgroundColor: z.string().optional(),
    order: z.number().optional(),
  });

  // Define ElementSchema with recursive reference
  static ElementSchema: z.ZodType<any> = z.union([
    Schema.ImageElementSchema,
    Schema.TextElementSchema,
    Schema.ButtonElementSchema,
    Schema.PersonalPlugSchema,
    Schema.VStackSchema,
    Schema.HStackSchema,
    Schema.ZStackSchema,
  ]);

  // Define Page schema
  static PageSchema = z.object({
    id: z.string(),
    light: z.string(),
    dark: z.string().nullable(),
    children: z.array(Schema.ElementSchema),
  });

  static HomeSchema = z.object({
    light: z.string(),
    dark: z.string().nullable(),
    children: z.array(Schema.ElementSchema),
  });

  // appInstance defines the base post instance
  static appInstance = z
    .object({
      status: z.enum(['draft', 'live']),
      url: z.string().nullable(),
      createdAt: z.string().datetime(),
      createdBy: z.string().min(1),
      owners: z.array(z.string()).min(1),
      color: z.object({
        light: z.string(),
        dark: z.string()
      }),
      title: z.string().min(1),
      header: z.string().min(1),
      subheader: z.string(),
      imageData: z.record(Schema.ImageElementSchema),
      home: Schema.HomeSchema,
      pages: z.record(Schema.PageSchema), // Techinically Same as Home page, but setup for pagination
    })
    .strict();

    // Plan on having reddit page create multiple posts.
    static PostSchema = z.record(Schema.appInstance);
}