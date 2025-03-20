#include <Arduino.h>
#include <stdint.h>
#include "mytime.h"
#include "WString.h"

MyTime::MyTime() {
  this->setHour(0);
  this->setMinute(0);
}

MyTime::MyTime(uint8_t hour, uint8_t minute) {
  this->setHour(hour);
  this->setMinute(minute);
}

MyTime::MyTime(uint8_t hour, uint8_t minute, uint8_t second) {
  this->setHour(hour);
  this->setMinute(minute);
  this->setSecond(second);
}

void MyTime::setHour(uint8_t hour) {
  this->hour = hour < 23 ? hour : 23;
}

void MyTime::setMinute(uint8_t minute) {
  this->minute = minute < 59 ? minute : 59;
}

void MyTime::setSecond(uint8_t second) {
  this->second = second < 59 ? second : 59;
}

String MyTime::toString() {
  return this->getHour() + F(":") + this->getMinute();
}

String MyTime::toStringWithSecond() {
  return this->toString() + F(":") + this->getSecond();
}

String MyTime::getHour() {
  return String() + (hour < 10 ? "0" : "") + hour;
}

String MyTime::getMinute() {
  return String() + (minute < 10 ? "0" : "") + minute;
}

String MyTime::getSecond() {
  return String() + (second < 10 ? "0" : "") + second;
}

MyDate::MyDate(uint8_t day, uint8_t month, uint16_t year) {
  this->setDay(day);
  this->setMonth(month);
  this->setYear(year);
}

void MyDate::setDay(uint8_t day) {
  this->day = day;
}

void MyDate::setMonth(uint8_t month) {
  this->month = month;
}

void MyDate::setYear(uint16_t year) {
  this->year = year;
}

String MyDate::toString() {
  return String() +
    (day < 10 ? "0" : "") + day
    + F("/") +
    (month < 10 ? "0" : "") + month
    + F("/") +
    (year < 10 ? "000" : year < 100 ? "00" : year < 1000 ? "0" : "") + year;
}

SmallTime MyTime::toSmall() {
  return {
    .hour = this->hour,
    .minute = this->minute,
  };
}
