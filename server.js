const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// 🔗 CONNECT DATABASE
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MONGO_URI:", process.env.MONGO_URI))
.catch(err=>console.log(err));

// 📦 MODEL
const Property = mongoose.model('Property', {
    title: String,
    location: String,
    price: String,
    image: String
});

// 📷 IMAGE UPLOAD
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// ➕ ADD PROPERTY
app.post('/add', upload.single('image'), async (req,res)=>{
    const property = new Property({
        title: req.body.title,
        location: req.body.location,
        price: req.body.price,
        image: req.file.filename
    });
    await property.save();
    res.send("Added");
});

// 📥 GET ALL
app.get('/properties', async (req,res)=>{
    const data = await Property.find();
    res.json(data);
});

// ❌ DELETE
app.delete('/delete/:id', async (req,res)=>{
    await Property.findByIdAndDelete(req.params.id);
    res.send("Deleted");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("Server running on " + PORT));
