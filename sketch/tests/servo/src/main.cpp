#include "main.h"
#include "Arduino.h"
#include <Servo.h>

Servo myservo, fuckingservo;  // create servo object to control a servo

void setup() {
  myservo.attach(9);  // attaches the servo on pin 9 to the servo object
  myservo.write(25);
  fuckingservo.attach(10);
  fuckingservo.write(25);
}

void loop() {
  myservo.write(70);
  fuckingservo.write(70);
  delay(150);
  myservo.write(25);
  fuckingservo.write(25);
  delay(2000);
}
