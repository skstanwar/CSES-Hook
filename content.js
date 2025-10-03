// === CREATE STYLE ===
const style = document.createElement('style');
style.textContent = `
  #float_box {
    width: 30vw;
    height: 70vh;
    background-color: #dbdb86ff;
    position: fixed;
    opacity: 0.5;
    top: 100px;
    left: 100px;
    cursor: move;
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 999999;
    resize: both;
    overflow: auto;
    border: 1px solid #aaa;
    border-radius: 4px;
  }

  .editor-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    font-family: monospace;
    font-size: 14px;
  }

  .line-numbers {
    background: #f0f0f0;
    padding: 5px;
    text-align: right;
    user-select: none;
    color: #555;
    overflow: hidden;
  }

  .editor-textarea {
    flex: 1;
    border: none;
    outline: none;
    padding: 5px;
    resize: none;
    background: transparent;
    line-height: 1.5;
    border-left: 1px solid #ccc;
    overflow: auto;
    background-image: repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 1.4em,
      rgba(0, 0, 255, 0.2) 1.4em,
      rgba(0, 0, 255, 0.2) 1.5em
    );
    background-attachment: local;
    width: 100%;
    height: 100%;
  }

  #submit_button {
    padding: 8px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    align-self: flex-end;
    cursor: pointer;
    border-radius: 3px;
  }

  #submit_button:hover {
    background-color: #0056b3;
  }

  .code-picker {
    padding: 6px;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #fff;
    width: 100%;
    box-sizing: border-box;
    font-family: monospace;
    margin-bottom: 8px;
  }
    textarea {
    color : #000000ff}
`;
document.head.appendChild(style);

// === CREATE FLOATING BOX ===
const floatBox = document.createElement('div');
floatBox.id = 'float_box';
document.body.appendChild(floatBox);

// === CREATE EDITOR CONTAINER ===
const editorContainer = document.createElement('div');
editorContainer.className = 'editor-container';

// === LINE NUMBERS COLUMN ===
const lineNumbers = document.createElement('div');
lineNumbers.className = 'line-numbers';

// === TEXTAREA ===
const textarea = document.createElement('textarea');
textarea.className = 'editor-textarea';
textarea.spellcheck = false;
textarea.wrap = 'off';
const saved = localStorage.getItem('savedCode');
if (saved !== null) {
  textarea.value = saved;
}
editorContainer.appendChild(lineNumbers);
editorContainer.appendChild(textarea);
floatBox.appendChild(editorContainer);
// 
// === SUBMIT BUTTON ===
const submitBtn = document.createElement('button');
submitBtn.id = 'submit_button';
submitBtn.textContent = 'Submit';

  submitBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    alert('Submitting from content.js...');

    // === Get data from custom box ===
    const lang = document.getElementById('code_language_picker')?.value || '';
    const version = document.getElementById('version_picker')?.value || '';
    const code = document.querySelector('.editor-textarea')?.value || '';
    const url =window.location.href;
    const match = url.match(/\/(\d+)\/?$/);
    const id = match ? match[1] : null;

    if (!code.trim()) {
      alert("Code can't be empty");
      return;
    }

    // === Create a fake file to simulate upload ===
    const blob = new Blob([code], { type: 'text/plain' });
    const file = new File([blob], 'solution.txt'); // You can change extension dynamically

    // === Get CSRF token from the page ===
    const csrfToken = await fetchCsrfToken(1071); 

    if (!csrfToken) {
      alert('CSRF token not found!');
      return;
    }

    // === Build the FormData ===
    const formData = new FormData();
    formData.append('csrf_token', csrfToken);
    formData.append('task', id);
    formData.append('file', file);
    formData.append('lang', lang);
    formData.append('option', version);
    formData.append('type', 'course');
    formData.append('target', 'problemset');

    // === Send the form data using fetch() ===
    try {
      const response = await fetch('/course/send.php', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important if cookies/session are needed
      });

      if (response.ok) {
        // Redirect or notify success, maybe reload page or show message
        // console.log(response);
        window.location.href = response.url;
      } else {
        alert('Submission failed: ' + response.statusText);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Submission failed.');
    }
  });



