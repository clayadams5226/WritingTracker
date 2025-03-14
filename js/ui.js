// ui.js - Handles UI updates and interactions

// Update the UI with current data
function updateUI() {
    updateUserLevel();
    updateDashboard();
    updateWritingLog();
    updateProjects();
    updateProjectsDropdown();
    updateStats();
    updatePrompts();
}

// Update user level and XP display
function updateUserLevel() {
    const data = window.dataManager.getData();
    const levelText = document.querySelector('.level-text');
    const xpCount = document.querySelector('.xp-count');
    const levelProgress = document.querySelector('.level-progress');
    
    if (levelText && xpCount && levelProgress) {
        levelText.textContent = `Level ${data.user.level} Writer`;
        xpCount.textContent = `${data.user.xp} XP`;
        
        // Calculate progress to next level
        const nextLevelXP = data.user.level * 1000;
        const previousLevelXP = (data.user.level - 1) * 1000;
        const progressPercentage = ((data.user.xp - previousLevelXP) / (nextLevelXP - previousLevelXP)) * 100;
        
        levelProgress.style.width = `${progressPercentage}%`;
    }
}

// Update dashboard with current data
function updateDashboard() {
    const data = window.dataManager.getData();
    
    // Update prompt
    const promptTitle = document.querySelector('.prompt-title');
    const promptDescription = document.querySelector('.prompt-description');
    
    if (promptTitle && promptDescription) {
        const todaysPrompt = dataManager.getTodaysPrompt();
        promptTitle.textContent = todaysPrompt.title;
        promptDescription.textContent = todaysPrompt.description;
    }
    
    // Update streak
    const streakCount = document.querySelector('.streak-count');
    const streakBonus = document.querySelector('.streak-bonus');
    
    if (streakCount && streakBonus) {
        streakCount.textContent = `${data.user.streak} Day Streak`;
        streakBonus.textContent = `+${Math.min(25 * data.user.streak, 100)} XP daily bonus`;
    }
    
    // Update quests based on sessions
    updateQuestsStatus();
    
    // Update streak calendar
    updateStreakCalendar();
    
    // Check for achievements
    checkForAchievements();
    
    // Update avatar
    updateAvatar();
}

