{ inputs, pkgs, ... }:
{
  name = "sketch";
  imports = [
    inputs.fmway-nix.devenvModules.arduino
  ];
  packages = with pkgs; [
    unstable.python3
  ];

  arduino-cli = {
    sketch."final" = {
      fqbn = "arduino:avr:uno";
    };
    sketch."esp" = {
      fqbn = "esp8266:esp8266:nodemcuv2";
    };
    enable = true;
    realPath = true;
    libraries = map (x: pkgs.arduino.lib.${x}.latest) [
      "Functional-Vlpp"
      "LiquidCrystal I2C"
      "Adafruit BusIO"
      "RTClib"
      "Servo"
      "Vector"
      "WebSockets"
    ];
    packages = with pkgs.arduino.pkgs.platforms; [
      arduino.avr.latest
      esp8266.esp8266.latest
    ];
    packageIndex = [
      "${inputs.arduino-index}/index/package_esp8266com_index.json"
    ];
  };

  overlays = [
    (self: super: {
      arduino-cli = self.unstable.arduino-cli;
    })
  ];
}
