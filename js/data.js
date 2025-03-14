// data.js - Handles all data management and storage

// Main data structure (will be saved to localStorage)
const WriterQuest = {
    user: {
        level: 1,
        xp: 0,
        streak: 0,
        lastWritingDate: null
    },
    
    sessions: [],
    projects: [],
    achievements: [],
    completedPrompts: [],
    skills: {
        dialogue: 0,
        character: 0,
        setting: 0,
        plot: 0,
        description: 0
    },
    
    avatar: {
        unlockedItems: ['base'],
        equippedItems: ['base'],
        availableItems: [
            { id: 'base', name: 'Base Character', type: 'base', level: 1 },
            { id: 'glasses', name: 'Glasses', type: 'accessory', level: 2 },
            { id: 'pen', name: 'Fancy Pen', type: 'accessory', level: 3 },
            { id: 'notebook', name: 'Notebook', type: 'accessory', level: 4 },
            { id: 'coffee', name: 'Coffee Mug', type: 'accessory', level: 5 },
            { id: 'hat', name: 'Writer\'s Hat', type: 'hat', level: 7 },
            { id: 'typewriter', name: 'Typewriter', type: 'tool', level: 10 },
            { id: 'cloak', name: 'Writer\'s Cloak', type: 'clothing', level: 12 },
            { id: 'quill', name: 'Quill Pen', type: 'tool', level: 15 }
        ]
    },
    
    // Sample data for testing - remove for production
    prompts: [
        {
            id: 1,
            title: "The Unexpected Visitor",
            description: "Write a scene where your character answers their door to find someone they never expected to see again. What happens next?",
            category: "fiction",
            skills: ["character", "dialogue"]
        },
        {
            id: 2,
            title: "The Secret Door",
            description: "Your character discovers a door in their home that they've never noticed before. What's behind it?",
            category: "setting",
            skills: ["setting", "description"]
        },
        {
            id: 3,
            title: "The Lost Letter",
            description: "Your character finds an unsent letter written years ago. Write the letter and then the scene of its discovery.",
            category: "character",
            skills: ["character", "description"]
        }
    ],
    
    // Sample quests
    quests: [
        {
            id: 1,
            name: "Morning Rush",
            description: "Write 750 words before noon",
            reward: 100,
            completed: false
        },
        {
            id: 2,
            name: "Prompt Challenge",
            description: "Write 500 words for prompt",
            reward: 150,
            completed: false
        },
        {
            id: 3,
            name: "7-Day Streak",
            description: "2 days to go",
            reward: 200,
            completed: false
        }
    ]
};

// Initialize data from localStorage or use default
function initializeData() {
    const savedData = localStorage.getItem('writerQuestData');
    
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Update our data structure with saved data
        WriterQuest.user = parsedData.user || WriterQuest.user;
        WriterQuest.sessions = parsedData.sessions || [];
        WriterQuest.projects = parsedData.projects || [];
        WriterQuest.achievements = parsedData.achievements || [];
        WriterQuest.completedPrompts = parsedData.completedPrompts || [];
        WriterQuest.skills = parsedData.skills || WriterQuest.skills;
        WriterQuest.avatar = parsedData.avatar || WriterQuest.avatar;
        
        console.log('Data loaded from localStorage');
    } else {
        console.log('No saved data found, using defaults');
        saveData();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('writerQuestData', JSON.stringify(WriterQuest));
    console.log('Data saved to localStorage');
}

// Add a new writing session
function addWritingSession(session) {
    // Calculate words per hour
    session.wph = Math.round((session.wordCount / session.timeSpent) * 60);
    
    // Calculate mood change
    session.moodChange = session.moodAfter - session.moodBefore;
    
    // Add timestamp
    session.timestamp = new Date().toISOString();
    
    // Add to sessions array
    WriterQuest.sessions.push(session);
    
    // Update user XP and check streak
    addXP(session.wordCount);
    updateStreak(new Date(session.date));
    
    // Update project stats
    updateProjectStats(session);
    
    // Save data
    saveData();
    
    return session;
}

// Add XP to user and check for level up
function addXP(amount) {
    const previousLevel = WriterQuest.user.level;
    WriterQuest.user.xp += amount;
    
    // Check for level up (simple formula: each level needs level * 1000 XP)
    const nextLevelXP = WriterQuest.user.level * 1000;
    
    if (WriterQuest.user.xp >= nextLevelXP) {
        WriterQuest.user.level++;
        console.log(`Leveled up to ${WriterQuest.user.level}!`);
        
        // Check for avatar unlocks
        checkAvatarUnlocks();
        
        // Could trigger level up notification here
    }
}

// Check for avatar unlocks
function checkAvatarUnlocks() {
    const currentLevel = WriterQuest.user.level;
    
    // Check for new unlocks
    WriterQuest.avatar.availableItems.forEach(item => {
        if (item.level <= currentLevel && !WriterQuest.avatar.unlockedItems.includes(item.id)) {
            // Unlock new item
            WriterQuest.avatar.unlockedItems.push(item.id);
            
            // Auto-equip certain items
            if (['base', 'glasses', 'pen', 'hat'].includes(item.id)) {
                WriterQuest.avatar.equippedItems.push(item.id);
            }
            
            console.log(`Unlocked new avatar item: ${item.name}`);
            // Could trigger notification here
        }
    });
    
    saveData();
}

