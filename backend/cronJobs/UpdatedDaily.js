const cron = require('node-cron');
const MatchInvitation = require('../models/MatchInvitation');
const { DateTime } = require('luxon');

cron.schedule('5 0 * * *', async () => {
    try {
        const today = DateTime.now().setZone('Asia/Ho_Chi_Minh').startOf('day').toJSDate();

        const acceptedResult = await MatchInvitation.updateMany(
            {
                Status: 'Accepted',
                MatchDate: { $lt: today }
            },
            { $set: { Status: 'Occurred' } }
        );

        const pendingResult = await MatchInvitation.updateMany(
            {
                Status: 'Pending',
                MatchDate: { $lt: today }
            },
            { $set: { Status: 'Declined' } }
        );

        console.log(`[CRON] Updated:
    - ${acceptedResult.modifiedCount} Accepted → Occurred
    - ${pendingResult.modifiedCount} Pending → Declined`);
    } catch (err) {
        console.error('[CRON ERROR] Failed to update match statuses:', err);
    }
});
