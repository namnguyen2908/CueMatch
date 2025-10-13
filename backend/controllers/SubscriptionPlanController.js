const { get } = require('mongoose');
const SubscriptionPlan = require('../models/SubscriptionPlan');

const SubscriptionPlanController = {
    getAllPlans: async (req, res) => {
        try {
            const plans = await SubscriptionPlan.find();
            res.status(200).json(plans);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    },

    getPlanById: async (req, res) => {
        try {
            const plan = await SubscriptionPlan.findById(req.params.planId);
            if (!plan) {
                return res.status(404).json({ message: 'Plan not found' });
            }
            res.status(200).json(plan);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    },

    createPlan: async (req, res) => {
        try {
            let { Name, Type, Price, Duration, Features } = req.body;

            if (!Array.isArray(Features)) Features = [];

            Features = Features.map(f => ({
                Key: String(f.Key),
                Description: f.Description || '',
                MonthlyLimit: f.MonthlyLimit === null || f.MonthlyLimit === undefined
                    ? null
                    : Number(f.MonthlyLimit)
            }));

            const newPlan = new SubscriptionPlan({ Name, Type, Price, Duration, Features, IsActive: true });
            await newPlan.save();

            res.status(201).json({ message: 'Subscription plan created', plan: newPlan });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    updatePlan: async (req, res) => {
        try {
            const planId = req.params.id;
            const { Name, Type, Price, Duration, Features, IsActive } = req.body;

            const updateData = {
                ...(Name !== undefined && { Name }),
                ...(Type !== undefined && { Type }),
                ...(Price !== undefined && { Price }),
                ...(Duration !== undefined && { Duration }),
                ...(IsActive !== undefined && { IsActive })
            };

            if (Features) {
                if (!Array.isArray(Features)) {
                    return res.status(400).json({ message: 'Features must be an array' });
                }

                updateData.Features = Features.map(f => ({
                    Key: String(f.Key),
                    Description: f.Description || '',
                    MonthlyLimit: f.MonthlyLimit === null || f.MonthlyLimit === undefined
                        ? null
                        : Number(f.MonthlyLimit)
                }));
            }

            const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(planId, updateData, { new: true });
            if (!updatedPlan) {
                return res.status(404).json({ message: 'Plan not found' });
            }

            res.status(200).json({ message: 'Subscription plan updated', plan: updatedPlan });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },


    disablePlan: async (req, res) => {
        try {
            const planId = req.params.id;

            const plan = await SubscriptionPlan.findById(planId);
            if (!plan) return res.status(404).json({ message: 'Plan not found' });
            plan.IsActive = !plan.IsActive;

            const updatedPlan = await plan.save();

            res.status(200).json({
                message: `Subscription plan is now ${updatedPlan.IsActive ? 'enabled' : 'disabled'}`,
                plan: updatedPlan
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    },

    getPlanByType: async (req, res) => {
        try {
            const type = req.query.type;
            if (!type) {
                return res.status(400).json({ message: 'Type query param is required' });
            }
            const plans = await SubscriptionPlan.find({ Type: type, IsActive: true });
            res.status(200).json(plans);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }
}
module.exports = SubscriptionPlanController;