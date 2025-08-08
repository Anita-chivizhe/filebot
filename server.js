const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// Serve static files (CSS, JS)
app.use(express.static("public"));

class FileCounterBot {
  constructor(folderPath, logFile = "file_count_log.csv") {
    this.folderPath = folderPath;
    this.logFile = logFile;
    this.currentCount = 0;
    this.lastUpdated = null;

    this.initializeLogFile();
  }

  initializeLogFile() {
    if (!fs.existsSync(this.logFile)) {
      const header = "Timestamp,Folder,File Count\n";
      fs.writeFileSync(this.logFile, header);
      console.log(`Created log file: ${this.logFile}`);
    }
  }

  countFiles() {
    try {
      if (!fs.existsSync(this.folderPath)) {
        console.error(`Error: Folder '${this.folderPath}' does not exist`);
        return 0;
      }

      const items = fs.readdirSync(this.folderPath);
      const fileCount = items.filter((item) => {
        const fullPath = path.join(this.folderPath, item);
        return fs.statSync(fullPath).isFile();
      }).length;

      return fileCount;
    } catch (error) {
      console.error(`Error counting files: ${error.message}`);
      return 0;
    }
  }

  updateCount() {
    this.currentCount = this.countFiles();
    this.lastUpdated = new Date().toISOString();

    // Log to CSV
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    const logEntry = `${timestamp},${this.folderPath},${this.currentCount}\n`;
    fs.appendFileSync(this.logFile, logEntry);

    console.log(`${timestamp}: Found ${this.currentCount} files`);
    return this.currentCount;
  }

  getCurrentData() {
    return {
      count: this.currentCount,
      folderPath: this.folderPath,
      lastUpdated: this.lastUpdated,
    };
  }

  getHistory() {
    try {
      const data = fs.readFileSync(this.logFile, "utf8");
      const lines = data.split("\n").filter((line) => line.trim());
      const history = lines.slice(1).map((line) => {
        const [timestamp, folder, count] = line.split(",");
        return {
          timestamp,
          folder,
          count: parseInt(count),
        };
      });
      return history.slice(-24); // Last 24 entries
    } catch (error) {
      console.error("Error reading history:", error);
      return [];
    }
  }
}

// Configuration - CHANGE THIS PATH
const FOLDER_TO_MONITOR = "C:\\Users\\E1009806\\Downloads"; // Change this!
const bot = new FileCounterBot(FOLDER_TO_MONITOR);

// Initial count
bot.updateCount();

// Update every 30 seconds for demo (change as needed)
setInterval(() => {
  bot.updateCount();
}, 3000000);

// API Routes
app.get("/api/current", (req, res) => {
  res.json(bot.getCurrentData());
});

app.get("/api/history", (req, res) => {
  res.json(bot.getHistory());
});

app.get("/api/refresh", (req, res) => {
  bot.updateCount();
  res.json(bot.getCurrentData());
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`File Counter UI running at http://localhost:${PORT}`);
  console.log(`Monitoring: ${FOLDER_TO_MONITOR}`);
  console.log("Press Ctrl+C to stop");
});
