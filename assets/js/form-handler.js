/**
 * form-handler.js
 * --------------------------------------------------------------
 * Shared AJAX submission + validation handler for every form on
 * the site marked with [data-ajax-form]. Used by BOTH:
 *   - the full Contact page form (contact.html)
 *   - the homepage "Get an Estimate" mini form (index.html, Final
 *     CTA glass card)
 *
 * Behavior:
 *   - Submits via fetch() to send-mail.php — no page reload, ever.
 *   - Runs client-side validation first (fast feedback), then
 *     always defers to the server's response for the source of
 *     truth (server validation in send-mail.php is authoritative;
 *     client validation here is a UX convenience only).
 *   - Shows inline per-field errors (WPForms-style: red border +
 *     message directly under the field).
 *   - Shows a form-level success or error banner.
 *   - Disables the submit button and shows a loading state while
 *     the request is in flight, to prevent double-submits.
 *   - On success, optionally swaps the form for a `.form-thank-you`
 *     block if the page provides one (see integration doc).
 * --------------------------------------------------------------
 */
(function () {
  'use strict';

  function getFieldWrapper(field) {
    return field.closest('.form-group') || field.parentElement;
  }

  function showFieldError(form, fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');

    const wrapper = getFieldWrapper(field);
    let errorEl = wrapper.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      errorEl.setAttribute('role', 'alert');
      wrapper.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  function clearFieldErrors(form) {
    form.querySelectorAll('.is-invalid').forEach((el) => {
      el.classList.remove('is-invalid');
      el.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.field-error').forEach((el) => {
      el.textContent = '';
    });
  }

  function setFormMessage(form, type, text) {
    let msgEl = form.querySelector('.form-message');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.className = 'form-message';
      form.prepend(msgEl);
    }
    msgEl.className = text ? `form-message form-message--${type}` : 'form-message';
    msgEl.textContent = text || '';
    msgEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
    msgEl.setAttribute('aria-live', 'polite');
  }

  // Mirrors the server-side rules in send-mail.php closely enough
  // to catch obvious mistakes instantly — the server re-checks
  // everything regardless, this is purely for fast feedback.
  function clientValidate(form) {
    const errors = {};

    form.querySelectorAll('[required]').forEach((field) => {
      if (field.type === 'checkbox') {
        if (!field.checked) {
          errors[field.name] = 'Please confirm this to continue.';
        }
        return;
      }

      const value = field.value.trim();
      if (!value) {
        errors[field.name] = 'This field is required.';
        return;
      }

      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field.name] = 'Please enter a valid email address.';
      }

      if (field.type === 'tel' && !/^[0-9+\-\s()]{7,20}$/.test(value)) {
        errors[field.name] = 'Please enter a valid phone number.';
      }

      if (field.tagName === 'TEXTAREA' && value.length < 20) {
        errors[field.name] = 'Please enter at least 20 characters.';
      }
    });

    return errors;
  }

  function initAjaxForm(form) {
    // We own the validation UX end-to-end — suppress the browser's
    // default bubble/tooltip validation styling.
    form.setAttribute('novalidate', 'novalidate');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFieldErrors(form);
      setFormMessage(form, '', '');

      const clientErrors = clientValidate(form);
      if (Object.keys(clientErrors).length) {
        Object.entries(clientErrors).forEach(([name, msg]) => showFieldError(form, name, msg));
        setFormMessage(form, 'error', 'Please fix the highlighted fields below.');
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalLabel = submitBtn.dataset.originalLabel || submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
        submitBtn.classList.add('is-loading');
      }

      const formData = new FormData(form);

      fetch(form.getAttribute('action') || 'send-mail.php', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFormMessage(form, 'success', data.message || 'Thank you! We will be in touch shortly.');
            form.reset();
            form.classList.add('is-submitted');

            // If the page provides a dedicated thank-you block
            // (data-form-wrapper > .form-thank-you), swap to it.
            const wrapper = form.closest('[data-form-wrapper]');
            const thankYou = wrapper ? wrapper.querySelector('.form-thank-you') : null;
            if (thankYou) {
              form.hidden = true;
              thankYou.hidden = false;
              thankYou.setAttribute('tabindex', '-1');
              thankYou.focus();
            }
          } else if (data.errors) {
            Object.entries(data.errors).forEach(([name, msg]) => showFieldError(form, name, msg));
            setFormMessage(form, 'error', data.message || 'Please fix the errors below.');
          } else {
            setFormMessage(form, 'error', data.message || 'Something went wrong. Please try again.');
          }
        })
        .catch(() => {
          setFormMessage(form, 'error', 'Network error — please check your connection and try again.');
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalLabel;
            submitBtn.classList.remove('is-loading');
          }
        });
    });

    // Clear a field's error the moment the user starts fixing it,
    // rather than making them re-submit to see it clear.
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('input', () => {
        field.classList.remove('is-invalid');
        field.removeAttribute('aria-invalid');
        const wrapper = getFieldWrapper(field);
        const errorEl = wrapper.querySelector('.field-error');
        if (errorEl) errorEl.textContent = '';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[data-ajax-form]').forEach(initAjaxForm);
  });
})();
