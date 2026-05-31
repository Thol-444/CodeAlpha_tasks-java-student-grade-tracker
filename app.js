// ============ STATE ============
let numStudents = 0;
let numSubjects = 0;
let subjectNames = [];
let studentNames = [];
let marks = []; // 2D array: marks[student][subject]

// ============ NAVIGATION ============
function goToStep(stepId) {
    document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(stepId);
    if (target) {
        target.classList.add('active');
        // Re-trigger animation
        target.style.animation = 'none';
        target.offsetHeight; // reflow
        target.style.animation = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ============ STEP 1 -> STEP 2 ============
function goToSubjectNames() {
    const studentsInput = document.getElementById('input-students');
    const subjectsInput = document.getElementById('input-subjects');

    numStudents = parseInt(studentsInput.value);
    numSubjects = parseInt(subjectsInput.value);

    if (!numStudents || numStudents < 1 || numStudents > 100) {
        showToast('Please enter a valid number of students (1-100)');
        studentsInput.focus();
        return;
    }
    if (!numSubjects || numSubjects < 1 || numSubjects > 20) {
        showToast('Please enter a valid number of subjects (1-20)');
        subjectsInput.focus();
        return;
    }

    // Build subject name fields
    const container = document.getElementById('subject-fields');
    container.innerHTML = '';

    for (let i = 0; i < numSubjects; i++) {
        const div = document.createElement('div');
        div.className = 'subject-field';

        const existing = subjectNames[i] || '';
        div.innerHTML = `
            <label for="subject-name-${i}">Subject ${i + 1}</label>
            <input type="text" id="subject-name-${i}" class="student-input"
                   placeholder="e.g. Mathematics" value="${existing}">
        `;
        container.appendChild(div);
    }

    goToStep('step-subjects');
    document.getElementById('subject-name-0').focus();
}

// ============ STEP 2 -> STEP 3 ============
function goToStudentData() {
    // Collect subject names
    subjectNames = [];
    for (let i = 0; i < numSubjects; i++) {
        const name = document.getElementById(`subject-name-${i}`).value.trim();
        if (!name) {
            showToast(`Please enter a name for Subject ${i + 1}`);
            document.getElementById(`subject-name-${i}`).focus();
            return;
        }
        subjectNames.push(name);
    }

    // Build student cards
    const container = document.getElementById('student-cards');
    container.innerHTML = '';

    for (let i = 0; i < numStudents; i++) {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.style.animationDelay = `${i * 0.08}s`;

        const existingName = studentNames[i] || '';

        let marksHTML = '';
        for (let j = 0; j < numSubjects; j++) {
            const existingMark = (marks[i] && marks[i][j] !== undefined) ? marks[i][j] : '';
            marksHTML += `
                <div class="mark-field">
                    <label for="mark-${i}-${j}">${subjectNames[j]}</label>
                    <input type="number" id="mark-${i}-${j}" min="0" max="100"
                           placeholder="0-100" value="${existingMark}">
                </div>
            `;
        }

        card.innerHTML = `
            <div class="student-card-header">
                <div class="student-number">${i + 1}</div>
                <input type="text" id="student-name-${i}" class="student-input student-name-input"
                       placeholder="Enter student name" value="${existingName}">
            </div>
            <div class="student-marks-row">${marksHTML}</div>
        `;

        container.appendChild(card);
    }

    goToStep('step-students');
}

// ============ GENERATE REPORT ============
function generateReport() {
    // Collect student data
    studentNames = [];
    marks = [];

    for (let i = 0; i < numStudents; i++) {
        const name = document.getElementById(`student-name-${i}`).value.trim();
        if (!name) {
            showToast(`Please enter a name for Student ${i + 1}`);
            document.getElementById(`student-name-${i}`).focus();
            return;
        }
        studentNames.push(name);

        marks[i] = [];
        for (let j = 0; j < numSubjects; j++) {
            const val = parseInt(document.getElementById(`mark-${i}-${j}`).value);
            if (isNaN(val) || val < 0 || val > 100) {
                showToast(`Invalid marks for ${name} in ${subjectNames[j]} (0-100)`);
                document.getElementById(`mark-${i}-${j}`).focus();
                return;
            }
            marks[i][j] = val;
        }
    }

    // Build report
    buildStatsRow();
    buildMarksTable();
    buildAveragesChart();
    buildWeakSubjectAlert();
    buildStudentPerformance();

    goToStep('step-report');
}

// ============ STATS ROW ============
function buildStatsRow() {
    const container = document.getElementById('stats-row');

    // Compute overall average
    let totalSum = 0;
    let totalCount = 0;
    for (let i = 0; i < numStudents; i++) {
        for (let j = 0; j < numSubjects; j++) {
            totalSum += marks[i][j];
            totalCount++;
        }
    }
    const overallAvg = (totalSum / totalCount).toFixed(1);

    // Highest single mark
    let highest = 0;
    let highName = '';
    for (let i = 0; i < numStudents; i++) {
        for (let j = 0; j < numSubjects; j++) {
            if (marks[i][j] > highest) {
                highest = marks[i][j];
                highName = studentNames[i];
            }
        }
    }

    // Lowest single mark
    let lowest = 100;
    let lowName = '';
    for (let i = 0; i < numStudents; i++) {
        for (let j = 0; j < numSubjects; j++) {
            if (marks[i][j] < lowest) {
                lowest = marks[i][j];
                lowName = studentNames[i];
            }
        }
    }

    container.innerHTML = `
        <div class="stat-card" style="animation-delay:0s">
            <div class="stat-value stat-accent">${numStudents}</div>
            <div class="stat-label">Students</div>
        </div>
        <div class="stat-card" style="animation-delay:0.1s">
            <div class="stat-value stat-accent">${numSubjects}</div>
            <div class="stat-label">Subjects</div>
        </div>
        <div class="stat-card" style="animation-delay:0.2s">
            <div class="stat-value stat-success">${highest}</div>
            <div class="stat-label">Highest Mark</div>
        </div>
        <div class="stat-card" style="animation-delay:0.3s">
            <div class="stat-value stat-danger">${lowest}</div>
            <div class="stat-label">Lowest Mark</div>
        </div>
        <div class="stat-card" style="animation-delay:0.4s">
            <div class="stat-value stat-warning">${overallAvg}</div>
            <div class="stat-label">Overall Average</div>
        </div>
    `;
}

// ============ MARKS TABLE ============
function buildMarksTable() {
    const thead = document.getElementById('marks-thead');
    const tbody = document.getElementById('marks-tbody');

    // Header
    let headHTML = '<tr><th>S.No</th><th>Name</th>';
    for (let j = 0; j < numSubjects; j++) {
        headHTML += `<th>${subjectNames[j]}</th>`;
    }
    headHTML += '<th>Total</th><th>Average</th></tr>';
    thead.innerHTML = headHTML;

    // Body
    let bodyHTML = '';
    for (let i = 0; i < numStudents; i++) {
        let total = 0;
        bodyHTML += `<tr><td>${i + 1}</td><td class="student-name-cell">${studentNames[i]}</td>`;
        for (let j = 0; j < numSubjects; j++) {
            const m = marks[i][j];
            total += m;
            const cls = m >= 75 ? 'mark-high' : m >= 40 ? 'mark-mid' : 'mark-low';
            bodyHTML += `<td class="${cls}">${m}</td>`;
        }
        const avg = (total / numSubjects).toFixed(1);
        const avgCls = avg >= 75 ? 'mark-high' : avg >= 40 ? 'mark-mid' : 'mark-low';
        bodyHTML += `<td class="${avgCls}">${total}</td>`;
        bodyHTML += `<td class="${avgCls}">${avg}</td>`;
        bodyHTML += '</tr>';
    }
    tbody.innerHTML = bodyHTML;
}

// ============ SUBJECT AVERAGES CHART ============
function buildAveragesChart() {
    const container = document.getElementById('averages-chart');
    const averages = [];

    for (let j = 0; j < numSubjects; j++) {
        let sum = 0;
        for (let i = 0; i < numStudents; i++) {
            sum += marks[i][j];
        }
        averages.push(sum / numStudents);
    }

    let html = '';
    for (let j = 0; j < numSubjects; j++) {
        const avg = averages[j];
        const pct = avg; // marks out of 100
        const barClass = avg >= 75 ? 'bar-high' : avg >= 40 ? 'bar-mid' : 'bar-low';

        html += `
            <div class="avg-bar-row">
                <div class="avg-label">${subjectNames[j]}</div>
                <div class="avg-bar-wrapper">
                    <div class="avg-bar ${barClass}" style="width: 0%" data-width="${pct}%">
                        <span class="avg-bar-value">${avg.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;

    // Animate bars after render
    requestAnimationFrame(() => {
        setTimeout(() => {
            container.querySelectorAll('.avg-bar').forEach(bar => {
                bar.style.width = bar.dataset.width;
            });
        }, 100);
    });
}

// ============ WEAK SUBJECT ALERT ============
function buildWeakSubjectAlert() {
    const container = document.getElementById('weak-subject-alert');
    let minAvg = Infinity;
    let weakSubject = '';

    for (let j = 0; j < numSubjects; j++) {
        let sum = 0;
        for (let i = 0; i < numStudents; i++) {
            sum += marks[i][j];
        }
        const avg = sum / numStudents;
        if (avg < minAvg) {
            minAvg = avg;
            weakSubject = subjectNames[j];
        }
    }

    container.innerHTML = `
        <div class="alert-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        </div>
        <div class="alert-content">
            <h3>Attention Required</h3>
            <p>Students' average marks are very low in <span class="weak-name">${weakSubject}</span>
            with an average of <span class="weak-avg">${minAvg.toFixed(1)}</span>.
            Faculty and students should focus more on this subject to improve performance.</p>
        </div>
    `;
}

// ============ INDIVIDUAL PERFORMANCE ============
function buildStudentPerformance() {
    const container = document.getElementById('student-performance');
    let html = '';

    for (let i = 0; i < numStudents; i++) {
        let total = 0;
        for (let j = 0; j < numSubjects; j++) total += marks[i][j];
        const avg = total / numSubjects;

        const avgClass = avg >= 75 ? 'perf-avg-high' : avg >= 40 ? 'perf-avg-mid' : 'perf-avg-low';

        let marksHTML = '';
        for (let j = 0; j < numSubjects; j++) {
            const m = marks[i][j];
            const cls = m >= 75 ? 'mark-high' : m >= 40 ? 'mark-mid' : 'mark-low';
            marksHTML += `
                <div class="perf-mark-row">
                    <span class="perf-subject">${subjectNames[j]}</span>
                    <span class="perf-score ${cls}">${m}</span>
                </div>
            `;
        }

        html += `
            <div class="perf-card" style="animation-delay:${i * 0.05}s">
                <div class="perf-header">
                    <span class="perf-name">${studentNames[i]}</span>
                    <span class="perf-avg ${avgClass}">${avg.toFixed(1)}%</span>
                </div>
                <div class="perf-marks">${marksHTML}</div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ============ RESET ============
function resetApp() {
    numStudents = 0;
    numSubjects = 0;
    subjectNames = [];
    studentNames = [];
    marks = [];

    document.getElementById('input-students').value = '3';
    document.getElementById('input-subjects').value = '4';

    goToStep('step-setup');
}
