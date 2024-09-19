import { WEBHOOK_URL } from './config.js';

const salaries = {
    "Commandant": 2000000,
    "Capitaine": 1600000,
    "Lieutenant Chef": 1500000,
    "Lieutenant": 1400000,
    "Sergent Chef": 1300000,
    "Sergent-II": 1200000,
    "Sergent": 1100000,
    "Officier-III": 1000000,
    "Officier-II": 900000,
    "Officier-I": 800000,
    "Cadet": 700000
};

const hourlyRate = 20000;
let currentOTP = '';

function generateAndSendOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    currentOTP = otp;

    const embed = {
        title: "Mot de passe à usage unique",
        description: `Votre mot de passe à usage unique est : **${otp}**`,
        color: 16777215 // Couleur blanche
    };

    return fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ embeds: [embed] })
    });
}

function addEntry() {
    const name = document.getElementById('name').value;
    const grade = document.getElementById('grade').value;
    const hours = parseInt(document.getElementById('hours').value);
    const minutes = document.getElementById('minutes').value ? parseInt(document.getElementById('minutes').value) : 0;
    const totalHours = hours + (minutes / 60);
    const baseSalary = salaries[grade];
    const totalSalary = baseSalary + (totalHours * hourlyRate);
    const salary = calculateSalary(grade, hours, minutes);
    const roundedSalary = Math.round(salary); // Arrondir à l'euro près

    const table = document.getElementById('salaryTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    const nameCell = newRow.insertCell(0);
    const gradeCell = newRow.insertCell(1);
    const hoursCell = newRow.insertCell(2);
    const salaryCell = newRow.insertCell(3);

    nameCell.textContent = name;
    gradeCell.textContent = grade;
    hoursCell.textContent = `${hours}h ${minutes}m`;
    salaryCell.textContent = roundedSalary.toLocaleString('fr-FR') + ' $';
}

function calculateSalary(grade, hours, minutes) {
    const baseSalary = salaries[grade];
    const totalHours = hours + (minutes / 60);
    const totalSalary = baseSalary + (totalHours * hourlyRate);
    return totalSalary;
}

function resetTable() {
    const table = document.getElementById('salaryTable').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
}

function sendResults() {
    generateAndSendOTP().then(response => {
        if (response.ok) {
            document.getElementById('otpModal').style.display = 'block';
        } else {
            alert('Erreur lors de l\'envoi du mot de passe à usage unique.');
        }
    });
}

function verifyOTP() {
    const enteredOTP = document.getElementById('otpInput').value;
    if (enteredOTP !== currentOTP) {
        alert('Mot de passe incorrect. Veuillez réessayer.');
        return;
    }

    const table = document.getElementById('salaryTable').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    const results = [];
    let totalAmount = 0;

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const entry = {
            name: cells[0].textContent,
            grade: cells[1].textContent,
            hours: cells[2].textContent,
            salary: cells[3].textContent
        };
        results.push(entry);
        totalAmount += parseInt(cells[3].textContent.replace(/\D/g, ''));
    }

    const embed = {
        title: "Résultats des Salaires LSPD",
        fields: results.map(result => ({
            name: `${result.name} (${result.grade})`,
            value: `Heures: ${result.hours}\nSalaire: ${result.salary}`,
            inline: false
        })),
        color: 3447003,
        footer: {
            text: `Total à payer: ${totalAmount.toLocaleString('fr-FR')} $`
        }
    };

    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ embeds: [embed] })
    }).then(response => {
        if (response.ok) {
            alert('Résultats envoyés avec succès!');
            closeModal();
        } else {
            alert('Erreur lors de l\'envoi des résultats.');
        }
    });
}

function closeModal() {
    document.getElementById('otpModal').style.display = 'none';
}

window.addEntry = addEntry;
window.resetTable = resetTable;
window.sendResults = sendResults;
window.verifyOTP = verifyOTP;
window.closeModal = closeModal;
