const users = [
    {
        username: "student",
        password: "1234",
        firstName: "Lebron",
        lastName: "James",
        gender: "Male",
        dob: "2000-01-01",
        email: "Lebron.James@email.com",
        address: "123 Main St, Melbourne",
        phone: "0412345678",
        drivingType: "L",
        type: "student"
    },
    {
        username: "trainer",
        password: "4321",
        firstName: "Alex",
        lastName: "Smith",
        gender: "Male",
        dob: "1980-05-10",
        email: "alex.smith@email.com",
        address: "456 Trainer Rd, Melbourne",
        phone: "0409876543",
        drivingType: "O",
        type: "trainer"
    }
];

let currentUser = null;
let lessons = [];
let notes = [];
let inbox = [
    {msg: "Welcome to No Yelling Driving School!", unread: true},
    {msg: "Your booking was successful.", unread: true}
];

/*check users login validation*/
function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    currentUser = users.find(user => user.username === u && user.password === p);
    if (currentUser) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("homePage").style.display = "block";
        document.getElementById("welcomeMsg").innerText = `Welcome, ${currentUser.firstName}`;
        updateUnread();
        renderHomeMenu();
    } else {
        document.getElementById("errorMsg").innerText = "Invalid credentials!";
    }

    const profileIcon = document.getElementById("profileIcon");
    if (profileIcon) {
        if (currentUser.type === "trainer") {
            profileIcon.src = "Trainer.png"; // Replace with actual trainer image filename
            profileIcon.alt = "Trainer Profile";
        } else {
            profileIcon.src = "L plate.png";
            profileIcon.alt = "Student Profile";
        }
    }
}

/* show the page that users selected*/
function showSection(section) {
    ["homePage","bookPage","lessonsPage","notesPage","inboxPage","profilePage"].forEach(id=>{
        document.getElementById(id).style.display="none";
    });
    
    if(section==="home") {
        document.getElementById("homePage").style.display="block";
    } else if(section==="book") {
        document.getElementById("bookPage").style.display="block";
        document.getElementById("lessonDate").value = "";
        document.getElementById("lessonTime").value = "";
        document.getElementById("trainer").value = "";
        document.getElementById("bookMsg").innerText = "";
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const localDate = `${yyyy}-${mm}-${dd}`;
        document.getElementById("lessonDate").setAttribute("min", localDate);

    } else if(section==="lessons") {
        document.getElementById("lessonsPage").style.display="block";
        document.querySelector("#lessonsPage h2").innerText = 
            currentUser.type === "trainer" ? "My Teaching Schedule" : "My Lessons";
        renderLessons();
    } else if(section==="notes") {
        document.getElementById("notesPage").style.display="block";
        renderNotes();
    } else if(section==="inbox") {
        document.getElementById("inboxPage").style.display="block";
        renderInbox();
    } else if(section==="profile") {
        document.getElementById("profilePage").style.display="block";
        renderProfile();
    }

    const lessonsHeading = document.querySelector("#lessonsPage h2");
    lessonsHeading.innerText = currentUser.type === "trainer" ? "My Teaching Schedule" : "My Lessons";

    if (currentUser.type === "trainer") {
        lessonsHeading.style.marginLeft = "100px"; // or any value you prefer
    } else {
        lessonsHeading.style.marginLeft = "0";
    }

}

/*allow students to book lessons when they click book a lesson button*/
function submitBooking(e) {
    e.preventDefault();
    const date = document.getElementById("lessonDate").value;
    const time = document.getElementById("lessonTime").value;
    const trainer = document.getElementById("trainer").value;

    if (time) {
        const [hour, minute] = time.split(':');
        if (minute !== "00" && minute !== "30") {
            document.getElementById("bookMsg").style.color = "red";
            document.getElementById("bookMsg").innerText = "Please select a time ending in :00 or :30.";
            return;
        }
    }

    if(date && time && trainer) {
        lessons.push({
            date,
            time,
            trainer,
            status:"Booked",
            studentUsername: currentUser.username
        });
        inbox.push({msg:`Lesson booked for ${date} at ${time} with ${trainer}.`, unread:true});
        document.getElementById("bookMsg").style.color="green";
        document.getElementById("bookMsg").innerText="Booking successful!";
        updateUnread();
        setTimeout(()=>showSection('lessons'),1000);
    } else {
        document.getElementById("bookMsg").style.color="red";
        document.getElementById("bookMsg").innerText="Please fill all fields.";
    }

}

