import { motion } from "framer-motion";
import JetRacerSimulator from "@/components/JetRacerSimulator";
import ModuleCard from "@/components/ModuleCard";
import StateVisualization from "@/components/StateVisualization";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";

const modules = [
  {
    icon: "👁️",
    title: "vision.py",
    subtitle: "YOLOv5n Person Detection",
    color: "hsl(var(--neon-green))",
    description: "Detects humans using YOLOv5n lightweight model. Estimates distance via bounding box height and tracks horizontal position for steering.",
    code: `class Vision:
    def __init__(self):
        self.model = torch.hub.load(
            'ultralytics/yolov5', 'yolov5n', pretrained=True
        )
        self.cap = cv2.VideoCapture(0)

    def detect_person(self, frame):
        results = self.model(frame)
        detections = results.pandas().xyxy[0]
        for _, row in detections.iterrows():
            if row['name'] == 'person':
                center = (row['xmin'] + row['xmax']) / 2
                height = row['ymax'] - row['ymin']
                return {"detected": True, 
                        "center": center, "height": height}
        return {"detected": False}`,
  },
  {
    icon: "🎙️",
    title: "audio.py",
    subtitle: "Offline Speech Recognition",
    color: "hsl(var(--neon-purple))",
    description: "Captures microphone input and converts speech to text using Vosk offline model. Runs entirely on-device without internet.",
    code: `class Audio:
    def __init__(self):
        self.q = queue.Queue()
        self.model = vosk.Model("vosk-model-small-en-us")
        self.rec = vosk.KaldiRecognizer(self.model, 16000)

    def listen(self):
        with sd.RawInputStream(samplerate=16000,
            blocksize=8000, dtype='int16',
            channels=1, callback=self.callback):
            data = self.q.get()
            if self.rec.AcceptWaveform(data):
                result = json.loads(self.rec.Result())
                return result.get("text", "")
        return ""`,
  },
  {
    icon: "🧠",
    title: "intent.py",
    subtitle: "Mood / Intent Classification",
    color: "hsl(var(--neon-orange))",
    description: "Classifies speech text into emotional categories: positive (FLATTERED), sad (COMFORT), aggressive (PANIC). Drives behavioral state transitions.",
    code: `class Intent:
    def __init__(self):
        self.positive = ["cool", "nice", "awesome", "cute"]
        self.sad = ["sad", "tired", "bad", "upset"]
        self.aggressive = ["come here", "stop", "hey"]

    def classify(self, text):
        text = text.lower()
        if any(w in text for w in self.positive):
            return "FLATTERED"
        if any(w in text for w in self.sad):
            return "COMFORT"
        if any(w in text for w in self.aggressive):
            return "PANIC"
        return None`,
  },
  {
    icon: "🎭",
    title: "personality.py",
    subtitle: "Dynamic Personality Model",
    color: "hsl(var(--neon-pink))",
    description: "Internal personality variables (ego, fear, patience) evolve over time based on interactions, shaping how the robot responds to future events.",
    code: `class Personality:
    def __init__(self):
        self.ego = 0      # Increases with compliments
        self.fear = 1      # Increases with threats
        self.patience = 5  # Decreases with disturbance

    def update(self, state):
        if state == "FLATTERED":
            self.ego += 1
            self.fear -= 0.1
        if state == "PANIC":
            self.fear += 0.2
        if state == "ANNOYED":
            self.patience -= 1`,
  },
  {
    icon: "🚘",
    title: "motor.py",
    subtitle: "JetRacer Motor Control",
    color: "hsl(var(--neon-cyan))",
    description: "Interfaces with NVIDIA JetRacer SDK to control throttle and steering. Supports roaming, avoidance, and panic maneuvers.",
    code: `from jetracer.nvidia_racecar import NvidiaRacecar

class Motor:
    def __init__(self):
        self.car = NvidiaRacecar()

    def roam(self):
        self.car.throttle = 0.2
        self.car.steering = random.uniform(-0.3, 0.3)

    def avoid(self, direction):
        self.car.steering = -direction
        self.car.throttle = 0.4

    def panic(self):
        self.car.throttle = -0.5
        time.sleep(0.3)
        self.car.steering = random.uniform(-1, 1)
        self.car.throttle = 0.8`,
  },
  {
    icon: "🎭",
    title: "behavior.py",
    subtitle: "Behavioral State Machine",
    color: "hsl(var(--neon-yellow))",
    description: "Central behavior engine managing 7 states. Combines vision data and speech intent to select actions and trigger speech responses via pyttsx3.",
    code: `class Behavior:
    def update(self, vision_data, intent):
        if intent:
            self.state = intent
        elif vision_data["detected"]:
            if vision_data["height"] > 200:
                self.state = "PANIC"
            else:
                self.state = "AVOID"
        else:
            self.state = "ROAM"
        self.execute(vision_data)

    def execute(self, vision_data):
        if self.state == "ROAM":
            self.motor.roam()
        elif self.state == "PANIC":
            self.motor.panic()
            self.speak("AHHH!")
        elif self.state == "FLATTERED":
            self.motor.stop()
            self.speak("You're making my GPU blush")`,
  },
];

