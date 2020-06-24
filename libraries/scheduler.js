const moment = require('../libraries/moment.js');
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

const bill_due_payment_checker = async function () {
    const bills = await Bill_Model.find({ 
        bill_create_date: { 
            $gte: moment().startOf('month').format("YYYY-MM-DD"), 
            $lte: moment().endOf('month').format("YYYY-MM-DD") 
        },
        bill_status: {$in: ['pending', 'due']}
    });
    bills.forEach( async function(bill) {
        const created_date = bill.bill_create_date;
        const today = moment().format('YYYY-MM-DD');
        const extend_days = moment(created_date, "YYYY-MM-DD").add(5, 'days');
        const formated_extend_date = moment(extend_days._d).format("YYYY-MM-DD");
        if(formated_extend_date === today){
            await User_Model.findByIdAndUpdate(bill.user_id, {
				payment_block   : true,
			}, {new: true}, function(err, res){
				if (err) return next(err);
                console.log('User blocked');
			});
        }
    });

}
module.exports = {
    bill_payment_create,
    bill_due_payment_checker
};