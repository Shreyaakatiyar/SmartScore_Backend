import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SmartScore API is running on port ${PORT}`);
})