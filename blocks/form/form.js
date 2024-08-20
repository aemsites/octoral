import createField from './form-fields.js';
import { div, form as Form, input } from '../../scripts/dom-helpers.js';
import { getPathSegments, loadTranslations, translate } from '../../scripts/utils.js';

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDateTime;
}


async function createForm(formHref, submitHref) {
  const resp = await fetch(formHref);
  const json = await resp.json();
  const [locale] = getPathSegments();
  // get translations
  await (async () => {
    await loadTranslations(`${formHref}?sheet=translations`, locale || 'en');
  })();

  const translatedData = json.data.map((fd) => {
    fd.Label = translate(fd.Label);
    return fd;
  });

  const form = Form();
  form.dataset.action = submitHref;

  const localeField = input({ hidden: 'hidden', name: 'locale', value: locale || 'en' });
  form.append(localeField);

  const submittedDate = input({ hidden: 'hidden', name: 'submitted', value: getCurrentDateTime() });
  form.append(submittedDate);

  const fields = await Promise.all(translatedData.map((fd) => createField(fd, form)));

  fields.forEach((field) => {
    if (field) {
      form.append(field);
    }
  });

  // group fields into fieldsets
  const fieldsets = form.querySelectorAll('fieldset');
  fieldsets.forEach((fieldset) => {
    form.querySelectorAll(`[data-fieldset="${fieldset.name}"`).forEach((field) => {
      fieldset.append(field);
    });
  });

  return form;
}

function generatePayload(form) {
  const payload = {};

  [...form.elements].forEach((field) => {
    if (field.name && field.type !== 'submit' && !field.disabled) {
      if (field.type === 'radio') {
        if (field.checked) payload[field.name] = field.value;
      } else if (field.type === 'checkbox') {
        if (field.checked) payload[field.name] = payload[field.name] ? `${payload[field.name]},${field.value}` : field.value;
      } else {
        payload[field.name] = field.value;
      }
    }
  });
  return payload;
}

async function handleSubmit(form) {
  if (form.getAttribute('data-submitting') === 'true') return;

  const submit = form.querySelector('button[type="submit"]');
  try {
    form.setAttribute('data-submitting', 'true');
    submit.disabled = true;

    // create payload
    const payload = generatePayload(form);
    const response = await fetch(form.dataset.action, {
      method: 'POST',
      body: JSON.stringify({ data: payload }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      // confirmation
      const formEl = document.querySelector('.form');
      const thankYou = div({ class: 'thank-you' }, 'Thank you for filling out this form. Your form has been sent.');
      formEl.replaceWith(thankYou);
    } else {
      const error = await response.text();
      throw new Error(error);
      const formEl = document.querySelector('.form');
      const errorMsg = div({ class: 'thank-you' }, 'There was an error submitting the form.  Please try again later.');
      formEl.prepend(errorMsg);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    form.setAttribute('data-submitting', 'false');
    submit.disabled = false;
  }
}

export default async function decorate(block) {
  const links = [...block.querySelectorAll('a')].map((a) => a.href);
  const formLink = links.find((link) => link.startsWith(window.location.origin));
  const submitLink = links.find((link) => link !== formLink);
  if (!formLink || !submitLink) return;

  const form = await createForm(formLink, submitLink);
  block.replaceChildren(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = form.checkValidity();
    if (valid) {
      handleSubmit(form);
    } else {
      const firstInvalidEl = form.querySelector(':invalid:not(fieldset)');
      if (firstInvalidEl) {
        firstInvalidEl.focus();
        firstInvalidEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}