const techStack = [
  { category: "Hardware", items: ["Jetson Nano", "Camera Module", "Microphone", "Speaker"] },
  { category: "Vision", items: ["YOLOv5n", "OpenCV", "PyTorch"] },
  { category: "Speech", items: ["Vosk STT", "pyttsx3 TTS", "sounddevice"] },
  { category: "Control", items: ["JetRacer SDK", "NvidiaRacecar", "Python 3"] },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background scanline">
      {/* Hero */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse-glow" />
              <span className="text-xs font-mono text-muted-foreground">NVIDIA JetRacer • HRI Project</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight mb-4">
              <span className="text-foreground">Mood-Aware </span>
              <span className="text-primary text-glow-cyan">Socially Reactive</span>
              <br />
              <span className="text-foreground">JetRacer</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-display">
              An autonomous robot with personality-driven behavior that detects humans,
              understands emotions, and responds with adaptive social intelligence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Live Simulator */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold font-display mb-2 text-foreground">
              🚗 Live Simulation
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Click states to trigger behaviors. Watch personality stats evolve in real-time.
            </p>
            <JetRacerSimulator />
          </motion.div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold font-display mb-6 text-foreground text-center">
            ⚙️ System Architecture
          </h2>
          <ArchitectureDiagram />
        </div>
      </section>

      {/* State Machine */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold font-display mb-6 text-foreground">
            🎭 Behavior State Machine
          </h2>
          <StateVisualization />
        </div>
      </section>

      {/* Modules */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold font-display mb-8 text-foreground">
            📦 Implementation Modules
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modules.map((mod, i) => (
              <ModuleCard key={mod.title} {...mod} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Main Loop */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-display mb-4 text-foreground">
            🚀 Main Loop
          </h2>
          <div className="bg-card rounded-xl border border-primary/30 p-6 box-glow-cyan">
            <pre className="text-xs sm:text-sm font-mono text-muted-foreground leading-relaxed overflow-x-auto">
              <code>{`from modules.vision import Vision
from modules.audio import Audio
from modules.intent import Intent
from modules.motor import Motor
from modules.personality import Personality
from modules.behavior import Behavior

vision = Vision()
audio = Audio()
intent_model = Intent()
motor = Motor()
personality = Personality()
behavior = Behavior(motor, personality)

while True:
    frame = vision.get_frame()
    vision_data = vision.detect_person(frame)
    text = audio.listen()
    intent = intent_model.classify(text)
    behavior.update(vision_data, intent)`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold font-display mb-6 text-foreground">
            🛠️ Tech Stack
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {techStack.map((cat) => (
              <div key={cat.category} className="bg-card rounded-lg border border-border p-4">
                <h3 className="text-sm font-mono font-bold text-primary mb-3">{cat.category}</h3>
                <ul className="space-y-1.5">
                  {cat.items.map(item => (
                    <li key={item} className="text-xs text-secondary-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 mb-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold font-display mb-6 text-foreground text-center">
            ✅ What You Get
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              "Human Detection",
              "Mood Detection",
              "Compliment Reaction",
              "Comfort Mode",
              "Panic Response",
              "Autonomous Roaming",
              "Personality Model",
              "Speech Output",
            ].map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-lg px-3 py-3 text-center text-sm font-display text-secondary-foreground hover:border-primary/40 transition-colors"
              >
                ✔ {feat}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center">
        <p className="text-xs font-mono text-muted-foreground">
          Mood-Aware Socially Reactive JetRacer • Built on NVIDIA Jetson Nano • HRI Research Project
        </p>
      </footer>
    </div>
  );
};

export default Index;
