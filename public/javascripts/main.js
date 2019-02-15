const MAX_BYTELENGTH = 5000;
const alertId = {
  warning: 'warningAlert',
  error: 'errorAlert'
};
const TIMEOUT = 5000;

function alertTimeout(timeout, id) {
  const alert = document.getElementById(id);
  setTimeout(() => {
    alert.style.display = 'none';
  }, timeout);
}

function hideAlert(id) {
  const alert = document.getElementById(id);
  alert.style.display = 'none';
}

function showSnackbar(message, id) {
  const snackbar = document.getElementById('snackbar');
  switch (id) {
    case 'errorAlert':
      snackbar.style.backgroundColor = 'Tomato';
      snackbar.innerHTML = `<strong>Error</strong> : ${message}`;
      break;
    case 'warningAlert':
      snackbar.style.backgroundColor = 'Orange';
      snackbar.innerHTML = `<strong>Warning</strong> : ${message}`;
      break;
  }
  snackbar.classList.add('show');
  setTimeout(function() {
    snackbar.className = snackbar.className.replace('show', '');
  }, TIMEOUT);
}

function selectAll(id) {
  document.getElementById(id).focus();
  document.getElementById(id).select();
}

function countByteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length;
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s += 2;
    if (code >= 0xdc00 && code <= 0xdfff) i--; //trail surrogate
  }
  return s;
}

function displayCharCount(input) {
  const textLenght = input.textLength;
  const byteLength = countByteLength(input.value);
  let displayText = `${textLenght} characters, ${byteLength} of 5000 bytes used.`;
  document.getElementById('charCount').textContent = displayText;
}

function checkMaxByte(event, input) {
  const warningAlert = document.getElementById(alertId.warning);
  const inputAreaByteLength = countByteLength(input.value);
  if (inputAreaByteLength > MAX_BYTELENGTH) {
    showSnackbar('Max byte length exceeded.', alertId.warning);
  }
}

async function translateText() {
  const errorAlert = document.getElementById(alertId.error);
  const warningAlert = document.getElementById(alertId.warning);
  const outputArea = document.getElementById('outputText');
  errorAlert.style.display = 'none';
  warningAlert.style.display = 'none';
  outputArea.value = '';
  try {
    const inputText = document.getElementById('inputText').value;
    if (!inputText.length) {
      throw { message: 'Please input text first.' };
    }
    const inputAreaByteLength = countByteLength(inputText);
    if (inputAreaByteLength > MAX_BYTELENGTH) {
      throw { message: 'Max byte length exceeded.' };
    }

    const translateResult = await fetch('/translate', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputText
      })
    });
    const translateResultResponse = await translateResult.json();
    if (translateResultResponse.status >= 400 && translateResultResponse.status < 600) {
      throw translateResultResponse;
    }
    const { TranslatedText } = translateResultResponse;
    outputArea.value = TranslatedText;
  } catch (err) {
    console.log(err);
    showSnackbar(err.message, alertId.error);
    outputArea.value = '';
  }
}
