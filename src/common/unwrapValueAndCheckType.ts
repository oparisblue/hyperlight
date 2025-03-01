import { FlatTypeNode } from "./types";

export function unwrapValueAndCheckType(
  wrappedValue: any,
  type: FlatTypeNode
): any {
  if (typeof wrappedValue !== "object" || wrappedValue == null) {
    throw new TypeCheckError();
  }
  const value = type.type === "union" ? wrappedValue : wrappedValue.v;

  switch (type.type) {
    case "null":
      if (value !== null) throw new TypeCheckError("expected null");
      return null;
    case "undefined":
      if (value !== undefined) throw new TypeCheckError("expected undefined");
      return undefined;
    case "void":
      return undefined;
    case "numberLiteral":
    case "stringLiteral":
    case "booleanLiteral":
      if (value !== type.value) {
        throw new TypeCheckError(`expected ${type.type}`);
      }
      return value;
    case "number":
      if (typeof value !== "number") {
        throw new TypeCheckError("expected number");
      }
      return value;
    case "boolean":
      if (typeof value !== "boolean") {
        throw new TypeCheckError("expected boolean");
      }
      return value;
    case "string":
      if (typeof value !== "string") {
        throw new TypeCheckError("expected string");
      }
      return value;
    case "union":
      for (const member of type.types) {
        try {
          const item = unwrapValueAndCheckType(value, member);
          return item;
        } catch {}
      }
      throw new TypeCheckError(
        `not in union, expected ${type.types
          .map((type) => type.type)
          .join(" or ")}`
      );
    case "array":
      if (!Array.isArray(value)) throw new TypeCheckError("expected array");
      return value.map((item) => unwrapValueAndCheckType(item, type.itemType));
    case "object":
      if (typeof value !== "object" || value == null) {
        throw new TypeCheckError("expected object");
      }

      const result: Record<string, unknown> = {};
      for (const [key, valueType] of type.keyValuePairTypes) {
        if (!(key in value)) {
          throw new TypeCheckError(`key "${key}" not in object`);
        }
        result[key] = unwrapValueAndCheckType(value[key], valueType);
      }
      return result;
    case "date":
      if (typeof value !== "string") {
        throw new TypeCheckError("expected date iso string");
      }
      return new Date(value);
  }
}

class TypeCheckError extends Error {}
