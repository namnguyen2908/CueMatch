const User = require('../models/User');
const BilliardsClub = require('../models/BilliardsClub');
const Post = require('../models/Post');

const DEFAULT_LIMITS = {
  users: 5,
  clubs: 5,
  posts: 5
};

const parseLimit = (value, fallback) => {
  const num = Number(value);
  if (Number.isFinite(num) && num > 0 && num <= 50) {
    return Math.floor(num);
  }
  return fallback;
};

const buildRegex = (keyword) => new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

const SearchController = {
  globalSearch: async (req, res) => {
    try {
      const { q = '', limitUsers, limitClubs, limitPosts } = req.query;
      const trimmedQuery = q.trim();

      if (!trimmedQuery) {
        return res.status(400).json({ message: 'Query parameter "q" is required' });
      }

      const regex = buildRegex(trimmedQuery);

      const usersLimit = parseLimit(limitUsers, DEFAULT_LIMITS.users);
      const clubsLimit = parseLimit(limitClubs, DEFAULT_LIMITS.clubs);
      const postsLimit = parseLimit(limitPosts, DEFAULT_LIMITS.posts);

      const roleFilter = { Role: { $ne: 'admin' } };

      const [users, clubs, authorMatches] = await Promise.all([
        User.find({
          ...roleFilter,
          $or: [
            { Name: regex },
            { Email: regex }
          ]
        })
          .select('Name Email Avatar Role')
          .limit(usersLimit)
          .sort({ createdAt: -1 }),

        BilliardsClub.find({
          IsActive: true,
          $or: [
            { Name: regex },
            { Address: regex },
            { Description: regex }
          ]
        })
          .limit(clubsLimit)
          .sort({ createdAt: -1 }),

        User.find({ ...roleFilter, Name: regex }).select('_id').limit(100)
      ]);

      const authorIds = authorMatches.map((user) => user._id);

      const posts = await Post.find({
        Status: 'public',
        $or: [
          { Content: regex },
          ...(authorIds.length ? [{ UserID: { $in: authorIds } }] : [])
        ]
      })
        .limit(postsLimit)
        .sort({ createdAt: -1 })
        .populate('UserID', 'Name Avatar');

      return res.status(200).json({
        query: trimmedQuery,
        users,
        clubs,
        posts
      });
    } catch (error) {
      console.error('SearchController.globalSearch error:', error);
      return res.status(500).json({ message: 'Unable to search at this time', error: error.message });
    }
  }
};

module.exports = SearchController;