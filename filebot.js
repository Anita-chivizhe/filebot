const fs = require("fs");
const path = require("path");

class FileCounterBot {
  constructor(folderPath, logFile = "file_count_log.csv") {
    this.folderPath = folderPath;
    this.logFile = logFile;

    // Create log file with headers if it doesn't exist
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

      // Read directory and filter only files (not directories)
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

  logCount() {
    const fileCount = this.countFiles();
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];

    // Append to log file
    const logEntry = `${timestamp},${this.folderPath},${fileCount}\n`;
    fs.appendFileSync(this.logFile, logEntry);

    console.log(
      `${timestamp}: Found ${fileCount} files in '${this.folderPath}'`
    );
    return fileCount;
  }

  runOnce() {
    console.log("Running file count...");
    this.logCount();
  }

  startScheduled(intervalHours = 1) {
    console.log("Starting file counter bot...");
    console.log(`Monitoring: ${this.folderPath}`);
    console.log(`Logging to: ${this.logFile}`);
    console.log(`Checking every ${intervalHours} hour(s)`);
    console.log("Press Ctrl+C to stop\n");

    // Run once immediately
    this.logCount();

    // Set up recurring interval
    const intervalMs = intervalHours * 60 * 60 * 1000; // Convert hours to milliseconds
    const interval = setInterval(() => {
      this.logCount();
    }, intervalMs);

    // Handle Ctrl+C gracefully
    process.on("SIGINT", () => {
      console.log("\nStopping bot...");
      clearInterval(interval);
      process.exit(0);
    });
  }
}

// Configuration - CHANGE THESE SETTINGS
const FOLDER_TO_MONITOR = "C:\\Users\\E1009806\\Downloads"; // Windows path
// const FOLDER_TO_MONITOR = '/Users/YourUsername/Downloads';    // Mac path
// const FOLDER_TO_MONITOR = '/home/yourusername/Downloads';     // Linux path

const LOG_FILE = "file_count_log.csv";
const CHECK_INTERVAL_HOURS = 1; // How often to check

// Create and start the bot
const bot = new FileCounterBot(FOLDER_TO_MONITOR, LOG_FILE);

// Choose one option:

// Option 1: Run once and exit
// bot.runOnce();

// Option 2: Run continuously on schedule
bot.startScheduled(CHECK_INTERVAL_HOURS);
