//--- Bunch to read the classId using callback ----------------  
var errCallback = function(){ alert("database error.");	};
var classNameToId = function(name, successCallback){
					db.transaction(function(tx){
						tx.executeSql("SELECT classId FROM classes WHERE className = ?;", [name],
							function(tx, result){successCallback(result);}, errCallback);
						});
					};
var readClassID = function(result){                
					if (result.rows.length > 0) {
						var item = result.rows.item(0);
						classID = item['classId'];
					}	
				};			
var classID;          //Invoke it with:  classNameToId(input, readClassID);

//--- STUDENTS  /  STUDENTS  /  STUDENTS / STUDENTS / STUDENTS / STUDENTS ------------------------------- 

//--- Load the list of student for edit --------------------------
function showStudents(input) {    //input is the selected class 
	if (arguments.length == 1) { classNameToId(input, readClassID); }       
	$('#list-students li').remove();
	$("#list-students").append('<li class="list-group-item disabled"><input type="text" id="input-new-student" class="form-control" placeholder="type a new student name..." style="display:none"/></li>');    
	db.transaction(function (tx) {
		tx.executeSql("SELECT studentName, categoryTag FROM students JOIN class_students ON students.studentId = "+
			"class_students.studentId LEFT OUTER JOIN categories ON categories.categoryId =class_students.categoryId "+
			"WHERE class_students.classId = ? ORDER BY studentName;",[classID], function (tx, result){		
			dataset = result.rows;                  
			for (var i = 0, item = null; i < dataset.length; i++) {
				item = dataset.item(i);        
				var studentNAME = item['studentName'];  
				var categoryTAG = item['categoryTag'];  
				if ((categoryTAG == null) ||(categoryTAG == 0)) { 
					$("#list-students").append('<li class="list-group-item">'+ studentNAME +'</li>');
				} else {
					$("#list-students").append('<li class="list-group-item">' + studentNAME +'<span class="badge">'+ categoryTAG +'</span></li>');
				}
			}  			
		});	
	});     
	$("#input-new-student").val(''); 
}
//--- Load the list of student for attendance -------------------- 
function showStudentsforAtt() {    
//	if (arguments.length == 1) { classNameToId(input, readClassID); }     
	$('#list-students li').remove();
	var date = new Date().toLocaleDateString();	
	db.transaction(function (tx) {
		tx.executeSql("SELECT studentName, attLate, attIn, attOut FROM students INNER JOIN attendance ON students.studentId = "+
			"attendance.studentId WHERE attendance.classId = ? AND attendance.attSession =? ORDER BY studentName;",[classID,date], function (tx, result){		
			dataset = result.rows;                  
			for (var i = 0, item = null; i < dataset.length; i++) {
				item = dataset.item(i);        
				var studentNAME = item['studentName'];     
				var attLATE = item['attLate'];  
				var attIN = item['attIn'];  
				var attOUT = item['attOut']; 
				$("#list-students").append('<li class="list-group-item">'+ studentNAME +'<span class="out"></span><span class="in"></span><span class="badge"></span></li>');
				if (attLATE != null) { $("#list-students li:last-child .badge").html(attLATE); }
				if (attIN != null) { $("#list-students li:last-child .in").html(attIN); }
				if (attOUT != null) { $("#list-students li:last-child .out").html(attOUT); }
				
			}  			
		});	
	});     
}
//--- Quicksave in students attendance ---------------------- 
function quickSave() {
var input = $("#search-input").val();
	var studentID, newstudentID;
	if (input != "") {                   
		db.transaction(function(tx) {
			tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [input], function(tx, result) {
				if (result.rows.length > 0) {    //it exist in student table
					studentID = result.rows.item(0).studentId; 
					tx.executeSql("SELECT * FROM class_students WHERE classId = ? AND studentId = ?;", [classID,studentID], function(tx, newresult) {
						if (newresult.rows.length == 0) {
							tx.executeSql("INSERT INTO class_students (classId,studentId) VALUES (?,?);", [classID,studentID]);
							var date = new Date().toLocaleDateString();						
							tx.executeSql("SELECT attId FROM attendance WHERE classId=? AND attSession=?;", [classID,date], function (tx, result2) {
								if (result2.rows.length > 0) {  
									tx.executeSql("INSERT INTO attendance (studentId, classId, attSession) VALUES (?,?,?);", [studentID,classID,date]);
								}
								tx.executeSql("SELECT behId FROM behavior WHERE classId=? AND behSession=?;", [classID,date], function (tx, result3) {
									if (result3.rows.length > 0) {  
										tx.executeSql("INSERT INTO behavior (studentId, classId, behSession,behMark) VALUES (?,?,?,'well');", [studentID,classID,date]);
									}
								});
							});
						}
					});
				} else {    //it doesn't
					tx.executeSql("INSERT INTO students (studentName) VALUES (?);", [input]);
					tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [input], function(tx, newresult) {
						newstudentID = newresult.rows.item(0).studentId;
						tx.executeSql("INSERT INTO class_students (classId,studentId) VALUES (?,?);", [classID,newstudentID]);
						var date = new Date().toLocaleDateString();						
						tx.executeSql("SELECT attId FROM attendance WHERE classId=? AND attSession=?;", [classID,date], function (tx, result4) {
							if (result4.rows.length > 0) {  
								tx.executeSql("INSERT INTO attendance (studentId, classId, attSession) VALUES (?,?,?);", [newstudentID,classID,date]);
							}
							tx.executeSql("SELECT behId FROM behavior WHERE classId=? AND behSession=?;", [classID,date], function (tx, result5) {
								if (result5.rows.length > 0) {  
									tx.executeSql("INSERT INTO behavior (studentId, classId, behSession, behMark) VALUES (?,?,?, 'well');", [newstudentID,classID,date]);
								}
							});
						});
					});
				}   
			});
		});		
		showStudentsforAtt();
	} 
}

