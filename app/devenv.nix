{ inputs, lib, config, pkgs, ... }:

let
  # Configure which Android tools we'll need (mostly the recommended ones)
  sdk = inputs.android-nixpkgs.sdk.${pkgs.system} (sdkPkgs:
    with sdkPkgs; [
      build-tools-30-0-3
      build-tools-33-0-0
      cmdline-tools-latest
      emulator
      # patcher-v4
      platform-tools
      platforms-android-33
      system-images-android-32-google-apis-x86-64
    ]);
in {
  # Install various packages from Nix that we'll need for this project
  packages = with pkgs; [
    nodejs
    nodePackages.eas-cli
    nodePackages.pnpm
    watchman
  ];

  # Ensure our path has various Android SDK things in it
  enterShell = ''
    export PATH="${sdk}/bin:$PATH"
    ${(builtins.readFile "${sdk}/nix-support/setup-hook")}
  '';

  # Create the initial AVD that's needed by the emulator
  scripts.create-avd.exec = /* sh */ "
    avdmanager create avd --force --name phone --package 'system-images;android-32;google_apis;x86_64'";

  # These processes will all run whenever we run `devenv run`
  processes.emulator.exec = /* sh */ ''
    emulator -avd phone -skin 800x1340'';
  processes.react-native.exec = /* sh */ ''
    npx react-native start'';
}
