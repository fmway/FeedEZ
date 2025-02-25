#include "storage.h"

template <typename T>
void Storage::save(uint16_t address, T data) {
  EEPROM.put(address, data);
}

void Storage::write(uint16_t address, uint8_t data) {
  EEPROM.write(address, data);
}

bool Storage::available(uint16_t address) {
  if (EEPROM.read(address) == 255) {
    return false;
  }
  return true;
}

void Storage::clear() {
  for (uint16_t i = 0; i < EEPROM.length(); i++) {
    EEPROM.write(i, 255);
  }
}

template <typename T>
void Storage::read(uint16_t address, T * dest) {
  EEPROM.get(address, dest);
}

uint8_t Storage::read(uint16_t address) {
  return EEPROM.read(address);
}
