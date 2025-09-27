const cron = require('node-cron');
const MatchInvitation = require('../models/MatchInvitation');
const { DateTime } = require('luxon');

cron.schedule('*/5 * * * *', async () => {
    try {
        const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');

        // Get all relevant matches
        const matches = await MatchInvitation.find({
            Status: { $in: ['Accepted', 'Pending'] },
            MatchDate: { $lte: now.toJSDate() }
        });

        let acceptedToOccurred = 0;
        let pendingToDeclined = 0;

        for (const match of matches) {
            const matchDate = DateTime.fromJSDate(match.MatchDate).setZone('Asia/Ho_Chi_Minh');
            const endDateTime = DateTime.fromFormat(`${matchDate.toISODate()}T${match.TimeEnd}`, 'yyyy-MM-dd\'T\'HH:mm', { zone: 'Asia/Ho_Chi_Minh' });
            const startDateTime = DateTime.fromFormat(`${matchDate.toISODate()}T${match.TimeStart}`, 'yyyy-MM-dd\'T\'HH:mm', { zone: 'Asia/Ho_Chi_Minh' });

            if (match.Status === 'Accepted' && endDateTime < now) {
                match.Status = 'Occurred';
                await match.save();
                acceptedToOccurred++;
            }

            if (match.Status === 'Pending' && startDateTime < now) {
                match.Status = 'Declined';
                await match.save();
                pendingToDeclined++;
            }
        }

        console.log(`[CRON] Updated:
    - ${acceptedToOccurred} Accepted → Occurred
    - ${pendingToDeclined} Pending → Declined`);

    } catch (err) {
        console.error('[CRON ERROR] Failed to update match statuses:', err);
    }
});