/*only student can see the book a lesson button*/
function renderHomeMenu() {
    const bookBtn = document.querySelector('.main-btn');
    const lessonBtn = document.querySelector('.grid-menu .menu-item:nth-child(1) p');
    if (bookBtn) bookBtn.style.display = (currentUser.type === "student") ? "block" : "none";
    if (lessonBtn) lessonBtn.innerText = (currentUser.type === "trainer") ? "My Teaching Schedule" : "My Lessons";

}



/*show the lessons that related to the logged in users*/
function renderLessons() {
    const ul = document.getElementById("lessonsList");
    let filteredLessons = [];

    if (currentUser.type === "trainer") {
        filteredLessons = lessons.filter(l => l.trainer === currentUser.firstName);
    } else {
        filteredLessons = lessons.filter(l => l.studentUsername === currentUser.username);
    }

    if (!filteredLessons.length) {
        ul.innerHTML = "<li>No lessons booked.</li>";
        return;
    }

    ul.innerHTML = filteredLessons.map((lesson, index) => {
        const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
        const now = new Date();
        const hoursDiff = (lessonDateTime - now) / (1000 * 60 * 60);
        const canCancel = hoursDiff >= 48 && lesson.status === "Booked";

        const originalIndex = lessons.findIndex(l => 
            l.date === lesson.date && 
            l.time === lesson.time && 
            l.trainer === lesson.trainer && 
            l.studentUsername === lesson.studentUsername
        );

        let displayName = "";
        if (currentUser.type === "trainer") {
            const student = users.find(u => u.username === lesson.studentUsername);
            displayName = student ? student.firstName : lesson.studentUsername;
        } else {
            displayName = lesson.trainer;
        }

        return `
            <li>
                <strong>${lesson.date} ${lesson.time}</strong> with ${displayName} - ${lesson.status}
                ${canCancel ? `<button onclick="cancelLesson(${originalIndex})">Cancel</button>` : ""}
            </li>
        `;
    }).join("");
}

/*allow students and trainers to cancel lessons before 48 hours of the lesson start time*/
function cancelLesson(index) {
    if (index < 0 || index >= lessons.length) return;
    
    const lesson = lessons[index];
    const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
    const now = new Date();
    const hoursDiff = (lessonDateTime - now) / (1000 * 60 * 60);
    
    if (hoursDiff < 48) {
        alert("You can only cancel a lesson at least 48 hours before it starts.");
        return;
    }

    lessons[index].status = "Cancelled";
    
    const cancelMsg = currentUser.type === "student" 
        ? `Lesson on ${lesson.date} at ${lesson.time} with ${lesson.trainer} was cancelled by student.`
        : `Lesson on ${lesson.date} at ${lesson.time} with student ${lesson.studentUsername} was cancelled by trainer.`;
    
    inbox.push({msg: cancelMsg, unread: true});
    updateUnread();
    renderLessons();
}

/*handle the practice notes for students and trainers*/
function renderNotes() {
    const ul = document.getElementById("notesList");
    const trainerContainer = document.getElementById("trainerNotesContainer");
    ul.style.display = "none";
    trainerContainer.style.display = "none";

    if (currentUser && currentUser.type === "student") {
        ul.style.display = "block";
        let filteredNotes = notes.filter(n => n.studentUsername === currentUser.username);
        ul.innerHTML = filteredNotes.length ? filteredNotes.map(n=>`
            <li><strong>${n.date}:</strong> ${n.note}</li>
        `).join("") : "<li>No practice notes yet.</li>";
    } else if (currentUser && currentUser.type === "trainer") {
        trainerContainer.style.display = "flex";
        trainerContainer.style.flexWrap = "wrap";
        trainerContainer.style.justifyContent = "center";
        trainerContainer.style.gap = "18px";
        trainerContainer.innerHTML = "";

        let trainerLessons = lessons.filter(l => l.trainer === currentUser.firstName && l.status === "Booked");
        trainerContainer.innerHTML = trainerLessons.length ? trainerLessons.map((l, idx) => {
            const student = users.find(u => u.username === l.studentUsername);
            const studentName = student ? `${student.firstName} ${student.lastName}` : l.studentUsername;

            return `
                <div class="trainer-note-card">
                    <div class="trainer-note-info"><strong>Date:</strong> ${l.date} <strong>Time:</strong> ${l.time}</div>
                    <div class="trainer-note-info"><strong>Student:</strong> ${studentName}</div>
                    <textarea id="trainerNoteInput${idx}" rows="3" class="trainer-note-textarea" placeholder="Write practice note..."></textarea>
                    <button class="main-btn trainer-note-btn" onclick="submitTrainerNoteFromNotesPage(${idx})">Submit</button>
                </div>
            `;
        }).join("") : "<div style='text-align:center; color: white;'>No lessons to write notes for.</div>";

    }
}