//--- Load the list of student for behavior ---------------------- 
function showStudentsforBehv() {    
//	if (arguments.length == 1) { classNameToId(input, readClassID); }     
	$('#list-students li').remove();
	var date = new Date().toLocaleDateString();	
	db.transaction(function (tx) {
		tx.executeSql("SELECT studentName, behMark FROM students INNER JOIN behavior ON students.studentId = "+
		 "behavior.studentId WHERE behavior.classId = ? AND behavior.behSession =? ORDER BY studentName;",[classID,date], function (tx, result){		
			dataset = result.rows;                  
			for (var i = 0, item = null; i < dataset.length; i++) {
				var item = dataset.item(i);        
				var studentNAME = item['studentName'];     
				var behavior = item['behMark']; 
				$("#list-students").append('<li class="list-group-item">'+ studentNAME +'<span></span></li>');
				if (behavior == 'well') { 
					$("#list-students li:last-child span").removeClass().addClass('icon icon-smiley2'); 
					$("#list-students li:last-child span").html(''); 
				} else if (behavior == 'reg'){ 
					$("#list-students li:last-child span").removeClass().addClass('icon icon-neutral2'); 
					$("#list-students li:last-child span").html(' !'); 
				} else if (behavior == 'bad'){ 
					$("#list-students li:last-child span").removeClass().addClass('icon icon-sad2'); 
					$("#list-students li:last-child span").html(' !!!'); 
				}
			}  			
		});	
	});     
}
//--- Add a new student to the selected class --------------------
function addStudentToClass() {    //if new student add to both class and DB               
    var input = $("#input-new-student").val();
	var studentID, newstudentID;
	if (input != "") {                   
		db.transaction(function(tx) {
			tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [input], function(tx, result) {
				if (result.rows.length > 0) {
					studentID = result.rows.item(0).studentId; 
					tx.executeSql("SELECT * FROM class_students WHERE classId = ? AND studentId = ?;", [classID,studentID], function(tx, newresult) {
						if (newresult.rows.length > 0) {
							$("#input-new-student").val(''); 
						} else {
							tx.executeSql("INSERT INTO class_students (classId,studentId) VALUES (?,?);", [classID,studentID]);
							var date = new Date().toLocaleDateString();						
							tx.executeSql("SELECT attId FROM attendance WHERE classId=? AND attSession=?;", [classID,date], function (tx, result) {
								if (result.rows.length != 0) {  
									tx.executeSql("INSERT INTO attendance (studentId, classId, attSession) VALUES (?,?,?);", [studentID,classID,date]);
								}
							});
						}
					});
				} else {
					tx.executeSql("INSERT INTO students (studentName) VALUES (?);", [input]);
					tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [input], function(tx, newresult) {
						newstudentID = newresult.rows.item(0).studentId;
						tx.executeSql("INSERT INTO class_students (classId,studentId) VALUES (?,?);", [classID,newstudentID]);
						var date = new Date().toLocaleDateString();						
						tx.executeSql("SELECT attId FROM attendance WHERE classId=? AND attSession=?;", [classID,date], function (tx, result) {
							if (result.rows.length != 0) {  
								tx.executeSql("INSERT INTO attendance (studentId, classId, attSession) VALUES (?,?,?);", [studentID,classID,date]);
							}
						});
					});
				}   
			});
		});		
		showStudents();
	} else {
		if ($("#input-new-student").css('display')== 'block') {
			$("#input-new-student").css('display','none');
		} else {
			$("#input-new-student").css('display','block');
			$("#input-new-student").focus();
		}
	}
}
//--- Delete multiple students from the selected class ----------- 	
function deleteStudents() {
	$("#list-students li").each( function() {
		var selection = $(this);                           
		if (selection.hasClass('active')) {                              
			var selectionContent = selection.html();         
			var locate = selectionContent.lastIndexOf("<span");
			var thestudent;
			if (locate == -1) {
				thestudent = selectionContent;
			} else {     
				thestudent = selectionContent.substring(0,locate);
			}                                
			db.transaction(function (tx) {  
				tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function(tx, result) {
					var studentID = result.rows.item(0).studentId; 
					tx.executeSql("DELETE FROM class_students WHERE classId =? AND studentId =?;", [classID,studentID]);
				});
			});			//need to specify if delete from students table when is not used for any class
		}
	});
	showStudents();
}
//--- When click 'save' under STUDENT EDIT -----------------------
function saveStudentForm() {                                           
	var input = $('#student-edit-text').html();
	var newname = $("#edit-student-name").val();
	var category = $('#selected-category').val();
	var categoryTag = $('#category-tag').val();
	var comments = $("#edit-student-comments").val();                 	
	// If is a new category save it in 'categories' table
	if ((category != '') && (categoryTag !='')) {
		db.transaction(function (tx) { 	
			tx.executeSql("SELECT categoryId FROM categories WHERE categoryName = ?;", [category], function (tx, result) {
				var dataset = result.rows.length;
				if (dataset == 0) {
					tx.executeSql("INSERT INTO categories (categoryName, categoryTag) VALUES (?,?);", [category,categoryTag]);	
				}
			});
		});
	}	
	if (newname != "") {
		if (newname==input) {                         
			db.transaction(function (tx) {
				tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [input], function(tx, result) {
					var studentID = result.rows.item(0).studentId; 
					tx.executeSql("UPDATE students SET studentComments=? WHERE studentId=?;", [comments,studentID]);
					if ((category != '') && (categoryTag !='')) {
						tx.executeSql("SELECT categoryId FROM categories WHERE categoryName = ?;", [category], function(tx, result2) {
							var categoryID = result2.rows.item(0).categoryId; 
								tx.executeSql("UPDATE class_students SET categoryId=? WHERE classId =? AND studentId=?;", [categoryID,classID,studentID]);
						});
					} else {
						var categoryID = 0;	
						tx.executeSql("UPDATE class_students SET categoryId=? WHERE classId =? AND studentId=?;", [categoryID,classID,studentID]);	
					}
				});
			});	 
			btnReturn();
		} else {      //verify is new name already exist
			db.transaction(function (tx) {    
				tx.executeSql("SELECT * FROM students WHERE studentName = ?;", [newname], function (tx, result) {
					var dataset = result.rows.length;
					if (dataset > 0) {
						alert('That student already exist!');
						return; 
					} else {
						tx.executeSql("INSERT INTO students (studentName, studentComments) VALUES (?,?);", [newname,comments]);
						tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [input], function (tx, result) {
							var item = result.rows.item(0);
							var studentID = item['studentId']; 
							tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [newname], function (tx, result2) {
								var item2 = result2.rows.item(0);
								var newstudentID = item2['studentId']; 
								if ((category != '') && (categoryTag !='')) {
									tx.executeSql("SELECT categoryId FROM categories WHERE categoryName = ?;", [category], function(tx, result3) {
										var item3 = result3.rows.item(0);
										var categoryID = item3['categoryId']; 
										tx.executeSql("UPDATE class_students SET studentId=?, categoryId=? WHERE classId =? AND studentId=?;", [newstudentID,categoryID,classID,studentID]);
									});
								} else {
									var categoryID = 0;	
									tx.executeSql("UPDATE class_students SET studentId=?, categoryId=? WHERE classId =? AND studentId=?;", [newstudentID,categoryID,classID,studentID]);	
								}
							});
						});
					btnReturn();
					}
				});
			});
		}
	}
}
//--- Clear fields in STUDENT EDIT form --------------------------
function clearStudentForm() {
	$('#edit-student-name').val('');		
	$('#edit-student-comments').val('');		
	$('#selected-category').val('');
	$('#category-tag').val('');
}
//--- Typeahead for students -------------------------------------
$(document).on('focus', "#input-new-student", function() {
   db.transaction(function (tx) {
		tx.executeSql("SELECT studentName FROM students ORDER BY studentName;",[], function (tx, result){		
			var typeaheadStudents = [];
			var dataset = result.rows;                  
			for (var i = 0; i < dataset.length; i++) {
				var item = dataset.item(i);
				typeaheadStudents.push(item['studentName']); 
			}
			$("#input-new-student").autocomplete({ 
				source: typeaheadStudents
			});
		});
	});
});  
//--- Close all panels under the page STUDENT --------------------
function closeStudentPanels() {
	$('#panel-students-main').css('display','none');
	$('#panel-students-student-edit').css('display','none');
	$('#buttons-track-behavior').css('display','none');
	$('#buttons-track-attendance').css('display','none');
	$('#buttons-student-edit').css('display','none');
	$('#panel-body-category-edit').css('display','none');
	$('#panel-body-student-edit').css('display','none');
	$('#panel-body-incident-edit').css('display','none');
	$('#two-buttons-student').css('display','none');
	$('#buttons-category-edit').css('display','none');
	$('#buttons-incident-edit').css('display','none');
	$('#btnIncident').removeClass('active');
	$('#top-buttons').css('display','none');
	$('#top-buttons-behv').css('display','none');
	$('.page-header h1').css('display','none');
	$('#buttons-student-incident-edit').css('display','none');
	$('#panel-body-student-incidents').css('display','none');
}

//--- ATTENDANCE  /  ATTENDANCE  /  ATTENDANCE / ATTENDANCE / ATTENDANCE / ATTENDANCE ------------------- 

