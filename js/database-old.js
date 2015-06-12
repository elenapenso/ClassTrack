
var db = window.openDatabase("ClassTrack", "1.0", "ClassTrack", 10*1024*1024);  // Open SQLite Database

//function onLoad() {
//	navigator.device.deviceReady();
//} 
		
function initDatabase() {
	try {
        if (!window.openDatabase)  {    
			alert('Databases are not supported in this browser.');
        } else { 
			db.transaction(function(tx) { 
				tx.executeSql("CREATE TABLE IF NOT EXISTS classes (classId INTEGER PRIMARY KEY AUTOINCREMENT, "+
							  "className VARCHAR(25), classDescription VARCHAR(50));");
				tx.executeSql("CREATE TABLE IF NOT EXISTS students (studentId INTEGER PRIMARY KEY AUTOINCREMENT, "+
					  		  "studentName VARCHAR(25), studentComments VARCHAR(50));");
				tx.executeSql("CREATE TABLE IF NOT EXISTS categories (categoryId INTEGER PRIMARY KEY AUTOINCREMENT, "+
							  "categoryName VARCHAR(20), categoryTag VARCHAR(3));");
				tx.executeSql("CREATE TABLE IF NOT EXISTS class_students (classId INTEGER, studentId INTEGER, categoryId INTEGER, "+
							  "PRIMARY KEY (classId, studentId), FOREIGN KEY(classId) REFERENCES classes(classId), FOREIGN KEY"+
							  "(studentId) REFERENCES students(studentId), FOREIGN KEY(categoryId) REFERENCES categories(categoryId));");
				tx.executeSql("CREATE TABLE IF NOT EXISTS notes (NoteId INTEGER PRIMARY KEY, classId INTEGER "+
				              "NOT NULL, noteContent VARCHAR(250), noteTimestamp DATETIME, FOREIGN KEY(classId) "+  
							  "REFERENCES classes(classId));");
				tx.executeSql("CREATE TABLE IF NOT EXISTS attendance(attId INTEGER PRIMARY KEY AUTOINCREMENT, classId INTEGER, "+
						  "studentId INTEGER, attSession VARCHAR(10), attIn INTEGER, attOut INTEGER, attLate VARCHAR(3), "+
						  "FOREIGN KEY(classID) REFERENCES classes(classId), FOREIGN KEY(studentId) REFERENCES students(studentId));");
				tx.executeSql("CREATE TABLE IF NOT EXISTS incidents (incidentId INTEGER PRIMARY KEY AUTOINCREMENT, "+
							  "incidentName VARCHAR(20), incidentCode INTEGER, incidentLevel VARCHAR(5));");
				tx.executeSql("CREATE TABLE IF NOT EXISTS behavior(behId INTEGER PRIMARY KEY AUTOINCREMENT, classId INTEGER, "+
						  "studentId INTEGER, behSession VARCHAR(10), behMark VARCHAR(5), behIncidents VARCHAR(100), behComments VARCHAR(250), "+
						  "FOREIGN KEY(classId) REFERENCES classes(classId), FOREIGN KEY(studentId) REFERENCES students(studentId));");
				tx.executeSql("CREATE TABLE IF NOT EXISTS loginfo(logId INTEGER PRIMARY KEY AUTOINCREMENT, logUser VARCHAR(40), "+
						  "logPassword VARCHAR(10));"); 
			
			
			
			
		//	tx.executeSql("delete from students where studentName = 'jane';");		
				
			});
		}
	} catch (e) {
        if (e == 2) {
            console.log("Invalid database version.");
        } else {
			console.log("Unknown error " + e + ".");       alert(e);
        }
        return;
    }
}

//DELETE FROM students WHERE (strftime('%s', time_created) + keepalive*60 - strftime('%s','now', 'localtime') < 0)
//	tx.executeSql("PRAGMA foreign_keys = ON;");