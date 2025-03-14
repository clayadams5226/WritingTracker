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
    
    // In a real app, this would also update the charts using Chart.js or similar
    // For now, we'll keep the placeholder text
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