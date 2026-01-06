'use strict';

console.log("EDIT.JS LOADED");

const form = document.querySelector('.needs-validation');

if (form) {
  form.addEventListener('submit', function (event) {

    // EXTRA MANUAL CHECK (IMPORTANT)
    const country = form.querySelector('[name="listing[country]"]').value.trim();
    const location = form.querySelector('[name="listing[location]"]').value.trim();

    const countryRegex = /^[A-Za-z\s-]+$/;
    const locationRegex = /^[A-Za-z\s.-]+$/;

    let valid = true;

    if (!countryRegex.test(country)) {
      valid = false;
      form.querySelector('[name="listing[country]"]').classList.add('is-invalid');
    }

    if (!locationRegex.test(location)) {
      valid = false;
      form.querySelector('[name="listing[location]"]').classList.add('is-invalid');
    }

    if (!form.checkValidity() || !valid) {
      event.preventDefault();
      event.stopPropagation();
    }

    form.classList.add('was-validated');
  });
}
