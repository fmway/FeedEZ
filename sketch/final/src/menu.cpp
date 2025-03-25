#include "menu.h"
#include "LiquidCrystal_I2C.h"
#include "mytime.h"
#include <stdint.h>

Display::Display() {
  this->setPage(STANDBY);
  this->FeedingSet.on_save([this] (uint8_t hour, uint8_t minute) {
    this->feedingTimes.push_back({ .hour = hour, .minute = minute, });
  });
}

Display::Display(Display::Page page) {
  this->setPage(page);
}

void Display::setPage(Display::Page page) {
  this->page = page;
  if (this->page == MENUSET) {
    this->menu.setState(Menu::FEEDING);
  }
}

void Display::setPage(Menu::State state) {
  if (state == Menu::FEEDING)
    this->setPage(SET_FEEDING);
  else
    this->setPage(SET_SPEED);
}

Display::Page Display::getPage() {
  return this->page;
}

void Display::show(LiquidCrystal_I2C lcd, DateTime now, uint8_t speed, uint8_t hour, uint8_t minute) {
  switch (this->page) {
  case STANDBY:
    lcd.setCursor(0, 0);
    // lcd.print(MyTime(now.hour(), now.minute(), now.second()).toStringWithSecond() + F("  "));
    lcd.print(MyTime(hour, minute).toString() + F("     "));
    lcd.setCursor(0, 1);
    lcd.print(MyDate(now.day(), now.month(), now.year()).toString());
    lcd.setCursor(10, 0);
    lcd.print(F("|SPEED"));
    lcd.setCursor(10, 1);
    lcd.print(String() + F("| x") + speed + F("  "));
    break;
  case MENUSET:
    this->menu.show(lcd);
    break;
  case SET_FEEDING:
    this->FeedingSet.show(lcd, count_feeding);
    break;
  case SET_SPEED:
    lcd.setCursor(0, 0);
    lcd.print(F("  Speed Level   "));
    lcd.setCursor(0, 1);
    lcd.print(String() + F("      <") + this->speed + F(">       "));
    break;
  }
}

void Display::nextMenu() {
  this->menu.next();
}

void Display::prevMenu() {
  this->menu.prev();
}

void Display::on_save(vl::Func<void(uint8_t, uint8_t, SmallTime *)> f) {
  this->_on_save = f;
}

void SetFeeding::on_save(vl::Func<void(uint8_t, uint8_t)> f) {
  this->_on_save = f;
}

SetFeeding::State Display::getCurrentFeeding() {
  return this->FeedingSet.getState();
}

bool SetFeeding::next(uint8_t count_feeding) {
  if (this->state == SET_COUNT) {
    this->setState(SET_TIME);
    this->time.idx++;
  } else if (this->time.next()) {
    this->time.idx++;
    return this->time.idx <= count_feeding;
  }
  return true;
}

void SetFeeding::TimeIncrement() {
  this->time.increment();
}

void SetFeeding::TimeDecrement() {
  this->time.decrement();
}

uint8_t Display::getCountFeeding() {
  return this->count_feeding;
}

uint8_t Display::getSpeed() {
  return this->speed;
}

void Display::setSpeed(uint8_t speed) {
  if (speed >= 1 && speed <= 5)
    this->speed = speed;
}

Menu::Menu() {}

Menu::Menu(Menu::State state) {
  this->setState(state);
}

void Menu::next() {
  this->setState(this->state ? FEEDING : SPEED);
}

void Menu::prev() {
  this->setState(this->state ? FEEDING : SPEED);
}

void Menu::setState(Menu::State state) {
  this->state = state;
}

Menu::State Menu::getState() {
  return this->state;
}

void Menu::show(LiquidCrystal_I2C lcd) {
  if (this->state == FEEDING) {
    lcd.setCursor(0, 0);
    lcd.print(F("> Set Feeding   "));
    lcd.setCursor(0, 1);
    lcd.print(F("  Set Speed     "));
  } else {
    lcd.setCursor(0, 0);
    lcd.print(F("  Set Feeding   "));
    lcd.setCursor(0, 1);
    lcd.print(F("> Set Speed     "));
  }
}

SetFeeding::SetFeeding() {
  this->setState(SET_COUNT);
  this->time.on_save([this](uint8_t h, uint8_t m) {
    this->_on_save(h, m);
  });
}

void TimeSelect::on_save(vl::Func<void(uint8_t, uint8_t)> f) {
  this->_on_save = f;
}

SetFeeding::SetFeeding(SetFeeding::State state) {
  this->setState(state);
}


void SetFeeding::setState(SetFeeding::State state) {
  this->state = state;
  if (this->state == SET_TIME) {
    this->time.clear();
  }
}

SetFeeding::State SetFeeding::getState() {
  return this->state;
}