// Update avatar display
function updateAvatar() {
    const avatar = window.dataManager.getAvatarInfo();
    const avatarContainer = document.querySelector('.avatar-placeholder');
    
    if (!avatarContainer) return;
    
    // Create SVG container
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="120" height="120">
        <!-- Base character (always shown) -->
        <circle cx="100" cy="100" r="50" fill="#f0eaff" stroke="#6c5ce7" stroke-width="3"/>
        <circle cx="100" cy="80" r="25" fill="#ffb8b8"/>
        <rect x="85" y="105" width="30" height="40" rx="5" fill="#6c5ce7"/>
        
        <!-- Glasses -->
        ${avatar.equippedItems.includes('glasses') ? `
        <rect x="70" y="75" width="60" height="10" fill="#0a3d62" rx="5"/>
        ` : ''}
        
        <!-- Hat -->
        ${avatar.equippedItems.includes('hat') ? `
        <path d="M100 45 L100 55 L75 70 L125 70 L100 55 Z" fill="#ffd32a"/>
        ` : ''}
        
        <!-- Pen -->
        ${avatar.equippedItems.includes('pen') ? `
        <rect x="75" y="130" width="8" height="20" fill="#333"/>
        ` : ''}
        
        <!-- Notebook -->
        ${avatar.equippedItems.includes('notebook') ? `
        <rect x="120" y="110" width="20" height="25" fill="#fff" stroke="#333" stroke-width="1"/>
        <line x1="123" y1="115" x2="137" y2="115" stroke="#333" stroke-width="1"/>
        <line x1="123" y1="120" x2="137" y2="120" stroke="#333" stroke-width="1"/>
        <line x1="123" y1="125" x2="137" y2="125" stroke="#333" stroke-width="1"/>
        ` : ''}
        
        <!-- Coffee Mug -->
        ${avatar.equippedItems.includes('coffee') ? `
        <rect x="130" y="90" width="15" height="20" fill="#e67e22" rx="2"/>
        <path d="M145 95 L150 95 L150 105 L145 105 Z" fill="#e67e22"/>
        <line x1="133" y1="95" x2="142" y2="95" stroke="#fff" stroke-width="1"/>
        ` : ''}
        
        <!-- Typewriter -->
        ${avatar.equippedItems.includes('typewriter') ? `
        <rect x="40" y="120" width="40" height="25" fill="#7f8c8d" rx="3"/>
        <rect x="45" y="125" width="30" height="10" fill="#ecf0f1" rx="1"/>
        <circle cx="50" cy="140" r="2" fill="#34495e"/>
        <circle cx="55" cy="140" r="2" fill="#34495e"/>
        <circle cx="60" cy="140" r="2" fill="#34495e"/>
        <circle cx="65" cy="140" r="2" fill="#34495e"/>
        <circle cx="70" cy="140" r="2" fill="#34495e"/>
        ` : ''}
        
        <!-- Cloak -->
        ${avatar.equippedItems.includes('cloak') ? `
        <path d="M70 105 C 70 150, 130 150, 130 105" fill="#8e44ad" stroke="#6c3483" stroke-width="1"/>
        ` : ''}
        
        <!-- Quill Pen -->
        ${avatar.equippedItems.includes('quill') ? `
        <path d="M120 130 L135 110 L133 108 L130 110 L125 115 L123 125 Z" fill="#f1c40f"/>
        ` : ''}
    </svg>
    `;
    
    // Replace placeholder with avatar SVG
    avatarContainer.innerHTML = svgContent;
    avatarContainer.style.backgroundColor = 'transparent';
    avatarContainer.style.border = 'none';
    
    // Update "Next Unlock" info
    updateNextUnlock();
}

// Add function to update the "Next Unlock" info
function updateNextUnlock() {
    const data = window.dataManager.getData();
    const avatar = window.dataManager.getAvatarInfo();
    const currentLevel = data.user.level;
    
    // Find next item to unlock
    const nextItems = avatar.availableItems
        .filter(item => item.level > currentLevel)
        .sort((a, b) => a.level - b.level);
        
    const nextItem = nextItems.length > 0 ? nextItems[0] : null;
    
    // Update UI
    const unlockItem = document.querySelector('.unlock-item');
    const unlockProgress = document.querySelector('.unlock-progress');
    
    if (unlockItem && unlockProgress && nextItem) {
        unlockItem.textContent = nextItem.name;
        
        // Calculate progress to next level
        const nextLevelXP = currentLevel * 1000;
        const previousLevelXP = (currentLevel - 1) * 1000;
        const xpToNextLevel = nextLevelXP - data.user.xp;
        const progressPercentage = ((data.user.xp - previousLevelXP) / (nextLevelXP - previousLevelXP)) * 100;
        
        unlockProgress.style.width = `${progressPercentage}%`;
        
        // Update level text below progress bar
        const levelText = document.querySelector('.next-unlock .summary-value') || 
                          document.querySelector('.avatar-info + p') ||
                          document.createElement('p');
        
        if (!levelText.parentNode) {
            levelText.className = 'summary-value';
            document.querySelector('.next-unlock').appendChild(levelText);
        }
        
        levelText.textContent = `Level ${nextItem.level} (${xpToNextLevel} XP to go)`;
    }
}

// Open avatar gallery modal
function openAvatarGallery() {
    const modal = document.getElementById('avatar-gallery-modal');
    if (!modal) return;
    
    // Get avatar information
    const avatar = window.dataManager.getAvatarInfo();
    const data = window.dataManager.getData();
    const currentLevel = data.user.level;
    
    // Update preview
    const previewContainer = modal.querySelector('.avatar-preview');
    if (previewContainer) {
        // Use the same SVG as the main avatar
        const svgContent = document.querySelector('.avatar-placeholder').innerHTML;
        previewContainer.innerHTML = svgContent;
    }
    
    // Populate item grid
    const itemGrid = document.getElementById('avatar-item-grid');
    if (itemGrid) {
        itemGrid.innerHTML = '';
        
        avatar.availableItems.forEach(item => {
            const isUnlocked = avatar.unlockedItems.includes(item.id);
            const isEquipped = avatar.equippedItems.includes(item.id);
            
            const itemElement = document.createElement('div');
            itemElement.className = `avatar-item ${isUnlocked ? '' : 'locked'} ${isEquipped ? 'equipped' : ''}`;
            itemElement.dataset.id = item.id;
            
            // Different icons for different item types
            let itemIcon = '👤';
            switch (item.type) {
                case 'hat': itemIcon = '🎩'; break;
                case 'accessory': itemIcon = '👓'; break;
                case 'clothing': itemIcon = '👔'; break;
                case 'tool': itemIcon = '🖋️'; break;
            }
            
            itemElement.innerHTML = `
                <div class="item-icon">${itemIcon}</div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-unlock">${isUnlocked ? 'Unlocked' : `Unlocks at Level ${item.level}`}</div>
                </div>
            `;
            
            // Add click handler for unlocked items
            if (isUnlocked) {
                itemElement.addEventListener('click', () => {
                    toggleAvatarItemEquipped(item.id);
                });
            }
            
            itemGrid.appendChild(itemElement);
        });
    }
    
    // Show the modal
    modal.style.display = 'block';
}

function toggleAvatarItemEquipped(itemId) {
    const success = window.dataManager.toggleAvatarItem(itemId);
    
    if (success) {
        // Update the gallery view
        const itemElement = document.querySelector(`.avatar-item[data-id="${itemId}"]`);
        if (itemElement) {
            itemElement.classList.toggle('equipped');
        }
        
        // Update the preview
        const previewContainer = document.querySelector('.avatar-preview');
        if (previewContainer) {
            // Use updateAvatar function to generate new SVG
            updateAvatar();
            // Copy the updated SVG to the preview
            const svgContent = document.querySelector('.avatar-placeholder').innerHTML;
            previewContainer.innerHTML = svgContent;
        }
    }
}

// Update quests status based on writing activity
function updateQuestsStatus() {
    const data = window.dataManager.getData();
    const questsList = document.querySelector('.quests-list');
    
    if (!questsList) return;
    
    // Clear existing quests
    questsList.innerHTML = '';
    
    // Update quest statuses
    data.quests.forEach(quest => {
        // Check if morning rush is completed (750 words before noon today)
        if (quest.id === 1) {
            const today = new Date().toISOString().slice(0, 10);
            const morningSession = data.sessions.find(s => {
                return s.date.startsWith(today) && 
                       s.timeOfDay === 'morning' && 
                       s.wordCount >= 750;
            });
            quest.completed = !!morningSession;
        }
        
        // Check if prompt challenge is completed (any writing for a prompt)
        if (quest.id === 2) {
            quest.completed = data.completedPrompts.length > 0;
        }
        
        // 7-day streak quest
        if (quest.id === 3) {
            quest.completed = data.user.streak >= 7;
        }
        
        // Create quest element
        const questItem = document.createElement('div');
        questItem.className = `quest-item ${quest.completed ? 'completed' : ''}`;
        questItem.innerHTML = `
            <span class="quest-name">${quest.name} (${quest.description})</span>
            ${quest.completed ? '<span class="quest-complete">✓</span>' : ''}
        `;
        
        questsList.appendChild(questItem);
    });
}

// Simple streak calendar visualization
function updateStreakCalendar() {
    const data = window.dataManager.getData();
    const calendarContainer = document.querySelector('.calendar-placeholder');
    
    if (!calendarContainer) return;
    
    // If we have sessions, replace placeholder with actual calendar
    if (data.sessions.length > 0) {
        // Get last 14 days
        const today = new Date();
        const days = [];
        
        for (let i = 13; i >= 0; i--) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            days.push({
                date: day,
                dateString: day.toISOString().slice(0, 10),
                dayNumber: day.getDate(),
                hasWriting: false
            });
        }
        
        // Mark days with writing
        data.sessions.forEach(session => {
            const dayIndex = days.findIndex(d => d.dateString === session.date.slice(0, 10));
            if (dayIndex >= 0) {
                days[dayIndex].hasWriting = true;
            }
        });
        
        // Create calendar HTML
        calendarContainer.innerHTML = '<div class="streak-calendar-grid"></div>';
        const grid = calendarContainer.querySelector('.streak-calendar-grid');
        
        // Add CSS to parent
        calendarContainer.style.backgroundColor = 'transparent';
        calendarContainer.style.padding = '0';
        
        // Add CSS to grid
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        grid.style.gap = '5px';
        
        days.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = `calendar-day ${day.hasWriting ? 'has-writing' : 'no-writing'}`;
            dayElement.textContent = day.dayNumber;
            
            // Style the day
            dayElement.style.width = '30px';
            dayElement.style.height = '30px';
            dayElement.style.borderRadius = '50%';
            dayElement.style.display = 'flex';
            dayElement.style.alignItems = 'center';
            dayElement.style.justifyContent = 'center';
            dayElement.style.fontWeight = 'bold';
            
            if (day.hasWriting) {
                dayElement.style.backgroundColor = '#6c5ce7';
                dayElement.style.color = 'white';
            } else {
                dayElement.style.backgroundColor = '#f0f0f0';
                dayElement.style.color = '#999';
            }
            
            grid.appendChild(dayElement);
        });
    }
}

// Check for achievements (placeholder for now)
function checkForAchievements() {
    // This would check for newly unlocked achievements
    // For now, we'll just update the display
}

// Update writing log table
function updateWritingLog() {
    const data = window.dataManager.getData();
    const tableBody = document.getElementById('log-table-body');
    
    if (tableBody) {
        // Clear existing rows
        tableBody.innerHTML = '';
        
        if (data.sessions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="9">No writing sessions recorded yet.</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // Sort sessions by date (newest first)
        const sortedSessions = [...data.sessions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Add each session to the table
        sortedSessions.forEach(session => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(session.date);
            const formattedDate = date.toLocaleDateString();
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${session.projectName || session.project}</td>
                <td>${session.wordCount.toLocaleString()}</td>
                <td>${session.timeSpent}</td>
                <td>${session.location || '-'}</td>
                <td>${session.timeOfDay}</td>
                <td>${session.wph}</td>
                <td>${session.moodChange > 0 ? '+' + session.moodChange : session.moodChange}</td>
                <td>${session.notes || '-'}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
}

// Update projects table with action buttons
function updateProjects() {
    const data = window.dataManager.getData();
    const tableBody = document.getElementById('projects-table-body');
    const summaryValues = document.querySelectorAll('#projects .summary-value');
    
    if (tableBody) {
        // Clear existing rows
        tableBody.innerHTML = '';
        
        if (data.projects.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="9">No projects created yet.</td>';
            tableBody.appendChild(emptyRow);
            
            // Update summary
            if (summaryValues.length >= 3) {
                summaryValues[0].textContent = '0';
                summaryValues[1].textContent = '-';
                summaryValues[2].textContent = '0';
            }
            
            return;
        }
        
        // Calculate totals for summary
        const totalProjects = data.projects.length;
        let totalWords = 0;
        let mostProductiveProject = { name: '-', totalWords: 0 };
        
        // Add each project to the table
        data.projects.forEach(project => {
            const row = document.createElement('tr');
            
            // Calculate average words per hour
            const avgWPH = project.totalTime > 0 ? Math.round((project.totalWords / project.totalTime) * 60) : 0;
            
            // Update totals
            totalWords += project.totalWords;
            if (project.totalWords > mostProductiveProject.totalWords) {
                mostProductiveProject = project;
            }
            
            // Determine status display
            let statusHtml = '';
            if (project.completed) {
                statusHtml = '<span class="status-indicator status-completed">Completed</span>';
            } else if (project.targetWords) {
                const percentage = Math.min(100, Math.round(project.totalWords / project.targetWords * 100));
                statusHtml = `<span class="status-indicator status-in-progress">${percentage}% Complete</span>`;
            } else {
                statusHtml = '<span class="status-indicator status-in-progress">In Progress</span>';
            }
            
            // Create action buttons
            const actionButtons = `
                <div class="action-buttons">
                    <button class="action-button edit-button" data-id="${project.id}">Edit</button>
                    ${!project.completed ? `<button class="action-button complete-button" data-id="${project.id}">Complete</button>` : ''}
                    <button class="action-button delete-button" data-id="${project.id}">Delete</button>
                </div>
            `;
            
            row.innerHTML = `
                <td>${project.name}</td>
                <td>${project.type || '-'}</td>
                <td>${project.totalWords.toLocaleString()}</td>
                <td>${(project.totalTime / 60).toFixed(1)}</td>
                <td>${avgWPH}</td>
                <td>${project.sessionsCount}</td>
                <td>${statusHtml}</td>
                <td>${project.targetDate || 'N/A'}</td>
                <td>${actionButtons}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update summary
        if (summaryValues.length >= 3) {
            summaryValues[0].textContent = totalProjects;
            summaryValues[1].textContent = mostProductiveProject.name;
            summaryValues[2].textContent = totalWords.toLocaleString();
        }
        
        // Add event listeners for action buttons
        setupProjectActionButtons();
    }
}

