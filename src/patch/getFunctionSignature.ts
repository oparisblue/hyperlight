import ts from "typescript";
import { Signature, SignatureParam } from "../common";
import { resolveTsTypeToFlatType } from "./resolveTsTypeToFlatType";

const NAME_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

export function getFunctionSignature(
  program: ts.Program,
  node: ts.FunctionDeclaration
): Signature | undefined {
  const typeChecker = program.getTypeChecker();

  const signature = typeChecker.getSignatureFromDeclaration(node);
  if (!signature) return;

  const functionName = node.name?.getText();
  if (!functionName) return;

  const params: SignatureParam[] = [];

  for (let i = 0; i < node.parameters.length; i++) {
    const param = node.parameters[i];

    if (!param.type) return;
    const type = resolveTsTypeToFlatType(
      typeChecker.getTypeFromTypeNode(param.type),
      typeChecker
    );
    if (!type) return;

    const name = param.name.getText();
    params.push({ name: NAME_REGEX.test(name) ? name : `param${i}`, type });
  }

  const returnType = resolveTsTypeToFlatType(
    typeChecker.getReturnTypeOfSignature(signature),
    typeChecker
  );
  if (!returnType) return;

  return { functionName, params, returnType };
}
