{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    fmway-nix.url = "github:fmway/fmway.nix";
    fmway-nix.inputs.nixpkgs.follows = "nixpkgs";
    fmway-nix.inputs.flake-parts.follows = "flake-parts";
    flake-parts.url = "github:hercules-ci/flake-parts";
    arduino-nix.url = "github:bouk/arduino-nix";
    arduino-index = {
      url = "github:bouk/arduino-indexes";
      flake = false;
    };
  };

  outputs = inputs: let
    inherit (inputs.arduino-nix) latestVersion;
  in inputs.fmway-nix.fmway.mkFlake { inherit inputs; enableOverlays = true; } {
    systems = [ "x86_64-linux" "aarch64-linux" ];

    perSystem = { pkgs, lib, ... }: let
      mkShell = lib.fmway.createShell pkgs;
      arduino-cli = pkgs.arduino-cli.wrapPackages {
        libraries = builtins.map (x: pkgs.arduino.lib.${x}.latest) [
          "Functional-Vlpp"
          "LiquidCrystal I2C"
          "Adafruit BusIO"
          "RTClib"
          "Servo"
          "Vector"
        ];

        packages = with pkgs.arduinoPackages; [
          (platforms.arduino.avr.latest)
        ];
      };
    in {
      devShells.default = mkShell {
        extraFiles.".clangd" = {
          addToGitignore = true;
          text = let
            fetchLib = dir:
              if lib.isList dir then
                lib.flatten (map (x: fetchLib x) dir)
              else let
                listDirs = builtins.readDir dir;
                filteredDirs = lib.filter (x: listDirs.${x} == "directory") (lib.attrNames listDirs);
              in map (x:
                if lib.pathExists "${dir}/${x}/src" then
                  "  - -I${dir}/${x}/src\n"
                else
                  "  - -I${dir}/${x}\n") filteredDirs; 
            l = map (x: "${pkgs.arduino-core-unwrapped}/${x}") [
              "share/arduino/libraries"
              "share/arduino/hardware/arduino/avr/libraries"
            ] ++ [ "${arduino-cli.passthru.userPath}/libraries" ];
            r = fetchLib l;
          in /* yaml */ ''
            CompileFlags:
              Add:
              - -I${pkgs.arduino-core-unwrapped}/share/arduino/hardware/arduino/avr/cores/arduino
              - -I${pkgs.arduino-core-unwrapped}/share/arduino/hardware/tools/avr/avr/include
              - -I${pkgs.arduino-core-unwrapped}/share/arduino/hardware/arduino/avr/variants/standard
          '' + lib.concatStringsSep "" r;
        };

        buildInputs = with pkgs; [
          arduino
          arduino-core-unwrapped
          arduino-cli
        ];
      };
    };

    flake.overlays = {
      arduino = self: super: {
        arduino-cli = super.arduino-cli // { wrapPackages = super.callPackage "${inputs.arduino-nix}/wrap-arduino-cli.nix" { inherit (self) lib; }; };
        arduino = super.arduino // { lib = self.arduinoLibraries; pkgs = self.arduinoPackages; };
      };
      arduinoPackages = self: super: {
        arduinoLibraries = let
          res = self.callPackage "${inputs.arduino-nix}/libraries.nix" {
            libraryIndex = builtins.fromJSON (builtins.readFile "${inputs.arduino-index}/index/library_index.json");
          };
        in builtins.listToAttrs (map (name: {
          inherit name;
          value = res.${name} // { latest = latestVersion res.${name}; };
        }) (builtins.attrNames res));

        arduinoPackages = let
          res = self.callPackage "${inputs.arduino-nix}/packages.nix" {
            packageIndex = builtins.fromJSON (builtins.readFile "${inputs.arduino-index}/index/package_index.json");
          };
        in res // {
          platforms = builtins.listToAttrs (map (name: {
            inherit name;
            value = res.platforms.${name} // builtins.listToAttrs (map (namex: {
              name = namex;
              value = res.platforms.${name}.${namex} // { latest = latestVersion res.platforms.${name}.${namex}; };
            }) (builtins.attrNames res.platforms.${name}));
          }) (builtins.attrNames res.platforms));
          tools = builtins.listToAttrs (map (name: {
            inherit name;
            value = res.tools.${name} // builtins.listToAttrs (map (namex: {
              name = namex;
              value = res.tools.${name}.${namex} // { latest = latestVersion res.tools.${name}.${namex}; };
            }) (builtins.attrNames res.tools.${name}));
          }) (builtins.attrNames res.tools));
        };
      };
    };
  };
}
