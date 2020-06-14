const {User_Model, Bill_Model} = require('../models');
const RandomizerHelper         = require('../helpers/randomizer.js');

const bill_payment_create = async function () {
    const users = await User_Model.find({role: 'agent', isActive : "1"}).populate("subscription_id");
    users.forEach( async function(user) {
        let Bill = new Bill_Model({
            user_id : user._id,
            bill_reference : new RandomizerHelper.RandomizerHelpers().generate(),
            bill_amount : user.subscription_id.subscription_price,
            bill_status : 'pending'
        }); 
        await Bill.save();
    });
    console.log('bill created');
}

module.exports = {
    bill_payment_create
};