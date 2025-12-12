import ts from "typescript";
import type { TransformerExtras, PluginConfig } from "ts-patch";
import { getFunctionSignature } from "./getFunctionSignature";
import { Colors, LIBRARY_NAME, Signature } from "../common";

const REGISTER_METHOD_NAME = "registerRpc";

const endpointNames = new Set<string>();

export default function (
  program: ts.Program,
  _pluginConfig: PluginConfig,
  { ts: tsInstance }: TransformerExtras
) {
  console.log(`Applying the ${LIBRARY_NAME} magic...`);

  return (ctx: ts.TransformationContext) => {
    const factory = ctx.factory;

    return (sourceFile: ts.SourceFile) => {
      const fileName = sourceFile.fileName;

      const addRegisterRpcToEndpointsVisitor = (
        node: ts.Node
      ): ts.NodeArray<ts.Node> | ts.Node => {
        const signature = visitNode(node, program, fileName, tsInstance);

        if (!signature) {
          if (
            tsInstance.isFunctionDeclaration(node) ||
            tsInstance.isClassDeclaration(node) ||
            tsInstance.isVariableDeclaration(node)
          ) {
            return node;
          }
          return tsInstance.visitEachChild(
            node,
            addRegisterRpcToEndpointsVisitor,
            ctx
          );
        }

        const callExpression = factory.createCallExpression(
          requireRegisterRpc(factory) as ts.Expression,
          undefined,
          [
            factory.createIdentifier(signature.functionName),
            factory.createStringLiteral(JSON.stringify(signature)),
          ]
        );

        const result = factory.createNodeArray([
          node,
          callExpression,
          factory.createToken(ts.SyntaxKind.SemicolonToken),
        ]);

        endpointNames.add(signature.functionName);

        return result;
      };
      const node = tsInstance.visitNode(
        sourceFile,
        addRegisterRpcToEndpointsVisitor
      );
      return node;
    };
  };
}

function visitNode(
  node: ts.Node,
  program: ts.Program,
  fileName: string,
  tsInstance: typeof ts
): Signature | undefined {
  if (!tsInstance.isFunctionDeclaration(node)) return;
  if (!isEndpoint(node, tsInstance)) return;

  const functionName = node.name?.getText();

  const signature = getFunctionSignature(program, node, tsInstance);

  if (!signature) {
    console.log(
      `${Colors.BgRed}${fileName}#${functionName}${Colors.Reset}\n  couldn't parse signature; ${Colors.FgYellow}skipped${Colors.Reset}\n  make sure the arguments and return value are serialisable (contain no functions, classes or recursive structures)\n\n`
    );
    return;
  }

  if (endpointNames.has(signature.functionName)) {
    console.log(
      `${Colors.BgRed}${fileName}#${functionName}${Colors.Reset}\n  duplicate endpoint name; ${Colors.FgYellow}skipped${Colors.Reset}\n  make sure your endpoint names are unique across the project in their function definitions, not just in export aliases\n\n`
    );
    return;
  }

  return signature;
}

function isEndpoint(
  node: ts.FunctionDeclaration,
  tsInstance: typeof ts
): boolean {
  const jsDoc = tsInstance.getJSDocTags(node);
  return jsDoc.some((tag) => tag.tagName.text === "endpoint");
}

function requireRegisterRpc(factory: ts.NodeFactory): ts.Node {
  // Ideally we wouldn't do it like this, e.g. see
  // https://stackoverflow.com/q/79423585/2691058
  return factory.createPropertyAccessExpression(
    factory.createCallExpression(
      factory.createIdentifier("require"),
      undefined,
      [factory.createStringLiteral(LIBRARY_NAME)]
    ),
    factory.createIdentifier(REGISTER_METHOD_NAME)
  );
}