// Set up event listeners for project action buttons
function setupProjectActionButtons() {
    // Edit buttons
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const projectId = e.target.dataset.id;
            openEditProjectModal(projectId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const projectId = e.target.dataset.id;
            openDeleteConfirmModal(projectId);
        });
    });
    
    // Complete buttons
    document.querySelectorAll('.complete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const projectId = e.target.dataset.id;
            openCompleteProjectModal(projectId);
        });
    });
}

// Open the edit project modal
function openEditProjectModal(projectId) {
    const data = window.dataManager.getData();
    const project = data.projects.find(p => p.id === projectId);
    
    if (project) {
        // Fill the form with current values
        document.getElementById('edit-project-id').value = project.id;
        document.getElementById('edit-project-name').value = project.name;
        document.getElementById('edit-project-type').value = project.type || 'other';
        document.getElementById('edit-target-words').value = project.targetWords || '';
        document.getElementById('edit-target-date').value = project.targetDate || '';
        
        // Show the modal
        document.getElementById('edit-project-modal').style.display = 'block';
    }
}

// Open the delete confirmation modal
function openDeleteConfirmModal(projectId) {
    document.getElementById('delete-project-id').value = projectId;
    document.getElementById('delete-confirm-modal').style.display = 'block';
}

// Open the complete project modal
function openCompleteProjectModal(projectId) {
    document.getElementById('complete-project-id').value = projectId;
    document.getElementById('complete-project-modal').style.display = 'block';
}

