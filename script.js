// Guthrie Syllabus Submission Frontend
// STEP YOU MUST DO: paste your deployed Apps Script Web App URL below.
const CONFIG = {
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbyX2iNDbopO35Z65Y3f74KMfUjPmB_cIspFUcIoT_9BJ7MJJFizmhB69hlwT4fkwQta/exec"
};

const records = window.SYLLABUS_RECORDS || [];
const options = window.SYLLABUS_OPTIONS || {};

const teacherSelect = document.getElementById("teacherSelect");
const courseSelect = document.getElementById("courseSelect");
const knownInfo = document.getElementById("knownInfo");
const form = document.getElementById("syllabusForm");
const unitContainer = document.getElementById("unitContainer");
const statusMessage = document.getElementById("statusMessage");
let selectedRecord = null;

function unique(arr){ return [...new Set(arr)].filter(Boolean).sort(); }

function populateSelect(select, values, placeholder){
  select.innerHTML = "";
  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  select.appendChild(first);
  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
}

function renderCertificationChecklist(selected=[]){
  const wrap = document.getElementById("certificationChecklist");
  wrap.innerHTML = "";
  (options.certificationOptions || []).forEach(cert => {
    const label = document.createElement("label");
    const checked = selected.includes(cert) ? "checked" : "";
    label.innerHTML = `<input type="checkbox" name="certifications" value="${escapeHtml(cert)}" ${checked}> <span>${escapeHtml(cert)}</span>`;
    wrap.appendChild(label);
  });
}

function init(){
  populateSelect(teacherSelect, unique(records.map(r => r.teacher)), "Select teacher...");
  populateSelect(document.getElementById("testingMonth"), options.months || [], "Select month if applicable...");
  populateSelect(document.getElementById("ctso"), options.ctsoOptions || [], "Select CTSO...");
  populateSelect(document.getElementById("tutorialTime"), options.tutorialDays || [], "Select tutorial day...");
  renderCertificationChecklist([]);
}

teacherSelect.addEventListener("change", () => {
  const teacher = teacherSelect.value;
  const teacherRecords = records.filter(r => r.teacher === teacher);
  const courseLabels = teacherRecords.map(r => `${r.course} — ${r.semester} — ${r.blocks}`);
  populateSelect(courseSelect, courseLabels, "Select course...");
  courseSelect.disabled = !teacher;
  form.classList.add("hidden");
  knownInfo.classList.add("hidden");
});

courseSelect.addEventListener("change", () => {
  const teacher = teacherSelect.value;
  const label = courseSelect.value;
  const teacherRecords = records.filter(r => r.teacher === teacher);
  selectedRecord = teacherRecords.find(r => `${r.course} — ${r.semester} — ${r.blocks}` === label);
  if(!selectedRecord) return;
  form.reset();
  document.getElementById("professionalDress").disabled = false;
  renderKnownInfo(selectedRecord);
  renderUnits(selectedRecord.semester === "Year" || selectedRecord.semester === "Yearlong" ? 6 : 4);
  prefillProgramFields(selectedRecord);
  loadDraft();
  form.classList.remove("hidden");
});

document.getElementById("noProfessionalDress").addEventListener("change", (e) => {
  const box = document.getElementById("professionalDress");
  if(e.target.checked){
    box.value = "None";
    box.disabled = true;
  }else{
    if(box.value === "None") box.value = "";
    box.disabled = false;
  }
});

function renderKnownInfo(r){
  knownInfo.innerHTML = `
    <h3>Known schedule information</h3>
    <div class="facts">
      <div class="fact"><b>Course</b>${escapeHtml(r.course)}</div>
      <div class="fact"><b>Teacher</b>${escapeHtml(r.teacher)}</div>
      <div class="fact"><b>Email</b>${escapeHtml(r.email || "TBA")}</div>
      <div class="fact"><b>Term</b>${escapeHtml(r.semester)}</div>
      <div class="fact"><b>Blocks</b>${escapeHtml(r.blocks)}</div>
      <div class="fact"><b>Conference</b>${escapeHtml(r.conference || "TBA")}</div>
      <div class="fact"><b>Program</b>${escapeHtml(r.program)}</div>
      <div class="fact"><b>Room</b>${escapeHtml(r.room || "TBA")}</div>
      <div class="fact"><b>Suggested CTSO</b>${escapeHtml(r.ctso || "TBA")}</div>
    </div>`;
  knownInfo.classList.remove("hidden");
}

