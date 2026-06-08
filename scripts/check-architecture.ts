import * as fs from "node:fs";
import * as path from "node:path";

type SourceLayer = "domain" | "application" | "infrastructure" | "presentation" | "presentation-app" | "app";
type TargetLayer = "domain" | "application" | "infrastructure" | "presentation" | "app";
type Severity = "critical" | "major";

type ImportSpec = {
  specifier: string;
  line: number;
};

type Finding = {
  group: string;
  severity: Severity;
  file: string;
  line: number;
  specifier: string;
  message: string;
};

type Warning = {
  group: string;
  file: string;
  message: string;
};

const ROUTE_NON_EMPTY_LINE_LIMIT = 8;

const skippedDirectoryNames = new Set([
  ".expo",
  ".git",
  "android",
  "build",
  "coverage",
  "dist",
  "generated",
  "__generated__",
  "ios",
  "node_modules",
  "__mocks__",
  "__tests__",
]);

const bareImportPattern = /^\s*import\s+["']([^"']+)["']/gm;
const fromImportPattern = /^\s*import\s+(?!["'])(?:type\s+)?[\s\S]*?\s+from\s+["']([^"']+)["']/gm;
const exportFromPattern = /^\s*export\s+(?:type\s+)?(?:\*|{[\s\S]*?})\s+from\s+["']([^"']+)["']/gm;
const dynamicImportPattern = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

const repoRoot = findRepoRoot(process.cwd());
const scannedRoots = ["src", "app"].map((dir) => path.join(repoRoot, dir));

const files = scannedRoots.flatMap((dir) => walkTypeScriptFiles(dir));
const findings: Finding[] = [];
const warnings: Warning[] = [];
let importsChecked = 0;

for (const filePath of files) {
  const relativeFile = toPosix(path.relative(repoRoot, filePath));
  const sourceLayer = getSourceLayer(relativeFile);
  const content = fs.readFileSync(filePath, "utf8");

  if (sourceLayer === "app") {
    addRouteThinnessWarning(relativeFile, content);
  }

  for (const importSpec of extractImports(content)) {
    importsChecked += 1;
    checkImport(relativeFile, sourceLayer, importSpec);
  }
}

printReport();

function findRepoRoot(startDirectory: string): string {
  let current = path.resolve(startDirectory);

  while (true) {
    const hasPackage = fs.existsSync(path.join(current, "package.json"));
    const hasSrc = fs.existsSync(path.join(current, "src"));
    const hasApp = fs.existsSync(path.join(current, "app"));

    if (hasPackage && hasSrc && hasApp) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error("Could not find repo root with package.json, src/, and app/.");
    }
    current = parent;
  }
}

function walkTypeScriptFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const result: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!shouldSkipDirectory(entry.name)) {
        result.push(...walkTypeScriptFiles(fullPath));
      }
      continue;
    }

    if (entry.isFile() && shouldScanFile(fullPath)) {
      result.push(fullPath);
    }
  }

  return result;
}

function shouldSkipDirectory(name: string): boolean {
  return skippedDirectoryNames.has(name);
}

function shouldScanFile(filePath: string): boolean {
  const relativeFile = toPosix(path.relative(repoRoot, filePath));
  const fileName = path.basename(filePath);

  if (!fileName.endsWith(".ts") && !fileName.endsWith(".tsx")) {
    return false;
  }

  if (fileName.endsWith(".d.ts")) {
    return false;
  }

  if (
    fileName.includes(".test.") ||
    fileName.includes(".spec.") ||
    fileName.includes(".generated.") ||
    relativeFile.includes("/generated/") ||
    relativeFile.includes("/__generated__/") ||
    relativeFile.includes("/__tests__/")
  ) {
    return false;
  }

  return true;
}

function extractImports(content: string): ImportSpec[] {
  const imports: ImportSpec[] = [];

  for (const pattern of [bareImportPattern, fromImportPattern, exportFromPattern, dynamicImportPattern]) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(content)) !== null) {
      const specifier = match[1];
      if (!specifier) {
        continue;
      }

      imports.push({
        specifier,
        line: getLineNumber(content, match.index),
      });
    }
  }

  return imports.sort((a, b) => a.line - b.line || a.specifier.localeCompare(b.specifier));
}

function getLineNumber(content: string, index: number): number {
  return content.slice(0, index).split(/\r\n|\r|\n/).length;
}

