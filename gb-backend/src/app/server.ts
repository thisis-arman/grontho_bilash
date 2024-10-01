import app from "./app";
import config from "./config";
import mongoose from "mongoose"; // Use import instead of require

const port = process.env.PORT || 3000;

async function main() {
  try {
    // Connecting to MongoDB using Mongoose
    await mongoose.connect(config.database_url as string, );

    console.log("Connected to MongoDB!");

    // Start the Express app
    app.listen(3000, () => {
      console.log(`Server is running on port ${3000}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

main();
