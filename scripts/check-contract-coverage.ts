import * as fs from "node:fs";
import * as path from "node:path";
import {
  type ContractEndpointRow,
  flattenContractEndpoints,
} from "./contract-endpoints";

type HttpMethod = ContractEndpointRow[1];

type ApiCall = {
  method: HttpMethod;
  path: string;
  file: string;
  line: number;
};

const repoRoot = findRepoRoot(process.cwd());
const repositoriesRoot = path.join(repoRoot, "src/infrastructure/repositories");
const calls = walkTypeScriptFiles(repositoriesRoot).flatMap(readApiCalls);
const rows = flattenContractEndpoints();

const missingRows = calls.filter(
  (call) => !rows.some((row) => row[1] === call.method && samePath(row[2], call.path)),
);
const staleRows = rows.filter(
  (row) => !calls.some((call) => call.method === row[1] && samePath(row[2], call.path)),
);

if (missingRows.length > 0 || staleRows.length > 0) {
  console.log("Contract coverage check failed:");

  if (missingRows.length > 0) {
    console.log("");
    console.log("Repository calls missing from scripts/contract-endpoints.ts:");
    for (const call of missingRows) {
      console.log(`- ${call.method} ${call.path} (${call.file}:${call.line})`);
    }
  }

  if (staleRows.length > 0) {
    console.log("");
    console.log("Contract endpoint rows without a matching repository call:");
    for (const [module, method, endpointPath] of staleRows) {
      console.log(`- ${module}: ${method} ${endpointPath}`);
    }
  }

  process.exitCode = 1;
} else {
  console.log(
    `PASS Contract coverage: ${calls.length} repository API calls match ${rows.length} contract rows.`,
  );
}

function findRepoRoot(startDirectory: string): string {
  let current = path.resolve(startDirectory);

  while (true) {
    if (
      fs.existsSync(path.join(current, "package.json")) &&
      fs.existsSync(path.join(current, "src"))
    ) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error("Could not find repo root.");
    }
    current = parent;
  }
}

function walkTypeScriptFiles(directory: string): string[] {
  const result: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__" && entry.name !== "mappers") {
        result.push(...walkTypeScriptFiles(fullPath));
      }
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".d.ts")
    ) {
      result.push(fullPath);
    }
  }
  return result;
}

function readApiCalls(filePath: string): ApiCall[] {
  const original = fs.readFileSync(filePath, "utf8");
  const content = stripComments(original);
  const relativeFile = toPosix(path.relative(repoRoot, filePath));
  const callsInFile: ApiCall[] = [];
  const callPattern = /apiClient\.(get|post|postForm|put|patch|del)\s*(?:<[\s\S]*?>)?\s*\(/g;
  let match: RegExpExecArray | null;

  while ((match = callPattern.exec(content)) !== null) {
    const method = methodFromApiClientName(match[1]);
    const literal = readFirstPathLiteral(content, callPattern.lastIndex);
    if (!literal) continue;

    callsInFile.push({
      method,
      path: normalizePath(literal),
      file: relativeFile,
      line: lineNumber(original, match.index),
    });
  }

  return callsInFile;
}

function methodFromApiClientName(name: string): HttpMethod {
  if (name === "postForm") return "POST";
  if (name === "del") return "DELETE";
  return name.toUpperCase() as HttpMethod;
}

function readFirstPathLiteral(content: string, start: number): string | null {
  for (let i = start; i < content.length; i += 1) {
    const char = content[i];
    if (char === '"' || char === "'") {
      return readQuotedLiteral(content, i, char);
    }
    if (char === "`") {
      return readTemplateLiteral(content, i);
    }
    if (char === ")") return null;
  }
  return null;
}

function readQuotedLiteral(content: string, start: number, quote: string): string {
  let value = "";
  for (let i = start + 1; i < content.length; i += 1) {
    const char = content[i];
    if (char === "\\") {
      value += content[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (char === quote) return value;
    value += char;
  }
  return value;
}

function readTemplateLiteral(content: string, start: number): string {
  let value = "";
  for (let i = start + 1; i < content.length; i += 1) {
    const char = content[i];
    if (char === "\\") {
      value += content[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (char === "`") return value;
    if (char === "$" && content[i + 1] === "{") {
      value += "{param}";
      i = skipTemplateExpression(content, i + 2);
      continue;
    }
    value += char;
  }
  return value;
}

function skipTemplateExpression(content: string, start: number): number {
  let depth = 1;
  for (let i = start; i < content.length; i += 1) {
    const char = content[i];
    if (char === '"' || char === "'") {
      i = skipQuoted(content, i, char);
      continue;
    }
    if (char === "`") {
      i = skipBacktick(content, i);
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return content.length - 1;
}

function skipQuoted(content: string, start: number, quote: string): number {
  for (let i = start + 1; i < content.length; i += 1) {
    if (content[i] === "\\") {
      i += 1;
      continue;
    }
    if (content[i] === quote) return i;
  }
  return content.length - 1;
}

function skipBacktick(content: string, start: number): number {
  for (let i = start + 1; i < content.length; i += 1) {
    if (content[i] === "\\") {
      i += 1;
      continue;
    }
    if (content[i] === "`") return i;
  }
  return content.length - 1;
}

function normalizePath(rawPath: string): string {
  let normalized = rawPath.split("?")[0];
  normalized = normalized.replace(/(?<!\/)\{param\}.*/, "");
  normalized = normalized.replace(/\/+$/, "");
  if (!normalized.startsWith("/api/v1/")) {
    normalized = `/api/v1${normalized.startsWith("/") ? "" : "/"}${normalized}`;
  }
  return normalizeParams(normalized);
}

function samePath(registered: string, actual: string): boolean {
  const registeredParts = normalizeParams(registered).split("/");
  const actualParts = normalizeParams(actual).split("/");
  if (registeredParts.length !== actualParts.length) return false;

  return registeredParts.every((part, index) => {
    const other = actualParts[index];
    return part === other || (isParam(part) && isParam(other));
  });
}

function normalizeParams(value: string): string {
  return value.replace(/\{[^}]+}/g, "{param}");
}

function isParam(value: string): boolean {
  return value === "{param}";
}

function stripComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function lineNumber(content: string, index: number): number {
  return content.slice(0, index).split(/\r\n|\r|\n/).length;
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}