function checkImport(file: string, sourceLayer: SourceLayer | null, importSpec: ImportSpec): void {
  if (!sourceLayer) {
    return;
  }

  const target = resolveProjectImport(file, importSpec.specifier);
  const targetLayer = target ? getTargetLayer(target) : null;

  if (isApiClientImport(target, importSpec.specifier) && sourceLayer !== "infrastructure") {
    addFinding({
      group: "apiClient import violations",
      severity: "critical",
      file,
      line: importSpec.line,
      specifier: importSpec.specifier,
      message: "apiClient is infrastructure-only",
    });
  }

  if (!target) {
    return;
  }

  if (sourceLayer === "app") {
    checkAppRouteImport(file, importSpec, target);
    return;
  }

  if (!targetLayer) {
    return;
  }

  if (sourceLayer === "domain" && targetLayer !== "domain") {
    addFinding({
      group: "layer boundary violations",
      severity: "critical",
      file,
      line: importSpec.line,
      specifier: importSpec.specifier,
      message: `domain cannot import ${targetLayer}`,
    });
    return;
  }

  if (
    sourceLayer === "application" &&
    (targetLayer === "infrastructure" || targetLayer === "presentation" || targetLayer === "app")
  ) {
    addFinding({
      group: "layer boundary violations",
      severity: "critical",
      file,
      line: importSpec.line,
      specifier: importSpec.specifier,
      message: `application cannot import ${targetLayer}`,
    });
    return;
  }

  if (sourceLayer === "infrastructure" && (targetLayer === "presentation" || targetLayer === "app")) {
    addFinding({
      group: "layer boundary violations",
      severity: "critical",
      file,
      line: importSpec.line,
      specifier: importSpec.specifier,
      message: `infrastructure cannot import ${targetLayer}`,
    });
    return;
  }

  if (sourceLayer === "presentation-app") {
    checkPresentationAppImport(file, importSpec, target, targetLayer);
    return;
  }

  if (sourceLayer === "presentation") {
    checkFeaturePresentationImport(file, importSpec, target, targetLayer);
  }
}

function checkAppRouteImport(file: string, importSpec: ImportSpec, target: string): void {
  if (isAllowedAppRouteTarget(target)) {
    return;
  }

  addFinding({
    group: "route boundary violations",
    severity: "major",
    file,
    line: importSpec.line,
    specifier: importSpec.specifier,
    message: "app routes may import only @/presentation/app/* or @/presentation/*/screens/*",
  });
}

function checkPresentationAppImport(
  file: string,
  importSpec: ImportSpec,
  target: string,
  targetLayer: TargetLayer,
): void {
  if (targetLayer === "infrastructure" && isInfrastructureDiTarget(target)) {
    return;
  }

  if (targetLayer === "infrastructure" || targetLayer === "application" || targetLayer === "app") {
    addFinding({
      group: "layer boundary violations",
      severity: "major",
      file,
      line: importSpec.line,
      specifier: importSpec.specifier,
      message: "presentation/app may import infrastructure only through @/infrastructure/di/*",
    });
  }
}

function checkFeaturePresentationImport(
  file: string,
  importSpec: ImportSpec,
  target: string,
  targetLayer: TargetLayer,
): void {
  if (targetLayer === "infrastructure" && isDIContextTarget(target)) {
    return;
  }

  if (targetLayer === "infrastructure" || targetLayer === "application" || targetLayer === "app") {
    addFinding({
      group: "layer boundary violations",
      severity: "major",
      file,
      line: importSpec.line,
      specifier: importSpec.specifier,
      message: "feature presentation cannot import application or infrastructure except @/infrastructure/di/DIContext",
    });
  }
}

function addFinding(finding: Finding): void {
  findings.push(finding);
}

function addRouteThinnessWarning(file: string, content: string): void {
  const nonEmptyLines = content.split(/\r\n|\r|\n/).filter((line) => line.trim().length > 0).length;

  if (nonEmptyLines <= ROUTE_NON_EMPTY_LINE_LIMIT) {
    return;
  }

  warnings.push({
    group: "route thinness warnings",
    file,
    message: `${file} has ${nonEmptyLines} non-empty lines; route files should stay at ${ROUTE_NON_EMPTY_LINE_LIMIT} or fewer`,
  });
}

