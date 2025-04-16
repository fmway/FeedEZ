#include "Function.h"
#include "button.h"
#ifndef _FEED_EZ_H
#define _FEED_EZ_H

#include "RTClib.h"
#include "menu.h"
#include "mytime.h"
#include "LiquidCrystal_I2C.h"
#include "dinamo.h"
#include "Servo.h"

class FeedEZ {
public:
  FeedEZ();
  /*FeedEZ(uint8_t speed);*/
  /*FeedEZ(uint8_t count_feeding, const MyTime feedingTimes[]);*/
  /*FeedEZ(uint8_t speed, uint8_t count_feeding, const MyTime feedingTimes[]);*/
  void init(uint8_t servo_pin);
  void setSpeed(uint8_t speed, bool notification = true);
  void setDuration(unsigned long duration, bool notification = true);
  void setFeedingTimes(uint8_t count, SmallTime feedingTimes[], bool notification = true);
  void showDisplay();
  void save();
  void load();
  void on_alarm(vl::Func<void()>);
  void run();
  void stop();
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
  unsigned long intervalAlarm[2] = { 3000, 80 };
  unsigned long statePrev = 0;
  bool isOpen = false;
  // int alarm_stop = -1;
  bool isRun = false;
  int el_kecepatan[5] = { 120, 150, 190, 220, 255 };
  unsigned long longTime = 6 * 60 + 30; // 6 minute 30 second
};

#endif // !_FEED_EZ_H
