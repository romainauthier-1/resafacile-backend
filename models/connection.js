const mongoose = require("mongoose");

const connectionString = process.env.CONNECTION_STRING;

mongoose.set("strictQuery", true);

// mongoose
//   .connect(connectionString, { connectTimeoutMS: 5000 })
//   .then(() => console.log("🗄 --- 🖥 BDD Connectée ✅ "))
//   .catch((error) => console.error(error));

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    });
    console.log("🗄 ↔️ 🖥 BDD Connectée ✅ ");
  } catch (err) {
    console.error("❌ Erreur de connection BDD", err.message);
    process.exit(1);
  }
};

connectDB();

mongoose.connection.on("disconnected", () => {
  console.warn("❌ MongoDB déconnecté — tentative de reconnexion...");
  setTimeout(connectDB, 5000);
});

mongoose.connection.on("error", (err) => {
  console.error("⚠️ Erreur MongoDB :", err);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnecté ✅");
});
