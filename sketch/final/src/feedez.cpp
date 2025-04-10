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

void FeedEZ::setSpeed(uint8_t speed, bool notification) {
  this->data.speed = speed;
  this->display.setSpeed(speed);
  if (notification)
    Serial.println(String() + "SET_SPEED, " + speed);
}

void FeedEZ::setFeedingTimes(uint8_t count, SmallTime feedingTimes[], bool notification) {
  this->data.count_feeding = count;
  String txt = "SET_FEEDING";
  for (uint8_t i = 0; i < count; i++) {
    auto t = feedingTimes[i];
    this->data.feeding_times[i * 2] = t.hour;
    this->data.feeding_times[i * 2 + 1] = t.minute;
    txt += ", ";
    txt += t.hour;
    txt += ":";
    txt += t.minute;
  }
  if (notification)
    Serial.println(txt);
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
      if (!this->isRun) {
        this->isRun = true;
        Serial.println("STATUS_RUN, TRUE");
        Serial.println("STATUS_RUN, TRUE");
      }
      this->run();
      f();
    } else if (this->isRun) {
      this->isRun = false;
      Serial.println("STATUS_RUN, FALSE");
      Serial.println("STATUS_RUN, FALSE");
    }
  } else {
    if (this->isRun) {
      this->isRun = false;
      Serial.println("STATUS_RUN, FALSE");
      Serial.println("STATUS_RUN, FALSE");
    }
    this->stop();
  }

  if (Serial.available()) {
    auto data = Serial.readStringUntil('\n');
    data.trim();

    if (data.equals("GET_STATUS_RUN")) {
      Serial.println(String() + "STATUS_RUN, " + (this->isRun ? "TRUE" : "FALSE"));
    } else if (data.equals("GET_TIME")) {
      auto now = this->rtc.now();
      Serial.println(String() + now.hour() + ":" + now.minute());
    } else if (data.length() > 0) {
      int index = data.indexOf(',');
      auto cmd = data.substring(0, index);
      cmd.trim();
      data = data.substring(index+1);
      data.trim();
      if (cmd.equals("SET_SPEED")) {
        this->setSpeed(data.toInt(), false);
        Serial.println(this->data.speed);
      }
      if (cmd.equals("SET_DURATION")) {
        this->setDuration(data.toInt(), false);
        Serial.println(this->longTime);
      }
      if (cmd.equals("SET_FEEDING")) {
        int i = 0;
        Serial.print("FEEDING");
        while (data.length() > 0) {
          index = data.indexOf(',');
          if (index == -1) {
            Serial.print(String() + ", " + data);
            this->data.feeding_times[i] = data.toInt();
            break;
          }
          auto chunk = data.substring(0, index);
          chunk.trim();
          Serial.print(String() + ", " + chunk);
          data = data.substring(index+1);
          data.trim();
          this->data.feeding_times[i] = chunk.toInt();
          i++;
        }
        Serial.println();
        this->data.count_feeding = i;
      }
    }
  }
}

void FeedEZ::setDuration(unsigned long duration, bool notification) {
  this->longTime = duration;
  if (notification)
    Serial.println(String() + "SET_DURATION, " + duration);
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
  Serial.begin(9600);
  while (!Serial) {}
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