//--- Delete content from search box ----------------------------- 
$(document).on('swipeleft',"#search-input",function() {
	$("#search-input").val('');	
});
//--- Trigger when buttons for 'attendance' are clicked ----------   
$(document).unbind('click').on('click', "#buttons-track-attendance .btn-group>.btn", function(){   
	var caller = $(this);
	if (caller.hasClass('active')) {      
		caller.removeClass("active");
	} else {                                 
		caller.addClass("active").siblings().removeClass("active");
	}
});
//---  When a student is click to check attendance --------------- 
$(document).on('tap', '#list-students li', function() {             
	if ($('#buttons-track-attendance').css('display') == 'block') {
		var caller = $(this);
		var thestudent;                                               
		var selectionContent = caller.html();                     
		var locate = selectionContent.indexOf("<span");  
		if (locate == -1) {
			thestudent = selectionContent;
		} else {     
			thestudent = selectionContent.substring(0,locate);
		}                                                                
		var attTIME = new Date().toLocaleTimeString();                 
		var date = new Date().toLocaleDateString();	         
		if ($('#btnAttend').hasClass('active') == true) {
			db.transaction(function (tx) {
				tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function (tx, result) {
					var studentID = result.rows.item(0).studentId;
					tx.executeSql("UPDATE attendance SET attIn=? WHERE studentId=? AND classId=? AND attSession=?;", [attTIME,studentID,classID,date]);
					caller.children(".in").html(attTIME);   
				});   
			});		
		} else if ($('#btnLate').hasClass('active') == true) {
			db.transaction(function (tx) {
				if (!(caller.children('.in').html()))  {
					tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function (tx, result) {
						var studentID = result.rows.item(0).studentId;
						tx.executeSql("UPDATE attendance SET attIn=?, attLate=? WHERE studentId=? AND classId=? AND attSession=?;", [attTIME,"L",studentID,classID,date]);
						caller.children(".badge").html("L"); 
						caller.children(".in").html(attTIME);
					});   
				} else {
					tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function (tx, result) {
						var studentID = result.rows.item(0).studentId;
						tx.executeSql("UPDATE attendance SET attLate=? WHERE studentId=? AND classId=? AND attSession=?;", ["L",studentID,classID,date]);
						caller.children(".badge").html("L"); 
					});
				}
			});	
		} else if ($('#btnDismiss').hasClass('active') == true) {
			db.transaction(function (tx) {
				tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function (tx, result) {
					var studentID = result.rows.item(0).studentId;
					tx.executeSql("UPDATE attendance SET attOut=? WHERE studentId=? AND classId=? AND attSession=?;", [attTIME,studentID,classID,date]);
					caller.children(".out").html(attTIME);   
				});   
			});	
		}  
	}
});
//---  When a student is dblclick to uncheck attendance ---------- 
$(document).on('swipeleft', '#list-students li', function() {             
	var caller = $(this);
	var thestudent;                                               
	var selectionContent = caller.html();                     
	var locate = selectionContent.indexOf("<span");  
	var date = new Date().toLocaleDateString();
	if (locate == -1) {
		thestudent = selectionContent;
	} else {     
		thestudent = selectionContent.substring(0,locate);
	}                                                                
	if ($('#btnAttend').hasClass('active') == true) {
		db.transaction(function (tx) {
			tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function (tx, result) {
				var studentID = result.rows.item(0).studentId;
				tx.executeSql("UPDATE attendance SET attIn=?, attLate=?, attOut=? WHERE studentId=? AND classId=? AND attSession=?;", ['','','',studentID,classID,date]);
				caller.children(".in").html('');   
				caller.children(".badge").html('');
				caller.children(".out").html('');
			});   
		});		
	} else if ($('#btnLate').hasClass('active') == true) {
		db.transaction(function (tx) {
			tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function (tx, result) {
				var studentID = result.rows.item(0).studentId;
				tx.executeSql("UPDATE attendance SET attLate=? WHERE studentId=? AND classId=? AND attSession=?;", ['',studentID,classID,date]);
				caller.children(".badge").html(''); 
			});   
		});	
	} else if ($('#btnDismiss').hasClass('active') == true) {
		db.transaction(function (tx) {
			tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function (tx, result) {
				var studentID = result.rows.item(0).studentId;
				tx.executeSql("UPDATE attendance SET attOut=? WHERE studentId=? AND classId=? AND attSession=?;", ['',studentID,classID,date]);
				caller.children(".out").html('');   
			});   
		});	
	}    
});
//--- Typeahead for search ---------------------------------------
$(document).on('focus', "#search-input", function() {
   db.transaction(function (tx) {
		tx.executeSql("SELECT studentName FROM students ORDER BY studentName;",[], function (tx, result){		
			var typeaheadStudents = [];
			var dataset = result.rows;                  
			for (var i = 0; i < dataset.length; i++) {
				var item = dataset.item(i);
				typeaheadStudents.push(item['studentName']); 
			}
			$("#search-input").autocomplete({ 
				source: typeaheadStudents
			});
		});
	});
});  
//--- to set focus to li  ***********NOT READY
function giveFocus() {   
	var thestudent;      
	var target = $('#search-input').val();
	$("#list-students li").each( function() {
		var element = $(this);
		var selection = element.html();                     
		var locate = selection.indexOf("<span");  
		if (locate == -1) {
			thestudent = selection;
		} else {     
			thestudent = selection.substring(0,locate);
		}                                                                
		if (thestudent == target) {
		
		  $('html, body').animate({
        scrollTop: element.offset().top - 150
    }, 400);
			
			// var top_offset = element.position().top;
			// element.animate({
				// 'margin-top': 95 - top_offset 
			// });
			             
			return false;
		}
	});
}  
//--- Load filter list in ATTENDANCE ----------------------------- 
$(document).on('filterOptions', function() {
	$('#filters-att li').not(':nth-child(-n+5)').remove();  
	db.transaction(function (tx) {
		tx.executeSql("SELECT DISTINCT categoryName FROM categories JOIN class_students ON "+
		  "categories.categoryId = class_students.categoryId WHERE class_students.classId = ? "+
		  "ORDER BY categoryName;",[classID], function (tx, result){		
			var dataset = result.rows;                  
			for (var i = 0; i < dataset.length; i++) {
				var item = dataset.item(i).categoryName;  
				$("#filters-att").append('<li><a>'+ item +'</a></li>');
			}
		});	
	});
}); 

//--- When selected a filter criteria ---------------------------- 
$(document).on('tap', '#filters-att li', function() {  
	var caller = $(this);
	var option = caller.children('a').html();    
 //--- embedded showStudentsforAtt ---
	$('#list-students li').remove();
	var date = new Date().toLocaleDateString();	
	db.transaction(function (tx) {
		tx.executeSql("SELECT studentName, attLate, attIn, attOut FROM students INNER JOIN attendance ON students.studentId = "+
			"attendance.studentId WHERE attendance.classId = ? AND attendance.attSession =? ORDER BY studentName;",[classID,date], function (tx, result){		
			dataset = result.rows;                  
			for (var i = 0, item = null; i < dataset.length; i++) {
				item = dataset.item(i);        
				var studentNAME = item['studentName'];     
				var attLATE = item['attLate'];  
				var attIN = item['attIn'];  
				var attOUT = item['attOut']; 
				$("#list-students").append('<li class="list-group-item">'+ studentNAME +'<span class="out"></span><span class="in"></span><span class="badge"></span></li>');
				if (attLATE != null) { $("#list-students li:last-child .badge").html(attLATE); }
				if (attIN != null) { $("#list-students li:last-child .in").html(attIN); }
				if (attOUT != null) { $("#list-students li:last-child .out").html(attOUT); }
			}
			//-- remove elements that doesn't match filter criteria	
			if (option == 'Attend') {
				$('#list-students li').each( function() {
					var element = $(this);
					if (element.children('.in').html() == '') { element.remove(); }
				});
			} else if (option == 'Late') {
				$('#list-students li').each( function() {
					var element = $(this);
					if (element.children('.badge').html() == '') { element.remove(); }
				});
			} else if (option == 'Dismissal') {
				$('#list-students li').each( function() {
					var element = $(this);
					if (element.children('.out').html() == '') { element.remove(); }
				});
			} else if (option == 'All') {
			} else { 
				$('#list-students li').each( function() {
					var element = $(this);                 
					var thestudent;                                               
					var selectionContent = element.html();                     
					var locate = selectionContent.indexOf("<span");  
					var date = new Date().toLocaleDateString();
					if (locate == -1) {
						thestudent = selectionContent;
					} else {     
						thestudent = selectionContent.substring(0,locate);
					}                                                        
					tx.executeSql("SELECT categoryName FROM students JOIN class_students ON "+
					  "students.studentId = class_students.studentId JOIN categories ON "+
					  "categories.categoryId = class_students.categoryId WHERE class_students.classId = ? "+
					  "AND students.studentName =?;",[classID,thestudent], function (tx, result2){		
						var dataset2 = result2.rows;                
						if (dataset2.length > 0) {
						  var category = dataset2.item(0).categoryName; 
						  if (category != option) { element.remove();}	
						} else {
							element.remove();
						}
					});
				});	
			}
		});	
	});
}); 

