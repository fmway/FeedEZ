#ifndef _MY_TIME_H
#define _MY_TIME_H

#include <stdint.h>
#include <WString.h>


typedef struct {
  uint8_t hour;
  uint8_t minute;
} SmallTime;

class MyTime {
public:
  MyTime();
  MyTime(uint8_t hour, uint8_t minute);
  MyTime(uint8_t hour, uint8_t minute, uint8_t second);
  void setHour(uint8_t hour);
  void setMinute(uint8_t minute);
  void setSecond(uint8_t second);
  String getHour();
  String getMinute();
  String getSecond();
  String toString();
  String toStringWithSecond();
  SmallTime toSmall();
  uint8_t hour = 0;
  uint8_t minute = 0;
  uint8_t second = 0;
};

class MyDate {
public:
  MyDate(uint8_t day, uint8_t month, uint16_t year);
  void setDay(uint8_t day);
  void setMonth(uint8_t month);
  void setYear(uint16_t year);
  String toString();
private:
  uint8_t day;
  uint8_t month;
  uint16_t year;
};

#endif // !MY_TIME_H
