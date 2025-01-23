let currentQuestionIndex = 0;
let answers = {};

const questions = [
    {
        id: 1,
        text: "Combien avez-vous de centrales frigorifiques sur le site ?",
        type: "number",
        min: 1,
        max: 10,
        required: true,
        step: 1
    },
    {
        id: 10,
        text: "Quel est le type de fluide frigorigène ?",
        type: "select",
        options: ["HFC/HFO", "CO2", "Ammoniac"],
        required: true,
        step: 1
    },
    {
        id: 11,
        text: "Souhaitez-vous mesurer les consommations énergétiques de la centrale ?",
        type: "boolean",
        required: true,
        step: 2
    },
    {
        id: 12,
        text: "De combien de moteurs la centrale dispose-t-elle ?",
        type: "number",
        min: 1,
        max: 10,
        condition: (answers) => answers[11] === true,
        required: true,
        step: 2
    },
    {
        id: 13,
        text: "Type de moteur",
        type: "multiMotor",
        condition: (answers) => answers[11] === true && answers[12],
        required: true,
        step: 2
    },
    {
        id: 14,
        text: "Le réservoir est-il dans la même pièce que les compresseurs ?",
        type: "boolean",
        condition: (answers) => answers[10] === "Ammoniac",
        required: true,
        step: 3
    },
    {
        id: 5,
        text: "Souhaitez-vous mesurer la salle de contrôle à l'ensemble des centrales ?",
        type: "boolean",
        required: true,
        step: 3
    },
    {
        id: 51,
        text: "Type de connexion",
        type: "select",
        options: ["Sans-Fil", "Filaire"],
        condition: (answers) => answers[5] === true,
        required: true,
        step: 3
    },
    {
        id: 52,
        text: "Module",
        type: "select",
        options: ["Module temp LoRa", "Module standard"],
        condition: (answers) => answers[5] === true,
        required: true,
        step: 3
    },
    {
        id: 6,
        text: "Avez-vous besoin d'une antenne déportée 4G ?",
        type: "select",
        options: ["Non", "5m", "20m"],
        required: true,
        step: 3
    },
    {
        id: 7,
        text: "De quel support disposez-vous ?",
        type: "select",
        options: ["Amarré", "Vissé"],
        required: true,
        step: 3
    }
];

function initializeApp() {
    displayQuestion(currentQuestionIndex);
    setupNavigationButtons();
    updateProgressSteps();
    document.getElementById('restartBtn').onclick = restartQuiz;
}

function setupNavigationButtons() {
    document.getElementById('prevBtn').onclick = previousQuestion;
    document.getElementById('nextBtn').onclick = nextQuestion;
    document.getElementById('submitBtn').onclick = generateReport;
    updateNavigationButtons();
}

function updateProgressSteps() {
    const currentQuestion = questions[currentQuestionIndex];
    const steps = document.querySelectorAll('.progress-step');
    
    steps.forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 === currentQuestion.step) {
            step.classList.add('active');
        }
    });
}

function displayQuestion(index) {
    const question = questions[index];
    if (!question) return;

    if (question.condition && !question.condition(answers)) {
        nextQuestion();
        return;
    }

    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    
    questionElement.textContent = question.text;
    optionsElement.innerHTML = '';

    if (question.type === 'number') {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'input-field';
        input.min = question.min;
        input.max = question.max;
        input.value = answers[question.id] || '';
        input.onchange = (e) => {
            answers[question.id] = parseInt(e.target.value);
            updateNavigationButtons();
            updateReport();
        };
        optionsElement.appendChild(input);
    } else {
        switch (question.type) {
            case 'select':
                question.options.forEach(option => {
                    const button = document.createElement('button');
                    button.className = `option-button ${answers[question.id] === option ? 'selected' : ''}`;
                    button.textContent = option;
                    button.onclick = () => {
                        answers[question.id] = option;
                        updateOptions();
                        updateNavigationButtons();
                        updateReport();
                    };
                    optionsElement.appendChild(button);
                });
                break;

            case 'boolean':
                ['Oui', 'Non'].forEach(option => {
                    const button = document.createElement('button');
                    button.className = `option-button ${answers[question.id] === (option === 'Oui') ? 'selected' : ''}`;
                    button.textContent = option;
                    button.onclick = () => {
                        answers[question.id] = option === 'Oui';
                        updateOptions();
                        updateNavigationButtons();
                        updateReport();
                    };
                    optionsElement.appendChild(button);
                });
                break;

            case 'multiMotor':
                const numMotors = answers[12] || 0;
                for (let i = 1; i <= numMotors; i++) {
                    const motorContainer = document.createElement('div');
                    motorContainer.className = 'motor-container';
                    
                    const motorLabel = document.createElement('div');
                    motorLabel.className = 'motor-label';
                    motorLabel.textContent = `Moteur ${i}:`;
                    
                    const select = document.createElement('select');
                    select.className = 'input-field';
                    ['1/3 TI', '1/2 TI'].forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option;
                        optionElement.textContent = option;
                        select.appendChild(optionElement);
                    });
                    select.value = answers[question.id]?.[i] || '1/3 TI';
                    select.onchange = (e) => {
                        answers[question.id] = {...(answers[question.id] || {}), [i]: e.target.value};
                        updateNavigationButtons();
                        updateReport();
                    };
                    
                    motorContainer.appendChild(motorLabel);
                    motorContainer.appendChild(select);
                    optionsElement.appendChild(motorContainer);
                }
                break;
        }
    }

    updateNavigationButtons();
    updateProgressSteps();
}

