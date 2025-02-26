#include "feedez.h"
#include "mytime.h"
#include "storage.h"
#include <stdint.h>

void din(uint8_t speed) {
  analogWrite(7, speed);
  digitalWrite(5, LOW);
  digitalWrite(6, HIGH);
}

FeedEZ::FeedEZ() {
  this->load();
  this->display.on_save([this] (uint8_t speed, uint8_t count, SmallTime * feedingTimes) {
    this->setSpeed(speed);
    this->setFeedingTimes(count, feedingTimes);
    this->save();
  });
}

/*FeedEZ::FeedEZ(uint8_t speed) {*/
/*  this->setSpeed(speed);*/
/*}*/
/**/
/*FeedEZ::FeedEZ(uint8_t count_feeding, const MyTime feedingTimes[]) {*/
/*  this->setFeedingTimes(count_feeding, feedingTimes);*/
/*}*/
/**/
/*FeedEZ::FeedEZ(uint8_t speed, uint8_t count_feeding, const MyTime feedingTimes[]) {*/
/*  *this = FeedEZ(speed);*/
/*  this->setFeedingTimes(count_feeding, feedingTimes);*/
/*}*/

void FeedEZ::setSpeed(uint8_t speed) {
  this->data.speed = speed;
  this->display.setSpeed(speed);
}

void FeedEZ::setFeedingTimes(uint8_t count, SmallTime feedingTimes[]) {
  this->data.count_feeding = count;
  for (uint8_t i = 0; i < count; i++) {
    this->data.feeding_times[i * 2] = feedingTimes[i].hour;
    this->data.feeding_times[i * 2 + 1] = feedingTimes[i].minute;
  }
}

void FeedEZ::on_alarm(vl::Func<void()> f) {
  auto now = rtc.now();
  auto is_alarm = false;

  for (uint8_t i = 0; i < this->data.count_feeding; ++i) {
    if (now.hour() == this->data.feeding_times[i * 2] && now.minute() == this->data.feeding_times[i * 2 + 1]) {
      is_alarm = true;
      break;
    }
  }

  if (is_alarm) {
    f();
    din(255);
    for (uint8_t i = 0; i < 10; i++) {
      servo.write(45);
      delay(7500);
      servo.write(0);
      delay(2500);
    }
    din(0);
  }
}

void FeedEZ::init(uint8_t servo_pin) {
  servo.attach(servo_pin);
  servo.write(0);
  rtc.begin();
  lcd.init();
  lcd.init();
  lcd.backlight();
  pinMode(7, OUTPUT);
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  din(0);
}

void FeedEZ::showDisplay() {
  this->display.show(lcd, rtc.now(), this->data.speed);
}

void FeedEZ::save() {
  // save speed
  Storage::write(0, this->data.speed);

  // save feeding times
  Storage::write(1, this->data.count_feeding);
  for (uint8_t i = 0; i < this->data.count_feeding; i++) {
    Storage::write(i * 1 + 2, this->data.feeding_times[i * 2]);
    Storage::write(i * 1 + 3, this->data.feeding_times[i * 2 + 1]);
  }
}

void FeedEZ::load() {
  uint8_t s;
  if (s = Storage::read(0), s != 255) {
    this->setSpeed(s);
    this->data.count_feeding = Storage::read(1);
    for (uint8_t i = 0; i < this->data.count_feeding; i++) {
      this->data.feeding_times[i * 2] = Storage::read(i * 2 + 2);
      this->data.feeding_times[i * 2 + 1] = Storage::read(i * 2 + 3);
    }
  }
}