floatBox.appendChild(submitBtn);
// ==== Get the CSRF TOKEN ===
async function fetchCsrfToken(taskId) {
  const url = `https://cses.fi/problemset/submit/${taskId}`;

  try {
    const response = await fetch(url, { credentials: 'include' });
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const input = doc.querySelector('input[name="csrf_token"]');
    const csrfToken = input?.value || null;

    return csrfToken;
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
    return null;
  }
}

// === display None ===
document.querySelectorAll('.skeleton').forEach(el => {
  el.addEventListener('click', () => {
   floatBox.style.display="None"
  });
});
// === LINE NUMBER SYNC ===
function updateLineNumbers() {
  localStorage.setItem('savedCode', textarea.value);
  const lines = textarea.value.split('\n').length;
  lineNumbers.innerHTML = '';
  for (let i = 1; i <= lines; i++) {
    lineNumbers.innerHTML += i + '<br>';
  }
}

textarea.addEventListener('input', updateLineNumbers);
textarea.addEventListener('scroll', () => {
  lineNumbers.scrollTop = textarea.scrollTop;
});
updateLineNumbers();

// === Language Options ===
const codingLanguages = [
  "C++",
  "Python2",
  "Python3",
  "Java",
  "C",
  "C#",
  "JavaScript",
  "Go",
  "Rust",
  "Kotlin",
  "Haskell"
];

// === Version Mapping ===
const options = {
  "C++": ["C++11", "C++17", "C++20"],
  "Python2": ["CPython2", "PyPy2"],
  "Python3": ["CPython3", "PyPy3"],
  "Rust": [2018, 2021]
};

const defaults = {
  "C++": "C++11",
  "Python2": "PyPy2",
  "Python3": "PyPy3",
  "Rust": "2021"
};

// === Create Language Picker ===
const codeLangPicker = document.createElement("select");
codeLangPicker.id = "code_language_picker";
codeLangPicker.className = "code-picker";

// Populate Language Picker
codingLanguages.forEach(lang => {
  const option = document.createElement("option");
  option.value = lang;
  option.textContent = lang;
  codeLangPicker.appendChild(option);
});

// Set default language
codeLangPicker.value = "C++";

// === Create Version Picker ===
const versionPicker = document.createElement("select");
versionPicker.id = "version_picker";
versionPicker.className = "code-picker";

// === Helper: Populate version picker ===
function populateVersionPicker(lang) {
  versionPicker.innerHTML = ""; // Clear existing

  if (options[lang]) {
    options[lang].forEach(ver => {
      const opt = document.createElement("option");
      opt.value = ver;
      opt.textContent = ver;
      versionPicker.appendChild(opt);
    });

    // Set default version if available
    versionPicker.value = defaults[lang] || options[lang][0];
    versionPicker.style.display = "block";
  } else {
    versionPicker.innerHTML = "";
    versionPicker.style.display = "none"; // Hide if no version list
  }
}

// === Handle Language Change ===
codeLangPicker.addEventListener("change", () => {
  const selectedLang = codeLangPicker.value;
  console.log("Selected Language:", selectedLang);

  populateVersionPicker(selectedLang);
});

// === Insert Pickers into float_box (top of box) ===
floatBox.insertBefore(versionPicker, floatBox.firstChild);
floatBox.insertBefore(codeLangPicker, versionPicker);

// === Initialize with defaults ===
populateVersionPicker(codeLangPicker.value);
// === DRAG FUNCTIONALITY ===
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

floatBox.addEventListener('mousedown', function (e) {
  // Don't drag if user clicks inside textarea or button
  if (e.target === textarea || e.target === submitBtn) return;

  isDragging = true;
  offsetX = e.clientX - floatBox.getBoundingClientRect().left;
  offsetY = e.clientY - floatBox.getBoundingClientRect().top;
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', function (e) {
  if (isDragging) {
    floatBox.style.left = `${e.clientX - offsetX}px`;
    floatBox.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener('mouseup', function () {
  isDragging = false;
  document.body.style.userSelect = '';
});

floatBox.addEventListener("click", e=>{
    floatBox.style.opacity="100%"

})
