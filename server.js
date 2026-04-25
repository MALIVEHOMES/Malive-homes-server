const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const app = express();

// ✅ MIDDLEWARE
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// ✅ CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ Mongo Error:", err));

// ✅ PROPERTY MODEL
const Property = mongoose.model('Property', {
    title: String,
    location: String,
    price: Number,
    image: String
});

// ✅ IMAGE STORAGE CONFIG
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// ✅ ADD PROPERTY (WITH IMAGE)
app.post('/add', upload.single('image'), async (req, res) => {
    try {
        const property = new Property({
            title: req.body.title,
            location: req.body.location,
            price: Number(req.body.price),
            image: "uploads/" + req.file.filename
        });

        await property.save();
        res.json({ message: "✅ Property added", property });

    } catch (err) {
        res.status(500).json({ error: "❌ Failed to add property" });
    }
});

// ✅ GET ALL PROPERTIES
app.get('/properties', async (req, res) => {
    try {
        const data = await Property.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "❌ Failed to fetch properties" });
    }
});

// ✅ DELETE PROPERTY
app.delete('/delete/:id', async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);
        res.json({ message: "🗑️ Property deleted" });
    } catch (err) {
        res.status(500).json({ error: "❌ Delete failed" });
    }
});

// ✅ OPTIONAL: ADD SAMPLE DATA (FOR TESTING)
app.get('/add-sample', async (req, res) => {
    try {
        const sample = new Property({
            title: "2 Bedroom Apartment",
            location: "Nairobi",
            price: 45000,
            image: "uploads/sample.jpg"
        });

        await sample.save();
        res.send("✅ Sample property added");
    } catch (err) {
        res.status(500).send("❌ Failed to add sample");
    }
});

// ✅ ROOT ROUTE (IMPORTANT FOR TESTING)
app.get('/', (req, res) => {
    res.send("🚀 Malive Homes API is running...");
});

// ✅ START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("🚀 Server running on " + PORT));
