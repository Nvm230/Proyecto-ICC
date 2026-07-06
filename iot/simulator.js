const mqtt = require('mqtt');

console.log("🚀 IoT Simulator Started");

const brokerUrl = process.env.MQTT_URL || "mqtt://mqtt-broker:1883";
const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log(`Connected to MQTT Broker at ${brokerUrl}`);
});

const sensors = ["PIR_LOBBY", "REED_DOOR_BACK", "HCSR04_GATE"];

// setInterval(() => {
//     if (!client.connected) return;
// 
//     // Trigger an event with 30% probability every 20 seconds
//     if (Math.random() < 0.3) {
//         const event = {
//             sensor_id: sensors[Math.floor(Math.random() * sensors.length)],
//             status: "TRIGGERED",
//             timestamp: Date.now()
//         };
//         
//         console.log(`📡 [Mock Sensor] Publishing Event: ${JSON.stringify(event)}`);
//         client.publish("condominio/sensors/events", JSON.stringify(event));
//     }
// }, 20000);
