#include <WiFi.h>
#include <HTTPClient.h>

const char *ssid = "iQOO Neo9 Pro";
const char *password = "1234567890";

const int turbidityPin = 34;
const int tdsPin = 35;
const int thermistorPin = 32;
const int buzzerPin = 4;
const int greenLEDPin = 2;
const int redLEDPin = 17;
const int pHPin = 33;

const char *serverUrl = "http://192.168.161.92:5000/data";

void setup()
{
  Serial.begin(115200);
  pinMode(greenLEDPin, OUTPUT);
  pinMode(redLEDPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  delay(1000);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
  }
}

void loop()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int turbidityValue = analogRead(turbidityPin);
    int tdsValue = analogRead(tdsPin);
    int thermistorValue = analogRead(thermistorPin);
    int pHValue = analogRead(pHPin);

    float turbidityVoltage = turbidityValue * (3.3 / 4095.0);
    float turbidityNTU = -2572.2 * turbidityVoltage * turbidityVoltage + 8700.5 * turbidityVoltage - 4352.9;

    float voltageTDS = tdsValue * (3.3 / 4095.0);
    float coef = 1.0 + 0.02 * ((1.0 / (1.0 / 298.15 + (1.0 / 3950.0) * log((10000.0 * (3.3 / (thermistorValue * (3.3 / 4095.0))) - 10000.0) / 10000.0)) - 273.15) - 25.0);
    float compV = voltageTDS / coef;
    float tds = (133.42 * pow(compV, 3) - 255.86 * pow(compV, 2) + 857.39 * compV) * 0.5;

    float thermistorVoltage = thermistorValue * (3.3 / 4095.0);
    float resistance = 10000.0 * (3.3 / thermistorVoltage - 1.0);
    const float B = 3950.0;
    const float R0 = 10000.0;
    const float T0 = 298.15;
    float temperatureK = 1.0 / (1.0 / T0 + (1.0 / B) * log(resistance / R0));
    float temperatureC = temperatureK - 273.15;

    float pHVoltage = pHValue * (3.3 / 4095.0);
    const float midV = 1.65;
    const float slope = 0.05916;
    float pH = 7.0 + (pHVoltage - midV) / slope;

    Serial.print("Turbidity NTU: ");
    Serial.print(turbidityNTU);
    Serial.print(" | TDS ppm: ");
    Serial.print(tds, 1);
    Serial.print(" | Temp °C: ");
    Serial.print(temperatureC, 1);
    Serial.print(" | pH: ");
    Serial.println(pH, 2);

    bool turbiditySafe = turbidityNTU <= 5;
    bool tdsSafe = tds >= 50 && tds <= 500;
    bool pHSafe = pH >= 6.5 && pH <= 7.5;

    if (turbiditySafe && tdsSafe && pHSafe)
    {
      digitalWrite(greenLEDPin, HIGH);
      digitalWrite(redLEDPin, LOW);
      digitalWrite(buzzerPin, HIGH);
    }
    else
    {
      digitalWrite(greenLEDPin, LOW);
      digitalWrite(redLEDPin, HIGH);
      digitalWrite(buzzerPin, LOW);
      delay(2000);
      digitalWrite(buzzerPin, HIGH);
    }

    String jsonData = "{\"tds\": " + String(tds, 2) + ", \"turbidity\": " + String(turbidityNTU, 2) + ", \"ph\": " + String(pH, 2) + ", \"temperature\": " + String(temperatureC, 2) + "}";

    int httpResponseCode = http.POST(jsonData);
    http.end();
  }

  delay(10000);
}