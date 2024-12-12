/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
const jpdbBaseURL = "http://api.login2explore.com:5577";
const connToken = "90934376|-31949226657043814|90957174";

const jpdbIRL = "/api/irl";
const jpdbIML = "/api/iml";
const empDBName = "EMP-DB";
const empRelationName = "EmpData";

setBaseUrl(jpdbBaseURL);

function toggleControls(controls, state) {
    controls.forEach(control => $(`#${control}`).prop('disabled', state));
}

function toggleFormFields(fields, state) {
    fields.forEach(field => $(`#${field}`).prop('disabled', state));
}

function initEmpForm() {
    localStorage.removeItem('first_rec_no');
    localStorage.removeItem('last_rec_no');
    localStorage.removeItem('rec_no');
    console.log('Form initialized');
}

function setRecordToLocalStorage(key, jsonObj) {
    const data = JSON.parse(jsonObj.data);
    localStorage.setItem(key, data.rec_no || "0");
}

function getRecordFromLocalStorage(key) {
    return localStorage.getItem(key);
}

function getEmpDetailsById() {
    const empId = $('#empid').val();
    const request = createGET_BY_KEYRequest(connToken, empDBName, empRelationName, JSON.stringify({ id: empId }));

    $.ajaxSetup({ async: false });
    const response = executeCommandAtGivenBaseUrl(request, jpdbBaseURL, jpdbIRL);
    $.ajaxSetup({ async: true });

    if (response.status === 400) {
        toggleControls(["save", "reset"], false);
        $('#empname').focus();
    } else if (response.status === 200) {
        populateForm(response);
    }
}

function createNewForm() {
    clearForm();
    toggleFormFields(["empid", "empname", "empsal", "hra", "da", "deduct"], false);
    toggleControls(["save", "reset"], false);
    toggleControls(["new", "edit", "change"], true);
    $('#empid').focus();
}

function clearForm() {
    ["empid", "empname", "empsal", "hra", "da", "deduct"].forEach(field => $(`#${field}`).val(""));
}

function resetForm() {
    const request = createGET_BY_RecordRequest(connToken, empDBName, empRelationName, getRecordFromLocalStorage("rec_no"));

    $.ajaxSetup({ async: false });
    const response = executeCommand(request, jpdbIRL);
    $.ajaxSetup({ async: true });

    populateForm(response);
    checkForSingleRecord();
    toggleControls(["new"], false);
    if (!getRecordFromLocalStorage("first_rec_no")) {
        clearForm();
        toggleControls(["edit"], true);
    } else {
        toggleControls(["edit"], false);
    }
}

function populateForm(jsonObj) {
    if (jsonObj.status === 400) return;

    const data = JSON.parse(jsonObj.data).record;
    setRecordToLocalStorage("rec_no", jsonObj);

    ["empid", "empname", "empsal", "hra", "da", "deduct"].forEach(field => $(`#${field}`).val(data[field] || ""));

    toggleFormFields(["empid", "empname", "empsal", "hra", "da", "deduct"], true);
    toggleControls(["save", "change", "reset"], true);
    toggleControls(["new", "edit"], false);

    updateNavigationButtons();
}

function validateFormData() {
    const fields = ["empid", "empname", "empsal", "hra", "da", "deduct"];
    for (const field of fields) {
        if (!$(`#${field}`).val()) {
            alert(`${field.toUpperCase()} is required`);
            $(`#${field}`).focus();
            return "";
        }
    }

    const formData = {
        id: $('#empid').val(),
        name: $('#empname').val(),
        salary: $('#empsal').val(),
        hra: $('#hra').val(),
        da: $('#da').val(),
        deduction: $('#deduct').val()
    };

    return JSON.stringify(formData);
}

function updateNavigationButtons() {
    const current = getRecordFromLocalStorage("rec_no");
    const first = getRecordFromLocalStorage("first_rec_no");
    const last = getRecordFromLocalStorage("last_rec_no");

    toggleControls(["first", "prev"], current === first);
    toggleControls(["last", "next"], current === last);
}

function saveData() {
    const formData = validateFormData();
    if (!formData) return;

    const request = createPUTRequest(connToken, formData, empDBName, empRelationName);

    $.ajaxSetup({ async: false });
    const response = executeCommand(request, jpdbIML);
    $.ajaxSetup({ async: true });

    if (!getRecordFromLocalStorage("first_rec_no")) {
        setRecordToLocalStorage("first_rec_no", response);
    }

    setRecordToLocalStorage("last_rec_no", response);
    setRecordToLocalStorage("rec_no", response);

    resetForm();
}

function navigateToFirst() {
    const request = createFIRST_RECORDRequest(connToken, empDBName, empRelationName);

    $.ajaxSetup({ async: false });
    const response = executeCommand(request, jpdbIRL);
    $.ajaxSetup({ async: true });

    setRecordToLocalStorage("first_rec_no", response);
    populateForm(response);
}

function navigateToPrev() {
    const current = getRecordFromLocalStorage("rec_no");
    if (current === "1") {
        toggleControls(["prev", "first"], true);
        return;
    }

    const request = createPREV_RECORDRequest(connToken, empDBName, empRelationName, current);

    $.ajaxSetup({ async: false });
    const response = executeCommand(request, jpdbIRL);
    $.ajaxSetup({ async: true });

    populateForm(response);
    updateNavigationButtons();
}

function navigateToNext() {
    const current = getRecordFromLocalStorage("rec_no");

    const request = createNEXT_RECORDRequest(connToken, empDBName, empRelationName, current);

    $.ajaxSetup({ async: false });
    const response = executeCommand(request, jpdbIRL);
    $.ajaxSetup({ async: true });

    populateForm(response);
    updateNavigationButtons();
}

function navigateToLast() {
    const request = createLAST_RECORDRequest(connToken, empDBName, empRelationName);

    $.ajaxSetup({ async: false });
    const response = executeCommand(request, jpdbIRL);
    $.ajaxSetup({ async: true });

    setRecordToLocalStorage("last_rec_no", response);
    populateForm(response);
}

function editFormData() {
    toggleFormFields(["empname", "empsal", "hra", "da", "deduct"], false);
    toggleControls(["change", "reset"], false);
    toggleControls(["new", "edit", "save"], true);
    $('#empname').focus();
}

function updateFormData() {
    const updatedData = validateFormData();
    if (!updatedData) return;

    const request = createUPDATERecordRequest(connToken, updatedData, empDBName, empRelationName, getRecordFromLocalStorage("rec_no"));

    $.ajaxSetup({ async: false });
    executeCommandAtGivenBaseUrl(request, jpdbBaseURL, jpdbIML);
    $.ajaxSetup({ async: true });

    resetForm();
}

function checkForSingleRecord() {
    const first = getRecordFromLocalStorage("first_rec_no");
    const last = getRecordFromLocalStorage("last_rec_no");

    if (!first && !last) {
        toggleFormFields(["empid", "empname", "empsal", "hra", "da", "deduct"], true);
        toggleControls(["new"], false);
    } else if (first === last) {
        toggleControls(["new", "edit"], false);
    }
}

initEmpForm();
navigateToFirst();
navigateToLast();
checkForSingleRecord();