function updateOptions() {
    const optionsElement = document.getElementById('options');
    const buttons = optionsElement.getElementsByClassName('option-button');
    Array.from(buttons).forEach(button => {
        button.classList.remove('selected');
        if (questions[currentQuestionIndex].type === 'boolean') {
            if ((button.textContent === 'Oui' && answers[questions[currentQuestionIndex].id] === true) ||
                (button.textContent === 'Non' && answers[questions[currentQuestionIndex].id] === false)) {
                button.classList.add('selected');
            }
        } else if (button.textContent === answers[questions[currentQuestionIndex].id]) {
            button.classList.add('selected');
        }
    });
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    nextBtn.style.display = isLastQuestion ? 'none' : 'block';
    submitBtn.style.display = isLastQuestion ? 'block' : 'none';

    const currentQuestion = questions[currentQuestionIndex];
    const hasValidAnswer = answers[currentQuestion.id] !== undefined;
    
    if (currentQuestion.type === 'number') {
        const input = document.querySelector('.input-field');
        const value = parseInt(input.value);
        const isValid = !isNaN(value) && value >= currentQuestion.min && value <= currentQuestion.max;
        nextBtn.disabled = !isValid;
        submitBtn.disabled = !isValid;
    } else {
        nextBtn.disabled = !hasValidAnswer;
        submitBtn.disabled = !hasValidAnswer;
    }
}

function updateReport() {
    const reportContent = document.getElementById('report-content');
    let report = '';

    questions.forEach(question => {
        if (!question.condition || question.condition(answers)) {
            const answer = answers[question.id];
            if (answer !== undefined) {
                report += `<div class="report-item">`;
                report += `<div class="report-question">${question.text}</div>`;
                if (question.type === 'multiMotor') {
                    Object.entries(answer).forEach(([motorNum, motorType]) => {
                        report += `<div class="report-answer">Moteur ${motorNum}: ${motorType}</div>`;
                    });
                } else if (question.type === 'boolean') {
                    report += `<div class="report-answer">${answer ? 'Oui' : 'Non'}</div>`;
                } else {
                    report += `<div class="report-answer">${answer}</div>`;
                }
                report += `</div>`;
            }
        }
    });

    reportContent.innerHTML = report || '<p class="no-data">Aucune réponse enregistrée</p>';
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    }
}

function generateReport() {
    let report = "Rapport Solution Finder Climalife\n";
    report += "================================\n\n";

    questions.forEach(question => {
        if (!question.condition || question.condition(answers)) {
            const answer = answers[question.id];
            if (answer !== undefined) {
                report += `${question.text}\n`;
                if (question.type === 'multiMotor') {
                    Object.entries(answer).forEach(([motorNum, motorType]) => {
                        report += `- Moteur ${motorNum}: ${motorType}\n`;
                    });
                } else if (question.type === 'boolean') {
                    report += `Réponse: ${answer ? 'Oui' : 'Non'}\n`;
                } else {
                    report += `Réponse: ${answer}\n`;
                }
                report += "\n";
            }
        }
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rapport_solution_finder.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function restartQuiz() {
    currentQuestionIndex = 0;
    answers = {};
    displayQuestion(currentQuestionIndex);
    updateReport();
}

window.onload = initializeApp;