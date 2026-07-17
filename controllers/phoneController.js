/**
 * Phone Controller
 * 
 * Handles all CRUD operations for phones.
 * Admin-only operations: add, edit, delete.
 * Public operations: get all phones.
 */

const Phone = require('../models/Phone');

// ============================================================
// GET PHONES ADDED BY THE CURRENT SELLER
// ============================================================
exports.getMyPhones = async (req, res) => {
    try {
        const query = req.session.userRole === 'admin'
            ? {}  // admins see all
            : { addedBy: req.session.userId };

        const phones = await Phone.find(query).sort({ createdAt: -1 });
        res.status(200).json(phones);
    } catch (error) {
        console.error('Error fetching seller phones:', error);
        res.status(500).json({ message: 'Error fetching your listings' });
    }
};

// ============================================================
// GET ALL PHONES
// ============================================================
exports.getAllPhones = async (req, res) => {
    try {
        // Fetch all phones from the database, sorted by brand then name
        const phones = await Phone.find().sort({ brand: 1, name: 1 });
        res.status(200).json(phones);
    } catch (error) {
        console.error('Error fetching phones:', error);
        res.status(500).json({ message: 'Error fetching phones' });
    }
};

// ============================================================
// GET FEATURED PHONES
// ============================================================
exports.getFeaturedPhones = async (req, res) => {
    try {
        const phones = await Phone.find({ featured: true, inStock: true }).sort({ price: -1 });
        res.status(200).json(phones);
    } catch (error) {
        console.error('Error fetching featured phones:', error);
        res.status(500).json({ message: 'Error fetching featured phones' });
    }
};

// ============================================================
// GET A SINGLE PHONE BY ID
// ============================================================
exports.getPhoneById = async (req, res) => {
    try {
        const phone = await Phone.findById(req.params.id);
        if (!phone) {
            return res.status(404).json({ message: 'Phone not found' });
        }
        res.status(200).json(phone);
    } catch (error) {
        console.error('Error fetching phone:', error);
        res.status(500).json({ message: 'Error fetching phone' });
    }
};

// ============================================================
// ADD A NEW PHONE (Admin or Seller)
// ============================================================
exports.addPhone = async (req, res) => {
    try {
        const { name, brand, price, ram, storage, battery, camera, usageType, inStock, description } = req.body;

        // Validate required fields
        if (!name || !brand || !price || !ram || !storage || !battery || !camera || !usageType) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Parse usageType if it comes as a string
        let parsedUsageType = usageType;
        if (typeof usageType === 'string') {
            parsedUsageType = usageType.split(',').map(type => type.trim());
        }

        // Create new phone object; track who added it
        const phone = new Phone({
            name,
            brand,
            price: Number(price),
            ram: Number(ram),
            storage: Number(storage),
            battery: Number(battery),
            camera: Number(camera),
            usageType: parsedUsageType,
            inStock: inStock !== undefined ? inStock : true,
            image: req.file ? req.file.filename : 'default-phone.svg',
            description: description || '',
            addedBy: req.session.userId || null
        });

        await phone.save();

        res.status(201).json({ message: 'Phone added successfully', phone });
    } catch (error) {
        console.error('Error adding phone:', error);
        res.status(500).json({ message: 'Error adding phone' });
    }
};

// ============================================================
// UPDATE AN EXISTING PHONE (Admin or owner Seller)
// ============================================================
exports.updatePhone = async (req, res) => {
    try {
        const phone = await Phone.findById(req.params.id);
        if (!phone) {
            return res.status(404).json({ message: 'Phone not found' });
        }

        // Sellers can only update phones they added
        if (req.session.userRole === 'seller') {
            const ownerId = phone.addedBy ? phone.addedBy.toString() : null;
            if (ownerId !== req.session.userId.toString()) {
                return res.status(403).json({ message: 'Access denied. You can only edit your own listings.' });
            }
        }

        const { name, brand, price, ram, storage, battery, camera, usageType, inStock, description } = req.body;

        // Build update object with provided fields
        const updateData = {};
        if (name) updateData.name = name;
        if (brand) updateData.brand = brand;
        if (price) updateData.price = Number(price);
        if (ram) updateData.ram = Number(ram);
        if (storage) updateData.storage = Number(storage);
        if (battery) updateData.battery = Number(battery);
        if (camera) updateData.camera = Number(camera);
        if (usageType) {
            updateData.usageType = typeof usageType === 'string'
                ? usageType.split(',').map(type => type.trim())
                : usageType;
        }
        if (inStock !== undefined) updateData.inStock = inStock;
        if (description !== undefined) updateData.description = description;
        if (req.file) updateData.image = req.file.filename;

        const updated = await Phone.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Phone updated successfully', phone: updated });
    } catch (error) {
        console.error('Error updating phone:', error);
        res.status(500).json({ message: 'Error updating phone' });
    }
};

// ============================================================
// DELETE A PHONE (Admin or owner Seller)
// ============================================================
exports.deletePhone = async (req, res) => {
    try {
        const phone = await Phone.findById(req.params.id);
        if (!phone) {
            return res.status(404).json({ message: 'Phone not found' });
        }

        // Sellers can only delete phones they added
        if (req.session.userRole === 'seller') {
            const ownerId = phone.addedBy ? phone.addedBy.toString() : null;
            if (ownerId !== req.session.userId.toString()) {
                return res.status(403).json({ message: 'Access denied. You can only delete your own listings.' });
            }
        }

        await Phone.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Phone deleted successfully' });
    } catch (error) {
        console.error('Error deleting phone:', error);
        res.status(500).json({ message: 'Error deleting phone' });
    }
};
