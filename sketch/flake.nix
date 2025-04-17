{
  description = "A very basic flake";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:cachix/devenv-nixpkgs/rolling";
    nixpkgs-unstable.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    devenv.url = "github:fmway/devenv";
    devenv.inputs.nixpkgs.follows = "nixpkgs";
    fmway-nix.url = "github:fmway/fmway.nix";
    fmway-nix.inputs.flake-parts.follows = "flake-parts";
    fmway-nix.inputs.nixpkgs.follows = "nixpkgs";
    arduino-nix.url = "github:fmway/arduino-nix";
    arduino-nix.inputs.arduino-index.follows = "arduino-index";
    devenv-root = {
      url = "file+file:///dev/null";
      flake = false;
    };
    arduino-index = {
      url = "github:bouk/arduino-indexes";
      flake = false;
    };
  };

  outputs = { fmway-nix, self, ... } @ inputs:
  fmway-nix.fmway.mkFlake { inherit inputs; } {
    systems = [ "x86_64-linux" "aarch64-linux" ];

    imports = [
      fmway-nix.flakeModules.nixpkgs
      fmway-nix.flakeModules.devenv
    ];

    perSystem = { pkgs, lib, ... }: {
      nixpkgs.overlays = [
        (self: super: {
          unstable = inputs.nixpkgs-unstable.legacyPackages.${self.system};
        })
      ];
      devenv.modules = [
        { _module.args.flake = self; }
        fmway-nix.devenvModules.some
      ];

      devenv.shells.default.imports = [ ./devenv.nix ];
    };
  };
}
