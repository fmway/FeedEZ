// Just for completion
#include "Function.h"
#include "button.h"
#ifndef ARDUINO
#define ARDUINO 1000
#define ARDUINO_ARCH_AVR
#endif // !ARDUINO

#ifndef _FEED_EZ_H
#define _FEED_EZ_H

#include "RTClib.h"
#include "menu.h"
#include "mytime.h"
#include "LiquidCrystal_I2C.h"
#include "dinamo.h"
#include "Servo.h"
#include<Arduino.h>
#include <stdint.h>

class FeedEZ {
public:
  FeedEZ();
  /*FeedEZ(uint8_t speed);*/
  /*FeedEZ(uint8_t count_feeding, const MyTime feedingTimes[]);*/
  /*FeedEZ(uint8_t speed, uint8_t count_feeding, const MyTime feedingTimes[]);*/
  void init(uint8_t servo_pin);
  void setSpeed(uint8_t speed);
  void setFeedingTimes(uint8_t count, SmallTime feedingTimes[]);
  void showDisplay();
  void save();
  void load();
  void on_alarm(vl::Func<void()>);
private:
  Dinamo dinamo;
public:
  Display display = Display();
private:
  struct {
    uint8_t speed = 3;
    uint8_t count_feeding = 0;
    uint8_t feeding_times[48];
  } data;
  Servo servo;
  RTC_DS3231 rtc;
  LiquidCrystal_I2C lcd = LiquidCrystal_I2C(0x27, 16, 2);
};

#endif // !_FEED_EZ_H
