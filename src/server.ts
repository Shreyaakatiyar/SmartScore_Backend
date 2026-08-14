import app from "./app";
import "dotenv/config";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`SmartScore API is running on port ${PORT}`);
})