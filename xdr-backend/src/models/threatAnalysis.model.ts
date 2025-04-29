import {
  pipe,
  number,
  minValue,
  string,
  minLength,
  regex,
  picklist,
  object,
} from "valibot";

const timestampSchema = pipe(
  number("Debe ser valor numerico"),
  minValue(0, "Timestamp inválido"),
);
const typeSchema = pipe(string(), minLength(3, "Tipo mínimo 3 caracteres"));
const sourceIPSchema = pipe(string(), regex(/^\d+\.\d+\.\d+\.\d+$/));
const destinationIPSchema = pipe(string(), regex(/^\d+\.\d+\.\d+\.\d+$/));
const severitySchema = pipe(picklist(["low", "medium", "high", "critical"]));
const packetLengthSchema = pipe(number());
const protocolSchema = pipe(string(), minLength(1, "Protocolo inválido"));
const additionalInfoSchema = pipe(
  string(),
  minLength(1, "Información adicional inválida"),
);

const detailsSchema = object({
  packet_length: packetLengthSchema,
  protocol: protocolSchema,
  additional_info: additionalInfoSchema,
});

export const NetworkEventSchema = object({
  timestamp: timestampSchema,
  type: typeSchema,
  sourceIP: sourceIPSchema,
  destinationIP: destinationIPSchema,
  severity: severitySchema,
  details: detailsSchema,
});
