//--- Close all pages -------------------------------------
function closePages() {          
	$('#page-main').css('display','none');
	$('#page-classes').css('display','none');
	$('#page-students').css('display','none');
	$('#page-notes').css('display','none');
}
//--- Disable attendance buttons --------------------------
function disableAttendanceButtons() {
	$('#btnAttend').removeClass('active');
	$('#btnLate').removeClass('active');
	$('#btnDismiss').removeClass('active');
}
//--- When click 'students' under CLASS CONFIGURATION -----------
function changeToStudents() {          
	var input = $('#class-options-text').html(); 
	closeClassPanels();
	closeStudentPanels();
	closePages();
	$('#page-students').css('display','block');
	$('#panel-students-main').css('display','block')
	$('#students-main-text').html(input);
	$('#buttons-student-edit').css('display','block');
	$('#panel-body-student-edit').css('display','block');
//	$('#top-buttons').css('display','none');
	$('.page-header h1').css('display','block');
	//$('#two-buttons-student').css('display','block');
	showStudents(input);
}
//--- When click 'categories' under CLASS CONFIGURATION -----------
function changeToCategory() {          
	var input = $('#class-options-text').html(); 
	closeClassPanels();
	closeStudentPanels();
	closePages();
	$('#page-students').css('display','block');
	$('#panel-students-student-edit').css('display','block')
	$('#student-edit-text').html(input);
	$('#student-edit-text').css('color','#428bca');
	$('#panel-body-category-edit').css('display','block');
//	$('#top-buttons').css('display','none');
	$('.page-header h1').css('display','block');
	$('#buttons-category-edit').css('display','block');
	$.event.trigger('loadCategoryEdit');
	$.event.trigger('loadAllCategories');
}
//--- When click 'incidents' under CLASS CONFIGURATION -----------
function changeToIncident() {          
	var input = $('#class-options-text').html(); 
	closeClassPanels();
	closeStudentPanels();
	closePages();
	$('#page-students').css('display','block');
	$('#panel-students-student-edit').css('display','block')
	$('#student-edit-text').html(input);
	$('#student-edit-text').css('color','#428bca');
	$('#panel-body-incident-edit').css('display','block');
//	$('#top-buttons').css('display','none');
	$('.page-header h1').css('display','block');
	$('#buttons-incident-edit').css('display','block');
	$.event.trigger('loadIncidentsEdit');
	$.event.trigger('loadAllIncidents');
}

//--- When click 'notes' under CLASS OPTIONS --------------
function changeToNotes() {           
	var input = $('#class-options-text').html();
	closeClassPanels();
	closeStudentPanels();
	closePages();
	$('#page-notes').css('display','block');
	$('#panel-notes-main').css('display','block')
	$('.page-header h1').css('display','block');
	$('#notes-main-text').html(input);
	showNotes(input);
}
//--- When click 'configuration' under CLASS OPTIONS --------------  
function changeToConfiguration() {           
	var input = $('#class-options-text').html();
	closeClassPanels();
	$('#panel-classes-class-options').css('display','block');
	$('#config-menu').css('display','block');
	$('#first-menu').css('display','none');
	$('.page-header h1').css('display','block');
	$('#class-options-text').html(input);	
}
//--- When click 'attendance' under CLASS OPTIONS -------   
function trackAttendance() {          
	var input = $('#class-options-text').html(); 
	classNameToId(input, readClassID);       
	closeClassPanels();
	closeStudentPanels();
	closePages();
	disableAttendanceButtons();
	$('#page-students').css('display','block');
	$('#panel-students-main').css('display','block');
	$('#buttons-student-edit').css('display','none');
	$('#buttons-track-attendance').css('display','block');
	$('#students-main-text').html(input);
//	$('.page-header h1').css('display','none');
	$('#top-buttons').css('display','block');
	var date = new Date().toLocaleDateString();	   
	db.transaction(function (tx) {
		tx.executeSql("SELECT attId FROM attendance WHERE classId=? AND attSession=?;", [classID,date], function (tx, result) {
			if (result.rows.length == 0) {  
				tx.executeSql("SELECT studentId FROM class_students WHERE classId=?;", [classID], function (tx, result2) {
					var dataset = result2.rows;
					for (var i = 0; i < dataset.length; i++) {
						var item = dataset.item(i).studentId;
						tx.executeSql("INSERT INTO attendance (studentId, classId, attSession) VALUES (?,?,?);", [item,classID,date]);
					}
				});
			}
		});	
	});
	showStudentsforAtt();
	$.event.trigger('filterOptions');
}
//--- When click 'behavior' under CLASS OPTIONS -------   
function trackBehavior() {          
	var input = $('#class-options-text').html(); 
	classNameToId(input, readClassID);       
	closeClassPanels();
	closePages();
	disableAttendanceButtons();
	$('#page-students').css('display','block');
	$('#panel-students-main').css('display','block');
	$('#buttons-student-edit').css('display','none');
	$('#buttons-track-behavior').css('display','block');
	$('#students-main-text').html(input);
//	$('.page-header h1').css('display','none');
	$('#top-buttons-behv').css('display','block');
	var date = new Date().toLocaleDateString();	   
	db.transaction(function (tx) {
		tx.executeSql("SELECT behId FROM behavior WHERE classId=? AND behSession=?;", [classID,date], function (tx, result) {
			if (result.rows.length == 0) {   
				tx.executeSql("SELECT studentId FROM class_students WHERE classId=?;", [classID], function (tx, result2) {
					var dataset = result2.rows;                                              
					for (var i = 0; i < dataset.length; i++) {
						var item = dataset.item(i).studentId;
						tx.executeSql("INSERT INTO behavior (studentId, classId, behSession,behMark) VALUES (?,?,?,?);", [item,classID,date,'well']);
					}
				});
			}
		});	
	});
	showStudentsforBehv();
	$.event.trigger('loadIncidents');
}