// Update projects dropdown in the writing entry form
function updateProjectsDropdown() {
    const projectSelect = document.getElementById('project');
    
    if (projectSelect) {
        // Remember selected value if any
        const selectedValue = projectSelect.value;
        
        // Clear existing options except the default
        while (projectSelect.options.length > 1) {
            projectSelect.remove(1);
        }
        
        // Get projects from data manager
        const projects = window.dataManager.getProjectsForDropdown();
        
        // Add each project as an option
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
        
        // Restore selected value if it still exists
        if (selectedValue) {
            projectSelect.value = selectedValue;
        }
    }
}

// Update stats and charts
function updateStats() {
    const data = window.dataManager.getData();
    const summaryValues = document.querySelectorAll('#stats .summary-value');
    
    if (summaryValues.length >= 6) {
        // Calculate total words
        const totalWords = data.sessions.reduce((sum, session) => sum + session.wordCount, 0);
        
        // Current streak
        const streak = data.user.streak;
        
        // Average daily words
        const uniqueDays = new Set(data.sessions.map(s => s.date.substring(0, 10))).size;
        const avgWords = uniqueDays > 0 ? Math.round(totalWords / uniqueDays) : 0;
        
        // Best day
        let bestDay = { date: '-', words: 0 };
        
        // Group sessions by day
        const sessionsByDay = {};
        data.sessions.forEach(session => {
            const day = session.date.substring(0, 10);
            if (!sessionsByDay[day]) {
                sessionsByDay[day] = 0;
            }
            sessionsByDay[day] += session.wordCount;
        });
        
        // Find best day
        for (const [day, words] of Object.entries(sessionsByDay)) {
            if (words > bestDay.words) {
                bestDay = { date: day, words };
            }
        }
        
        // Format best day
        let bestDayFormatted = '-';
        if (bestDay.date !== '-') {
            const dateObj = new Date(bestDay.date);
            bestDayFormatted = `${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${bestDay.words.toLocaleString()})`;
        }
        
        // Most productive time - count sessions by time of day
        const timeOfDayCounts = {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
        };
        
        data.sessions.forEach(session => {
            if (session.timeOfDay) {
                timeOfDayCounts[session.timeOfDay]++;
            }
        });
        
        let mostProductiveTime = '-';
        let maxCount = 0;
        
        for (const [time, count] of Object.entries(timeOfDayCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostProductiveTime = time.charAt(0).toUpperCase() + time.slice(1);
            }
        }
        
        // Best location
        const locationCounts = {};
        
        data.sessions.forEach(session => {
            if (session.location) {
                if (!locationCounts[session.location]) {
                    locationCounts[session.location] = 0;
                }
                locationCounts[session.location]++;
            }
        });
        
        let bestLocation = '-';
        maxCount = 0;
        
        for (const [location, count] of Object.entries(locationCounts)) {
            if (count > maxCount) {
                maxCount = count;
                bestLocation = location;
            }
        }
        
        // Update summary values
        summaryValues[0].textContent = totalWords.toLocaleString();
        summaryValues[1].textContent = streak > 0 ? `${streak} days` : '0 days';
        summaryValues[2].textContent = avgWords.toLocaleString();
        summaryValues[3].textContent = bestDayFormatted;
        summaryValues[4].textContent = mostProductiveTime;
        summaryValues[5].textContent = bestLocation;
    }
    
    // Render charts
    updateCharts();
}

