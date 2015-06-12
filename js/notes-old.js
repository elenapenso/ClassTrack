//--- Bunch to read the classId using callback ------------  /*
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
//--- Load the list of student from the selected class ----
function showNotes(input) {    //--- receive as a parameter the selected class -----------
	if (arguments.length == 1) { classNameToId(input, readClassID); }       
	$('#list-notes li').not(":first").remove();
	db.transaction(function (tx) {
		tx.executeSql("SELECT noteContent, noteTimestamp FROM notes WHERE classId = ? ORDER BY noteTimestamp DESC;",[classID], function (tx, result){		
			dataset = result.rows;                  
			for (var i = 0, item = null; i < dataset.length; i++) {
				var noteCONTENT = dataset.item(i).noteContent;  
				var noteDATE = dataset.item(i).noteTimestamp;   
				var thedate = convertDate(noteDATE);
				$("#list-notes").append('<li class="list-group-item"><h6 class="list-group-item-heading">'+ thedate +'<span style="visibility:hidden">'+
				noteDATE +'</span></h6><p class="list-group-item-text">'+ noteCONTENT +'</p></li>');
			
			}
		});	
	});     
	$("#input-new-note").val(''); 
}
//--- Add a new note to the selected class ---------------
function addNoteToClass() {         
    var input = $("#input-new-note").val();
	if (input != "") {                          
		var timestamp = convertDate();   
		db.transaction(function(tx) {
			tx.executeSql("INSERT INTO notes (noteContent, noteTimestamp, classId) VALUES (?,?,?);", [input,timestamp,classID]);
		});			
		$("#input-new-note").css('display','none');

		showNotes();
	} else {
		if ($("#input-new-note").css('display')== 'block') {
			$("#input-new-note").css('display','none');
		} else {
			$("#input-new-note").css('display','block');
			$("#input-new-note").focus();
		}
	}
}
//--- Delete multiple notes from the selected class ---- 	
function deleteNotes() {
	$("#list-notes li").each( function() {
		var selection = $(this);                           
		var notetimestamp = selection.find("span").html();         
		//var notetimestamp = $("#list-notes li h6 span").html();         
		if (selection.hasClass('active')) {                              
			db.transaction(function (tx) {  
				tx.executeSql("DELETE FROM notes WHERE classId =? AND noteTimestamp =?;", [classID,notetimestamp]);
			});
		}
	});
	showNotes();
} 	

//--- When click 'save' under STUDENT EDIT ------------------
function saveNoteForm() {                                           
	var input = $('#note-edit-text').html();
	var notecontent = $('#edit-note-content').val();
	var notetimestamp = $("#note-timestamp").html(); 
	var oldstamp = parseInt(notetimestamp); 
	var newstamp = convertDate();
	if (notecontent != '') {	
		db.transaction(function (tx) {
			tx.executeSql("UPDATE notes SET noteContent =?, noteTimestamp =? WHERE noteTimestamp = ? and classId =?;", [notecontent, newstamp, oldstamp,classID]);
		});		
		btnReturn();	
	}
}
//--- Close all panels under the page NOTES ---------------
function closeNotePanels() {
	$('#panel-notes-main').css('display','none');
	$('#panel-notes-note-edit').css('display','none');
}
//--- Clear fields in NOTE EDIT form -------------------
function clearNoteForm() {
	var notetimestamp = $("#note-date span").html();         
	var date = '<span id="note-timestamp" style="visibility:hidden">' + notetimestamp + '</span>';
	$('#note-date').html(date);
	$('#edit-note-content').val('');		
}
//--- Manage date for record and display ------------------
function convertDate(input) {
	var dateString;                                        
	if (arguments.length == 1) {       
		var date = new Date(input).toString();            
		var hour = date.substr(16,2); 
		var meridiam;  
		if (hour > 12) { 
			meridiam = 'pm';
			hour -= 12;
		} else { 
			meridiam = 'am'; 
		}
		dateString = date.substr(0,10) +', '+ date.substr(11,4) +' - '+ hour + date.substr(18,3) +' '+ meridiam;  
	} else if (arguments.length == 0) {
		dateString = new Date().getTime();
	}
	return dateString;
}	
  
//--- Select notes in NOTES PANEL ------------------------
$(document).on('tap', '#list-notes li', function() {             
	var selection = $(this);
	if (selection.hasClass('active') == true) {
		selection.removeClass('active');
	} else {
		selection.addClass('active');
	}
});  
 
  
 
  
  
  