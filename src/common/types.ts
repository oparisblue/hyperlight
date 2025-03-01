export type FlatTypeNode =
  | { type: "number" }
  | { type: "boolean" }
  | { type: "string" }
  | { type: "null" }
  | { type: "undefined" }
  | { type: "void" }
  | { type: "numberLiteral"; value: number }
  | { type: "stringLiteral"; value: string }
  | { type: "booleanLiteral"; value: boolean }
  | { type: "union"; types: FlatTypeNode[] }
  | { type: "array"; itemType: FlatTypeNode }
  | { type: "object"; keyValuePairTypes: [string, FlatTypeNode][] }
  | { type: "date" };

export interface Signature {
  functionName: string;
  params: SignatureParam[];
  returnType: FlatTypeNode;
  jsDoc: string;
}

export interface SignatureParam {
  name: string;
  type: FlatTypeNode;
}
