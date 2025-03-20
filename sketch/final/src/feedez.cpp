#include "feedez.h"
#include "mytime.h"
#include "storage.h"
#include <stdint.h>

void din(uint8_t speed) {
  analogWrite(5, speed);
  digitalWrite(6, LOW);
  digitalWrite(7, HIGH);
}

FeedEZ::FeedEZ() {
  this->load();
  this->display.on_save([this] (uint8_t speed, uint8_t count, SmallTime * feedingTimes) {
    this->setSpeed(speed);
    if (count > 0)
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
  int alarm_stop = -1;
  int time = now.hour() * 3600 + now.minute() * 60 + now.second();

  for (uint8_t i = 0; i < this->data.count_feeding; ++i) {
    int start = this->data.feeding_times[i * 2] * 3600 + this->data.feeding_times[i * 2 + 1] * 60;
    int stop = start + this->longTime;
    if (time >= start && time < stop) {
      alarm_stop = stop;
      break;
    }
  }

  if (alarm_stop > -1) {
    if (time < alarm_stop) {
      this->run();
      f();
    }
  } else {
    this->stop();
  }
}

void FeedEZ::run() {
  this->showDisplay();
  din(this->el_kecepatan[this->data.speed -1]);
  if (this->statePrev == 0 || millis() - this->statePrev >= this->intervalAlarm[int(this->isOpen)]) {
    this->statePrev = millis();
    this->isOpen = !this->isOpen;
    servo.write(this->isOpen ? 45 : 0);
  }
}

void FeedEZ::stop() {
  this->isOpen = false;
  this->statePrev = 0;
  servo.write(0);
  din(0);
}

void FeedEZ::init(uint8_t servo_pin) {
  servo.attach(servo_pin);
  servo.write(0);
  rtc.begin();
  lcd.init();
  lcd.init();
  lcd.backlight();
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
  din(0);
}

void FeedEZ::showDisplay() {
  this->display.show(lcd, rtc.now(), this->el_kecepatan[this->data.speed - 1]);
}

void FeedEZ::save() {
  // save speed
  Storage::write(0, this->data.speed);

  // save feeding times
  Storage::write(1, this->data.count_feeding);
  for (uint8_t i = 0; i < this->data.count_feeding; i++) {
    Storage::write(i * 2 + 2, this->data.feeding_times[i * 2]);
    Storage::write(i * 2 + 3, this->data.feeding_times[i * 2 + 1]);
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
