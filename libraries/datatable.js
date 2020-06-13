const {Orders_Model} = require('../models');
const moment = require('../libraries/moment.js');
const mongoose = require('mongoose');
const debug = require('eyes').inspector({styles: {all: 'cyan'}});

const DT_agent_order_list = function (request, response, next) {
    
    var params = request.body;
    var order = params.order || [];
    var columns = params.columns || [];
    var brand_id = params.brand_id || "";
    var status = params.status || "";
    var daterange = params.daterange || "";
    var where_clause = {};

    if(brand_id){
        where_clause.brand_id = brand_id;
    }
    if(status){
        where_clause.order_status = status;
    }

    var searchStr = params.search.value;

    if(params.search.value){
            var regex = new RegExp(params.search.value, "i")
            searchStr = {
                $or: [
                    {'order_customer_name': regex},
                    {'order_customer_phone': regex},
                    {'order_reference': regex},
                ],
                "user_id" : mongoose.Types.ObjectId(request.session.userId) 

            };
    }else if(daterange){
        var date_array = daterange.split("-");
        var start_date =  request.helper.date_format(new Date(date_array[0]), "YYYY-MM-DD");
        var end_date   =  request.helper.date_format(new Date(date_array[1]), "YYYY-MM-DD");
        var formatted_start_date =  moment.utc(start_date).format();
        var formatted_end_date =  moment.utc(end_date).format();
        searchStr = { 
            'order_create_date': { $gt: formatted_start_date, $lt: formatted_end_date}, 
            "user_id" : mongoose.Types.ObjectId(request.session.userId)
        };
    }else{
         searchStr = {
            "user_id" : mongoose.Types.ObjectId(request.session.userId) 
         };
    }

    if (order && columns) {
        const sortByOrder = order.reduce((memo, ordr) => {
          const column = columns[ordr.column];
          memo[column.data] = ordr.dir === 'asc' ? 1 :  -1;
          return memo;
        }, {});
  
        if (Object.keys(sortByOrder).length) {
          sort = sortByOrder;
        }
    }


    var recordsTotal = 0;
    var recordsFiltered = 0;

    Orders_Model.countDocuments({"user_id" : mongoose.Types.ObjectId(request.session.userId)}, function(err, all_count){
        recordsTotal = all_count;
        Orders_Model.countDocuments(searchStr, function(err, filterd_count) {
            recordsFiltered = filterd_count;
            Orders_Model.find(searchStr, 'order_customer_name  order_customer_phone order_reference')
            .select("_id order_reference order_status order_create_date order_delete_request order_customer_name order_amount  order_customer_phone ")
            .where(where_clause)
            .skip(Number(params.start))
            .limit(Number(params.length))
            .sort(sort)
            .populate('brand_id',  'brand_name')
            .exec(function(err, results) {
                if (err) {
                    response.status(400).json({
                        message : err
                    });
                    return;
                }
                var data = JSON.stringify({
                    "draw": params.draw,
                    "recordsFiltered": recordsFiltered,
                    "recordsTotal": recordsTotal,
                    "data": results
                });
                response.send(data);
            });

        });

    });
    
}

