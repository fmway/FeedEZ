#ifndef _EVENT_H
#define _EVENT_H
#include "Arduino.h"
#include <stdint.h>
#include "functional-vlpp.h"

class Event {
private:
  unsigned long prevTime = millis();
public:
  void on_interval(uint16_t sec, vl::Func<void()> func);
  void delay(uint16_t sec);
  Event();
};
#endif // !_EVENT_H
