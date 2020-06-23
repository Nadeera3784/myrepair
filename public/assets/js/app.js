$(document).ready(function () {
if($("#DatatableHolder").length > 0){
    $("#DatatableHolder").dataTable({
		"pageLength": 10,
        isMobile: window.outerWidth < 800 ? true : false,
        responsive: window.outerWidth < 800 ? true : false, 
        "aLengthMenu": [[5, 10, 25, -1], [5, 10, 25, "All"]]
    });

    $('#DatatableHolder').delegate('#deleteLocation', 'click', function(){
		var location_id = $(this).attr('data-id');  
		lnv.confirm({
			title: 'Confirm',
			content: 'Are you sure you want to delete this location?',
			confirmBtnText: 'Yes',
			confirmHandler: function(){
				$.ajax({
					type: 'POST',
					url: AppHelper.baseUrl  +'admin/delete_locations',
					data: {location_id : location_id},
					dataType  : 'json',
					success: function(response){
						if(response.type == "success"){
							location.reload();
						}
					}
				}); 				
			},
			cancelBtnText: 'No',
			cancelHandler: function(){
		
			}
		})	
	});


	$('#DatatableHolder').delegate('#deleteSubscription', 'click', function(){
		var subscription_id = $(this).attr('data-id');  
		lnv.confirm({
			title: 'Confirm',
			content: 'Are you sure you want to delete this subscription?',
			confirmBtnText: 'Yes',
			confirmHandler: function(){
				$.ajax({
					type: 'POST',
					url: AppHelper.baseUrl  +'admin/delete_subscription',
					data: {subscription_id : subscription_id},
					dataType  : 'json',
					success: function(response){
						if(response.type == "success"){
							location.reload();
						}
					}
				}); 				
			},
			cancelBtnText: 'No',
			cancelHandler: function(){
		
			}
		})	
	});

	$('#DatatableHolder').delegate('#deleteUser', 'click', function(){
		var user_id = $(this).attr('data-id');  
		lnv.confirm({
			title: 'Confirm',
			content: 'Are you sure you want to delete this user?',
			confirmBtnText: 'Yes',
			confirmHandler: function(){
				$.ajax({
					type: 'POST',
					url: AppHelper.baseUrl  +'admin/delete_user',
					data: {user_id : user_id},
					dataType  : 'json',
					success: function(response){
						if(response.type == "success"){
							location.reload();
						}
					}
				}); 				
			},
			cancelBtnText: 'No',
			cancelHandler: function(){
		
			}
		})	
	});

	$('#DatatableHolder').delegate('#deleteBrand', 'click', function(){
		var brand_id = $(this).attr('data-id');  
		lnv.confirm({
			title: 'Confirm',
			content: 'Are you sure you want to delete this brand?',
			confirmBtnText: 'Yes',
			confirmHandler: function(){
				$.ajax({
					type: 'POST',
					url: AppHelper.baseUrl  +'admin/delete_brand',
					data: {brand_id : brand_id},
					dataType  : 'json',
					success: function(response){
						if(response.type == "success"){
							location.reload();
						}
					}
				}); 				
			},
			cancelBtnText: 'No',
			cancelHandler: function(){
		
			}
		})	
	});

	$('#DatatableHolder').delegate('#deleteAnnouncement', 'click', function(){
		var announcement_id = $(this).attr('data-id');  
		lnv.confirm({
			title: 'Confirm',
			content: 'Are you sure you want to delete this brand?',
			confirmBtnText: 'Yes',
			confirmHandler: function(){
				$.ajax({
					type: 'POST',
					url: AppHelper.baseUrl  +'admin/delete_announcement',
					data: {announcement_id : announcement_id},
					dataType  : 'json',
					success: function(response){
						if(response.type == "success"){
							location.reload();
						}
					}
				}); 				
			},
			cancelBtnText: 'No',
			cancelHandler: function(){
		
			}
		})	
	});

}

if($(".select2").length > 0){
	$('.select2').select2();
}

if($("#instantValidator").length > 0){
	$("#instantValidator").validate();
}

if($("#singleDatePicker").length > 0){
	$("#singleDatePicker").daterangepicker({
		singleDatePicker: true,
		minDate: moment().startOf('month').format('YYYY-MM-DD'),
        maxDate  : moment().endOf('month').format('YYYY-MM-DD'),
		locale: {
			format: 'YYYY-MM-DD'
		}
	});
}

if($("#daterange").length > 0){
	$('input[name="daterange"]').daterangepicker({
		autoUpdateInput: false,
		locale: {
			cancelLabel: 'Clear'
		}
	});
	$('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
		$(this).val(picker.startDate.format('YYYY/MM/DD') + ' - ' + picker.endDate.format('YYYY/MM/DD'));
	});
  
	$('input[name="daterange"]').on('cancel.daterangepicker', function(ev, picker) {
		$(this).val('');
	});
  
}

if($("#DatatableHolderAgentOrders").length > 0){
	$('#DatatableHolderAgentOrders').DataTable({
		"dom": "lfr<'#total_price'>tip",
		"initComplete": function(settings, json) {
			$("#total_price").text("");
		},
		"isMobile": window.outerWidth < 800 ? true : false,
        "responsive": window.outerWidth < 800 ? true : false, 
		"pageLength": 10,
		"processing": true, 
		"serverSide": true,
		'ajax': {
			'type': 'POST',
			'url': AppHelper.baseUrl +'agent/populate_DT_agent_order_list',
			"data": function (data) {
				data.brand_id = $('#brand_id').val();
				data.status = $('#status').val();
				data.daterange = $('#daterange').val();
			}
		},
		'columns':[
			{ 'data': 'order_reference'},
			{ 'data': 'brand_id.brand_name'},
			{ "data": "order_amount"},
			{ "data": "order_status"},
			{ 'data': 'order_create_date'},
			{ 'data': '_id'},
		],
		"columnDefs": [
		{
			"targets": [1], 
			"orderable": true,
			"render": function (data, type, row, meta ) {
				return  data[0].toUpperCase() +  data.slice(1);
			}
		},
		{
			"targets": [3], 
			"orderable": true,
			"render": function ( data, type, row, meta ) {
				return  '<span class="badge badge-default">'+data+'</span>';
			}
		},
		{
			"targets": [4], 
			"orderable": true,
			"render": function (data, type, row, meta ) {
				return  moment(data).format('YYYY-MM-DD');
			}
		},
		{
			"targets": [5], 
			"orderable": false,
			"render": function ( data, type, row, meta ) {
				var delete_request_status =  (row.order_delete_request != true)? " " : "disabled";
				return  '<a href="'+AppHelper.baseUrl+'agent/update_order/'+data+'" class="btn btn-xs btn-primary mr-5">Edit</a>'+
						'<a href="'+AppHelper.baseUrl+'agent/details_order/'+data+'" class="btn btn-xs btn-default mr-5">Details</a>'+
						'<a href="'+AppHelper.baseUrl+'agent/print_order/'+data+'" target="_blank" class="btn btn-xs btn-primary mr-5">Print</a>'+
						'<button type="button" class="btn btn-outline btn-xs btn-primary '+delete_request_status+'" id="delete_order" data-id="'+data+'">Delete</button>';
			}
		}],
		"footerCallback": function (tfoot, data, start, end, display) {
			var api = this.api(), data;

			var intVal = function ( i ) {
				return typeof i === 'string' ?
					i.replace(/[\$,]/g, '')*1 :
					typeof i === 'number' ?
						i : 0;
			};
 
			var total = api.column(2).data().reduce( function (a, b) {
					return intVal(a) + intVal(b);
				}, 0 );

			$('#total_price').text(total);  
		},
		
	});

	$('#applyAgentOrderListfilter').click(function(){ 
		$('#DatatableHolderAgentOrders').DataTable().ajax.reload(); 
	});

	$('#clearAgentOrderListfilter').click(function(){ 
		$('#brand_id').val("");
		$('#status').val("");
		$('#daterange').val("");
		$('#DatatableHolderAgentOrders').DataTable().ajax.reload(); 
	});

	$('#DatatableHolderAgentOrders').delegate('#delete_order', 'click', function(){
		var order_id = $(this).attr('data-id');  
		lnv.confirm({
			title: 'Confirm',
			content: 'Are you sure you want to delete this order?',
			confirmBtnText: 'Yes',
			confirmHandler: function(){
				$.ajax({
					type: 'POST',
					url: AppHelper.baseUrl  +'agent/delete_order',
					data: {order_id : order_id},
					dataType  : 'json',
					success: function(response){
						if(response.type == "success"){
							lnv.alert({
								title: 'Success',
								content: 'Your delete request has been sent successfully. The order will be removed after revision of administration.'
							}); 
							 $('#DatatableHolderAgentOrders').DataTable().ajax.reload(); 
						 }else{
							lnv.alert({
								title: 'Error',
								content: 'Somethig went wrong, please try again later.'
							}); 
						 }
					}
				}); 				
			},
			cancelBtnText: 'No',
			cancelHandler: function(){
		
			}
		})	
	});
  
	$('#download_agent_exportx').click(function(){
		var daterange = $('#daterange').val(); 
		$.ajax({
			type: 'POST',
			url: AppHelper.baseUrl  +'agent/agent_export_orders',
			data: {daterange : daterange},
			dataType  : 'json',
			// xhrFields: {
			// 	responseType: 'blob'
			// },
			success: function(response){
				// var a = document.createElement('a');
				// var url = window.URL.createObjectURL(response);
				// a.href = url;
				// a.download = 'myfile.pdf';
				// document.body.append(a);
				// a.click();
				// a.remove();
				// window.URL.revokeObjectURL(url);
				var blob = new Blob([response], { type: 'application/pdf' });
				var link = document.createElement('a');
				link.href = window.URL.createObjectURL(blob);
				link.download = filename;
		
				document.body.appendChild(link);
		
				link.click();
		
				document.body.removeChild(link);
			}
		}); 
	});
}

if($("#DatatableHolderAdminOrders").length > 0){
	$('#DatatableHolderAdminOrders').DataTable({
		"isMobile": window.outerWidth < 800 ? true : false,
        "responsive": window.outerWidth < 800 ? true : false, 
		"pageLength": 10,
		"processing": true, 
		"serverSide": true,
		'ajax': {
			'type': 'POST',
			'url': AppHelper.baseUrl +'admin/populate_DT_order_list',
			"data": function (data) {
				data.brand_id = $('#brand_id').val();
				data.status = $('#status').val();
				data.agent_id = $('#agent_id').val();
				data.daterange = $('#daterange').val();
			}
		},
		'columns':[
			{ 'data': 'order_reference'},
			{ 'data': 'user_id.first_name'},
			{ 'data': 'brand_id.brand_name'},
			{ "data": "order_status",},
			{ 'data': 'order_create_date'},
			{ 'data': '_id'},
		],
		"columnDefs": [
		{
			"targets": [1], 
			"orderable": true,
			"render": function (data, type, row, meta ) {
				return  data[0].toUpperCase() +  data.slice(1);
			}
		},
		{
			"targets": [3], 
			"orderable": true,
			"render": function ( data, type, row, meta ) {
				return  '<span class="badge badge-default">'+data+'</span>';
			}
		},
		{
			"targets": [4], 
			"orderable": true,
			"render": function (data, type, row, meta ) {
				return  moment(data).format('YYYY-MM-DD');
			}
		},
		{
			"targets": [5], 
			"orderable": false,
			"render": function ( data, type, row, meta ) {
				var delete_request_status =  (row.order_delete_request != true)? "request_status_none" : "request_status_active";
				return  '<a href="'+AppHelper.baseUrl+'admin/update_order/'+data+'" class="btn btn-xs btn-primary mr-5">Edit</a>'+
						 '<a href="'+AppHelper.baseUrl+'admin/details_order/'+data+'" class="btn btn-xs btn-default mr-5">Details</a>'+
						'<button type="button" class="btn btn-outline btn-xs btn-primary" id="delete_order" data-id="'+data+'">Delete  <span class="'+delete_request_status+'"></span></button>';
			}
		}]
		
	});

	$('#applyAdminOrderListfilter').click(function(){ 
		$('#DatatableHolderAdminOrders').DataTable().ajax.reload(); 
	});

	$('#clearAdminOrderListfilter').click(function(){ 
		$('#brand_id').val("");
		$('#status').val("");
		$('#daterange').val("");
		$('#agent_id').val("");
		$('#DatatableHolderAdminOrders').DataTable().ajax.reload(); 
	});

	$('#DatatableHolderAdminOrders').delegate('#delete_order', 'click', function(){
		var order_id = $(this).attr('data-id');  
		lnv.confirm({
			title: 'Confirm',
			content: 'Are you sure you want to delete this order?',
			confirmBtnText: 'Yes',
			confirmHandler: function(){
				$.ajax({
					type: 'POST',
					url: AppHelper.baseUrl  +'admin/delete_order',
					data: {order_id : order_id},
					dataType  : 'json',
					success: function(response){
						if(response.type == "success"){
							lnv.alert({
								title: 'Success',
								content: 'Order has been deleted successfully'
							}); 
							 $('#DatatableHolderAdminOrders').DataTable().ajax.reload(); 
						 }else{
							lnv.alert({
								title: 'Error',
								content: 'Somethig went wrong, please try again later.'
							}); 
						 }
					}
				}); 				
			},
			cancelBtnText: 'No',
			cancelHandler: function(){
		
			}
		})	
	});

}

if($("#DatatableHolderAgentBilling").length > 0){
	$('#DatatableHolderAgentBilling').DataTable({
		"isMobile": window.outerWidth < 800 ? true : false,
        "responsive": window.outerWidth < 800 ? true : false, 
		"pageLength": 10,
		"processing": true, 
		"serverSide": true,
		'ajax': {
			'type': 'POST',
			'url': AppHelper.baseUrl +'agent/populate_DT_agent_billing_list',
			"data": function (data) {
				data.payment_method = $('#payment_method').val();
				data.status = $('#status').val();
				data.daterange = $('#daterange').val();
			}
		},
		'columns':[
			{ 'data': 'bill_reference'},
			{ 'data': 'bill_amount'},
			{ "data": "bill_status"},
			{ 'data': 'bill_create_date'},
			{ 'data': '_id'},
		],
		"columnDefs": [
		{
			"targets": [1], 
			"orderable": true,
			"render": function (data, type, row, meta ) {
				return  data[0].toUpperCase() +  data.slice(1);
			}
		},
		{
			"targets": [2], 
			"orderable": true,
			"render": function ( data, type, row, meta ) {
				return  '<span class="badge badge-default">'+data+'</span>';
			}
		},
		{
			"targets": [3], 
			"orderable": true,
			"render": function (data, type, row, meta ) {
				return  moment(data).format('YYYY-MM-DD');
			}
		},
		{
			"targets": [4], 
			"orderable": false,
			"render": function ( data, type, row, meta ) {
				return  '<a href="'+AppHelper.baseUrl+'agent/update_bill/'+data+'" class="btn btn-xs btn-primary mr-5">Edit</a>'+
						'<a href="'+AppHelper.baseUrl+'agent/details_bill/'+data+'" class="btn btn-xs btn-default mr-5">Details</a>';
			}
		}]
		
	});

	$('#applyAgentBillingListfilter').click(function(){ 
		$('#DatatableHolderAgentBilling').DataTable().ajax.reload(); 
	});

	$('#clearAgentBillingListfilter').click(function(){ 
		$('#payment_method').val("");
		$('#status').val("");
		$('#daterange').val("");
		$('#DatatableHolderAgentBilling').DataTable().ajax.reload(); 
	});

}

if($("#DatatableHolderAdminBilling").length > 0){
	$('#DatatableHolderAdminBilling').DataTable({
		"isMobile": window.outerWidth < 800 ? true : false,
        "responsive": window.outerWidth < 800 ? true : false, 
		"pageLength": 10,
		"processing": true, 
		"serverSide": true,
		'ajax': {
			'type': 'POST',
			'url': AppHelper.baseUrl +'admin/populate_DT_admin_billing_list',
			"data": function (data) {
				data.user_id = $('#agent_id').val();
				data.payment_method = $('#payment_method').val();
				data.status = $('#status').val();
				data.daterange = $('#daterange').val();
			}
		},
		'columns':[
			{ 'data': 'bill_reference'},
			{ 'data': 'user_id.first_name'},
			{ 'data': 'bill_amount'},
			{ "data": "bill_status"},
			{ 'data': 'bill_create_date'},
			{ 'data': '_id'},
		],
		"columnDefs": [
		{
			"targets": [1], 
			"orderable": true,
			"render": function (data, type, row, meta ) {
				return  data + " " + row.user_id.last_name;
			}
		},
		{
			"targets": [3], 
			"orderable": true,
			"render": function ( data, type, row, meta ) {
				return  '<span class="badge badge-default">'+data+'</span>';
			}
		},
		{
			"targets": [4], 
			"orderable": true,
			"render": function (data, type, row, meta ) {
				return  moment(data).format('YYYY-MM-DD');
			}
		},
		{
			"targets": [5], 
			"orderable": false,
			"render": function ( data, type, row, meta ) {
				return  '<a href="'+AppHelper.baseUrl+'admin/update_bill/'+data+'" class="btn btn-xs btn-primary mr-5">Edit</a>'+
						'<a href="'+AppHelper.baseUrl+'admin/details_bill/'+data+'" class="btn btn-xs btn-default mr-5">Details</a>'+
						'<button type="button" class="btn btn-outline btn-xs btn-primary" id="delete_bill" data-id="'+data+'">Delete</button>';
			}
		}],
		// "footerCallback": function (tfoot, data, start, end, display) {
		// 	var api = this.api(), data;

		// 	var intVal = function ( i ) {
		// 		return typeof i === 'string' ?
		// 			i.replace(/[\$,]/g, '')*1 :
		// 			typeof i === 'number' ?
		// 				i : 0;
		// 	};
 
		// 	var total = api.column(2).data().reduce( function (a, b) {
		// 			return intVal(a) + intVal(b);
		// 		}, 0 );

		// 	$('#total_price').text(total);  
		// },
		
	});

	$('#applyAdminBillingListfilter').click(function(){ 
		$('#DatatableHolderAdminBilling').DataTable().ajax.reload(); 
	});

	$('#clearAdminBillingListfilter').click(function(){ 
		$('#agent_id').val("");
		$('#payment_method').val("");
		$('#status').val("");
		$('#daterange').val("");
		$('#DatatableHolderAdminBilling').DataTable().ajax.reload(); 
	});

	$('#DatatableHolderAdminBilling').delegate('#delete_bill', 'click', function(){
		var bill_id = $(this).attr('data-id');  
		lnv.confirm({
			title: 'Confirm',
			content: 'Are you sure you want to delete this bill?',
			confirmBtnText: 'Yes',
			confirmHandler: function(){
				$.ajax({
					type: 'POST',
					url: AppHelper.baseUrl  +'admin/delete_bill',
					data: {bill_id : bill_id},
					dataType  : 'json',
					success: function(response){
						if(response.type == "success"){
							lnv.alert({
								title: 'Success',
								content: 'Bill has been deleted successfully'
							}); 
							 $('#DatatableHolderAdminBilling').DataTable().ajax.reload(); 
						 }else{
							lnv.alert({
								title: 'Error',
								content: 'Somethig went wrong, please try again later.'
							}); 
						 }
					}
				}); 				
			},
			cancelBtnText: 'No',
			cancelHandler: function(){
		
			}
		})	
	});

}


if($("#roomBlockSearch").length > 0){
	$('#roomBlockSearch').click(function() {
		var hotel_id = $("#hotel_id").val();
		$.ajax({
			type: 'POST',
			url: AppHelper.baseUrl  +'admin/get_room_block_rooms',
			data: {hotel_id : hotel_id},
			dataType  : 'html',
			success: function(response){
				console.log(response);
				$("#ajax-rooms").html(response);
			}
		}); 
	});

	$('#clearBlockSearch').click(function(){ 
		$('#hotel_id').val("");
		$('#daterange').val("");
	});
}

if($('#announcement_type').length > 0){
	$('#announcement_type').on('change', function() {
	  if(this.value == "private"){
		  $('#typeToggle').show();
	  }else{
		  $('#typeToggle').hide();
	  }
	});
}

if($('#agent_week_report').length > 0){
	$.ajax({
	  url: AppHelper.baseUrl +"agent/agent_week_report",
	  method: "GET",
	  dataType: "json",
	  success: function(response) {
		Morris.Bar({
		  element: 'agent_week_report',
		  data: response.message.weekdata,
		  xkey: 'date',
		  ykeys: ['booking'],
		  labels: ['Amount(Rs)'],
		  barRatio: 0.4,
		  xLabelAngle: 35,
		  pointSize: 1,
		  barOpacity: 1,
		  pointStrokeColors:['#ff6028'],
		  behaveLikeLine: true,
		  grid: true,
		  gridTextColor:'#878787',
		  hideHover: 'auto',
		  smooth: true,
		  barColors: ['#3324f5'],
		  resize: true,
		  gridTextFamily:"Roboto"
		});  
	  }
	});
}

if($('#agent_month_report').length > 0){
	$.ajax({
	  url: AppHelper.baseUrl +"agent/agent_month_report",
	  method: "GET",
	  dataType: "json",
	  success: function(response) {
		Morris.Bar({
		  element: 'agent_month_report',
		  data: response.message.weekdata,
		  xkey: 'date',
		  ykeys: ['booking'],
		  labels: ['Amount(Rs)'],
		  barRatio: 0.4,
		  xLabelAngle: 35,
		  pointSize: 1,
		  barOpacity: 1,
		  pointStrokeColors:['#ff6028'],
		  behaveLikeLine: true,
		  grid: true,
		  gridTextColor:'#878787',
		  hideHover: 'auto',
		  smooth: true,
		  barColors: ['#3324f5'],
		  resize: true,
		  gridTextFamily:"Roboto"
		});  
	  }
	});
}

if($('#agent_year_report').length > 0){
	$.ajax({
	  url: AppHelper.baseUrl +"agent/agent_year_report",
	  method: "GET",
	  dataType: "json",
	  success: function(response) {
		Morris.Bar({
		  element: 'agent_year_report',
		  data: response.message.weekdata,
		  xkey: 'date',
		  ykeys: ['booking'],
		  labels: ['Amount(Rs)'],
		  barRatio: 0.4,
		  xLabelAngle: 35,
		  pointSize: 1,
		  barOpacity: 1,
		  pointStrokeColors:['#ff6028'],
		  behaveLikeLine: true,
		  grid: true,
		  gridTextColor:'#878787',
		  hideHover: 'auto',
		  smooth: true,
		  barColors: ['#3324f5'],
		  resize: true,
		  gridTextFamily:"Roboto"
		});  
	  }
	});
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
var target = $(e.target).attr("href");
switch (target) {
	case "#earningsW":        
	$(window).trigger('resize');
	break;
	case "#earningsM":        
	$(window).trigger('resize');
	break;
	case "#earningsY":        
	$(window).trigger('resize');
	break;
}
});

});