const DT_admin_order_list = function (request, response, next) {
    
    var params = request.body;
    var order = params.order || [];
    var columns = params.columns || [];
    var brand_id = params.brand_id || "";
    var status = params.status || "";
    var agent_id = params.agent_id || "";
    var daterange = params.daterange || "";
    var where_clause = {};

    if(brand_id){
        where_clause.brand_id = brand_id;
    }
    if(status){
        where_clause.order_status = status;
    }
    if(agent_id){
        where_clause.user_id = agent_id;
    }
    var searchStr = params.search.value;

    if(params.search.value){
            var regex = new RegExp(params.search.value, "i")
            searchStr = {
                $or: [
                    {'order_customer_name': regex},
                    {'order_customer_phone': regex},
                    {'order_reference': regex},
                ]

            };
    }else if(daterange){
        var date_array = daterange.split("-");
        var start_date =  request.helper.date_format(new Date(date_array[0]), "YYYY-MM-DD");
        var end_date   =  request.helper.date_format(new Date(date_array[1]), "YYYY-MM-DD");
        var formatted_start_date =  moment.utc(start_date).format();
        var formatted_end_date =  moment.utc(end_date).format();
        searchStr = { 
            'order_create_date': { $gt: formatted_start_date, $lt: formatted_end_date}
        };
    }else{
         searchStr = {};
    }

    if (order && columns) {
        const sortByOrder = order.reduce((memo, ordr) => {
          const column = columns[ordr.column];
          memo[column.data] = ordr.dir === 'asc' ? 1 :  -1;
          return memo;
        }, {});
  
        if (Object.keys(sortByOrder).length) {
          sort = sortByOrder;
        }
    }


    var recordsTotal = 0;
    var recordsFiltered = 0;

    Orders_Model.countDocuments({}, function(err, all_count){
        recordsTotal = all_count;
        Orders_Model.countDocuments(searchStr, function(err, filterd_count) {
            recordsFiltered = filterd_count;
            Orders_Model.find(searchStr, 'order_customer_name  order_customer_phone order_reference')
            .select("_id order_reference order_status order_delete_request order_create_date order_customer_name  order_customer_phone ")
            .where(where_clause)
            .skip(Number(params.start))
            .limit(Number(params.length))
            .sort(sort)
            .populate('brand_id',  'brand_name')
            .populate('user_id',  'first_name  last_name')
            .exec(function(err, results) {
                if (err) {
                    response.status(400).json({
                        message : err
                    });
                    return;
                }
                var data = JSON.stringify({
                    "draw": params.draw,
                    "recordsFiltered": recordsFiltered,
                    "recordsTotal": recordsTotal,
                    "data": results
                });
                response.send(data);
            });

        });

    });
    
}

const DT_room_list = function(request, response, next) {
    var params = request.body;
    var order = params.order || [];
    var columns = params.columns || [];
    var hotel_id = params.hotel_id || "";
    var type = params.type || "";
    var searchStr = params.search.value;
    var where_clause = {};

    if(hotel_id){
        where_clause.hotel_id = hotel_id
    }

    if(type){
        where_clause.room_type = type
    }

    if(params.search.value){
            var regex = new RegExp(params.search.value, "i")
            searchStr = { $or: [{'room_type': regex }] };
    }else{
         searchStr = {};
    }

    if (order && columns) {
        const sortByOrder = order.reduce((memo, ordr) => {
          const column = columns[ordr.column];
          memo[column.data] = ordr.dir === 'asc' ? 1 :  -1;
          return memo;
        }, {});
  
        if (Object.keys(sortByOrder).length) {
          sort = sortByOrder;
        }
    }


    var recordsTotal = 0;
    var recordsFiltered = 0;

    Rooms_Model.countDocuments({}, function(err, all_count){
        recordsTotal = all_count;
        Rooms_Model.countDocuments(searchStr, function(err, filterd_count) {
            recordsFiltered = filterd_count;
            Rooms_Model.find(searchStr, 'room_type')
            .select("_id hotel_id room_capacity room_type room_price createdAt")
            .where(where_clause)
            .skip(Number(params.start))
            .limit(Number(params.length))
            .sort(sort)
            .populate('hotel_id', 'hotel_title')
            .exec(function(err, results) {
                if (err) {
                    response.status(400).json({
                        message : err
                    });
                    return;
                }
                var data = JSON.stringify({
                    "draw": params.draw,
                    "recordsFiltered": recordsFiltered,
                    "recordsTotal": recordsTotal,
                    "data": results
                });
                response.send(data);
            });

        });

    });
    
}



module.exports = {
    DT_agent_order_list,
    DT_admin_order_list
};