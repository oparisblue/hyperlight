import { FlatTypeNode } from "../common";

export function flatTypeToTsType(type: FlatTypeNode): string {
  switch (type.type) {
    case "null":
      return "null";
    case "undefined":
      return "undefined";
    case "void":
      return "void";
    case "numberLiteral":
    case "stringLiteral":
    case "booleanLiteral":
      return JSON.stringify(type.value);
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "string":
      return "string";
    case "union":
      return `(${type.types
        .map((member) => flatTypeToTsType(member))
        .join("|")})`;
    case "array":
      return `${flatTypeToTsType(type.itemType)}[]`;
    case "object":
      return `{${type.keyValuePairTypes
        .map(([key, value]) => `${key}: ${flatTypeToTsType(value)}`)
        .join(", ")}}`;
    case "date":
      return "Date";
  }
}
