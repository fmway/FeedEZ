// Just for completion
#include "Function.h"
#include "Vector.h"
#ifndef _MY_MENU_H
#define _MY_MENU_H

#include "LiquidCrystal_I2C.h"
#include "RTClib.h"
#include "mytime.h"

class TimeSelect {
public:
  typedef enum {
    SET_HOUR = 0,
    SET_MINUTE = 1,
  } State;

  TimeSelect();
  TimeSelect(uint8_t hour, uint8_t minute);
  TimeSelect(State state);
  void show(LiquidCrystal_I2C lcd, uint8_t count_feeding);
  void setState(State state);
  void decrement();
  void increment();
  void clear();
  void on_save(vl::Func<void(uint8_t, uint8_t)>);
  bool next();
private:
  State state = SET_HOUR;
  vl::Func<void(uint8_t, uint8_t)> _on_save;
public:
  uint8_t idx = 0;
private:
  MyTime time;
public:
  MyTime getTime();
};

class Menu {
public:
  typedef enum {
    FEEDING = 0,
    SPEED = 1,
  } State;

  Menu();
  Menu(State state);
  void show(LiquidCrystal_I2C lcd);
  void setState(State state);
  State getState();
  void next();
  void prev();
private:
  State state = FEEDING;
};

class SetFeeding {
public:
  typedef enum {
    SET_COUNT = 0,
    SET_TIME = 1,
  } State;

  SetFeeding();
  SetFeeding(State state);
  void show(LiquidCrystal_I2C lcd, uint8_t count_feeding);
  void setState(State state);
  void TimeIncrement();
  void TimeDecrement();
  State getState();
  bool next(uint8_t count_feeding);
  void on_save(vl::Func<void(uint8_t, uint8_t m)> func);

private:
  State state = SET_COUNT;
  vl::Func<void(uint8_t h, uint8_t m)> _on_save;
public:
  TimeSelect time;
};


class Display {
public:
  typedef enum {
    STANDBY = 0,
    MENUSET = 1,
    SET_FEEDING = 2,
    SET_SPEED = 3,
  } Page;

  typedef enum {
    MENU_BUTTON = 0,
    MINUS_BUTTON = 1,
    PLUS_BUTTON = 2,
    SELECT_BUTTON = 3,
  } ButtonHandle;

  Display();
  Display(Page page);
  Page getPage();
  void show(LiquidCrystal_I2C lcd, DateTime now, uint8_t speed);
  void setPage(Page page);
  void setPage(Menu::State state);
  void nextMenu();
  void prevMenu();
  void handle(ButtonHandle handle);
  void on_save(vl::Func<void(uint8_t, uint8_t, SmallTime *)>);
  void on_click(vl::Func<void()>);
private:
  void _save();
public:
  void setSpeed(uint8_t speed);
  SetFeeding::State getCurrentFeeding();
  uint8_t getCountFeeding();
  uint8_t getSpeed();

private:
  uint8_t count_feeding = 1;
  uint8_t speed = 3;
  SmallTime _initial[24];
  Page page;
  Menu menu;
  SetFeeding FeedingSet;
  Vector<SmallTime> feedingTimes = _initial;
  vl::Func<void(uint8_t, uint8_t, SmallTime *)> _on_save;
  vl::Func<void()> _click;
};

#endif // !_MY_MENU_H
