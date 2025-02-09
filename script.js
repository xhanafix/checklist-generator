class ChecklistGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('openrouter_api_key') || '';
        this.languagePrompts = {
            en: {
                placeholder: 'Describe your project or task...',
                objectiveTitle: 'Checklist Objective',
                generatePrompt: (task) => `Create a detailed checklist for the following task/project. First, provide a brief objective summary (2-3 sentences) of what this checklist aims to achieve. Then, for each item, provide a brief description or explanation. Format the response as follows:

Objective: [Write the objective summary here]

1. Task item
Description: Brief explanation of the task

2. Next task item
Description: Another explanation

And so on. Task: ${task}`,
                loading: 'Generating your checklist...',
                apiKeyMissing: 'Please enter your OpenRouter API key first',
                taskMissing: 'Please enter a task or project description',
                apiKeySaved: 'API key saved successfully!',
                apiKeyReset: 'API key reset successfully!',
                apiKeyInvalid: 'Please enter a valid API key',
                error: 'Error generating checklist: ',
                status: {
                    pending: 'Pending',
                    completed: 'Completed'
                }
            },
            ms: {
                placeholder: 'Huraikan projek atau tugas anda...',
                objectiveTitle: 'Objektif Senarai Semak',
                generatePrompt: (task) => `Buat senarai semak terperinci untuk tugas/projek berikut dalam Bahasa Malaysia. Mula-mula, berikan ringkasan objektif (2-3 ayat) tentang apa yang ingin dicapai oleh senarai semak ini. Kemudian, untuk setiap item, berikan penerangan ringkas. Format jawapan MESTI seperti berikut:

Objective: [Tulis ringkasan objektif di sini]

1. Item tugas
Description: Penerangan ringkas tentang tugas

2. Item tugas seterusnya
Description: Penerangan lain

Dan seterusnya. 

PENTING: Setiap item MESTI diikuti dengan baris "Description:" dalam Bahasa Malaysia.

Tugas: ${task}`,
                loading: 'Menjana senarai semak anda...',
                apiKeyMissing: 'Sila masukkan kunci API OpenRouter anda terlebih dahulu',
                taskMissing: 'Sila masukkan penerangan tugas atau projek',
                apiKeySaved: 'Kunci API berjaya disimpan!',
                apiKeyReset: 'Kunci API berjaya diset semula!',
                apiKeyInvalid: 'Sila masukkan kunci API yang sah',
                error: 'Ralat menjana senarai semak: ',
                status: {
                    pending: 'Belum Selesai',
                    completed: 'Selesai'
                }
            }
        };
        this.init();
    }

    init() {
        // Initialize DOM elements
        this.apiKeyInput = document.getElementById('api-key');
        this.saveApiKeyBtn = document.getElementById('save-api-key');
        this.resetApiKeyBtn = document.getElementById('reset-api-key');
        this.taskInput = document.getElementById('task-input');
        this.generateBtn = document.getElementById('generate-btn');
        this.loading = document.getElementById('loading');
        this.checklistOutput = document.getElementById('checklist-output');
        this.checklistItems = document.getElementById('checklist-items');
        this.printBtn = document.getElementById('print-btn');
        this.languageSelect = document.getElementById('language-select');
        this.loadingText = this.loading.querySelector('p');

        // Set initial API key if exists
        if (this.apiKey) {
            this.apiKeyInput.value = this.apiKey;
        }

        // Add event listeners
        this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.resetApiKeyBtn.addEventListener('click', () => this.resetApiKey());
        this.generateBtn.addEventListener('click', () => this.generateChecklist());
        this.printBtn.addEventListener('click', () => window.print());
        this.languageSelect.addEventListener('change', () => this.updateLanguage());

        // Set initial language
        this.updateLanguage();
    }

    updateLanguage() {
        const lang = this.languageSelect.value;
        const prompts = this.languagePrompts[lang];
        
        // Update placeholder text
        this.taskInput.placeholder = prompts.placeholder;
        
        // Update loading text
        this.loadingText.textContent = prompts.loading;
        
        // Update existing status texts if checklist exists
        if (!this.checklistOutput.classList.contains('hidden')) {
            document.querySelectorAll('[id^="status-"]').forEach(status => {
                const isCompleted = status.classList.contains('status-completed');
                status.textContent = isCompleted ? prompts.status.completed : prompts.status.pending;
            });
        }
    }

    saveApiKey() {
        const newApiKey = this.apiKeyInput.value.trim();
        const lang = this.languageSelect.value;
        
        if (newApiKey) {
            this.apiKey = newApiKey;
            localStorage.setItem('openrouter_api_key', newApiKey);
            alert(this.languagePrompts[lang].apiKeySaved);
        } else {
            alert(this.languagePrompts[lang].apiKeyInvalid);
        }
    }

    resetApiKey() {
        const lang = this.languageSelect.value;
        this.apiKey = '';
        this.apiKeyInput.value = '';
        localStorage.removeItem('openrouter_api_key');
        alert(this.languagePrompts[lang].apiKeyReset);
    }

    async generateChecklist() {
        const lang = this.languageSelect.value;
        
        if (!this.apiKey) {
            alert(this.languagePrompts[lang].apiKeyMissing);
            return;
        }

        const task = this.taskInput.value.trim();
        if (!task) {
            alert(this.languagePrompts[lang].taskMissing);
            return;
        }

        this.loading.classList.remove('hidden');
        this.checklistOutput.classList.add('hidden');
        
        // Reset progress
        this.updateProgress(0);

        try {
            const result = await this.callOpenRouterAPI(task);
            this.displayChecklist(result);
        } catch (error) {
            alert(this.languagePrompts[lang].error + error.message);
        } finally {
            this.loading.classList.add('hidden');
        }
    }

    updateProgress(percent) {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
    }

    async callOpenRouterAPI(task) {
        // Simulate progress while waiting for API response
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress = Math.min(progress + 5, 90); // Max 90% until complete
            this.updateProgress(progress);
        }, 300);

        try {
            const lang = this.languageSelect.value;
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': window.location.origin,
                },
                body: JSON.stringify({
                    model: 'google/learnlm-1.5-pro-experimental:free',
                    messages: [{
                        role: 'user',
                        content: this.languagePrompts[lang].generatePrompt(task)
                    }]
                })
            });

            clearInterval(progressInterval);
            this.updateProgress(100);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            return this.parseChecklistFromResponse(data.choices[0].message.content);
        } catch (error) {
            clearInterval(progressInterval);
            throw error;
        }
    }

    parseChecklistFromResponse(content) {
        const lines = content.split('\n');
        const items = [];
        let currentItem = null;
        let objective = '';

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // Check for objective
            const objectiveMatch = line.match(/^objective:\s*(.*)/i);
            if (objectiveMatch) {
                objective = objectiveMatch[1];
                return;
            }

            if (line.match(/^\d+\./)) {
                if (currentItem) {
                    items.push(currentItem);
                }
                currentItem = {
                    task: line.replace(/^\d+\.\s*/, ''),
                    description: ''
                };
            } else if (currentItem) {
                const descMatch = line.match(/^(description|penerangan|keterangan):\s*(.*)/i);
                if (descMatch) {
                    currentItem.description = descMatch[2];
                }
            }
        });

        if (currentItem) {
            items.push(currentItem);
        }

        return { objective, items };
    }

    displayChecklist(result) {
        const lang = this.languageSelect.value;
        this.checklistItems.innerHTML = '';
        
        // Display objective
        const objectiveDiv = document.getElementById('checklist-objective');
        objectiveDiv.innerHTML = `
            <h3>${this.languagePrompts[lang].objectiveTitle}</h3>
            <p>${result.objective}</p>
        `;

        // Display checklist items
        result.items.forEach((item, index) => {
            const row = document.createElement('tr');
            const descriptionRow = document.createElement('tr');
            const taskNumber = index + 1;
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" id="item-${index}" 
                           onchange="document.getElementById('status-${index}').textContent = this.checked ? '${this.languagePrompts[lang].status.completed}' : '${this.languagePrompts[lang].status.pending}';
                                    document.getElementById('status-${index}').className = this.checked ? 'status-completed' : 'status-pending';">
                </td>
                <td><label for="item-${index}">${taskNumber}. ${item.task}</label></td>
                <td id="status-${index}" class="status-pending">${this.languagePrompts[lang].status.pending}</td>
            `;
            
            descriptionRow.innerHTML = `
                <td></td>
                <td colspan="2" class="task-description">${item.description}</td>
            `;
            
            this.checklistItems.appendChild(row);
            this.checklistItems.appendChild(descriptionRow);
        });

        this.checklistOutput.classList.remove('hidden');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ChecklistGenerator();
}); 