function prefillProgramFields(r){
  renderCertificationChecklist(r.certifications || []);
  const ctsoSelect = document.getElementById("ctso");
  if(r.ctso && [...ctsoSelect.options].some(o => o.value === r.ctso)){
    ctsoSelect.value = r.ctso;
  } else {
    ctsoSelect.value = "";
  }
  document.getElementById("certificationNotes").placeholder =
    r.certifications && r.certifications.length
      ? "Suggested: " + r.certifications.join("; ")
      : "Optional: add or clarify credential details";
}

function renderUnits(count){
  unitContainer.innerHTML = "";
  for(let i=1;i<=count;i++){
    const div = document.createElement("div");
    div.className = "unit-card";
    div.innerHTML = `
      <h3>Unit ${i}</h3>
      <label>Unit ${i} Title
        <input name="unit${i}Title" placeholder="Example: Patient Assessment Skills">
      </label>
      <label>Topics Covered
        <textarea name="unit${i}Topics" rows="2" placeholder="Brief summary of major concepts or skills."></textarea>
      </label>
      <label>Hands-On Learning
        <textarea name="unit${i}HandsOn" rows="2" placeholder="Labs, projects, simulations, field experiences, or applied learning."></textarea>
      </label>
      <label>Assessment
        <textarea name="unit${i}Assessment" rows="2" placeholder="How understanding will be measured."></textarea>
      </label>`;
    unitContainer.appendChild(div);
  }
}

function draftKey(){
  return selectedRecord ? `guthrie-syllabus-draft-${selectedRecord.id}` : null;
}

function collectFormData(){
  const fd = new FormData(form);
  const data = {};
  for(const [k,v] of fd.entries()) {
    if(k === "certifications") continue;
    data[k] = v;
  }
  data.certifications = fd.getAll("certifications");
  return {
    status: "Submitted for Review",
    submittedAt: new Date().toISOString(),
    record: selectedRecord,
    responses: data
  };
}

function fillFormFromDraft(saved){
  if(!saved || !saved.responses) return;
  Object.entries(saved.responses).forEach(([name,value]) => {
    if(name === "certifications"){
      renderCertificationChecklist(value || []);
      return;
    }
    const el = form.elements[name];
    if(!el) return;
    if(el.type === "checkbox") el.checked = value === "on" || value === true;
    else el.value = value;
  });
  if(saved.responses.noProfessionalDress){
    document.getElementById("noProfessionalDress").checked = true;
    document.getElementById("professionalDress").disabled = true;
  }
}

function saveDraft(){
  if(!selectedRecord) return;
  const data = collectFormData();
  data.status = "Draft";
  localStorage.setItem(draftKey(), JSON.stringify(data));
  statusMessage.textContent = "Draft saved on this computer/browser.";
  statusMessage.className = "status ok";
}

function loadDraft(){
  statusMessage.textContent = "";
  const raw = localStorage.getItem(draftKey());
  if(raw){
    fillFormFromDraft(JSON.parse(raw));
    statusMessage.textContent = "A saved draft was loaded from this computer/browser.";
    statusMessage.className = "status ok";
  }
}

function resetAfterSubmit(){
  form.reset();
  form.classList.add("hidden");
  courseSelect.value = "";
  teacherSelect.value = "";
  courseSelect.innerHTML = '<option value="">Select teacher first...</option>';
  courseSelect.disabled = true;
  knownInfo.classList.add("hidden");
  unitContainer.innerHTML = "";
  renderCertificationChecklist([]);
  selectedRecord = null;
}

document.getElementById("saveDraftBtn").addEventListener("click", saveDraft);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if(!selectedRecord){
    alert("Please select a teacher and course first.");
    return;
  }
  if(CONFIG.WEB_APP_URL.includes("PASTE_YOUR")){
    statusMessage.textContent = "Submission backend is not configured yet. Paste your Apps Script Web App URL in script.js.";
    statusMessage.className = "status warn";
    return;
  }
  const payload = collectFormData();
  const body = new URLSearchParams();
  body.append("payload", JSON.stringify(payload));

  try{
    await fetch(CONFIG.WEB_APP_URL, { method:"POST", mode:"no-cors", body });
    localStorage.removeItem(draftKey());
    resetAfterSubmit();
    alert("Submitted for review. The form has been cleared for the next entry.");
  }catch(err){
    console.error(err);
    statusMessage.textContent = "Submission may not have completed. Save your draft and contact Joe if this continues.";
    statusMessage.className = "status warn";
  }
});

init();
