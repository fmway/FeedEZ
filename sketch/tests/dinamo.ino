#include <L298NX2.h>

L298NX2 motor(2, 3, 4, 5);

void setup() {
  motor.stop();
  motor.setSpeed(255);
}

void loop() {
  motor.forward();
  // delay(2000);
  // motor.backward();
  // delay(2000);
}