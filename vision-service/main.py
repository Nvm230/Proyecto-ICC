import time
import json
import random
import paho.mqtt.client as mqtt

broker_address = "mqtt-broker"
topic = "condominio/vision/events"

print("🚀 Vision Service Mock Started")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, "vision-service-mock")
connected = False

while not connected:
    try:
        print(f"Connecting to MQTT Broker at {broker_address}...")
        client.connect(broker_address, 1883, 60)
        client.loop_start()
        connected = True
        print("Connected!")
    except Exception as e:
        print(f"Connection failed: {e}. Retrying in 5s...")
        time.sleep(5)

cameras = ["CAM_01_MAIN_GATE", "CAM_02_POOL", "CAM_03_PARKING"]
violation_types = ["PET_RESTRICTED_AREA", "UNAUTHORIZED_VEHICLE", "LOITERING", "UNAUTHORIZED_ACCESS"]
severities = ["LOW", "MEDIUM", "HIGH"]

while True:
    time.sleep(random.randint(15, 45)) # Send event every 15 to 45 seconds
    event = {
        "camera_id": random.choice(cameras),
        "type": random.choice(violation_types),
        "severity": random.choice(severities),
        "timestamp": int(time.time()),
        "image_mock": "https://example.com/mock-evidence.jpg"
    }
    payload = json.dumps(event)
    print(f"📷 [Mock Detection] Publishing Event: {payload}")
    client.publish(topic, payload)
