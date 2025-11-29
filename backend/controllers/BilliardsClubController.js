const BilliardsClub = require('../models/BilliardsClub');
const mongoose = require('mongoose');

const BilliardsClubController = {
  createClub: async (req, res) => {
    try {
      const { Name, Address, Phone, Description, OpenTime, CloseTime, Location } = req.body;
      const ownerId = req.user.id;

      // Validate required fields
      if (!Name || Name.trim().length === 0) {
        return res.status(400).json({ message: 'Name is required and cannot be empty' });
      }

      if (!Address || Address.trim().length === 0) {
        return res.status(400).json({ message: 'Address is required and cannot be empty' });
      }

      // Validate Name length
      if (Name.length > 100) {
        return res.status(400).json({ message: 'Name must not exceed 100 characters' });
      }

      // Validate Address length
      if (Address.length > 200) {
        return res.status(400).json({ message: 'Address must not exceed 200 characters' });
      }

      // Validate Phone format if provided
      if (Phone) {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(Phone.replace(/\s+/g, ''))) {
          return res.status(400).json({ message: 'Invalid phone number format. Phone must be 10-11 digits' });
        }
      }

      // Validate Description length if provided
      if (Description && Description.length > 1000) {
        return res.status(400).json({ message: 'Description must not exceed 1000 characters' });
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (OpenTime && !timeRegex.test(OpenTime)) {
        return res.status(400).json({ message: 'Invalid OpenTime format. Expected HH:MM (24-hour format)' });
      }
      if (CloseTime && !timeRegex.test(CloseTime)) {
        return res.status(400).json({ message: 'Invalid CloseTime format. Expected HH:MM (24-hour format)' });
      }

      // Validate OpenTime < CloseTime if both provided
      if (OpenTime && CloseTime) {
        const [openHour, openMin] = OpenTime.split(':').map(Number);
        const [closeHour, closeMin] = CloseTime.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        
        if (openMinutes >= closeMinutes) {
          return res.status(400).json({ message: 'OpenTime must be earlier than CloseTime' });
        }
      }

      // Validate Location if provided
      if (Location) {
        if (typeof Location !== 'object' || Location === null) {
          return res.status(400).json({ message: 'Location must be an object with lat and lng' });
        }
        if (Location.lat !== undefined && (isNaN(Location.lat) || Location.lat < -90 || Location.lat > 90)) {
          return res.status(400).json({ message: 'Location latitude must be a number between -90 and 90' });
        }
        if (Location.lng !== undefined && (isNaN(Location.lng) || Location.lng < -180 || Location.lng > 180)) {
          return res.status(400).json({ message: 'Location longitude must be a number between -180 and 180' });
        }
      }

      const club = await BilliardsClub.create({
        Owner: ownerId,
        Name: Name.trim(),
        Address: Address.trim(),
        Phone: Phone ? Phone.trim() : undefined,
        Description: Description ? Description.trim() : undefined,
        OpenTime,
        CloseTime,
        Location: Location || null,
      });

      return res.status(201).json({ message: 'Club created successfully', club });
    } catch (error) {
      console.error('❌ createClub error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  getAllClubs: async (req, res) => {
    try {
      const clubs = await BilliardsClub.find({ IsActive: true }).sort({ createdAt: -1 });
      return res.json(clubs);
    } catch (error) {
      console.error('❌ getAllClubs error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  getMyClubs: async (req, res) => {
    try {
      const userId = req.user.id;
      const clubs = await BilliardsClub.find({ Owner: userId });
      return res.json(clubs);
    } catch (error) {
      console.error('❌ getMyClubs error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  getClubById: async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid club ID format' });
      }

      const club = await BilliardsClub.findById(id);
      if (!club || !club.IsActive) {
        return res.status(404).json({ message: 'Club not found' });
      }
      return res.json(club);
    } catch (error) {
      console.error('❌ getClubById error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  updateClub: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate ID format
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid club ID format' });
      }

      const club = await BilliardsClub.findOne({ _id: id, Owner: userId });
      if (!club) {
        return res.status(404).json({ message: 'Club not found or you do not have permission to update this club' });
      }

      const updates = req.body;

      // ✅ Giữ an toàn: chỉ cho phép cập nhật các trường hợp lệ
      const allowedFields = [
        'Name',
        'Address',
        'Phone',
        'Description',
        'OpenTime',
        'CloseTime',
        'Location',
      ];

      // Validate each field before updating
      if (updates.Name !== undefined) {
        if (!updates.Name || updates.Name.trim().length === 0) {
          return res.status(400).json({ message: 'Name cannot be empty' });
        }
        if (updates.Name.length > 100) {
          return res.status(400).json({ message: 'Name must not exceed 100 characters' });
        }
        club.Name = updates.Name.trim();
      }

      if (updates.Address !== undefined) {
        if (!updates.Address || updates.Address.trim().length === 0) {
          return res.status(400).json({ message: 'Address cannot be empty' });
        }
        if (updates.Address.length > 200) {
          return res.status(400).json({ message: 'Address must not exceed 200 characters' });
        }
        club.Address = updates.Address.trim();
      }

      if (updates.Phone !== undefined) {
        if (updates.Phone) {
          const phoneRegex = /^[0-9]{10,11}$/;
          if (!phoneRegex.test(updates.Phone.replace(/\s+/g, ''))) {
            return res.status(400).json({ message: 'Invalid phone number format. Phone must be 10-11 digits' });
          }
          club.Phone = updates.Phone.trim();
        } else {
          club.Phone = updates.Phone;
        }
      }

      if (updates.Description !== undefined) {
        if (updates.Description && updates.Description.length > 1000) {
          return res.status(400).json({ message: 'Description must not exceed 1000 characters' });
        }
        club.Description = updates.Description ? updates.Description.trim() : updates.Description;
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (updates.OpenTime !== undefined) {
        if (updates.OpenTime && !timeRegex.test(updates.OpenTime)) {
          return res.status(400).json({ message: 'Invalid OpenTime format. Expected HH:MM (24-hour format)' });
        }
        club.OpenTime = updates.OpenTime;
      }

      if (updates.CloseTime !== undefined) {
        if (updates.CloseTime && !timeRegex.test(updates.CloseTime)) {
          return res.status(400).json({ message: 'Invalid CloseTime format. Expected HH:MM (24-hour format)' });
        }
        club.CloseTime = updates.CloseTime;
      }

      // Validate OpenTime < CloseTime
      const finalOpenTime = club.OpenTime || updates.OpenTime;
      const finalCloseTime = club.CloseTime || updates.CloseTime;
      if (finalOpenTime && finalCloseTime) {
        const [openHour, openMin] = finalOpenTime.split(':').map(Number);
        const [closeHour, closeMin] = finalCloseTime.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        
        if (openMinutes >= closeMinutes) {
          return res.status(400).json({ message: 'OpenTime must be earlier than CloseTime' });
        }
      }

      // Validate Location
      if (updates.Location !== undefined) {
        if (updates.Location === null) {
          club.Location = null;
        } else if (typeof updates.Location === 'object') {
          if (updates.Location.lat !== undefined && (isNaN(updates.Location.lat) || updates.Location.lat < -90 || updates.Location.lat > 90)) {
            return res.status(400).json({ message: 'Location latitude must be a number between -90 and 90' });
          }
          if (updates.Location.lng !== undefined && (isNaN(updates.Location.lng) || updates.Location.lng < -180 || updates.Location.lng > 180)) {
            return res.status(400).json({ message: 'Location longitude must be a number between -180 and 180' });
          }
          club.Location = updates.Location;
        } else {
          return res.status(400).json({ message: 'Location must be an object with lat and lng or null' });
        }
      }
      await club.save();
      return res.json({ message: 'Club updated successfully', club });
    } catch (error) {
      console.error('❌ updateClub error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  deleteClub: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate ID format
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid club ID format' });
      }

      const club = await BilliardsClub.findOne({ _id: id, Owner: userId });
      if (!club) {
        return res.status(404).json({ message: 'Club not found or you do not have permission to delete this club' });
      }

      club.IsActive = false;
      await club.save();
      return res.json({ message: 'Club deleted successfully (hidden from system)' });
    } catch (error) {
      console.error('❌ deleteClub error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = BilliardsClubController;