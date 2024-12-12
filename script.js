var jpdbBaseURL="http://api.login2explore.com:5577";
var connToken="90934376|-31949226657043814|90957174";

var jpdbIRL="/api/irl";
var jpdbIML="/api/iml";
var empDBName="EMP-DB";
var empRelationName="EmpData";

setBaseUrl(jpdbBaseURL);

function disableCtrl(ctrl){
    $('#new').prop('disabled',ctrl);
    $('#save').prop('disabled',ctrl);
    $('#edit').prop('disabled',ctrl);
    $('#change').prop('disabled',ctrl);
    $('#reset').prop('disabled',ctrl);
}

function disableNav(ctrl){
    $('#first').prop('disabled',ctrl);
    $('#prev').prop('disabled',ctrl);
    $('#next').prop('disabled',ctrl);
    $('#last').prop('disabled',ctrl);
}

function disableForm(bvalue){
    $('#empid').prop('disabled',bValue);
    $('#empname').prop('disabled',bValue);
    $('#empsal').prop('disabled',bValue);
    $('#hra').prop('disabled',bValue);
    $('#da').prop('disabled',bValue);
    $('#deduct').prop('disabled',bValue);
}

function initEmpForm(){
    localStorage.removeItem('first_rec_no');
    localStorage.removeItem('last_rec_no');
    localStorage.removeItem('rec_no');
    
    console.log('initEmpForm() - done');
    
}

function setCurrRecNo2LS(jsonObj){
    var data= JSON.parse(jsonObj.data);
    localStorage.setItem("rec_no",data.rec_no);
}

function getCurrRecNoFromLS(jsonObj){
    return localStorage.getItem("rec_no");
}

function setFirstRecNo2LS(jsonObj){
    var data= JSON.parse(jsonObj.data);
    if(data.rec_no===undefined){
        localStorage.setItem("first_rec_no","0");
    } else {
        localStorage.setItem("first_rec_no",data.rec_no);
    }
}

function getFirstRecNoFromLS(jsonObj){
    return localStorage.getItem("first_rec_no");
}

function setLastRecNo2LS(jsonObj){
    var data= JSON.parse(jsonObj.data);
    if(data.rec_no===undefined){
        localStorage.setItem("last_rec_no",'0');
    } else {
        localStorage.setItem("last_rec_no",data.rec_no);
    }
}

function getLastRecNoFromLS(jsonObj){
    return localStorage.getItem("last_rec_no");
}

function getEmpFromEmpID() {
    var empid = $('#empid').val();
    var jsonStr = {
        id: empid
    };
    var getRequest = createGET_BY_KEYRequest(connToken,empDBName, empRelationName, JSON.stringify(jsonStr));
    jQuery.ajaxSetup({async:false});
    var jsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    if (jsonObj.status === 400){
        $("#save").prop("disabled",false);
        $("#reset").prop("disabled",false);
        $("#empname").focus();
    } else if(jsonObj.status === 200){
        showData(jsonObj);
    }
    jQuery.ajaxSetup({async: true});
}

function newForm(){
    makeDataFormEmpty();

    disableForm(false);
    $('#empid').focus();
    disableNav(true);
    disableCtrl(true);

    $('#save').prop('disabled',false);
    $('#reset').prop('disabled',false);
    
}

function makeDataFormEmpty(){
    $('#empid').val("");
    $('#empname').val("");
    $('#empsal').val("");
    $('#hra').val("");
    $('#da').val("");
    $('#deduct').val("");
}

function resetForm(){
    disableCtrl(false);
    disableNav(true);
    makeDataFormEmpty();
    var getCurRequest = createGET_BY_RecordRequest(connToken, empDBName, empRelationName, getCurrRecNoFromLS());
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getCurRequest,irlPartUrl);
    showData(result);
    jQuery.ajaxSetup({async: true});

    if (isOnlyOneRecordPresent() || isNoRecordPresentLS()){
        disableNav(true);
    }
    $('#new').prop('disabled',false);
    if (isNoRecordPresentLS()){
        makeDataFormEmpty();
        $("#edit").prop('disabled',true);
    } else {
        $("#edit").prop('disabled',false);
    }
    disableForm(True);
}

function showData(jsonObj){
    if (jsonObj.status===400){
        return;
    }
    var data = (JSON.parse(jsonObj.data)).record;
    setCurrRecNo2LS(jsonObj);

    $('#empid').val(data.id);
    $('#empname').val(data.name);
    $('#empsal').val(data.salary);
    $('#hra').val(data.hra);
    $('#da').val(data.da);
    $('#deduct').val(data.deduction);

    disableNav(false);
    disableForm(true);

    $("#save").prop('disabled',true);
    $("#change").prop('disabled',true);
    $("#reset").prop('disabled',true);

    $("#new").prop('disabled',false);
    $("#edit").prop('disabled',false);

    if (getCurrRecNoFromLS() === getLastRecNoFromLS()){
        $("#next").prop('disabled',true);
        $("#last").prop('disabled',true);
    }

    if (getCurrRecNoFromLS() === getFirstRecNoFromLS()){
        $("#prev").prop('disabled',true);
        $("#first").prop('disabled',true);
        return;
    }
}