//--- BEHAVIOR  /  BEHAVIOR  /  BEHAVIOR / BEHAVIOR / BEHAVIOR / BEHAVIOR -------------------------------

//--- Trigger when incident in edit student behavior ----------   
$(document).on('tap', "#edit-stuIncident-list li", function(){ 
	var caller = $(this);
	if (caller.hasClass('active') == true) { caller.removeClass("active"); }
	else { caller.addClass("active"); }
});
//--- Clear form incident in edit student behavior ----------   
function clearStudentIncident() {
	$('#behavior-comment').val('');
}
//--- Delete incident in edit student behavior ----------   
function deleteStudentIncident() {
	var mark = 'well', count = 0;
	$("#edit-stuIncident-list li").each( function() {
		var selection = $(this);                           
		if (selection.hasClass('active') == true) {                              
			selection.remove();
		} else {
			if (selection.children('span').hasClass('icon icon-sad2') == true) {                              
				mark = 'bad';
			} else if (selection.children('span').hasClass('icon icon-neutral2') == true) {
				if (mark == 'well') { mark = 'reg'; }	
				count ++; 
			} 
			if (count > 2) { mark = 'bad'; }
		}
	});
	if (mark == 'well') {
		$('#today-behavior').children('span').html('');   
		$('#today-behavior').children('span').css('color','gray');
		$('#today-behavior').children("span").removeClass().addClass('icon icon-smiley2'); 	
	} else if (mark == 'reg') {
		$('#today-behavior').children('span').html(' !');
		$('#today-behavior').children('span').css('color','#428bca');
		$('#today-behavior').children("span").removeClass().addClass('icon icon-neutral2'); 	
	} else if (mark == 'bad') {
		$('#today-behavior').children('span').html(' !!!');   
		$('#today-behavior').children('span').css('color','red');
		$('#today-behavior').children("span").removeClass().addClass('icon icon-sad2'); 	
	}
}

//Select -add a new incident in edit student behavior ----------
$(document).on('tap',"#add-edit-student-inc li a",function() {
	var selection = $(this);
	var theincident;
	var selectionContent = selection.html();                     
	var locate = selectionContent.indexOf("<span");  
	if (locate == -1) { theincident = selectionContent; }
	else { theincident = selectionContent.substring(0,locate); }                                                                
	db.transaction(function (tx) {  
		tx.executeSql("SELECT incidentLevel, incidentCode FROM incidents WHERE incidentName = ?;", [theincident], function(tx, result) {
			var level = result.rows.item(0).incidentLevel; 
			var code = result.rows.item(0).incidentCode; 
			$("#edit-stuIncident-list").append('<li class="list-group-item" style="color:black">'+ code +' - '+ theincident +'<span></span></li>');
			if (level == 'minor') { 
				$("#edit-stuIncident-list li:last-child span").removeClass().addClass('icon icon-neutral2'); 
				$("#edit-stuIncident-list li:last-child span").html(' !'); ;
				var countincidents = $('#edit-stuIncident-list li').size();
				if ($('#today-behavior').children("span").hasClass('icon icon-smiley2') == true) {
					$('#today-behavior').children('span').html(' !');
					$('#today-behavior').children('span').css('color','#428bca');
					$('#today-behavior').children("span").removeClass().addClass('icon icon-neutral2');
				} else if ($('#today-behavior').children("span").hasClass('icon icon-neutral2') == true) {	
					if (countincidents > 2 ) {
						$('#today-behavior').children('span').html(' !!!');
						$('#today-behavior').children('span').css('color','red');
						$('#today-behavior').children("span").removeClass().addClass('icon icon-sad2'); 	
					}
				}
			} else if (level == 'major') { 
				$("#edit-stuIncident-list li:last-child span").removeClass().addClass('icon icon-sad2'); 
				$("#edit-stuIncident-list li:last-child span").html(' !!!'); 
				$('#today-behavior').children('span').html(' !!!');   
				$('#today-behavior').children('span').css('color','red');
				$('#today-behavior').children("span").removeClass().addClass('icon icon-sad2'); 	
			}
		});
	});
});

//--- save form edit student incidents in Behavior -------- 
function saveStudentIncident() {
	var thestudent = $("#student-edit-text").html();
	var date = new Date().toLocaleDateString();	
	var incidentArray = []; 	
	var newstring;
	var mark;
	var comments = $('#behavior-comment').val();	
	if ($('#today-behavior').children("span").hasClass('icon icon-smiley2') == true) { 	
		mark = 'well';
	} else if ($('#today-behavior').children("span").hasClass('icon icon-neutral2') == true) {
		mark = 'reg';
	} else if ($('#today-behavior').children("span").hasClass('icon icon-sad2') == true) {
		mark = 'bad';
	}
	$("#edit-stuIncident-list li").each( function() {
		var selection = $(this);   
		var theincident;	
		var selectionContent = selection.html();         
		var locate = selectionContent.indexOf("-");  
		if (locate == -1) { theincident = selectionContent; }
		else { theincident = selectionContent.substring(0,locate-1); }                                                                
		incidentArray.push(theincident);
	});
	newstring = incidentArray.join("-");
	db.transaction(function (tx) {  
		tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function(tx, result2) {
			var studentID = result2.rows.item(0).studentId; 
			tx.executeSql("UPDATE behavior SET behMark =?, behComments =?, behIncidents =? WHERE classId =? AND behSession =? AND studentId =?;", [mark,comments,newstring,classID,date,studentID]);
		});
	});    
	btnReturn();
/*	db.transaction(function (tx) {  
		tx.executeSql("SELECT className FROM classes WHERE classId = ?;", [classID], function(tx, result3) {
			var classname = result3.rows.item(0).className; 
			$('#students-main-text').html(classname);
		});
	});	*/
}
					
//--- Load incidents list in edit student behavior ----------------------- 
$(document).on('loadEditStudentIncidents', function() { 
	$('#add-edit-student-inc li').remove();    
	db.transaction(function (tx) {
		tx.executeSql("SELECT incidentCode, incidentName FROM incidents ORDER BY incidentCode;",[], function (tx, result){		
			var dataset = result.rows;                  
			for (var i = 0; i < dataset.length; i++) {
				var item = dataset.item(i);        
				var incident = item['incidentName'];  
				$("#add-edit-student-inc").append('<li><a>'+ incident +'</a></li>');
			}
		});	
	});
}); 