//--- When click 'return' (in footer) under any screen ----
function btnReturn() {
	if ($('#page-classes').css('display') == 'block') {
		if ($('#panel-classes-main').css('display') =='block') {   	
			//back to main main	
		} else if ($('#panel-classes-class-edit').css('display') =='block') {
			closeClassPanels();
			$('#buttons-student-edit').css('display','block');
			$('#panel-classes-main').css('display','block');
			$('#page-main').css('display','none');
			$('#page-classes').css('display','block');
			$('.page-header h1').css('display','block');
		} else if ($('#panel-classes-class-options').css('display') =='block') {
			if ($('#first-menu').css('display') == 'block') {
				closeClassPanels();
				$('#panel-classes-main').css('display','block');
				$('.page-header h1').css('display','block');
			} else if ($('#config-menu').css('display') == 'block') { 
				$('#config-menu').css('display','none');
				$('#first-menu').css('display','block');
			}
		} else if ($('#panel-backup-recover').css('display') =='block') {
			var input = $('#backup-text').html();
			closeClassPanels();
			closePages();
			$('#page-classes').css('display','block');
			$('#panel-classes-class-options').css('display','block');
			$('#first-menu').css('display','block');
			$('.page-header h1').css('display','block');
			$('#classes-options-text').html(input);
		}
	} else if ($('#page-students').css('display') == 'block') {
		if ($('#panel-students-main').css('display') =='block') {   //back to classes
			var input = $('#students-main-text').html();
			if (($('#buttons-track-attendance').css('display') == 'block') ||
			   ($('#buttons-track-behavior').css('display') == 'block')) {
				closeStudentPanels();
				closeClassPanels();
				closePages();
				$('.page-header h1').css('display','block');
	//			$('#top-buttons').css('display','none');
				$('#page-classes').css('display','block');
				$('#panel-classes-class-options').css('display','block');
				$('#first-menu').css('display','block');
				$('#class-options-text').html(input);
			} else if ($('#buttons-student-edit').css('display') == 'block') {    
				closeStudentPanels();
				closeClassPanels();
				closePages();
				$('.page-header h1').css('display','block');
	//			$('#top-buttons').css('display','none');
				$('#page-classes').css('display','block');
				$('#panel-classes-class-options').css('display','block');
				$('#config-menu').css('display','block');
				$('#class-options-text').html(input);
			}
		} else if ($('#panel-students-student-edit').css('display') =='block') {
			var input = $('#student-edit-text').html();
			if ($('#two-buttons-student').css('display') == 'block') {
				closeStudentPanels();
				$('#panel-students-main').css('display','block');
				$('.page-header h1').css('display','block');
				$('#buttons-student-edit').css('display','block');
				showStudents(input);
			} else if (($('#buttons-category-edit').css('display') =='block') || 
					  ($('#buttons-incident-edit').css('display') =='block')) {
				closeClassPanels();
				closeStudentPanels();
				closePages();
				$('#page-classes').css('display','block');
				$('#panel-classes-class-options').css('display','block');
				$('#config-menu').css('display','block');
				$('.page-header h1').css('display','block');
				$('#class-options-text').html(input);            
			} else if ($('#buttons-student-incident-edit').css('display') == 'block') {
				closeStudentPanels();
				$('#panel-students-main').css('display','block');
				$('#buttons-student-edit').css('display','none');
				$('#buttons-track-behavior').css('display','block');
				$('#top-buttons-behv').css('display','block');
				showStudentsforBehv();
				$.event.trigger('loadIncidents');
				$('#btnEditBehavior').removeClass('active');
				db.transaction(function (tx) {  
					tx.executeSql("SELECT className FROM classes WHERE classId = ?;", [classID], function(tx, result3) {
						var classname = result3.rows.item(0).className; 
						$('#students-main-text').html(classname);
					});
				});
			}
		}	
	} else if ($('#page-notes').css('display') == 'block') {
		if ($('#panel-notes-main').css('display') =='block') {   //back to classes
			var input = $('#notes-main-text').html();
			closeNotePanels();
			closePages();
			$('#page-classes').css('display','block');
			$('#panel-classes-class-options').css('display','block');
			$('#first-menu').css('display','block');
			$('#classes-options-text').html(input);
		} else if ($('#panel-notes-note-edit').css('display') =='block') {
			var input = $('#note-edit-text').html();
			closeNotePanels();
			$('#panel-notes-main').css('display','block');
			$('#notes-main-text').html(input);
			showNotes(input);

		}
	}
}

	


