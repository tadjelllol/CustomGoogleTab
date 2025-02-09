function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
}

setInterval(updateTime, 1000);
updateTime();

document.getElementById('search').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const query = event.target.value;
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
});