//--- Delete content from search box ----------------------------- 
$(document).on('swipeleft',"#search-input-beh",function() {
	$("#search-input").val('');	
});
//--- Trigger when button 'incident' is clicked ----------   
$(document).on('tap', "#btnIncident", function(){ 
	if ($("#btnIncident").hasClass('active')) {      
		$("#btnIncident").removeClass("active");
	} else {                                 
		$("#btnIncident").addClass("active");
		$("#btnEditBehavior").removeClass("active");
	}
});
$(document).on('tap', "#btnEditBehavior", function(){ 
	if ($("#btnEditBehavior").hasClass('active')) {      
		$("#btnEditBehavior").removeClass("active");
	} else {                                 
		$("#btnEditBehavior").addClass("active");
		$("#btnIncident").removeClass("active");
	}
});
//---  When a student is click to mark behavior ---------------     
$(document).on('tap', '#list-students li', function(e) {   e.stopPropagation();     
	var caller = $(this);	
	if (($('#btnIncident').hasClass('active') == true) && ($('#select-incident-input').val() != '')) {
		var thestudent;                                               
		var selectionContent = caller.html();                     
		var locate = selectionContent.indexOf("<span");  
		if (locate == -1) { thestudent = selectionContent; }
		else { thestudent = selectionContent.substring(0,locate); }                                                                
		var newincidents = $('#select-incident-input').val();                 
		var date = new Date().toLocaleDateString();	         
		db.transaction(function (tx) {
			tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function (tx, result) {
				var studentID = result.rows.item(0).studentId;
				var mark = 'reg';
				var finalstring;
				var finalarray = [];
				tx.executeSql("SELECT behId, behIncidents FROM behavior WHERE studentId = ? AND classId=? AND behSession=?;", [studentID,classID,date], function (tx, result2) {
					var behID = result2.rows.item(0).behId;
					var incidents = result2.rows.item(0).behIncidents;
					var arrayIncidents = [], arraynewIncidents = [];
					var count = 0;
					if (!incidents) {
						arraynewIncidents = newincidents.split("-");
						if (arraynewIncidents.length == 1 ) {
							tx.executeSql("SELECT incidentLevel FROM incidents WHERE incidentCode = ?", [arraynewIncidents[0]], function (tx, result6) {
								var level1 = result6.rows.item(0).incidentLevel;
								if (level1 == 'major') { 
									mark = 'bad'; 
									caller.children("span").html(' !!!');   
									caller.children("span").removeClass().addClass('icon icon-sad2'); 
								} else {
									caller.children("span").html(' !');   
									caller.children("span").removeClass().addClass('icon icon-neutral2');   
								}
								tx.executeSql("UPDATE behavior SET behIncidents=?, behMark=? WHERE behId=?;", [newincidents,mark,behID]);
								alert('Student: ' + thestudent + '\nRegister incidents: ' + newincidents); 
							});
						} else if (arraynewIncidents.length == 2 ) {
							tx.executeSql("SELECT incidentLevel FROM incidents WHERE incidentCode IN (?,?)", [arraynewIncidents[0],arraynewIncidents[1]], function (tx, result5) {
								var level1 = result5.rows.item(0).incidentLevel;
								var level2 = result5.rows.item(1).incidentLevel;
								if ((level1 == 'major')||(level2 == 'major')) { 
									mark = 'bad'; 
									caller.children("span").html(' !!!');   
									caller.children("span").removeClass().addClass('icon icon-sad2'); 
								} else {
									caller.children("span").html(' !');   
									caller.children("span").removeClass().addClass('icon icon-neutral2');   
								}
								tx.executeSql("UPDATE behavior SET behIncidents=?, behMark=? WHERE behId=?;", [newincidents,mark,behID]);
								alert('Student: ' + thestudent + '\nRegister incidents: ' + newincidents); 
							});
						} else if (arraynewIncidents.length >= 3 ) { 
							mark = 'bad';
							caller.children("span").html(' !!!');   
							caller.children("span").removeClass().addClass('icon icon-sad2'); 
							tx.executeSql("UPDATE behavior SET behIncidents=?, behMark=? WHERE behId=?;", [newincidents,mark,behID]);
							alert('Student: ' + thestudent + '\nRegister incidents: ' + newincidents); 
						} 
					} else {
						arrayIncidents = incidents.split("-");
						arraynewIncidents = newincidents.split("-");
						finalarray = arrayIncidents.slice();
						var found = 0;
						for (i = 0; i < arraynewIncidents.length; i++) {
							for (j = 0; j < arrayIncidents.length; j++) {
								if (arraynewIncidents[i] == arrayIncidents[j]) { found = 1; }
							}		
							if (found == 0) { finalarray.push(arraynewIncidents[i]); } 
							else { found = 0; }	
						}		
						finalstring	= finalarray.join("-");
						if (finalarray.length == 1 ) {
							tx.executeSql("SELECT incidentLevel FROM incidents WHERE incidentCode = ?", [finalarray[0]], function (tx, result6) {
								var level1 = result6.rows.item(0).incidentLevel;
								if (level1 == 'major') { 
									mark = 'bad'; 
									caller.children("span").html(' !!!');   
									caller.children("span").removeClass().addClass('icon icon-sad2'); 
								} else {
									caller.children("span").html(' !');   
									caller.children("span").removeClass().addClass('icon icon-neutral2');   
								}
								tx.executeSql("UPDATE behavior SET behIncidents=?, behMark=? WHERE behId=?;", [finalstring,mark,behID]);
								alert('Student: ' + thestudent + '\nRegister incidents: ' + finalstring); 
							});
						} else if (finalarray.length == 2 ) {
							tx.executeSql("SELECT incidentLevel FROM incidents WHERE incidentCode IN (?,?)", [finalarray[0],finalarray[1]], function (tx, result5) {
								var level1 = result5.rows.item(0).incidentLevel;
								var level2 = result5.rows.item(1).incidentLevel;
								if ((level1 == 'major')||(level2 == 'major')) { 
									mark = 'bad'; 
									caller.children("span").html(' !!!');   
									caller.children("span").removeClass().addClass('icon icon-sad2'); 
								} else {
									caller.children("span").html(' !');   
									caller.children("span").removeClass().addClass('icon icon-neutral2');   
								}
								tx.executeSql("UPDATE behavior SET behIncidents=?, behMark=? WHERE behId=?;", [finalstring,mark,behID]);
								alert('Student: ' + thestudent + '\nRegister incidents: ' + finalstring); 
							});
						} else if (finalarray.length >= 3 ) { 
							mark = 'bad';
							caller.children("span").html(' !!!');   
							caller.children("span").removeClass().addClass('icon icon-sad2'); 
							tx.executeSql("UPDATE behavior SET behIncidents=?, behMark=? WHERE behId=?;", [finalstring,mark,behID]);
							alert('Student: ' + thestudent + '\nRegister incidents: ' + finalstring); 
						}
					}		
				});
			});   
		});		
	} else if ($('#btnEditBehavior').hasClass('active') == true) {
		var selectionContent = caller.html();           
		var locate = selectionContent.lastIndexOf("<span");
		if (locate == -1) { thestudent = selectionContent; }
		else { thestudent = selectionContent.substring(0,locate); }
		editStudentIncidents(thestudent);
	}
});
//---  To delete a student mark behavior and incidents ---------------                    delete description!!!
$(document).on('swipeleft', '#list-students li', function() {             
	if ($('#btnIncident').hasClass('active') == true) {
		var caller = $(this);
		var thestudent;                                               
		var selectionContent = caller.html();                     
		var locate = selectionContent.indexOf("<span");  
		if (locate == -1) { thestudent = selectionContent; }
		else { thestudent = selectionContent.substring(0,locate); }                                                                
		var date = new Date().toLocaleDateString();	         
		db.transaction(function (tx) {
			tx.executeSql("SELECT studentId FROM students WHERE studentName = ?;", [thestudent], function (tx, result) {
				var studentID = result.rows.item(0).studentId;
				tx.executeSql("SELECT behId, behIncidents FROM behavior WHERE studentId = ? AND classId=? AND behSession=?;", [studentID,classID,date], function (tx, result2) {
					var behID = result2.rows.item(0).behId;
					var incidents = result2.rows.item(0).behIncidents;
					var locate = incidents.indexOf('-');
					if (locate == -1) {
						caller.children("span").html('');   
						caller.children("span").removeClass(); 
						caller.children("span").removeClass().addClass('icon icon-smiley2'); 
						tx.executeSql("UPDATE behavior SET behIncidents=?, behMark=? WHERE behId=?;", ['','well',behID]);
					} else { 
						var response = confirm("Do you want to delete incidents " + incidents + " for this student?");
						if (response == true) {
							caller.children("span").html('');   
							caller.children("span").removeClass(); 
							caller.children("span").removeClass().addClass('icon icon-smiley2'); 
							tx.executeSql("UPDATE behavior SET behIncidents=?, behMark=? WHERE behId=?;", ['','well',behID]);
						}
					}					
				});	
			});
		});
	}
});		
//--- When selected a filter for behavior ---------------------------- 
$(document).on('tap', '#filters-beh li', function() {  
	var caller = $(this);
	var option;
	var selection = caller.children('a').html();
	var locate = selection.lastIndexOf("/span");  
	if (locate == -1) { option = selection; }
	else { option = selection.substring(locate + 6); }
 //--- embedded showStudentsforBehv ---
	$('#list-students li').remove();
	var date = new Date().toLocaleDateString();	
	db.transaction(function (tx) {
		tx.executeSql("SELECT studentName, behMark FROM students INNER JOIN behavior ON students.studentId = "+
		 "behavior.studentId WHERE behavior.classId = ? AND behavior.behSession =? ORDER BY studentName;",[classID,date], function (tx, result){		
			dataset = result.rows;                  
			for (var i = 0, item = null; i < dataset.length; i++) {
				var item = dataset.item(i);        
				var studentNAME = item['studentName'];     
				var behavior = item['behMark']; 
				$("#list-students").append('<li class="list-group-item">'+ studentNAME +'<span></span></li>');
				if (behavior == 'well') { 
					$("#list-students li:last-child span").removeClass().addClass('icon icon-smiley2'); 
					$("#list-students li:last-child span").html(''); 
				} else if (behavior == 'reg'){ 
					$("#list-students li:last-child span").removeClass().addClass('icon icon-neutral2'); 
					$("#list-students li:last-child span").html(' !'); 
				} else if (behavior == 'bad'){ 
					$("#list-students li:last-child span").removeClass().addClass('icon icon-sad2'); 
					$("#list-students li:last-child span").html(' !!!'); 
				}
			}  			
			//-- remove elements that doesn't match filter criteria	
			if (option == 'Good behavior') {
				$('#list-students li').each( function() {
					var element = $(this);
					if (element.children('span').html() != '') { element.remove(); }
				});
			} else if (option == 'Incidents') {
				$('#list-students li').each( function() {
					var element = $(this);
					if (element.children('span').html() == '') { element.remove(); }
				});
			} else if (option == 'All') {
			} else {
				tx.executeSql("SELECT attId FROM attendance WHERE classId=? AND attSession=?;", [classID,date], function (tx, result2) {
					if (result2.rows.length > 0) {   
						$('#list-students li').each( function() {
							var element = $(this);
							var selection = element.html();
							var thestudent;
							var locate = selection.indexOf("<span");  
							if (locate == -1) { thestudent = selection; }
							else { thestudent = selection.substring(0,locate); }                                                                
							var date = new Date().toLocaleDateString();	   
							tx.executeSql("SELECT attIn FROM attendance JOIN students ON students.studentId = attendance.studentId "+
							  "WHERE students.studentName =? AND attendance.attSession =? AND attendance.classId =?;",[thestudent,date,classID], function (tx, result3){
								var dataset3 = result3.rows.item(0).attIn;
								if (!dataset3 || (dataset3 == '')) { 
								 if (option == 'Present') { element.remove(); } 
								 else if (option == 'Attendance') { element.addClass('disabled'); } 
								}
							});
						});
					} else { alert('There is no register of attendance for this class'); }
				});
			}
		});	
	});
}); 

