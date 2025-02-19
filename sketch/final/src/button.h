#ifndef _MY_BUTTON_H
#define _MY_BUTTON_H

#include "Arduino.h"
#include "functional-vlpp.h"
class Button {
  public:
    uint8_t pin;
    bool clicked();
    void init(uint8_t pin);
    void on_click(vl::Func<void()> func);
  private:
    bool state = false;
};

#endif // !_MY_BUTTON_H