function resolveProjectImport(sourceFile: string, specifier: string): string | null {
  const cleanSpecifier = specifier.split("?")[0];

  if (cleanSpecifier.startsWith("@/")) {
    return normalizeProjectPath(`src/${cleanSpecifier.slice(2)}`);
  }

  if (cleanSpecifier.startsWith(".")) {
    const sourceDirectory = path.dirname(path.join(repoRoot, sourceFile));
    const absoluteTarget = path.resolve(sourceDirectory, cleanSpecifier);
    const relativeTarget = toPosix(path.relative(repoRoot, absoluteTarget));

    if (relativeTarget.startsWith("..")) {
      return null;
    }

    return normalizeProjectPath(relativeTarget);
  }

  if (path.isAbsolute(cleanSpecifier)) {
    const relativeTarget = toPosix(path.relative(repoRoot, cleanSpecifier));

    if (!relativeTarget.startsWith("..")) {
      return normalizeProjectPath(relativeTarget);
    }
  }

  return null;
}

function normalizeProjectPath(projectPath: string): string {
  return toPosix(projectPath).replace(/\/+$/, "");
}

function getSourceLayer(file: string): SourceLayer | null {
  if (pathMatches(file, "app")) {
    return "app";
  }

  if (pathMatches(file, "src/domain")) {
    return "domain";
  }

  if (pathMatches(file, "src/application")) {
    return "application";
  }

  if (pathMatches(file, "src/infrastructure")) {
    return "infrastructure";
  }

  if (pathMatches(file, "src/presentation/app")) {
    return "presentation-app";
  }

  if (pathMatches(file, "src/presentation")) {
    return "presentation";
  }

  return null;
}

function getTargetLayer(target: string): TargetLayer | null {
  if (pathMatches(target, "app")) {
    return "app";
  }

  if (pathMatches(target, "src/domain")) {
    return "domain";
  }

  if (pathMatches(target, "src/application")) {
    return "application";
  }

  if (pathMatches(target, "src/infrastructure")) {
    return "infrastructure";
  }

  if (pathMatches(target, "src/presentation")) {
    return "presentation";
  }

  return null;
}

function isAllowedAppRouteTarget(target: string): boolean {
  return pathMatches(target, "src/presentation/app") || /^src\/presentation\/[^/]+\/screens(\/|$)/.test(target);
}

function isInfrastructureDiTarget(target: string): boolean {
  return pathMatches(target, "src/infrastructure/di");
}

function isDIContextTarget(target: string): boolean {
  return target === "src/infrastructure/di/DIContext" || target === "src/infrastructure/di/DIContext.tsx";
}

function isApiClientImport(target: string | null, specifier: string): boolean {
  return (
    specifier === "@/infrastructure/api/apiClient" ||
    specifier === "@/infrastructure/api/apiClient.ts" ||
    target === "src/infrastructure/api/apiClient" ||
    target === "src/infrastructure/api/apiClient.ts"
  );
}

function pathMatches(projectPath: string, prefix: string): boolean {
  return projectPath === prefix || projectPath.startsWith(`${prefix}/`);
}

function printReport(): void {
  sortFindings();
  warnings.sort((a, b) => a.file.localeCompare(b.file) || a.message.localeCompare(b.message));

  if (findings.length > 0) {
    console.log("Architecture check failed:");
    printFindingGroups(findings);

    if (warnings.length > 0) {
      console.log("");
      printWarningGroups(warnings);
    }

    process.exitCode = 1;
    return;
  }

  if (warnings.length > 0) {
    console.log("Architecture check passed with warnings:");
    printWarningGroups(warnings);
    console.log("");
  }

  console.log(
    `PASS Architecture check: scanned ${files.length} files and ${importsChecked} imports with no boundary violations.`,
  );
}

function sortFindings(): void {
  findings.sort(
    (a, b) =>
      a.group.localeCompare(b.group) ||
      a.file.localeCompare(b.file) ||
      a.line - b.line ||
      a.specifier.localeCompare(b.specifier),
  );
}

function printFindingGroups(groupedFindings: Finding[]): void {
  let currentGroup: string | null = null;

  for (const finding of groupedFindings) {
    if (finding.group !== currentGroup) {
      currentGroup = finding.group;
      console.log("");
      console.log(`${capitalize(currentGroup)}:`);
    }

    console.log(
      `- [${finding.severity}] ${finding.file}:${finding.line} imports ${finding.specifier} (${finding.message})`,
    );
  }
}

function printWarningGroups(groupedWarnings: Warning[]): void {
  let currentGroup: string | null = null;

  for (const warning of groupedWarnings) {
    if (warning.group !== currentGroup) {
      currentGroup = warning.group;
      console.log(`${capitalize(currentGroup)}:`);
    }

    console.log(`- [warning] ${warning.message}`);
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}