function validateData(){
    var empid, empname, empsal, hra, da, deduct;
    empid= $('#empid').val();
    empname= $('#empname').val();
    empsal= $('#empsal').val();
    hra= $('#hra').val();
    da= $('#da').val();
    deduct= $('#deduct').val();

   if (empid === ""){
       alert('Employee ID Missing');
       $('#empid').focus();
       return "";
   }

   if (empname === ""){
       alert('Employee Name Missing');
       $('#empname').focus();
       return "";
   }
   if (empsal === ""){
       alert('Employee Salary Missing');
       $('#empsal').focus();
       return "";
   }
   if (hra === ""){
       alert('Employee HRA Missing');
       $('#hra').focus();
       return "";
   }
   if (da === ""){
       alert('Employee DA Missing');
       $('#da').focus();
       return "";
   }
   if (deduct === ""){
       alert('Employee Deduction Missing');
       $('#deduct').focus();
       return "";
   }
   
   var jsonStrObj = {
       id: empid,
       name: empname,
       salary: empsal,
       hra: hra,
       da: da,
       duduction: deduct
   };

    return JSON.stringify(jsonStrObj);

}

function getFirst() {
    var getFirstRequest = createFIRST_RECORDRequest(connToken, empDBName, empRelationName);
    jQuery.ajaxSetup({async:false});
    var result = executeCommand(getFirstRequest,irlPartUrl);
    showData(result);
    setFirstRecNo2LS(result);
    jQuery.ajaxSetup({async:true});
    $("#first").prop('disabled',true);
    $("#prev").prop('disabled',true);
    $("next").prop('disabled',false);
    $("#save").prop('disabled',true);
}

function getPrev() {
    var r = getCurrRecNoFromLS();
    if(r === 1)
    {
        $("#prev").prop('disabled',true);
        $("#first").prop('disabled',true);
    }

    var getPrevRequest = createPREV_RECORDRequest(connToken, empDBName, empRelationName,r);
    jQuery.ajaxSetup({async:false});
    var result = executeCommand(getPrevRequest, irlPartUrl);
    showData(result);
    jQuery.ajaxSetup({async:true});
    var r= getCurrRecNoFromLS();
    if(r === 1)
    {
        $("#first").prop('disabled',true);
        $("#prev").prop('disabled',true);
    }
    $("#save").prop('disabled',true);
}

function getNext() {
    var r =getCurrRecNoFromLS();

    var getPrevRequest = createNEXT_RECORDRequest(connToken, empDBName, empRelationName,r);
    jQuery.ajaxSetup({async:false});
    var result = executeCommand(getPrevRequest,irlPartUrl);
    showData(result);
    jQuery.ajaxSetup({async: true});

    $("#save").prop('disabled',true);
}
function getLast(){
    var getLastRequest = createLAST_RECORDRequest(connToken, empDBName, empRelationName,r);
    jQuery.ajaxSetup({async:false});
    var result = executeCommand(getLastRequest, irlPartUrl);
    showData(result);
    jQuery.ajaxSetup({async: true});
    $("#first").prop('disabled',false);
    $("#prev").prop('disabled',false);
    $("#last").prop('disabled',true);
    $("#next").prop('disabled',true);
    $("#save").prop('disabled',true);

}

function saveData(){
    var jsonStrObj = validateData();
    if(jsonStrObj === ""){
        return "";
    }
    var putRequest = createPUTRequest(connToken,jsonStrObj, empDBName, empRelationName);
    alert(putRequest);
    jQuery.ajaxSetup({async:false});
    var jsonObj = executeCommand(putRequest,imlPartUrl);
    jQuery.ajaxSetup({async:true});
    if(isNoRecordPresentLS()){
        setFirstRecNo2LS(jsonObj);
    }
    setLastRecNo2LS(jsonObj);
    setCurrRecNo2LS(jsonObj);
    resetForm();
}
function createPUTRequest(connToken, jsonStrObj, empDBName, empRelationName) {
    var putRequests = "{\n"
    + "\"token\" : \""
    + connToken
    + "\","
    + "\"dbName\": \""
    + empDBName
    + "\",\n" + "\"cmd\" : \"PUT\",\n"
    + "\"rel\" : \""
    + empRelationName + "\","
    + "\"jsonStr\": \n"
    + jsonStrObj
    + "\n"
    + "}";
    return putRequests;
    }

function editData(){
    disableForm(false);
    $('#empid').prop('disabled',true);
    $('#empname').focus();

    disableNav(true);
    disableCtrl(true);
    $('#change').prop('disabled',false);
    $('#reset').prop('disabled',false);
}

function changeData(){
    jsonChg=validateData();
    var updateRequest = createUPDATERecordRequest(connToken, jsonChg, empDBName, empRelationName, getCurrRecNoFromLS());
    jQuery.ajaxSetup({async: false});
    var jsonObj= executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({async:true});
    console.log(jsonObj);
    resetForm();
    $('#empid').focus();
    $('#edit').focus();
}

function isNoRecordPresentLS(){
    if (getFirstRecNoFromLS() === "0" && getLastRecNoFromLS() === "0"){
        return true;
    }   
    return false;
}

function isOnlyOneRecordPresent(){
    if (isNoRecordPresentLS()){
        return false;
    }
    if (getFirstRecNoFromLS() === getLastRecNoFromLS()){
        return true;
    }
    return false;
}

function checkForNoOrOneRecord(){
    if (isNoRecordPresentLS()){
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $('#new').prop("disabled",false);
        return;
    }
    if (isOnlyOneRecordPresent()){
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $('#new').prop("disabled",false);
        $('#edit').prop("disabled",false);
        return;
    }
}

initEmpForm();
getFirst();
getLast();
checkForNoOrOneRecord();