// Update charts
function updateCharts() {
    const data = window.dataManager.getData();
    
    // Only create charts if we have sessions
    if (data.sessions.length === 0) return;
    
    // Process session data for charts
    const chartData = processChartData(data.sessions);
    
    // Render each chart
    renderDailyWordCountChart(chartData);
    renderDayOfWeekChart(chartData);
    renderTimeOfDayChart(chartData);
    renderEfficiencyChart(chartData);
    renderMoodImpactChart(chartData);
}

// Process session data into chart-friendly format
function processChartData(sessions) {
    // Sort sessions by date (oldest first for timeline charts)
    const sortedSessions = [...sessions].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    
    // Get unique dates and calculate daily totals
    const dailyTotals = {};
    const dayOfWeekTotals = {
        "Sunday": { words: 0, count: 0 },
        "Monday": { words: 0, count: 0 },
        "Tuesday": { words: 0, count: 0 },
        "Wednesday": { words: 0, count: 0 },
        "Thursday": { words: 0, count: 0 },
        "Friday": { words: 0, count: 0 },
        "Saturday": { words: 0, count: 0 }
    };
    const timeOfDayTotals = {
        "morning": 0,
        "afternoon": 0,
        "evening": 0,
        "night": 0
    };
    const efficiencyData = [];
    const moodData = [];
    
    // Last 14 days date range (reduced from 30 to 14 to prevent excessive scrolling)
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    // Create empty data for the last 14 days
    for (let i = 0; i < 14; i++) {
        const date = new Date(twoWeeksAgo);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        dailyTotals[dateString] = 0;
    }
    
    // Process each session
    sortedSessions.forEach(session => {
        const date = new Date(session.date);
        const dateString = session.date.split('T')[0];
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        const timeOfDay = session.timeOfDay || 'morning';
        const wph = session.wph || Math.round((session.wordCount / session.timeSpent) * 60);
        
        // Only include data from the last 14 days for daily chart
        if (date >= twoWeeksAgo && date <= today) {
            // Add to daily totals
            if (dailyTotals[dateString] !== undefined) {
                dailyTotals[dateString] += session.wordCount;
            } else {
                dailyTotals[dateString] = session.wordCount;
            }
        }
        
        // Add to day of week totals
        if (!dayOfWeekTotals[dayOfWeek]) {
            dayOfWeekTotals[dayOfWeek] = { words: 0, count: 0 };
        }
        dayOfWeekTotals[dayOfWeek].words += session.wordCount;
        dayOfWeekTotals[dayOfWeek].count += 1;
        
        // Add to time of day totals
        if (timeOfDayTotals[timeOfDay] !== undefined) {
            timeOfDayTotals[timeOfDay] += session.wordCount;
        }
        
        // Add to efficiency data
        efficiencyData.push({
            date: dateString,
            wph: wph
        });
        
        // Add to mood data if both before and after are recorded
        if (session.moodBefore && session.moodAfter) {
            moodData.push({
                date: dateString,
                before: session.moodBefore,
                after: session.moodAfter,
                change: session.moodAfter - session.moodBefore
            });
        }
    });
    
    // Calculate averages for day of week
    const dayOfWeekAverages = {};
    for (const [day, data] of Object.entries(dayOfWeekTotals)) {
        dayOfWeekAverages[day] = data.count > 0 ? Math.round(data.words / data.count) : 0;
    }
    
    return {
        dailyTotals,
        dayOfWeekAverages,
        timeOfDayTotals,
        efficiencyData,
        moodData
    };
}

