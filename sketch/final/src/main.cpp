#include "main.h"
#include "Arduino.h"

Event event;
Button menu, plus, minus, select;
FeedEZ feed;
unsigned long time_alarm = -1;

void setup() {
  menu.init(4);
  plus.init(2);
  minus.init(3);
  select.init(1);
  feed.init(8); 
}

void loop() {
  Display::Page page = feed.display.getPage();

  event.on_interval(1000, [&page] () {
    if (page == Display::STANDBY) {
      feed.showDisplay();
    }
  });

  feed.on_alarm([] {
    /*tone(6, 300);*/
    /*delay(3000);*/
    /*noTone(6);*/
  });


  menu.on_click([] {
    feed.display.handle(Display::MENU_BUTTON);
    feed.showDisplay();
  });

  minus.on_click([] {
    feed.display.handle(Display::MINUS_BUTTON);
    feed.showDisplay();
  });

  plus.on_click([] {
    feed.display.handle(Display::PLUS_BUTTON);
    feed.showDisplay();
  });

  select.on_click([] {
    feed.display.handle(Display::SELECT_BUTTON);
    feed.showDisplay();
  });

}
