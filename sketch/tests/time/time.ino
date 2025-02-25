#include "RTClib.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

RTC_DS3231 rtc;
LiquidCrystal_I2C lcd(0x27, 16, 2);

char daysOfTheWeek[7][12] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
String hour, minute, second;

void setup() {
  // put your setup code here, to run once:
  rtc.begin();
  // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  lcd.init();
  lcd.init();
  lcd.backlight();
}

String toTimeString(int x) {
  if (x < 10) {
    return "0" + String() + x;
  } else {
    return String() + x;
  }
}

void loop() {
  // put your main code here, to run repeatedly:
  DateTime now = rtc.now();
  hour = toTimeString(now.hour());
  minute = toTimeString(now.minute());
  second = toTimeString(now.second());
  lcd.setCursor(0,0);
  lcd.print(hour + ":" + minute + ":" + second);
  delay(1000);
  lcd.setCursor(0,1);
  lcd.print("Don't Touch!");
}