// Render Daily Word Count Chart
function renderDailyWordCountChart(chartData) {
    const canvas = document.getElementById('dailyWordCountChart');
    if (!canvas) return;
    
    // Clear existing chart
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Prepare data - limit to last 7 days to prevent scrolling issues
    const dates = Object.keys(chartData.dailyTotals).slice(-7).sort();
    const wordCounts = dates.map(date => chartData.dailyTotals[date]);
    
    // Find maximum word count to set scale
    const maxWordCount = Math.max(...wordCounts, 1); // Add 1 to prevent 0 max
    const suggestedMax = Math.ceil(maxWordCount * 1.2 / 500) * 500; // Round to nearest 500 above max
    
    // Format dates for display
    const formattedDates = dates.map(date => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Create chart
    canvas.chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: formattedDates,
            datasets: [{
                label: 'Words Written',
                data: wordCounts,
                backgroundColor: 'rgba(108, 92, 231, 0.7)',
                borderColor: 'rgba(108, 92, 231, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 0
            },
            animation: {
                duration: 500
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10
                    },
                    max: suggestedMax,
                    title: {
                        display: true,
                        text: 'Word Count'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                }
            }
        }
    });
}

// Render Day of Week Chart
function renderDayOfWeekChart(chartData) {
    const canvas = document.getElementById('dayOfWeekChart');
    if (!canvas) return;
    
    // Clear existing chart
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Order days of the week
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const averages = daysOrder.map(day => chartData.dayOfWeekAverages[day] || 0);
    
    // Find maximum value to set scale
    const maxAverage = Math.max(...averages, 1);
    const suggestedMax = Math.ceil(maxAverage * 1.2 / 500) * 500;
    
    // Create chart
    canvas.chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: daysOrder,
            datasets: [{
                label: 'Average Words per Day',
                data: averages,
                backgroundColor: 'rgba(80, 119, 231, 0.7)',
                borderColor: 'rgba(80, 119, 231, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 0
            },
            animation: {
                duration: 500
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10
                    },
                    max: suggestedMax,
                    title: {
                        display: true,
                        text: 'Avg. Word Count'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                }
            }
        }
    });
}