//--- CATEGORIES  /  CATEGORIES  /  CATEGORIES / CATEGORIES / CATEGORIES / CATEGORIES ------------------- 

//--- Trigger an event when a category is selected ---------------              
$(document).on('tap', '#categories li a', function() {
	var selection = $(this).html();                 
    $('#selected-category').val(selection);   
	$('#selected-category').trigger('keyup');
});
//--- Fill the tag for the selected category ---------------------                    
$(document).on('keydown', '#selected-category',function() {        
	$('#category-tag').removeAttr('disabled');
	$('#category-tag').val('');
});
$(document).on('keyup', '#selected-category', function() {
	var category = $('#selected-category').val();
	db.transaction(function (tx) { 	
		tx.executeSql("SELECT categoryTag FROM categories WHERE categoryName = ?;", [category], function (tx, result) {
			var dataset = result.rows.length;
			if (dataset > 0) {
				var item = result.rows.item(0);
				$('#category-tag').val(item['categoryTag']);
				$('#category-tag').attr('disabled', true);
			} else {
				$('#category-tag').attr('disabled',false);   //removeAttr('disabled');
				$('#category-tag').val('');
			}				
		});
	});
}); 
//--- Load categories list in student EDIT ----------------------- 
$(document).on('loadCategory', function() { 
	$('#categories li').remove();    
	db.transaction(function (tx) {
		tx.executeSql("SELECT categoryName FROM categories ORDER BY categoryName;",[], function (tx, result){		
			var dataset = result.rows;                  
			for (var i = 0; i < dataset.length; i++) {
				var item = dataset.item(i);        
				var category2 = item['categoryName'];  
				$("#categories").append('<li><a>'+ category2 +'</a></li>');
			}
		});	
	});
}); 
//--- Load categories list in category EDIT ---------------------- 
$(document).on('loadCategoryEdit', function() { 
	$('#categories-edit li').remove();    
	db.transaction(function (tx) {
		tx.executeSql("SELECT categoryName FROM categories ORDER BY categoryName;",[], function (tx, result){		
			var dataset = result.rows;                  
			for (var i = 0; i < dataset.length; i++) {
				var item = dataset.item(i);        
				var category2 = item['categoryName'];  
				$("#categories-edit").append('<li><a>'+ category2 +'</a></li>');
			}
		});	
	});
}); 
//--- Load categories listbox in category EDIT ------------------- 
$(document).on('loadAllCategories', function() { 
	$('#all-categories li').remove();    
	db.transaction(function (tx) {
		tx.executeSql("SELECT categoryName, categoryTag FROM categories ORDER BY categoryName;",[], function (tx, result){		
			var dataset = result.rows;                  
			for (var i = 0; i < dataset.length; i++) {
				var category2 = dataset.item(i).categoryName;        
				var tag2 = dataset.item(i).categoryTag;  
				$("#all-categories").append('<li>'+ category2 + ' - ' + tag2 +'</li>');
			}
		});	
	});
}); 
//--- Select category from listbox when dropdown click in EDIT ---
$(document).on('tap', '#categories-edit li a', function() {
	var selectedCategory = $(this).html();
    $('#selected-category-edit').val(selectedCategory);
	db.transaction(function (tx) { 	
		tx.executeSql("SELECT categoryTag FROM categories WHERE categoryName = ?;", [selectedCategory], function (tx, result) {
			var item = result.rows.item(0);
			$('#category-tag-edit').val(item['categoryTag']);
		});	
	});		
	$("#all-categories li").each( function() {
		var selection = $(this);
		var selectionContent = selection.html();             
		var locate = selectionContent.lastIndexOf("-");
		var categoryvalue = selectionContent.substring(0,locate - 1);   
		if (categoryvalue == selectedCategory) {  
			$("#all-categories>li.selected").removeClass("selected");
			selection.addClass('selected'); 
			return;
		}
	});
});	
//--- Select category from listbox when selected change in EDIT --
$(document).on('change', '#selected-category-edit', function() {
	var selectedCategory = $('#selected-category-edit').val();
	if (!$("#all-categories").find('li').hasClass('selected')) {
		$("#all-categories li").each( function() {
			var selection = $(this);
			var selectionContent = selection.html();             
			var locate = selectionContent.lastIndexOf("-");
			var categoryvalue = selectionContent.substring(0,locate - 1);   
			if (categoryvalue == selectedCategory) {  
				$("#all-categories>li.selected").removeClass("selected");
				selection.addClass('selected'); 
				return;
			}
		}); 
	}
});	
//--- Clear fields in category EDIT form -------------------------
function clearCategory() {
	$('#selected-category-edit').val('');
	$('#category-tag-edit').val('');
	$("#all-categories li").each( function() {
		var selection = $(this);
		selection.removeClass('selected');
	});	
}
//--- Delete a category in category EDIT ------------------------- 	
function deleteCategory() {
	var selection = $('#selected-category-edit').val();
	db.transaction(function (tx) {  
		tx.executeSql("SELECT categoryId FROM categories WHERE categoryName = ?;", [selection], function(tx, result) {
			var dataset = result.rows;
			if (dataset.length > 0) {
				var categoryID = dataset.item(0).categoryId; 
				tx.executeSql("DELETE FROM categories WHERE categoryId =?;", [categoryID]);
			} 
		});
	});
	$('#selected-category-edit').val('');
	$('#category-tag-edit').val('');
	$.event.trigger('loadCategoryEdit');
	$.event.trigger('loadAllCategories');
}
//--- Save/Add a category in category EDIT ----------------------- 	
function addSaveCategory() {                                                                          
	var newcategory = $('#selected-category-edit').val();
	var newtag = $('#category-tag-edit').val();
	var oldcategory, oldtag;
	if ((newcategory != '') && (newtag !='')) {
		var oldcategory, oldtag;
		$('#selected-category-edit').trigger('change');
		if ($("#all-categories").find('li').hasClass("selected")) {
			var content = $("#all-categories>li.selected").html();
			var locate = content.lastIndexOf("-");
			oldcategory = content.substring(0,locate - 1);        
			oldtag = content.substring(locate + 2,locate + 5);     
		}
		if (!oldcategory) {
			db.transaction(function (tx) { 	
				tx.executeSql("SELECT categoryId FROM categories WHERE categoryTag = ?;", [newtag], function (tx, result) {
					var dataset = result.rows.length;
					if (dataset > 0) {
						alert('That Tag already exist!');
						$('#category-tag-edit').val('');
					} else {	
						tx.executeSql("INSERT INTO categories (categoryName, categoryTag) VALUES (?,?);", [newcategory,newtag]);
						$('#selected-category-edit').val('');
						$('#category-tag-edit').val('');
					}
				});
			});
		} else {
			db.transaction(function (tx) { 	
				tx.executeSql("SELECT categoryId FROM categories WHERE categoryName = ?;", [oldcategory], function (tx, result2) {
					var dataset2 = result2.rows.item(0).categoryId;
					tx.executeSql("SELECT categoryId FROM categories WHERE categoryName = ? AND categoryId != ?;", [newcategory, dataset2], function (tx, result3) {
						var dataset3 = result3.rows.length;
						if (dataset3 > 0) {
							alert('That category already exist!');
							$('#selected-category-edit').val('');
						} else {
							tx.executeSql("SELECT categoryId FROM categories WHERE categoryTag = ? AND categoryId != ?;", [newtag,dataset2], function (tx, result4) {
								var dataset4 = result4.rows.length;
								if (dataset4 > 0) {
									alert('That Tag already exist!');
									$('#category-tag-edit').val('');
								} else {
									tx.executeSql("UPDATE categories SET categoryName =?, categoryTag =? WHERE categoryId = ?;", [newcategory,newtag,dataset2]);
									$('#selected-category-edit').val('');
									$('#category-tag-edit').val('');
								}
							});
						}	
					});	
				});
			});
		}
		$.event.trigger('loadCategoryEdit');
		$.event.trigger('loadAllCategories');
	}
}

