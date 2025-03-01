import ts from "typescript";
import { FlatTypeNode } from "../common";

export function resolveTsTypeToFlatType(
  type: ts.Type,
  typeChecker: ts.TypeChecker
): FlatTypeNode | undefined {
  if (type.flags & ts.TypeFlags.Number) return { type: "number" };
  if (type.flags & ts.TypeFlags.Boolean) return { type: "boolean" };
  if (type.flags & ts.TypeFlags.String) return { type: "string" };
  if (type.flags & ts.TypeFlags.Null) return { type: "null" };
  if (type.flags & ts.TypeFlags.Undefined) return { type: "undefined" };
  if (type.flags & ts.TypeFlags.Void) return { type: "void" };

  if (type.isNumberLiteral()) {
    return { type: "numberLiteral", value: type.value };
  }

  if (type.isStringLiteral()) {
    return { type: "stringLiteral", value: type.value };
  }

  if (isBooleanLiteral(type)) {
    return {
      type: "booleanLiteral",
      value: type.intrinsicName === "true"
    };
  }

  if (type.isUnion()) {
    const types = [];
    for (const member of type.types) {
      const flatMember = resolveTsTypeToFlatType(member, typeChecker);

      if (!flatMember) return;
      types.push(flatMember);
    }

    return { type: "union", types };
  }

  if (isArray(type)) {
    const itemType = resolveTsTypeToFlatType(
      type.resolvedTypeArguments[0],
      typeChecker
    );
    if (!itemType) return;

    return { type: "array", itemType };
  }

  if (isPromise(type)) {
    return resolveTsTypeToFlatType(type.resolvedTypeArguments[0], typeChecker);
  }

  if (isDate(type)) {
    return { type: "date" };
  }

  if (isObject(type)) {
    const keyValuePairTypes: [string, FlatTypeNode][] = [];

    const typeDeclarations = type.getSymbol()?.getDeclarations();

    try {
      for (const property of type.getProperties()) {
        const declaration =
          property.getDeclarations()?.[0] ?? typeDeclarations?.[0];
        if (!declaration) continue;

        const type = resolveTsTypeToFlatType(
          typeChecker.getTypeAtLocation(declaration),
          typeChecker
        );
        if (!type) return;
        keyValuePairTypes.push([property.getName(), type]);
      }

      return { type: "object", keyValuePairTypes };
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function isBooleanLiteral(
  type: ts.Type
): type is ts.Type & { intrinsicName: "true" | "false" } {
  return !!(type.flags & ts.TypeFlags.BooleanLiteral);
}

function isArray(
  type: ts.Type
): type is ts.Type & { resolvedTypeArguments: [ts.Type] } {
  return type.getSymbol()?.name === "Array";
}

function isPromise(
  type: ts.Type
): type is ts.Type & { resolvedTypeArguments: [ts.Type] } {
  return type.getSymbol()?.name === "Promise";
}

function isDate(type: ts.Type): boolean {
  return (
    !!(type.flags & ts.TypeFlags.Object) &&
    "objectFlags" in type &&
    type.symbol.escapedName === "Date"
  );
}

function isObject(type: ts.Type): boolean {
  return (
    !!(type.flags & ts.TypeFlags.Object) &&
    "objectFlags" in type &&
    "properties" in type &&
    !type.isClass() &&
    type.getCallSignatures().length === 0
  );
}
