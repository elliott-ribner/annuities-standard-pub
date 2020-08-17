var handleJointLifeCheckChange = function () {
  $(".secondPerson").toggle();
};

var getFormData = function (formId) {
  var formObj = {};
  var inputs = $("#" + formId).serializeArray();
  $.each(inputs, function (i, input) {
    formObj[input.name] = input.value;
  });
  return formObj;
};

var submitQuoteRequestForm = function () {
  var formData = getFormData("quote-request-form");
  for (var key in formData) {
    if (
      formData[key] === "Required" ||
      formData[key] === "Optional" ||
      formData[key] === "" ||
      formData[key] === "empty"
    ) {
      delete formData[key];
    }
  }
  var queryString = jQuery.param(formData);
  //TODO move this to use some sort of config
  var baseUrlWithAnnuityQuote =
    "https://www.next-annuity.com/" + "annuity-quote?";
  var age = formData["age"];
  var gender = formData["gender"];
  var secondIsChecked = document.getElementById("jointLifeCheckBox").checked;
  var secondAge = secondIsChecked ? formData["second-age"] : true;
  var secondGender = secondIsChecked ? formData["second-gender"] : true;
  var principleIsInteger =
    Number.isInteger(parseInt(formData["principle"])) &&
    formData["principle"] > 19999;
  if (!gender || !age || !secondAge || !secondGender || !principleIsInteger) {
    var alertMessage = "";
    if (!gender) alertMessage += "You must enter gender. ";
    if (!age) alertMessage += "You must enter age. ";
    if (!secondGender) alertMessage += "You must enter second gender. ";
    if (!secondAge) alertMessage += "You must equal second age. ";
    if (!principleIsInteger)
      alertMessage += "Investment amount must be at least 20000";
    alert(alertMessage);
    return;
  }
  $(location).attr("href", baseUrlWithAnnuityQuote + queryString);
};

var submitEmail = function () {
  var form = $("#newsletter-email-form");
  var email = form.val();
  console.log(email);
  if (email) {
    $.post(window.location.href + "email-list", { emailAddress: email });
    form.val("");
  } else {
    alert("You must enter an email address");
  }
};

var submitQuestion = function () {
  var formData = getFormData("question-form");
  for (var key in formData) {
    if (
      formData[key] === "Required" ||
      formData[key] === "Optional" ||
      formData[key] === "" ||
      formData[key] === "empty"
    ) {
      delete formData[key];
    }
  }
  var email = formData["email"];
  var name = formData["name"];
  var question = formData["question"];
  var principle = formData["principle"];
  if (!email || !question) {
    var alertMessage = "";
    if (!principle) {
      alertMessage += "You must enter an investment amount";
    }
    if (!email) {
      alertMessage += "You must enter an email. ";
    }
    if (!question) {
      alertMessage += "You must include a question. ";
    }
    if (!name) {
      alertMessage += "You must enter a name";
    }
    alert(alertMessage);
    return;
  } else {
    $.post(window.location.href + "question", formData);
    $("#question-form").val("");
  }
};

$(document).ready(function () {
  $(document).on("change", 'input[type="checkbox"]', function (e) {
    handleJointLifeCheckChange();
  });
  $("#submit-quote-request").click(function () {
    submitQuoteRequestForm();
  });
  $("#submit-email").click(function () {
    submitEmail();
  });
  $("#submit-question").click(function () {
    submitQuestion();
  });
  $(".buy-button").click(function (e) {
    var currentTargetId = e.currentTarget.id;
    $(".modal-wrapper").toggleClass("open");
    $(".page-wrapper").toggleClass("blur");
    var url;
    var callback = function () {
      if (typeof url != "undefined") {
        window.location = url;
      }
    };
    gtag("event", "conversion", {
      send_to: "google-conversion-tag",
      event_callback: callback,
    });
  });
  $(".btn-close").click(function (e) {
    $(".modal-wrapper").toggleClass("open");
    $(".page-wrapper").toggleClass("blur");
  });
});