// Render Time of Day Chart
function renderTimeOfDayChart(chartData) {
    const canvas = document.getElementById('timeOfDayChart');
    if (!canvas) return;
    
    // Clear existing chart
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Format times for display
    const times = ["morning", "afternoon", "evening", "night"];
    const displayTimes = ["Morning", "Afternoon", "Evening", "Night"];
    const wordCounts = times.map(time => chartData.timeOfDayTotals[time] || 0);
    
    // Create chart
    canvas.chart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: displayTimes,
            datasets: [{
                data: wordCounts,
                backgroundColor: [
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 0
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 10,
                        font: {
                            size: 10
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} words (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render Efficiency Chart
function renderEfficiencyChart(chartData) {
    const canvas = document.getElementById('efficiencyChart');
    if (!canvas) return;
    
    // Clear existing chart
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Use only the last 7 sessions for efficiency to prevent scrolling issues
    const efficiencyData = chartData.efficiencyData.slice(-7);
    
    // Prepare data
    const dates = efficiencyData.map(d => d.date);
    const wphValues = efficiencyData.map(d => d.wph);
    
    // Find maximum value to set scale
    const maxWph = Math.max(...wphValues, 1);
    const suggestedMax = Math.ceil(maxWph * 1.2 / 100) * 100;
    
    // Format dates for display
    const formattedDates = dates.map(date => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Create chart
    canvas.chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: formattedDates,
            datasets: [{
                label: 'Words per Hour',
                data: wphValues,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 0
            },
            animation: {
                duration: 500
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10
                    },
                    max: suggestedMax,
                    title: {
                        display: true,
                        text: 'Words per Hour'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                }
            }
        }
    });
}

// Render Mood Impact Chart
function renderMoodImpactChart(chartData) {
    const canvas = document.getElementById('moodImpactChart');
    if (!canvas) return;
    
    // Clear existing chart
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Use only the last 7 sessions with mood data to prevent scrolling issues
    const moodData = chartData.moodData.slice(-7);
    
    // Prepare data
    const dates = moodData.map(d => d.date);
    const beforeValues = moodData.map(d => d.before);
    const afterValues = moodData.map(d => d.after);
    
    // Format dates for display
    const formattedDates = dates.map(date => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Create chart
    canvas.chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: formattedDates,
            datasets: [
                {
                    label: 'Before Writing',
                    data: beforeValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'After Writing',
                    data: afterValues,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 0
            },
            animation: {
                duration: 500
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    grid: {
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 2,
                        padding: 10
                    },
                    title: {
                        display: true,
                        text: 'Mood (1-10)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 15,
                        padding: 10,
                        font: {
                            size: 10
                        }
                    }
                },
                title: {
                    display: false
                }
            }
        }
    });
}

// Update prompts tab
function updatePrompts() {
    // This would populate the prompts list and skill development
    // For now, we'll use the placeholder content
}

// Handle tab switching
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // Remove active class from all tabs and buttons
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Add active class to selected tab and button
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// Set up form handling
function setupFormHandlers() {
    // Writing form submission
    const writingForm = document.getElementById('writing-form');
    
    if (writingForm) {
        writingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(writingForm);
            const projectId = formData.get('project');
            
            // Find the project name for display purposes
            let projectName = "Unknown Project";
            const projects = window.dataManager.getProjectsForDropdown();
            const selectedProject = projects.find(p => p.id === projectId);
            if (selectedProject) {
                projectName = selectedProject.name;
            }
            
            const session = {
                date: formData.get('date'),
                project: projectId, // This is now the ID
                projectName: projectName, // We store the name separately for display
                wordCount: parseInt(formData.get('wordCount')),
                timeSpent: parseInt(formData.get('timeSpent')),
                location: formData.get('location'),
                timeOfDay: formData.get('timeOfDay'),
                moodBefore: parseInt(formData.get('moodBefore') || 0),
                moodAfter: parseInt(formData.get('moodAfter') || 0),
                notes: formData.get('notes')
            };
            
            // Add session
            window.dataManager.addSession(session);
            
            // Update UI
            updateUI();
            
            // Reset form
            writingForm.reset();
            setDefaultDate(); // Reset date to today
            
            // Show success message or notification
            alert('Writing session saved successfully!');
            
            // Switch to dashboard to see updated info
            const dashboardTab = document.querySelector('.tab-button[data-tab="dashboard"]');
            if (dashboardTab) {
                dashboardTab.click();
            }
        });
    }
    
    // Project form submission
    const projectForm = document.getElementById('project-form');
    
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(projectForm);
            const project = {
                name: formData.get('projectName'),
                type: formData.get('projectType'),
                targetWords: parseInt(formData.get('targetWords') || 0),
                targetDate: formData.get('targetDate')
            };
            
            // Add project
            window.dataManager.addProject(project);
            
            // Update UI
            updateUI();
            
            // Reset form
            projectForm.reset();
            
            // Show success message or notification
            alert('Project added successfully!');
        });
    }
}

