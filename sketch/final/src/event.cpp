#include "event.h"

void Event::on_interval(uint16_t sec, vl::Func<void()> func) {
  if (millis() - prevTime >= sec) {
    func();
    prevTime = millis();
  }
}

Event::Event() {

}