// Update user streak
function updateStreak(date) {
    const lastDate = WriterQuest.user.lastWritingDate ? new Date(WriterQuest.user.lastWritingDate) : null;
    const currentDate = new Date(date);
    
    // Set time to midnight for proper day comparison
    currentDate.setHours(0, 0, 0, 0);
    
    if (lastDate) {
        lastDate.setHours(0, 0, 0, 0);
        
        // Calculate difference in days
        const timeDiff = currentDate.getTime() - lastDate.getTime();
        const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff === 1) {
            // Consecutive day, increase streak
            WriterQuest.user.streak++;
        } else if (daysDiff > 1) {
            // Streak broken
            WriterQuest.user.streak = 1;
        } else if (daysDiff === 0) {
            // Same day, don't change streak
        }
    } else {
        // First writing session
        WriterQuest.user.streak = 1;
    }
    
    // Update last writing date
    WriterQuest.user.lastWritingDate = currentDate.toISOString();
}

// Update project statistics
function updateProjectStats(session) {
    // Find the project
    const projectIndex = WriterQuest.projects.findIndex(p => p.id === session.project);
    
    if (projectIndex === -1) {
        // Project doesn't exist yet, create it
        const newProject = {
            id: session.project,
            name: session.projectName || session.project, // This would be better with a proper name
            totalWords: session.wordCount,
            totalTime: session.timeSpent,
            sessionsCount: 1,
            lastSessionDate: session.date
        };
        
        WriterQuest.projects.push(newProject);
    } else {
        // Update existing project
        const project = WriterQuest.projects[projectIndex];
        project.totalWords += session.wordCount;
        project.totalTime += session.timeSpent;
        project.sessionsCount++;
        project.lastSessionDate = session.date;
    }
}

// Add a new project
function addProject(project) {
    // Generate a unique ID
    project.id = 'proj_' + Date.now();
    
    // Initialize project stats
    project.totalWords = 0;
    project.totalTime = 0;
    project.sessionsCount = 0;
    project.createdDate = new Date().toISOString();
    
    // Add to projects array
    WriterQuest.projects.push(project);
    
    // Save data
    saveData();
    
    return project;
}

// Delete a project
function deleteProject(projectId) {
    const projectIndex = WriterQuest.projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
        // Remove the project
        WriterQuest.projects.splice(projectIndex, 1);
        saveData();
        return true;
    }
    
    return false;
}

// Edit a project
function editProject(projectId, updatedProject) {
    const projectIndex = WriterQuest.projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
        // Preserve stats that shouldn't change
        const existingProject = WriterQuest.projects[projectIndex];
        updatedProject.id = existingProject.id;
        updatedProject.totalWords = existingProject.totalWords;
        updatedProject.totalTime = existingProject.totalTime;
        updatedProject.sessionsCount = existingProject.sessionsCount;
        updatedProject.lastSessionDate = existingProject.lastSessionDate;
        updatedProject.createdDate = existingProject.createdDate;
        
        // Update the project
        WriterQuest.projects[projectIndex] = updatedProject;
        saveData();
        return true;
    }
    
    return false;
}

// Mark a project as complete
function completeProject(projectId) {
    const projectIndex = WriterQuest.projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
        // Mark as complete and record completion date
        WriterQuest.projects[projectIndex].completed = true;
        WriterQuest.projects[projectIndex].completedDate = new Date().toISOString();
        
        // Award XP for completing a project
        const project = WriterQuest.projects[projectIndex];
        const completionXP = 500; // Base XP for completing a project
        addXP(completionXP);
        
        saveData();
        return true;
    }
    
    return false;
}

// Get projects for dropdown selection
function getProjectsForDropdown() {
    return WriterQuest.projects.map(project => ({
        id: project.id,
        name: project.name
    }));
}

// Get avatar information
function getAvatarInfo() {
    return {
        unlockedItems: WriterQuest.avatar.unlockedItems,
        equippedItems: WriterQuest.avatar.equippedItems,
        availableItems: WriterQuest.avatar.availableItems
    };
}

// Toggle avatar item equipped state
function toggleAvatarItem(itemId) {
    // Check if item is unlocked
    if (!WriterQuest.avatar.unlockedItems.includes(itemId)) {
        return false;
    }
    
    // Check if item is already equipped
    const equippedIndex = WriterQuest.avatar.equippedItems.indexOf(itemId);
    
    if (equippedIndex > -1) {
        // Don't unequip the base character
        if (itemId === 'base') {
            return false;
        }
        
        // Unequip item
        WriterQuest.avatar.equippedItems.splice(equippedIndex, 1);
    } else {
        // Equip item
        WriterQuest.avatar.equippedItems.push(itemId);
    }
    
    saveData();
    return true;
}

// Get today's prompt
function getTodaysPrompt() {
    // For now, just return the first prompt
    // In a real app, you would rotate prompts or select randomly
    return WriterQuest.prompts[0];
}

// Export functions for use in other files
window.dataManager = {
    initialize: initializeData,
    save: saveData,
    addSession: addWritingSession,
    addProject: addProject,
    deleteProject: deleteProject,
    editProject: editProject,
    completeProject: completeProject,
    getTodaysPrompt: getTodaysPrompt,
    getProjectsForDropdown: getProjectsForDropdown,
    getAvatarInfo: getAvatarInfo,
    toggleAvatarItem: toggleAvatarItem,
    checkAvatarUnlocks: checkAvatarUnlocks,
    getData: () => WriterQuest
};