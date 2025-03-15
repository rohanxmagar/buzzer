// ✅ Initialize Socket.io (Local or Deployed Environment)
const socket = io(
    window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://quickbuzz-dtle.onrender.com'
);

// ✅ Fetch Team Data from Session Storage
const teamName = sessionStorage.getItem('teamName') || "Team_X";
document.getElementById('teamNameDisplay').textContent = `Team: ${teamName}`;

// Stopwatch Variables
let buzzerPressed = false;
let startTime = 0;
let stopwatchInterval;

// ⏱️ Start Stopwatch when Buzzer is Active
function startStopwatch() {
    startTime = performance.now();
    const stopwatch = document.getElementById('stopwatch');
    stopwatch.style.display = 'block';

    stopwatchInterval = setInterval(() => {
        if (!buzzerPressed) {
            const elapsedTime = performance.now() - startTime;
            stopwatch.textContent = `⏱️ ${Math.floor(elapsedTime)} ms`;
        }
    }, 1);
}

// 🛎️ Handle Buzzer Press (Send Directly to Admin via Socket.io)
function pressBuzzer() {
    const buzzerButton = document.getElementById('buzzer');
    if (buzzerPressed || buzzerButton.disabled) return;

    buzzerPressed = true;
    buzzerButton.disabled = true;
    buzzerButton.classList.add('blocked');
    document.getElementById('buzzerStatus').textContent = '⏳ Buzzer Pressed! Waiting for admin...';

    const elapsedTime = Math.floor(performance.now() - startTime);
    socket.emit('buzzerPressed', { teamName, elapsedTime });

    clearInterval(stopwatchInterval);
}

// 🔄 Listen for Reset Event from Admin
socket.on('resetBuzzer', () => {
    buzzerPressed = false;
    document.getElementById('buzzer').disabled = true;
    document.getElementById('buzzerStatus').textContent = '🔁 Waiting for admin to activate buzzer!';
    document.getElementById('stopwatch').style.display = 'none';
    clearInterval(stopwatchInterval);
});

// 🔄 Listen for Activate Buzzer Event from Admin
socket.on('activateBuzzer', () => {
    buzzerPressed = false;
    document.getElementById('buzzer').disabled = false;
    document.getElementById('buzzerStatus').textContent = '✅ Ready to buzz!';
    startStopwatch();
});

// 🔄 Listen for Deactivate Buzzer Event from Admin
socket.on('deactivateBuzzer', () => {
    buzzerPressed = true;
    document.getElementById('buzzer').disabled = true;
    document.getElementById('buzzerStatus').textContent = '❌ Buzzer Deactivated by Admin!';
    clearInterval(stopwatchInterval);
});

// 🔄 Listen for Leaderboard Updates
socket.on("updateLeaderboard", (leaderboard) => {
    console.log("Received Leaderboard Update:", leaderboard); // ✅ Debugging

    const teamEntry = leaderboard.find(entry => entry.teamName === teamName);
    if (teamEntry) {
        document.getElementById('buzzerStatus').textContent = `🎉 Your Position: ${teamEntry.position}`;
    }
});

// 🔄 Listen for Individual Position Update
socket.on("yourPosition", (position) => {
    document.getElementById('buzzerStatus').textContent = `🎉 Your Position: ${position}`;
});

// ✅ Toggle Mobile Menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('toggle');
});

function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('toggle');
}

// 🔒 Logout Function
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
