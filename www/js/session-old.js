//--- Save username and password in the phone -------------------------------
$(document).on('tap',"#login-save", function() {  
	var username = $("#username").val(); 
	var password = $("#password").val();
	if ((username != '') && (password != '')) {
		db.transaction(function (tx) {
			tx.executeSql("SELECT * FROM loginfo;",[], function (tx, result) {		
				if (result.rows.length > 0) {
					tx.executeSql("DELETE FROM loginfo;");		
				} 
				tx.executeSql("INSERT INTO loginfo (logUser, logPassword) VALUES(?,?);", [username, password]);		
				alert('Login information have been saved');
			});
		});	
	}
	$("#username").val(''); 
	$("#password").val('');
});	

//--- Upload class session into the server ----------------
function uploadClass(date, classid, userid) {
	var attendance = [];
	var behavior = [];
	var login = [];   
	var backup = {};
	db.transaction(function (tx) {
		tx.executeSql("SELECT className FROM classes WHERE classId =?; ",[classid], function(tx,result) {
			var classname = result.rows.item(0).className;
			login.push ({ 
				"userid" 	: userid,
				"class"		: classname,
				"session"	: date
			});
			tx.executeSql("SELECT studentName, attIn, attLate, attOut FROM attendance JOIN students ON attendance.studentId "+ 
			  " =students.studentId WHERE classId =? AND attSession =?;", [classid,date], function (tx, result2) {
				var dataset2 = result2.rows;
				if (dataset2.length > 0) {
					for (var i = 0, item = null; i < dataset2.length; i++) {
						attendance.push({ 
							"student" 	: dataset2.item(i).studentName,
							"arrival"  	: dataset2.item(i).attIn,
							"late"      : dataset2.item(i).attLate, 
							"dismissal" : dataset2.item(i).attOut 
						});
					}
					tx.executeSql("SELECT studentName, behMark, behIncidents FROM behavior JOIN students ON behavior.studentId "+
					 " =students.studentId WHERE classId =? AND behSession =?;", [classid,date], function (tx, result3) {
						var dataset3 = result3.rows;
						if (dataset3.length > 0) {
							for (var j = 0, item = null; j < dataset3.length; j++) {
								behavior.push({ 
									"student" 	: dataset3.item(j).studentName,
									"behavior"  : dataset3.item(j).behMark,
									"incidents" : dataset3.item(j).behIncidents
								});
							}
							backup = {"login":login, "attendance":attendance, "behavior":behavior, "update":true };
						} else {
							backup = {"login":login, "attendance":attendance, "update":true };
						}
						$.ajax({
							type	    : "POST",
							url         : 'http://cis-linux2.temple.edu/~tue87356/EP/php/backup.php',
							data        :  backup,
							dataType    : "json",
							cache       : false,
							crossDomain : true,
							success     : function(data) { alert(data.E); },
							error       : function() { alert('Failed!'); }
						});
					});
				} else {
					tx.executeSql("SELECT studentName, behMark, behIncidents FROM behavior JOIN students ON behavior.studentId "+
					 " =students.studentId WHERE classId =? AND behSession =?;", [classid,date], function (tx, result4) {
						var dataset4 = result4.rows;
						if (dataset4.length > 0) {
							for (var j = 0, item = null; j < dataset4.length; j++) {
								behavior.push({ 
									"student" 	: dataset4.item(j).studentName,
									"behavior"  : dataset4.item(j).behMark,
									"incidents" : dataset4.item(j).behIncidents, 
								});
							}
							backup = {"login":login, "behavior":behavior, "update":true };
							$.ajax({
								type	    : "POST",
								url         : 'http://cis-linux2.temple.edu/~tue87356/EP/php/backup.php',
								data        :  backup,
								dataType    : "json",
								cache       : false,
								crossDomain : true,
								success     : function(data) { alert(data); },
								error       : function() { alert('Failed!'); }
							});
						}	
					});
				}
			});
		});
	});
}

$(document).on('tap',"#btn-upload", function() {  
	var classU = $("#selected-backup").val();
	var startDateU = $("#start-date").val(); 
	var endDateU = $("#end-date").val();
	var currentclass, date;
	date = formatDate(startDateU); 
	//check class, range of time
	var abort = 0;
	var username = $("#username").val(); 
	var password = $("#password").val();
	if (classU != 'All My Classes') { 
		db.transaction(function (tx) {
			tx.executeSql("SELECT classId FROM classes WHERE className =?; ",[classU], function(tx,result0) {
				currentclass = result0.rows.item(0).classId;
				tx.executeSql("SELECT logUser, logPassword FROM loginfo;",[], function (tx, result) {		
					if (result.rows.length > 0) {
						username = result.rows.item(0).logUser;			
						password = result.rows.item(0).logPassword;
					} else {	
						if ((username == '') || (password == '')) {
							alert('Please provide username and password');
							abort = 1;
							return false;
						}
					}
					if (abort == 0 ) {
						$.ajax({
							type     : "POST",
							url      : 'http://cis-linux2.temple.edu/~tue87356/EP/php/login.php',
							data     : {method:'app', username:username, password:password},
							dataType : "json",
							success  : function(data) {
								if (data.Elena == 'invalid') {
									alert('Invalid username or password');
								} else {
									//alert('valid');     //need message if login fails
									uploadClass(date,currentclass,data.Elena);
								}
							} 
						});
					}
				});
			});
		});	
	}
});

function formatDate(input) {
	var year, day, month;
	year = input.substring(0,4);
	if (input.substring(8,9) == '0') { day = input.substring(9); }
	else { day = input.substring(8); }
	if (input.substring(5,6) == '0') { month = input.substring(6,7); }
	else { month = input.substring(5,7); }
	return month+'/'+day+'/'+year;
}
