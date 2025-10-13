const BilliardsClub = require('../models/BilliardsClub');

const BilliardsClubController = {
  createClub: async (req, res) => {
    try {
      const { Name, Address, Phone, Description, CoverImage, OpenTime, CloseTime } = req.body;
      const ownerId = req.user.id;

      const club = await BilliardsClub.create({
        Owner: ownerId,
        Name,
        Address,
        Phone,
        Description,
        CoverImage,
        OpenTime,
        CloseTime
      });

      return res.status(201).json({ message: 'Tạo quán Bi-a thành công', club });
    } catch (error) {
      console.error('❌ createClub error:', error);
      return res.status(500).json({ message: 'Lỗi server khi tạo quán' });
    }
  },

  getAllClubs: async (req, res) => {
    try {
      const clubs = await BilliardsClub.find({ IsActive: true }).sort({ createdAt: -1 });
      return res.json(clubs);
    } catch (error) {
      console.error('❌ getAllClubs error:', error);
      return res.status(500).json({ message: 'Lỗi khi lấy danh sách quán' });
    }
  },

  getMyClubs: async (req, res) => {
    try {
      const userId = req.user.id;
      const clubs = await BilliardsClub.find({ Owner: userId });
      return res.json(clubs);
    } catch (error) {
      console.error('❌ getMyClubs error:', error);
      return res.status(500).json({ message: 'Lỗi khi lấy quán của bạn' });
    }
  },

  getClubById: async (req, res) => {
    try {
      const { id } = req.params;
      const club = await BilliardsClub.findById(id);
      if (!club || !club.IsActive) {
        return res.status(404).json({ message: 'Không tìm thấy quán Bi-a' });
      }
      return res.json(club);
    } catch (error) {
      console.error('❌ getClubById error:', error);
      return res.status(500).json({ message: 'Lỗi khi lấy thông tin quán' });
    }
  },

  updateClub: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const club = await BilliardsClub.findOne({ _id: id, Owner: userId });
      if (!club) {
        return res.status(404).json({ message: 'Bạn không có quyền sửa quán này' });
      }

      const updates = req.body;
      Object.assign(club, updates);

      await club.save();
      return res.json({ message: 'Cập nhật thành công', club });
    } catch (error) {
      console.error('❌ updateClub error:', error);
      return res.status(500).json({ message: 'Lỗi khi cập nhật quán' });
    }
  },

  deleteClub: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const club = await BilliardsClub.findOne({ _id: id, Owner: userId });
      if (!club) {
        return res.status(404).json({ message: 'Bạn không có quyền xoá quán này' });
      }

      club.IsActive = false;
      await club.save();
      return res.json({ message: 'Xoá quán thành công (ẩn khỏi hệ thống)' });
    } catch (error) {
      console.error('❌ deleteClub error:', error);
      return res.status(500).json({ message: 'Lỗi khi xoá quán' });
    }
  }
};

module.exports = BilliardsClubController;