//--- INCIDENTS  /  INCIDENTS  /  INCIDENTS / INCIDENTS / INCIDENTS / INCIDENTS ------------------------- 

//--- Fill the text with incident number when dropdown collapse --                         //fast scroll to top??
$(document).click(function(e){
	//e.stopPropagation();
	if ($(e.target).is('#incidents li a') == false) {
	e.stopPropagation();
		//if ($('#buttons-track-behavior').css('display') == 'block') { 
		if ($('#incident-droplist').hasClass('open') == true) {
			var items = $("#select-incident-input").val();
			var finalitems = items;
			$("#incidents li a.selected").each( function() {
				var selection = $(this).html();             
				var locate = selection.lastIndexOf("-");
				var selectedcode = selection.substring(0, locate -1);  
				var repeat = 0;
				//if is not already in 
				if (items == '') {
					if (finalitems == '') { 
						finalitems = selectedcode;
					} else {
						finalitems += '-' + selectedcode;
					}
				} else {
					var stop = 0;
					var rest = items;
					var space = items.indexOf('-');
					while (stop == 0) {	
						if (space == -1) {
							if (selectedcode == rest) { repeat = 1; }
							stop = 1;        
						} else {
							var element = rest.substring(0, space );     
							if (selectedcode == element) { repeat = 1; }
							rest =  rest.substring(space +1, 100);  
							space = rest.indexOf('-');
						}		
					}	
					if (repeat == 0) { finalitems += '-'+ selectedcode; }	
				} 
				$(this).removeClass('selected');
			});
			$("#select-incident-input").val(finalitems);
			$('#incident-droplist').removeClass('open');
			//close dropdowns
		} else if ($(e.target).is('#category-button-edit') == true) { 
			if 	($('#fix4').hasClass('open') == true) { $('#fix4').removeClass('open'); }
			else { $('#fix4').addClass('open'); }
		} else if ($(e.target).is('#category-button') == true) {
			if 	($('#fix3').hasClass('open') == true) { $('#fix3').removeClass('open'); }
			else { $('#fix3').addClass('open'); }
		} else if ($(e.target).is('#btn-filter') == true) {
			if 	($('#fix').hasClass('open') == true) { $('#fix').removeClass('open'); }
			else { $('#fix').addClass('open'); }
		} else if ($(e.target).is('#btn-filter-behv') == true) {
			if 	($('#fix2').hasClass('open') == true) { $('#fix2').removeClass('open'); }
			else { $('#fix2').addClass('open'); }
		} else if ($(e.target).is('#incident-button') == true) {
			if 	($('#incident-droplist').hasClass('open') == true) { $('#incident-droplist').removeClass('open'); }
			else { $('#incident-droplist').addClass('open'); }
		} else if ($(e.target).is('#btn-stuEditInc') == true) {
			if 	($('#fix6').hasClass('open') == true) { $('#fix6').removeClass('open'); }
			else { $('#fix6').addClass('open'); }
		} else {
			if ($('#fix4').hasClass('open') == true) { $('#fix4').removeClass('open'); }
			if ($('#fix3').hasClass('open') == true) { $('#fix3').removeClass('open'); }   
			if ($('#fix2').hasClass('open') == true) { $('#fix2').removeClass('open'); }    
			if ($('#fix').hasClass('open') == true) { $('#fix').removeClass('open'); }    
			if ($('#fix6').hasClass('open') == true) { $('#fix6').removeClass('open'); }
		}
	} else {                          //multiple selection
		var caller = $(e.target);
		$('#btnIncident').removeClass('active');
		if (caller.hasClass('selected') == true) {
			caller.removeClass('selected');
		} else {
			caller.addClass('selected');
		}
	}
});			
//--- Multiple selection of incidents in BEHAVIOR ---------------- 
/*	$(document).on('tap', '#incidents li', function(e) {
//	e.stopPropagation(); 
	$('#btnIncident').removeClass('active');
	var caller = $(this).find('a');
	if (caller.hasClass('selected') == true) {
		caller.removeClass('selected');
	} else {
		caller.addClass('selected');
	}
});
*/
//--- Clear input box for selected incidents in BEHAVIOR ---------
$(document).on('swipeleft',"#select-incident-input",function() {
	$("#select-incident-input").val('');	
	$('#btnIncident').removeClass('active');
});
//--- Load incident list in BEHAVIOR ----------------------------- 
$(document).on('loadIncidents', function() { 
	$('#incidents li').remove();    
	db.transaction(function (tx) {
		tx.executeSql("SELECT incidentName, incidentCode FROM incidents ORDER BY incidentCode;",[], function (tx, result){		
			var dataset = result.rows;                  
			for (var i = 0; i < dataset.length; i++) {
				var item = dataset.item(i);        
				var incident = item['incidentName'];  
				var code = item['incidentCode'];  
				$("#incidents").append('<li><a>'+ code + ' - ' + incident +'</a></li>');
			}
		});	
	});
}); 
//--- Select from listbox in INCIDENTS EDIT --------------------
$(document).on('tap', '#all-incidents li', function() {
	var selection = $(this);
	if ($(this).hasClass('active') == true) {
		selection.removeClass("active");
	} else {
		selection.addClass("active");
		var content = selection.html();             
		var locate = content.indexOf("-");
		var locate2 = content.indexOf("<span");
		$('#oldIncident').html(content.substring(0, locate));
		$('#incident-number').val(content.substring(0, locate));   
		$('#selected-incident').val(content.substring(locate + 2, locate2));   
		if (selection.find("span").hasClass('icon icon-neutral2') == true) {
			$('#btn-level').html('minor incident<span class="icon icon-neutral2"></span>');
		} else if (selection.find("span").hasClass('icon icon-sad2') == true) {
			$('#btn-level').html('not acceptable<span class="icon icon-sad2"></span>');	
		}
	}
});	
//--- Toggle levels button in INCIDENTS EDIT -------------------- 
$(document).on('tap', '#btn-level', function() {
	var content = $(this).html();
	var locate = content.indexOf('<span');
	content = content.substring(0, locate);
	if (content == 'minor incident') {
		$('#btn-level').html('not acceptable<span class="icon icon-sad2"></span>');
	} else if (content == 'not acceptable') {
		$('#btn-level').html('minor incident<span class="icon icon-neutral2"></span>');
	}
});
//--- Load incident listbox in INCIDENTS EDIT -------------------- 
$(document).on('loadAllIncidents', function() { 
	$('#all-incidents li').remove();    
	db.transaction(function (tx) {
		tx.executeSql("SELECT incidentName, incidentCode, incidentLevel FROM incidents ORDER BY incidentCode;",[], function (tx, result){		
			var dataset = result.rows;                  
			for (var i = 0; i < dataset.length; i++) {
				var incident = dataset.item(i).incidentName;        
				var code = dataset.item(i).incidentCode;  
				var level = dataset.item(i).incidentLevel;
				if  (level == 'minor') {		
					$("#all-incidents").append('<li class="list-group-item">'+ code + ' - ' + incident +'<span class="icon icon-neutral2"></span></li>');
				} else if  (level == 'major') {
					$("#all-incidents").append('<li class="list-group-item">'+ code + ' - ' + incident +'<span class="icon icon-sad2"></span></li>');
				}
			}
		});	
	});
	clearIncident();
});  

