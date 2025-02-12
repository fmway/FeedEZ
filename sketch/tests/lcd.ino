#include <DS3231.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.init();
  lcd.backlight();

}

void loop() {
  lcd.setCursor(0,0);
  lcd.print("Feeder Otomatis ");
  lcd.setCursor(0,0);
  lcd.print("eeder Otomatis F");
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("eder Otomatis Fe");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("der Otomatis Fee");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("er Otomatis Feed");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("r Otomatis Feede");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print(" Otomatis Feeder");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("Otomatis Feeder ");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("tomatis Feeder O");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("omatis Feeder Ot");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("matis Feeder Oto");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("atis Feeder Otom");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("tis Feeder Otoma");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("is Feeder Otomat");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print("s Feeder Otomati");  
  delay(200);
  lcd.setCursor(0,0);
  lcd.print(" Feeder Otomatis");  
  delay(200);
  lcd.setCursor(5,1);
  lcd.print("BBPPMPV");  
}
