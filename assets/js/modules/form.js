const fields = ["fullName", "phone", "email", "interest", "message"];

function markFieldState(element, hasError) {
  element.classList.toggle("field-error", hasError);
}

function validateForm(form) {
  const values = Object.fromEntries(new FormData(form).entries());
  const errors = {};

  if (!values.fullName || values.fullName.trim().length < 3) {
    errors.fullName = "Please enter your full name.";
  }

  if (!values.phone || values.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.interest) {
    errors.interest = "Please select a product category.";
  }

  if (!values.message || values.message.trim().length < 12) {
    errors.message = "Please share a few details about your requirement.";
  }

  return { values, errors };
}

export function setupEnquiryForm() {
  const form = document.querySelector("#enquiry-form");
  const status = document.querySelector("#form-status");

  if (!form || !status) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const { values, errors } = validateForm(form);

    fields.forEach((fieldName) => {
      const field = form.elements.namedItem(fieldName);
      if (field instanceof HTMLElement) {
        markFieldState(field, Boolean(errors[fieldName]));
      }
    });

    if (Object.keys(errors).length > 0) {
      status.textContent = Object.values(errors)[0];
      status.className = "form-status error";
      return;
    }

    status.textContent =
      `Thank you, ${values.fullName}. Your enquiry has been prepared for ${values.interest}. ` +
      "You can now connect with Resatu India by phone or email for follow-up.";
    status.className = "form-status success";
    form.reset();
  });
}
