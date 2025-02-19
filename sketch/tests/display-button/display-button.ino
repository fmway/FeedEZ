#include <DS3231.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
String daysOfTheWeek[7] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
int i = 0, buttonPrev, buttonNext;
bool statePrev = false, stateNext = false;

void prin() {
  lcd.setCursor(0, 0);
  lcd.print("                ");
  lcd.setCursor(0, 0);
  lcd.print(daysOfTheWeek[i]);
}

void setup() {
  lcd.init();
  lcd.init();
  lcd.backlight();
  pinMode(1, INPUT_PULLUP);
  pinMode(2, INPUT_PULLUP);
  prin();
}

void loop() {
  buttonPrev = digitalRead(1);
  buttonNext = digitalRead(2);
  if (buttonNext == LOW && !stateNext) {
    if (i == 6) i = 0;
    else i++;
    prin();
    stateNext = !stateNext;
    delay(100);
  }

  if (buttonPrev == HIGH && statePrev) {
    statePrev = !statePrev;
  }

  if (buttonPrev == LOW && !statePrev) {
    if (i == 0) i = 6;
    else i--;
    prin();
    statePrev = !statePrev;
    delay(100);
  }

  if (buttonNext == HIGH && stateNext) {
    stateNext = !stateNext;
  }
}