// Set up modals and their forms
function setupModals() {
    // Close buttons for all modals
    document.querySelectorAll('.close-button, .cancel-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Edit project form
    const editForm = document.getElementById('edit-project-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const projectId = document.getElementById('edit-project-id').value;
            const formData = new FormData(editForm);
            
            const updatedProject = {
                name: formData.get('projectName'),
                type: formData.get('projectType'),
                targetWords: parseInt(formData.get('targetWords') || 0),
                targetDate: formData.get('targetDate')
            };
            
            if (window.dataManager.editProject(projectId, updatedProject)) {
                updateUI();
                document.getElementById('edit-project-modal').style.display = 'none';
                alert('Project updated successfully!');
            } else {
                alert('Error updating project.');
            }
        });
    }
    
    // Delete project confirmation
    const deleteBtn = document.getElementById('confirm-delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const projectId = document.getElementById('delete-project-id').value;
            
            if (window.dataManager.deleteProject(projectId)) {
                updateUI();
                document.getElementById('delete-confirm-modal').style.display = 'none';
                alert('Project deleted successfully!');
            } else {
                alert('Error deleting project.');
            }
        });
    }
    
    // Complete project confirmation
    const completeBtn = document.getElementById('confirm-complete-btn');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            const projectId = document.getElementById('complete-project-id').value;
            
            if (window.dataManager.completeProject(projectId)) {
                updateUI();
                document.getElementById('complete-project-modal').style.display = 'none';
                alert('Congratulations! Project marked as complete and you earned 500 XP!');
            } else {
                alert('Error completing project.');
            }
        });
    }
    
    // Avatar gallery button
    const viewGalleryBtn = document.querySelector('.avatar-card .secondary-button');
    if (viewGalleryBtn) {
        viewGalleryBtn.addEventListener('click', openAvatarGallery);
    }
}

// Set today's date as default in the writing form
function setDefaultDate() {
    const dateInput = document.getElementById('entry-date');
    
    if (dateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        dateInput.value = formattedDate;
    }
}

// Export functions for use in other files
window.uiManager = {
    update: updateUI,
    setupTabs: setupTabNavigation,
    setupForms: setupFormHandlers,
    setupModals: setupModals,
    setDefaultDate: setDefaultDate
};