/*show the messages in the in-box notification*/
function renderInbox() {
    const ul = document.getElementById("inboxList");
    ul.innerHTML = inbox.length ? inbox.map((m,i)=>`
        <li style="background:${m.unread?'#e6f0ff':'#fff'};padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;" onclick="markRead(${i})">
            ${m.msg} ${m.unread?'<span style="color:#ff3b3b;">(unread)</span>':''}
        </li>
    `).join("") : "<li>No messages.</li>";
}

/*when the users click the message, that message will be marked as read*/
function markRead(idx) {
    inbox[idx].unread = false;
    updateUnread();
    renderInbox();
}

/*display unread message count*/
function updateUnread() {
    const count = inbox.filter(m=>m.unread).length;
    const badge = document.getElementById("unreadCount");
    badge.innerText = count;
    badge.style.display = count ? "inline-block" : "none";
}

/*show user profile details*/
function renderProfile() {
    document.getElementById("profileDetails").innerHTML = `
        <p><strong>First Name:</strong> ${currentUser.firstName}</p>
        <p><strong>Last Name:</strong> ${currentUser.lastName}</p>
        <p><strong>Gender:</strong> ${currentUser.gender}</p>
        <p><strong>Date of Birth:</strong> ${currentUser.dob}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Address:</strong> ${currentUser.address}</p>
        <p><strong>Phone:</strong> ${currentUser.phone}</p>
        <p><strong>Driving Type:</strong> ${currentUser.drivingType}</p>
    `;
}

/*close out the current user account and go back to the login page*/
function logout() {
    currentUser = null;
    ["homePage","bookPage","lessonsPage","notesPage","inboxPage","profilePage"].forEach(id=>{
        document.getElementById(id).style.display="none";
    });
    document.getElementById("loginPage").style.display = "flex";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("errorMsg").innerText = "";
}


/*handle the practice notes for trainers*/
let noteLessonIdx = null;

function writeNote(idx) {
    noteLessonIdx = idx;
    document.getElementById("trainerNoteText").value = "";
    document.getElementById("noteModal").style.display = "flex";
}

function closeNoteModal() {
    document.getElementById("noteModal").style.display = "none";
    noteLessonIdx = null;
}

function submitTrainerNote() {
    const noteText = document.getElementById("trainerNoteText").value.trim();
    if (noteText && noteLessonIdx !== null) {
        const lesson = lessons[noteLessonIdx];
        notes.push({
            date: lesson.date,
            note: `Trainer's notes: ${noteText}`,
            studentUsername: lesson.studentUsername
        });
        lessons[noteLessonIdx].status = "Finished";
        inbox.push({msg:`Practice notes added for lesson on ${lesson.date}.`, unread:true});
        updateUnread();
        closeNoteModal();
        renderLessons();
    }
}

function submitTrainerNoteFromNotesPage(idx) {
    let trainerLessons = lessons.filter(l => l.trainer === currentUser.firstName && l.status === "Booked");
    const lesson = trainerLessons[idx];
    const noteText = document.getElementById(`trainerNoteInput${idx}`).value.trim();
    if (noteText && lesson) {
        notes.push({
            date: lesson.date,
            note: `Trainer's notes: ${noteText}`,
            studentUsername: lesson.studentUsername
        });
        lesson.status = "Finished";
        inbox.push({msg:`Practice notes added for lesson on ${lesson.date}.`, unread:true});
        renderNotes();
    }
}


