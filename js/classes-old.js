//--- Bunch to read the classId using callback ------------  
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
//			
//--- Load the list of classes from the DB ----------------
function showClasses() { 
	db.transaction(function (tx) {
		tx.executeSql("SELECT * FROM classes ORDER BY className;", [], function (tx, result) {
			dataset = result.rows;
			$('#list-classes li').not(":first").remove();
			for (var i = 0, item = null; i < dataset.length; i++) {
				item = dataset.item(i).className;
				$("#list-classes").append('<li class="list-group-item">' + item + '</li>'); 
			}
		});
	});     
	$("#input-new-class").val(''); 
}
//--- Add a new class to the DB --------------------------- OK
$(function(){
	$(document).on("tap", "#btnAddClass", function() {
		var input = $("#input-new-class").val();                 	
		if (input != "") {
			db.transaction(function (tx) {    
				tx.executeSql("SELECT * FROM classes WHERE className = ?;", [input], function (tx, result) {
					var dataset = result.rows.length;
					if (dataset > 0) {
						alert('That class already exist!');
					} else {
						tx.executeSql("INSERT INTO classes (className) VALUES (?);", [input]);
						showClasses();
					}
				});
			});	
		} else {
			if ($("#input-new-class").css('display')== 'block') {
				$("#input-new-class").css('display','none');
			} else {
				$("#input-new-class").css('display','block');
				$("#input-new-class").focus();
			}
		}
	});  
 });   
//--- Delete multiple classes from the DB ----------------- OK          PENDIENTE!!!!!!!!!!!!!!
$(function() {	
	$(document).on('tap', "#btnDeleteClass", function() {          
		$("#list-classes li").each( function() {
			var theclass = $(this);                        //make it on delete cascade PK/FK class_students ON classes  
			if (theclass.hasClass('active')) {			   //remove all students for it, all categories		
				db.transaction(function (tx) {  			// related tables that are not under session   . ASK FOR CONFIRMATION!!!	
					tx.executeSql("DELETE FROM classes WHERE className = ?;", [theclass.html()]); 
				});
			}
		});
		showClasses();
	}); 
});
	//--- When click 'edit' under STUDENT MAIN ----------------
$(function() {	
	$(document).on('tap', "#btnEditClass", function() {   
		$("#list-students li").each( function() {
			var selection = $(this);
			var loopFlag = 0;
			if (selection.hasClass('active')) {       
				var selectionContent = selection.html();           
				var locate = selectionContent.lastIndexOf("<span");
				if (locate == -1) {
					thestudent = selectionContent;
				} else {     
					thestudent = selectionContent.substring(0,locate);
				}
				db.transaction(function (tx) {   
					tx.executeSql("SELECT students.studentName, students.studentComments, categories.categoryName, categories.categoryTag "+
					" FROM students INNER JOIN class_students ON students.studentId = class_students.studentId LEFT OUTER JOIN categories "+
					" ON categories.categoryId = class_students.categoryId WHERE students.studentName = ? AND class_students.classId = ?;", [thestudent,classID], function (tx, result) {
						var item = result.rows.item(0);
						var name = item['studentName'];
						var description = item['studentComments'];
						var category = item['categoryName'];           
						var tag = item['categoryTag'];             					
						closeStudentPanels();
						$('#panel-students-student-edit').css('display','block');
						$('#panel-body-student-edit').css('display','block');
						$('#edit-student-name').val(name);		
						$('#edit-student-comments').val(description);		
						$('#selected-category').val(category);		
						$('#category-tag').val(tag);		
						if ((category != null) && (category > 0)) {  $('#category-tag').attr('disabled', true);  } 
						$('#student-edit-text').html(thestudent);
						$('#two-buttons-student').css('display','block');
					});    
				});   
				loopFlag = 1; 
			}
			if (loopFlag == 1) {  return false;  }
		});   
		$.event.trigger('loadCategory');
	});
});
//--- When click 'save' under CLASS EDIT ------------------
$(function() {	
	$(document).on('tap', "#btnSaveClassForm", function() {
		var input = $('#class-edit-text').html();
		var newname = $("#edit-class-name").val();
		var description = $("#edit-class-description").val();
		if (newname != "") {
			classNameToId(input, readClassID);
			if (newname == input) {
				db.transaction(function (tx) { 		
						tx.executeSql("UPDATE classes SET classDescription=? WHERE classId=?;", [description,classID]);
					});   
				btnReturn();
			} else {
				db.transaction(function (tx) {    
					tx.executeSql("SELECT * FROM classes WHERE className = ?;", [newname], function (tx, result) {
						var dataset = result.rows.length;
						if (dataset > 0) {
							alert('That class already exist!');
							return; 
						} else {
							tx.executeSql("UPDATE classes SET className=?, classDescription=? WHERE classId=?;", [newname,description,classID]);
						}
					});
				});
				btnReturn();
				showClasses();
			}  	
		}
	});
});
//--- Close all panels under the page CLASS ---------------
function closeClassPanels() {
	$('#panel-classes-main').css('display','none');
	$('#panel-classes-class-edit').css('display','none');
	$('#panel-classes-class-options').css('display','none');
	$('#panel-backup-recover').css('display','none');
	$('#first-menu').css('display','none');
	$('#config-menu').css('display','none');
	$('#top-buttons').css('display','none');
	$('#top-buttons-behv').css('display','none');
	$('.page-header h1').css('display','none');
}
//--- Button 'Clear' in CLASS EDIT form ----------------------
$(function() {		
	$(document).on('tap', "#btnClearClassForm", function() {
		$('#edit-class-name').val('');		
		$('#edit-class-description').val('');		
	});
});
//--- When dblclick on a 'class', open CLASS OPTIONS ------
$(function() {	 
	$(document).on('swiperight', '#list-classes li', function() {
		var theclass = $(this);
		closeClassPanels();
		$('#panel-classes-class-options').css('display','block');
		$('#config-menu').css('display','none');
		$('.page-header h1').css('display','block');
		$('#first-menu').css('display','block');
		$('#class-options-text').html(theclass.html());	
	});
});	
//--- Eliminates the selection highlight ------------------
//  $(document).on('mousedown', function(e) { e.preventDefault(); });

//--- Typeahead for classes -------------------------------
$(function() {	
	$(document).on('focus', "#input-new-class", function() {
	   db.transaction(function (tx) {
			tx.executeSql("SELECT className FROM classes ORDER BY className;",[], function (tx, result){		
				var typeaheadClasses = [];
				var dataset = result.rows;                  
				for (var i = 0; i < dataset.length; i++) {
					var item = dataset.item(i).className;
					typeaheadClasses.push(item); 
				}
				$("#input-new-class").autocomplete({ 
					source: typeaheadClasses
				});
			});
		});
	});  
});

