// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    updateDate();
    loadTodayMeals();
    updateStats();
    renderWeeklyCalendar();
});

// Update current date display
function updateDate() {
    const dateElement = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Get today's date key
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Load today's meals from localStorage
function loadTodayMeals() {
    const todayKey = getTodayKey();
    const meals = JSON.parse(localStorage.getItem(todayKey)) || { lunch: false, dinner: false };
    
    updateMealUI('lunch', meals.lunch);
    updateMealUI('dinner', meals.dinner);
}

// Toggle meal status
function toggleMeal(mealType) {
    const todayKey = getTodayKey();
    const meals = JSON.parse(localStorage.getItem(todayKey)) || { lunch: false, dinner: false };
    
    meals[mealType] = !meals[mealType];
    localStorage.setItem(todayKey, JSON.stringify(meals));
    
    updateMealUI(mealType, meals[mealType]);
    updateStats();
    renderWeeklyCalendar();
    
    // Add celebration animation
    if (meals[mealType]) {
        celebrateMeal(mealType);
    }
}

// Update meal UI
function updateMealUI(mealType, isConsumed) {
    const card = document.getElementById(`${mealType}Card`);
    const button = document.getElementById(`${mealType}Button`);
    const status = document.getElementById(`${mealType}Status`);
    
    if (isConsumed) {
        card.classList.add('consumed');
        button.classList.add('checked');
        status.textContent = `✓ Consumed at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        card.classList.remove('consumed');
        button.classList.remove('checked');
        status.textContent = 'Not consumed yet';
    }
}

// Celebration animation
function celebrateMeal(mealType) {
    const card = document.getElementById(`${mealType}Card`);
    card.style.animation = 'none';
    setTimeout(() => {
        card.style.animation = 'celebrate 0.5s ease';
    }, 10);
}

// Update statistics
function updateStats() {
    const todayKey = getTodayKey();
    const meals = JSON.parse(localStorage.getItem(todayKey)) || { lunch: false, dinner: false };
    
    // Today's meals
    const consumed = (meals.lunch ? 1 : 0) + (meals.dinner ? 1 : 0);
    document.getElementById('todayMeals').textContent = `${consumed}/2`;
    
    // Weekly progress
    const weeklyData = getWeeklyData();
    const totalMeals = weeklyData.length * 2;
    const consumedMeals = weeklyData.reduce((sum, day) => {
        const dayMeals = JSON.parse(localStorage.getItem(day)) || { lunch: false, dinner: false };
        return sum + (dayMeals.lunch ? 1 : 0) + (dayMeals.dinner ? 1 : 0);
    }, 0);
    const weeklyProgress = Math.round((consumedMeals / totalMeals) * 100);
    document.getElementById('weeklyProgress').textContent = `${weeklyProgress}%`;
    
    // Streak calculation
    const streak = calculateStreak();
    document.getElementById('streak').textContent = streak;
}

// Get weekly data (last 7 days)
function getWeeklyData() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        days.push(key);
    }
    return days;
}

// Calculate streak
function calculateStreak() {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const meals = JSON.parse(localStorage.getItem(key));
        
        if (!meals || (!meals.lunch && !meals.dinner)) {
            break;
        }
        
        if (meals.lunch || meals.dinner) {
            streak++;
        }
    }
    
    return streak;
}

// Render weekly calendar
function renderWeeklyCalendar() {
    const calendar = document.getElementById('weeklyCalendar');
    calendar.innerHTML = '';
    
    const weeklyData = getWeeklyData();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    weeklyData.forEach(dateKey => {
        const [year, month, day] = dateKey.split('-');
        const date = new Date(year, month - 1, day);
        const meals = JSON.parse(localStorage.getItem(dateKey)) || { lunch: false, dinner: false };
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        dayCard.innerHTML = `
            <div class="day-name">${dayNames[date.getDay()]}</div>
            <div class="day-date">${day}</div>
            <div class="day-meals">
                <div class="meal-dot ${meals.lunch ? 'consumed' : ''}"></div>
                <div class="meal-dot ${meals.dinner ? 'consumed' : ''}"></div>
            </div>
        `;
        
        calendar.appendChild(dayCard);
    });
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
        localStorage.clear();
        loadTodayMeals();
        updateStats();
        renderWeeklyCalendar();
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes celebrate {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);