//--- Clear fields in INCIDENTS EDIT -----------------------------
function clearIncident() {
	$('#selected-incident').val('');
	$('#incident-number').val('');
	$('#btn-level').html('minor incident<span class="icon icon-neutral2"></span>');
	$("#all-incidents li").each( function() {
		var selection = $(this);
		selection.removeClass('selected');
	});	
	$('#all-incidents li.active').removeClass('active');
	$('#incident-number').focus(); 
}
//--- Delete an incident in INCIDENTS EDIT ----------------------- 	
function deleteIncident() {
	$('#all-incidents li').each( function() {
		var selection = $(this);                           
		if (selection.hasClass('active') == true) {
			var content = selection.html();         
			var locate = content.indexOf("-");
			var theincident;
			if (locate == -1) {
				theincident = content;
			} else {     
				theincident = content.substring(0,locate -1);
			}                                
			db.transaction(function (tx) {  
				tx.executeSql("SELECT incidentId FROM incidents WHERE incidentCode = ?;", [theincident], function(tx, result) {
					var incidentID = result.rows.item(0).incidentId; 
					tx.executeSql("DELETE FROM incidents WHERE incidentId =?;", [incidentID]);
				});
			});
		}
	});	
	$.event.trigger('loadAllIncidents');
}
//--- Add or modify an incident in INCIDENTS EDIT ---------------- 	
function addSaveIncident() {                                                                           
	var newincident = $('#selected-incident').val();
	var newcode = $('#incident-number').val();
	var newlevel;
	if ((newincident != '') && (newcode !='')) {
		var oldcode = $('#oldIncident').html();
		if ($('#btn-level').find("span").hasClass('icon icon-neutral2') == true) { newlevel = 'minor'; } 
		else if ($('#btn-level').find("span").hasClass('icon icon-sad2') == true) { newlevel = 'major'; } 
		var incidentid;
		if (!oldcode) {          //new record - insert
			db.transaction(function (tx) { 	
				tx.executeSql("SELECT incidentId FROM incidents WHERE incidentCode = ? OR incidentName = ?;", [newcode,newincident], function (tx, result3) {
					if (result3.rows.length > 0) {
						alert('You can duplicate an existing incident name or code!');
						$('#incident-number').val('');
					} else {	
						tx.executeSql("INSERT INTO incidents (incidentName, incidentCode, incidentLevel) VALUES (?,?,?);", [newincident,newcode,newlevel]);
						$.event.trigger('loadAllIncidents');
					}
				});
			});
		} else {                 //existing record - update
			db.transaction(function (tx) { 	
				tx.executeSql("SELECT incidentId FROM incidents WHERE incidentCode = ?;", [oldcode], function (tx, result) {
					var incidentID = result.rows.item(0).incidentId;      
					tx.executeSql("SELECT incidentId FROM incidents WHERE (incidentCode = ? OR incidentName = ?) AND incidentId != ?;", [newcode,newincident,incidentID], function (tx, result2) {
						if (result2.rows.length > 0) {
							alert('You can duplicate an existing incident name or code!');
							$('#incident-number').val('');
						} else {	
							tx.executeSql("UPDATE incidents SET incidentName =?, incidentCode =?, incidentLevel=? WHERE incidentId = ?;", [newincident,newcode,newlevel,incidentID]);
							$.event.trigger('loadAllIncidents');
						}	
					});
				});	
			});
		}
	}
}
//--- BACKUP  /  BACKUP  /  BACKUP / BACKUP / BACKUP / BACKUP ------------------------- 

//--- Toggle dropdown list CLASSES in BACKUP ---------------------------- 

$(document).on('tap', '#enter-classes-button',function() {
	if 	($('#fix5').hasClass('open') == true) { $('#fix5').removeClass('open'); }
	else { $('#fix5').addClass('open'); }
});

//--- Load incident listbox in INCIDENTS EDIT -------------------- 
/*$(document).on('loadAllIncidents', function() { 
	$('#all-incidents li').remove();    
	db.transaction(function (tx) {
		tx.executeSql("SELECT incidentName, incidentCode, incidentLevel FROM incidents ORDER BY incidentCode;",[], function (tx, result){		
			var dataset = result.rows;                  
			for (var i = 0; i < dataset.length; i++) {
				var incident = dataset.item(i).incidentName;        
				var code = dataset.item(i).incidentCode;  
				var level = dataset.item(i).incidentLevel;
				if  (level == 'minor') {		
					$("#all-incidents").append('<li class="list-group-item">'+ code + ' - ' + incident +'<span class="icon icon-neutral2"></span></li>');
				} else if  (level == 'major') {
					$("#all-incidents").append('<li class="list-group-item">'+ code + ' - ' + incident +'<span class="icon icon-sad2"></span></li>');
				}
			}
		});	
	});
	clearIncident();
});  */
