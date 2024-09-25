import { consola } from "consola";
import { camelCase } from "scule";

async function prompt(
  message: string,
  options: any,
  required: boolean = true,
  errorMessage: string = "Field is required"
) {
  const result = await consola.prompt(message, options);
  if (typeof result === "symbol") {
    process.exit(1);
  }
  if (required && (result || "").trim().length === 0) {
    throw new Error(errorMessage);
  }
  return (result || "").trim();
}

export async function initPrompts() {
  const projectName = camelCase(
    (await prompt(
      "Enter project name:",
      { type: "text", placeholder: "codetieProject" },
      true,
      "Project name is required"
    )) || "codetieProject"
  );
  const bundleIdPrefix =
    (await prompt(
      "Enter Bundle ID Prefix:",
      { type: "text", placeholder: "com.example" },
      false,
      "Bundle ID Prefix is required"
    )) || "com.example";
  const deploymentTarget =
    (await prompt(
      "Enter Deployment Target iOS Version:",
      { type: "text", placeholder: "17.0" },
      false,
      "Deployment Target is required"
    )) || "17.0";
  const xcodeVersion =
    (await prompt(
      "Enter Xcode Version:",
      { type: "text", placeholder: "15.3" },
      false,
      "Xcode Version is required"
    )) || "15.3";
  const swiftVersion =
    (await prompt(
      "Enter Swift Version:",
      { type: "text", placeholder: "5.10.1" },
      false,
      "Swift Version is required"
    )) || "5.10.1";
  const appVersion =
    (await prompt(
      "Enter App Version:",
      { type: "text", placeholder: "1.0.0" },
      false,
      "App Version is required"
    )) || "1.0.0";
  const buildNumber =
    (await prompt(
      "Enter Build Number:",
      { type: "text", placeholder: "1" },
      false,
      "Build Number is required"
    )) || "1";
  return {
    projectName,
    bundleIdPrefix,
    deploymentTarget,
    xcodeVersion,
    swiftVersion,
    appVersion,
    buildNumber,
  };
}
