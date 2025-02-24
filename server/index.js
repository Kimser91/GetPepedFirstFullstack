const { app } = require("./app.js");
const { poolPromise, dcnDB } = require("./db.js");

poolPromise
  .then(() => {
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
    });
    process.on("SIGINT", () => shutdown(server));
    process.on("SIGTERM", () => shutdown(server));
  })
  .catch((err) => {
    console.error("❌ Feil ved oppkobling til DB:", err);
    process.exit(1);
  });

async function shutdown(server) {
  server.close(async () => {
    try {
      await dcnDB();
      process.exit(0);
    } catch (error) {
      console.error("❌ Feil ved lukking av database:", error);
      process.exit(1);
    }
  });
}