void SetFeeding::show(LiquidCrystal_I2C lcd, uint8_t count_feeding) {
  if (this->state == SET_COUNT) {
    lcd.setCursor(0, 0);
    lcd.print(F("  BERAPA KALI?  "));
    lcd.setCursor(0, 1);
    lcd.print(String() + F("      <") + count_feeding + F(">       "));
  } else {
    time.show(lcd, count_feeding);
  }
}

TimeSelect::TimeSelect() {
  this->time = MyTime();
}

TimeSelect::TimeSelect(uint8_t hour, uint8_t minute) {
  this->time = MyTime(hour, minute);
}

TimeSelect::TimeSelect(TimeSelect::State state) {
  this->setState(state);
}

void TimeSelect::setState(TimeSelect::State state) {
  this->state = state;
}

void TimeSelect::decrement() {
  if (this->state == SET_HOUR)
    time.setHour(time.hour == 0 ? 23 : time.hour - 1);
  else
    time.setMinute(time.minute == 0 ? 59 : time.minute - 1);
}

MyTime TimeSelect::getTime() {
  return this->time;
}

void TimeSelect::increment() {
  if (this->state == SET_HOUR)
    time.setHour(time.hour + 1);
  else
    time.setMinute(time.minute + 1);
}

void TimeSelect::show(LiquidCrystal_I2C lcd, uint8_t count_feeding) {
  auto hour = this->time.getHour();
  auto minute = this->time.getMinute();
  lcd.setCursor(0, 0);
  lcd.print(String() + F("WAKTU KE-") + this->idx + F("      "));
  lcd.setCursor(0, 1);
  if (this->state == SET_HOUR) {
    lcd.print(String(F("<")) + hour + F(">:") + minute + F("          "));
  } else {
    lcd.print(hour + F(":<") + minute + F(">") + F("          "));
  }
}

void TimeSelect::clear() {
  this->time.setHour(0);
  this->time.setMinute(0);
}

bool TimeSelect::next() {
  if (this->state == SET_HOUR) {
    this->state = SET_MINUTE;
    return false;
  } else {
    this->state = SET_HOUR;
    this->_on_save(this->time.hour, this->time.minute);
    this->clear();
    return true;
  }
}

void Display::handle(Display::ButtonHandle handle) {
  switch (handle) {
    case MENU_BUTTON:
      if (page != Display::STANDBY) {
        this->setPage(Display::STANDBY);
        this->feedingTimes.clear();
        this->FeedingSet.setState(SetFeeding::SET_COUNT);
        this->FeedingSet.time.setState(TimeSelect::SET_HOUR);
        this->FeedingSet.time.idx = 0;
      } else {
        this->setPage(Display::MENUSET);
      }
      break;
    case MINUS_BUTTON:
      if (page == Display::MENUSET) {
        this->prevMenu();
      };
      if (page == Display::SET_FEEDING) {
        auto state = this->FeedingSet.getState();
        if (state == SetFeeding::SET_COUNT) {
          this->count_feeding = count_feeding > 1 ? count_feeding - 1 : 24;
        }
        if (state == SetFeeding::SET_TIME) {
          this->FeedingSet.TimeDecrement();
        }
      }
      if (page == Display::SET_SPEED) {
        this->speed = this->speed > 1 ? speed - 1 : 5;
      }
      break;
    case PLUS_BUTTON:
      if (page == Display::MENUSET) {
        this->nextMenu();
      };
      if (page == Display::SET_FEEDING) {
        auto state = this->FeedingSet.getState();
        if (state == SetFeeding::SET_COUNT) {
          this->count_feeding = this->count_feeding < 24 ? this->count_feeding + 1 : 1;
        }
        if (state == SetFeeding::SET_TIME) {
          this->FeedingSet.TimeIncrement();
        }
      }
      if (page == Display::SET_SPEED) {
        this->speed = this->speed < 5 ? this->speed + 1 : 1;
      }
      break;
    case SELECT_BUTTON:
      if (page == Display::STANDBY) {
        this->_click();
      } else if (page == Display::MENUSET) {
        this->setPage(this->menu.getState());
      } else if (page == Display::SET_FEEDING) {
        if (this->FeedingSet.getState() == SetFeeding::SET_COUNT) {
          this->FeedingSet.time.setState(TimeSelect::SET_HOUR);
          this->FeedingSet.time.idx = 0;
        }
        if (!this->FeedingSet.next(this->count_feeding)) {
          this->_save();
          this->feedingTimes.clear();
          this->setPage(STANDBY);
          this->FeedingSet.setState(SetFeeding::SET_COUNT);
        }
      } else if (page == Display::SET_SPEED)  {
        this->_save();
        this->setPage(STANDBY);
      }
      break;
  }
}

void Display::_save() {
  /*SmallTime data[feedingTimes.size()];*/
  /*for (uint8_t i; i < feedingTimes.size(); i++)*/
  /*  data[i] = feedingTimes.at(i);*/
  this->_on_save(speed, feedingTimes.size(), feedingTimes.data());
}

void Display::on_click(vl::Func<void()> click) {
  this->_click = click;
}