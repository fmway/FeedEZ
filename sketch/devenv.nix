{ inputs, name, lib, flake, system, pkgs, config, ... }: let
  arduino = pkgs.arduino.pkgs.platforms.arduino.avr.latest;
in {
  name = "sketch";
  imports = [
    inputs.arduino-nix.devenvModules.default
  ];

  arduino-cli = {
    enable = true;
    realPath = true;
    libraries = map (x: pkgs.arduino.lib.${x}.latest) [
      "Functional-Vlpp"
      "LiquidCrystal I2C"
      "Adafruit BusIO"
      "RTClib"
      "Servo"
      "Vector"
    ];
    packages = [
      arduino
      pkgs.arduino.pkgs.platforms.esp8266.esp8266.latest
    ];
    packageIndex = [
      "${inputs.arduino-index}/index/package_esp8266com_index.json"
    ];
  };

  files.".clangd".text = let
    inherit (config.arduino-cli) userPath dataPath;
    fetchLib = dir:
      if lib.isList dir then
        lib.flatten (map (x: fetchLib x) dir)
      else let
        listDirs = builtins.readDir dir;
        filteredDirs = lib.filter (x: listDirs.${x} == "directory") (lib.attrNames listDirs);
      in map (x:
        if lib.pathExists "${dir}/${x}/src" then
          "- -I${dir}/${x}/src"
        else if lib.pathExists "${dir}/${x}/include" then
          "- -I${dir}/${x}/include"
        else
          "- -I${dir}/${x}") filteredDirs; 
    l = map (x: "${pkgs.arduino-core-unwrapped}/${x}") [
    ] ++ [
      "${userPath}/libraries"
      "${dataPath}/packages/arduino/hardware/avr/${arduino.version}/libraries"
    ];
    r = fetchLib l;
  in /* yaml */ ''
    CompileFlags:
      Add:
      - -DARDUINO=10813
      - -DARDUINO_ARCH_AVR
      - -DUSBCON
      - -Wno-attributes
      - -I${dataPath}/packages/arduino/hardware/avr/${arduino.version}/cores/arduino
      - -I${dataPath}/packages/arduino/hardware/avr/${arduino.version}/variants/standard
      ${lib.concatStringsSep "\n  " r}
      ${let
        path = "${dataPath}/packages/arduino/tools/avr-gcc";
      in lib.pipe path [
        (builtins.readDir)
        (lib.filterAttrs (_: v: v == "directory"))
        (lib.attrNames)
        (map (x: "- -I${path}/${x}/avr/include"))
        (lib.concatStringsSep "\n  ")
      ]}
  '';

  nixpkgs.overlays = [
    (self: super: {
      arduino-cli = self.unstable.arduino-cli;
    })
  ];
}
