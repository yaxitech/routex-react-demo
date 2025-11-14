{
  lib,
  buildNpmPackage,
  buildMode ? "production",
}:
let
  packageJson = lib.importJSON ../../../routex-react-demo/package.json;
  buildModeToSuffix = {
    production = "";
  };
in

assert lib.asserts.assertOneOf "buildMode" buildMode (lib.attrNames buildModeToSuffix);

buildNpmPackage {
  pname = packageJson.name + buildModeToSuffix.${buildMode};
  version = packageJson.version;

  src = ../../../routex-react-demo;
  npmDepsHash = "sha256-ukbJrjpW/k75oxKIJSGcqihp2qMGaloEOB8AFG9yRlk=";

  # https://vite.dev/guide/env-and-mode#modes
  npmBuildFlags = [
    "--"
    "--mode"
    buildMode
  ];

  installPhase = ''
    runHook preInstall

    cp -r dist/ "$out/"

    runHook postInstall
  '';

  passthru = {
    inherit buildMode;
  };
}
