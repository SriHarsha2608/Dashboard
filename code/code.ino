#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "iQOO Neo9 Pro";
const char* password = "1234567890";

const int turbidityPin = 34;
const int tdsPin = 35;
const int thermistorPin = 32;
const int buzzerPin = 4;
const int greenLEDPin = 2;
const int redLEDPin = 17;
const int pHPin = 33;

// Replace with your server's IP and port
const char* serverUrl = "http://192.168.161.92:5000/data";

void setup() {
  Serial.begin(115200);
  pinMode(greenLEDPin, OUTPUT);
  pinMode(redLEDPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  delay(1000);

  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("\nConnected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Target Server URL: ");
  Serial.println(serverUrl);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int turbidityValue = analogRead(turbidityPin);
    int tdsValue = analogRead(tdsPin);
    int thermistorValue = analogRead(thermistorPin);
    int pHValue = analogRead(pHPin);

    float turbidityVoltage = turbidityValue * (3.3 / 4095.0);
    float turbidityNTU = 50 * turbidityVoltage;

    float tds = tdsValue * 2.5 + 50;

    float thermistorVoltage = thermistorValue * (3.3 / 4095.0);
    float resistance = (3.3 * 10000.0 / thermistorVoltage) - 10000.0;
    float temperatureK = 1.0 / (1.0 / 298.15 + (1.0 / 3950.0) * log(resistance / 10000.0)) + 30;
    float temperatureC = temperatureK - 273.15;

    float pHVoltage = pHValue * (3.3 / 4095.0);
    float pH = 3.5 * pHVoltage;

    Serial.print("Turbidity ADC: ");
    Serial.print(turbidityValue);
    Serial.print(" | Voltage: ");
    Serial.print(turbidityVoltage, 3);
    Serial.print(" V | NTU: ");
    Serial.print(turbidityNTU);
    Serial.print(" || TDS ADC: ");
    Serial.print(tdsValue);
    Serial.print(" | TDS: ");
    Serial.print(tds, 1);
    Serial.print(" ppm");
    Serial.print(" || Temp: ");
    Serial.print(temperatureC, 1);
    Serial.print(" °C");
    Serial.print(" || pH ADC: ");
    Serial.print(pHValue);
    Serial.print(" | pH: ");
    Serial.println(pH, 2);

    bool turbiditySafe = turbidityNTU <= 5;
    bool tdsSafe = tds >= 50 && tds <= 150;
    bool pHSafe = pH >= 6.5 && pH <= 7.5;

    if (turbiditySafe && tdsSafe && pHSafe) {
      digitalWrite(greenLEDPin, HIGH);
      digitalWrite(redLEDPin, LOW);
      digitalWrite(buzzerPin, HIGH);
      Serial.println("Water is safe to drink");
    } else {
      digitalWrite(greenLEDPin, LOW);
      digitalWrite(redLEDPin, HIGH);
      Serial.println("Throw this water away immediately");
      digitalWrite(buzzerPin, LOW);
      delay(2000);
      digitalWrite(buzzerPin, HIGH);
    }

    
    String jsonData = "{\"tds\": " + String(tds, 2) + ", \"turbidity\": " + String(turbidityNTU, 2) + ", \"ph\": " + String(pH, 2) + ", \"temperature\": " + String(temperatureC, 2) + "}";

    Serial.print("Sending: ");
    Serial.println(jsonData);

    
    int httpResponseCode = http.POST(jsonData);
    

    http.end();
  } else {
    Serial.println("WiFi disconnected");
  }

  delay(10000); 
}