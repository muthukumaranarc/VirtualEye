#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

// WiFi credentials
const char* ssid = "OPPO A55 (Muthu)";
const char* password = "Muthu1208";

// AI Thinker Camera Pins
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

WebServer server(80);


// STREAM HANDLER
void handle_jpg_stream() {

  WiFiClient client = server.client();
  // 🔥 CRITICAL FIX: Disable Nagle's algorithm to send packets immediately.
  // This removes the 200-500ms lag per frame.
  client.setNoDelay(true);

  String response =
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n\r\n";

  client.print(response);

  while (client.connected()) {

    camera_fb_t * fb = esp_camera_fb_get();

    if (!fb) {
      Serial.println("Capture failed");
      continue;
    }

    client.printf("--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n", fb->len);

    client.write(fb->buf, fb->len);

    client.print("\r\n");

    esp_camera_fb_return(fb);

    // Yield to the ESP32 WiFi task, keeping latency as low as possible.
    delay(1);
  }
}


// START SERVER
void startCameraServer() {

  server.on("/stream", HTTP_GET, handle_jpg_stream);

  server.begin();
}


// SETUP
void setup() {

  Serial.begin(115200);

  camera_config_t config;

  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;

  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;

  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;

  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;

  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;

  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // 🔥 MOST IMPORTANT SETTINGS FOR SPEED AND QUALITY
  config.frame_size = FRAMESIZE_QVGA; // 320x240 (GOOD BALANCE)
  config.jpeg_quality = 15; // lower number = higher quality (10-63 range)
  config.fb_count = 2; // double buffer = smoother


  if (esp_camera_init(&config) != ESP_OK) {

    Serial.println("Camera init failed");
    return;
  }


  WiFi.begin(ssid, password);

  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi Connected");

  Serial.print("Stream URL: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/stream");

  startCameraServer();
}


void loop() {

  server.handleClient();

}