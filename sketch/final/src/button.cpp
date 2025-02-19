#include "button.h"
#include "Arduino.h"

void Button::init(uint8_t pin) {
  this->pin = pin;
  pinMode(pin, INPUT_PULLUP);
}

bool Button::clicked() {
  return digitalRead(pin) == LOW ? true : false;
}

void Button::on_click(vl::Func<void()> func) {
  auto is_click = clicked();
  if (is_click && ! this->state) {
    func();
  }

  if ((is_click && !this->state) || (!is_click && this->state)) {
    this->state = !this->state;
  }
}
