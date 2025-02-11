{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs = inputs: inputs.flake-parts.lib.mkFlake { inherit inputs; } {
    systems = [ "x86_64-linux" "aarch64-linux" ];

    perSystem = { pkgs, lib, ... }: let
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          arduino
          arduino-cli
        ];
      };
    };
  };

}
