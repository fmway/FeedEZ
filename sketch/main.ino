#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>
#include <Servo.h>

Servo myservo;

typedef enum Menu {
  STANDBY = 0,
  MENUSET = 1,
  SET_FEEDING = 2,
  SET_SPEED = 3,
} Menu;

typedef enum PageMenu {
  FEEDING = 0,
  SPEED = 1,
} PageMenu;

typedef enum PageFeeding {
  SET_COUNT_FEEDING = 0,
  SET_TIME = 1,
} PageFeeding;

typedef enum TimeSelect {
  SET_HOUR = 0,
  SET_MINUTE = 1,
} TimeSelect;

LiquidCrystal_I2C lcd(0x27, 16, 2);
RTC_DS3231 rtc;
int buttonMenu, buttonLeft, buttonRight, buttonSelect;
int speed = 3, count_feeding = 1;
int i = 0, j = 0, k = -1, l = 0, m = 1;
int jam = 0, menit = 0, hour = 0, minute = 0;
unsigned long oldTime;
bool stateSelect = false, stateLeft = false, stateRight = false, stateMenu = false;
int servoPin = 9;
bool alarm = false;

//.......................TAMPILAN MENU...........................//
void showStandby(DateTime now) {
  // char daysOfTheWeek[7][7] = {"Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"};
  // lcdPrint(0, 0, daysOfTheWeek[now.dayOfTheWeek()]);
  lcdPrint(0, 0, String() + now.hour() + F(":") + now.minute() + F(":") + now.second() + F("   "));
  lcdPrint(0, 1, String() + now.day() + F("/") + now.month() + F("/") + now.year() + F(" "));
  lcdPrint(10,0, F("|SPEED"));
  lcdPrint(10,1, String() + F("| x") + speed + F("  "));
}

void showMenuSet(){
  if (j == FEEDING) {
    lcdPrint(0,0, F("> Set Feeding   "));
    lcdPrint(0,1, F("  Set Speed     "));
  } else {
    lcdPrint(0,0, F("  Set Feeding   "));
    lcdPrint(0,1, F("> Set Speed     "));
  }
}

void showSetFeeding() {
  if (k == SET_COUNT_FEEDING) {
    lcdPrint(0,0, F("  BERAPA KALI?  "));
    lcdPrint(0,1, String() + F("      <") + count_feeding + F(">       "));
  } else {
    lcdPrint(0,0, String() + F("WAKTU KE-") + m + F("      "));
    if (l == SET_HOUR) {
      lcdPrint(0,1, String() + F("<") + jam + F(">:") + menit + F("          "));
    } else {
      lcdPrint(0,1, String() + jam + F(":<") + menit + F(">") + F("          "));
    }
  }
}

void showSetSpeed(){
  lcdPrint(0,0, F("  Speed Level   "));
  lcdPrint(0,1, String() + F("      <") + speed + F(">       "));
}

void lcdPrint(int x, int y, const String str) {
  lcd.setCursor(x, y);
  lcd.print(str);
}

void setup() {
  rtc.begin();
  lcd.init();
  lcd.init();
  lcd.backlight();
  pinMode(1, INPUT_PULLUP);
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(4, INPUT_PULLUP);
  myservo.attach(servoPin);
  myservo.write(0);
  oldTime = millis();
}

void showMenu(DateTime now) {
  // clear();
  // lcd.clear();
  if (i == STANDBY) {
    showStandby(now);
  }
  if (i == MENUSET) {
    showMenuSet();
  }
  if (i == SET_FEEDING) {
    showSetFeeding();
  }
  if (i == SET_SPEED) {
    showSetSpeed();
  }
}

void loop() {
  DateTime now = rtc.now();
  buttonMenu = digitalRead(1);
  buttonLeft = digitalRead(2);
  buttonRight = digitalRead(3);
  buttonSelect = digitalRead(4);
  if (hour == now.hour() && minute == now.minute() && !alarm) {
    for (int pos = 0; pos <= 180; pos += 5) {
      myservo.write(pos);
      delay(10);
    }
    alarm = !alarm;
  }
  if (i == STANDBY && millis() - oldTime >= 1000) {
    showMenu(now);
    oldTime = millis();
  }
  if (buttonMenu == LOW && !stateMenu) {
    if (i != STANDBY) {
      i = STANDBY;
    } else {
      i = MENUSET;
      j = 0;
    }
    showMenu(now);
    stateMenu = !stateMenu;
    delay(100);
  }

  if (buttonMenu == HIGH && stateMenu) {
    stateMenu = !stateMenu;
  }

  if (buttonLeft == LOW && !stateLeft) {
    if (i == MENUSET) {
      if (j == FEEDING) {
        j = SPEED;
      } else {
        j = FEEDING;
      };
    }
    if (i == SET_FEEDING && k == SET_COUNT_FEEDING && count_feeding > 1) {
      count_feeding--;
    }

    if (i == SET_FEEDING && k == SET_TIME) {
      if (l == SET_HOUR && jam > 0) {
        jam--;
      }
      if (l == SET_MINUTE && menit > 0) {
        menit--;
      }
    }

    if (i == SET_SPEED && speed > 1)
      speed--;
    showMenu(now);
    stateLeft = !stateLeft;
    delay(100);
  }

  if (buttonLeft == HIGH && stateLeft) {
    stateLeft = !stateLeft;
  }

  if (buttonRight == LOW && !stateRight) {
    if (i == MENUSET) {
      if (j == FEEDING) {
        j = SPEED;
      } else {
        j = FEEDING;
      };
    }
    if (i == SET_FEEDING && k == SET_COUNT_FEEDING && count_feeding < 10) {
      count_feeding++;
    }
    if (i == SET_FEEDING && k == SET_TIME) {
      if (l == SET_HOUR && jam < 24) {
        jam++;
      }
      if (l == SET_MINUTE && menit < 60) {
        menit++;
      }
    }
    if (i == SET_SPEED && speed < 5)
      speed++;
    showMenu(now);
    stateRight = !stateRight;
    delay(100);
  }

  if (buttonRight == HIGH && stateRight) {
    stateRight = !stateRight;
  }

  if (buttonSelect == LOW && !stateSelect) {
    if (i == MENUSET) {
      if (j == FEEDING) {
        i = SET_FEEDING;
        k = SET_COUNT_FEEDING;
        count_feeding = 1;
      } else {
        i = SET_SPEED;
      };
    } else if (i == SET_FEEDING) {
      if (k == SET_COUNT_FEEDING) {
        k = SET_TIME;
        menit = 0;
        jam = 0;
        l = SET_HOUR;
      } else {
        if (l == SET_MINUTE) {
          if (m < count_feeding) {
            m++;
          } else {
            i = STANDBY;
            m = 1;
          }
          minute = menit;
          hour = jam;
          alarm = false;
          menit = 0;
          jam = 0;
          l = SET_HOUR;
        } else {
          l = SET_MINUTE;
        }
      }
    } else if (i == SET_SPEED) {
      i = STANDBY;
    }
    showMenu(now);
    stateSelect = !stateSelect;
    delay(100);
  }

  if (buttonSelect == HIGH && stateSelect) {
    stateSelect = !stateSelect;
  }

}