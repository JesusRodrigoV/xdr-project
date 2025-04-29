import { pipe, string, minLength, object } from "valibot";

const messageSchema = pipe(
  string(),
  minLength(1, "El mensaje no puede estar vacío"),
);

export const ChatSchema = object({
  message: messageSchema,
});
