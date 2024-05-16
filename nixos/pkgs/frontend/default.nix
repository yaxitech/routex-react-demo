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
  npmDepsHash = "sha256-8EuZkfZNCG49n2cKXEoF7Urtq+TUZVFfotw3g17Jj/8=";

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
