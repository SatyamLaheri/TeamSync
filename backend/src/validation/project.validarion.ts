import { z } from "zod";

export const emojiSchema = z.string().min(1).trim().optional();
export const nameSchema = z.string().min(1).trim().max(255);
export const descriptionSchema = z.string().trim().optional();

export const projectIdSchema = z.string().trim().min(1);
export const createProjectSchema = z.object({
    emoji:emojiSchema,
    name:nameSchema,
    description:descriptionSchema

})

export const updateProjectSchema = z.object({
    emoji:emojiSchema,
    name:nameSchema,
    description:descriptionSchema
})