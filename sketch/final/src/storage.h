#ifndef __MY_STORAGE_H
#define __MY_STORAGE_H

#include "Arduino.h"
#include "EEPROM.h"
#include "inttypes.h"

class Storage {
public:
  template <typename T> static void save(uint16_t address, T data);
  static void write(uint16_t address, uint8_t data);
  static void clear();
  template <typename T> static void read(uint16_t address, T * dest);
  static uint8_t read(uint16_t address);
  static bool available(uint16_t address);
};

#endif // !__MY_STORAGE_H
