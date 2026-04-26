const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// 🔗 DB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// 📦 MODEL (MULTIPLE IMAGES)
const Property = mongoose.model('Property', {
    title: String,
    location: String,
    price: Number,
    size: String,
    description: String,
    images: [String]
});

// 📷 UPLOAD CONFIG
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// ➕ ADD PROPERTY (UP TO 7 IMAGES)
app.post('/add', upload.array('images', 7), async (req, res) => {
    try {

        const imagePaths = req.files.map(f => "uploads/" + f.filename);

        const property = new Property({
            title: req.body.title,
            location: req.body.location,
            price: Number(req.body.price),
            size: req.body.size,
            description: req.body.description,
            images: imagePaths
        });

        await property.save();
        res.json({ message: "Added", property });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📥 GET ALL
app.get('/properties', async (req, res) => {
    const data = await Property.find();
    res.json(data);
});

// ❌ DELETE
app.delete('/delete/:id', async (req, res) => {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// 🚀 SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on " + PORT));
