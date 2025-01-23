let currentQuestionIndex = 0;
let answers = {};

const questions = [
    {
        id: 1,
        text: "Combien de centrales frigorifiques sur le site ?",
        type: "number",
        min: 1,
        max: 10,
        required: true
    },
    {
        id: 10,
        text: "Quel est le type de fluide frigorigène ?",
        type: "select",
        options: ["HFC/HFO", "CO2", "Ammoniac"],
        required: true
    },
    {
        id: 11,
        text: "Souhaitez-vous mesurer les consommations énergétiques de la centrale ?",
        type: "boolean",
        required: true
    },
    {
        id: 12,
        text: "De combien de moteurs la centrale dispose-t-elle ?",
        type: "number",
        min: 1,
        max: 10,
        condition: (answers) => answers[11] === true,
        required: true
    },
    {
        id: 13,
        text: "Type de moteur",
        type: "multiMotor",
        condition: (answers) => answers[11] === true && answers[12],
        required: true
    },
    {
        id: 14,
        text: "Le réservoir est-il dans la même pièce que les compresseurs ?",
        type: "boolean",
        condition: (answers) => answers[10] === "Ammoniac",
        required: true
    },
    {
        id: 5,
        text: "Souhaitez-vous mesurer la salle de contrôle à l'ensemble des centrales ?",
        type: "boolean",
        required: true
    },
    {
        id: 51,
        text: "Type de connexion",
        type: "select",
        options: ["Sans-Fil", "Filaire"],
        condition: (answers) => answers[5] === true,
        required: true
    },
    {
        id: 52,
        text: "Module",
        type: "select",
        options: ["Module temp LoRa", "Module standard"],
        condition: (answers) => answers[5] === true,
        required: true
    },
    {
        id: 6,
        text: "Avez-vous besoin d'une antenne déportée 4G ?",
        type: "select",
        options: ["Non", "5m", "20m"],
        required: true
    },
    {
        id: 7,
        text: "De quel support disposez-vous ?",
        type: "select",
        options: ["Amarré", "Vissé"],
        required: true
    }
];

function initializeApp() {
    displayQuestion(currentQuestionIndex);
    document.getElementById('prevBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'block';
}

function displayQuestion(index) {
    const question = questions[index];
    if (!question) return;

    // Vérifier si la question doit être affichée en fonction des conditions
    if (question.condition && !question.condition(answers)) {
        nextQuestion();
        return;
    }

    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    
    questionElement.textContent = question.text;
    optionsElement.innerHTML = '';

    switch (question.type) {
        case 'number':
            const input = document.createElement('input');
            input.type = 'number';
            input.min = question.min;
            input.max = question.max;
            input.className = 'input-field';
            input.value = answers[question.id] || '';
            input.onchange = (e) => {
                answers[question.id] = parseInt(e.target.value);
                updateNavigationButtons();
            };
            optionsElement.appendChild(input);
            break;

        case 'select':
            question.options.forEach(option => {
                const button = document.createElement('button');
                button.className = `option-button ${answers[question.id] === option ? 'selected' : ''}`;
                button.textContent = option;
                button.onclick = () => {
                    answers[question.id] = option;
                    updateOptions();
                    updateNavigationButtons();
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
                };
                optionsElement.appendChild(button);
            });
            break;

        case 'multiMotor':
            const numMotors = answers[12] || 0;
            for (let i = 1; i <= numMotors; i++) {
                const motorLabel = document.createElement('div');
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
                };
                optionsElement.appendChild(motorLabel);
                optionsElement.appendChild(select);
            }
            break;
    }

    updateNavigationButtons();
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
    nextBtn.disabled = !hasValidAnswer;
    submitBtn.disabled = !hasValidAnswer;
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

    // Créer et télécharger le fichier
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

// Initialiser l'application au chargement
window.onload = initializeApp;