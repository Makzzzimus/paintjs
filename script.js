let selectedTool = null;
let paintBrushStroke = 12;
let selectedColorPicker = document.getElementById("SelectedColor");
let selectedColorHexInput = document.getElementById("SelectedColorHex");
function selectTool(t){
    if (selectedTool === null){
        document.getElementById("ToolPreferencesBox").style.opacity = 1;
        document.getElementById("ToolPreferencesBox").style.transform = "scale(1)";
    }
    else{
        reverseToolButtonColor();
    }
    selectedTool = t.id.slice(0,3);
    changeToolButtonColor(t);
    if(selectedTool == "PBr"){
        document.getElementById("ToolPreferencesFieldset").innerHTML = `<legend>Tool Settings</legend> <div> <label>Selected width: </label><br> <input id="PBrStrokeSlider" type="range" min="1" max="72" value="${paintBrushStroke}" oninput="changeStroke(this)"> <input id="PBrStrokeValue" type="number" min="1" max="72" value="${paintBrushStroke}" onchange="changeStroke(this)"><br> </div> <div> <label>Selected brush type: </label><br> <select id="SelectBrushType"> <option value="">Square</option> </select> </div>`;
    }
}

function changeStroke(t){
    if (t.id.slice(-5) == "Value"){
        document.getElementById(`${selectedTool}StrokeSlider`).value = t.value;
    }
    else{
        document.getElementById(`${selectedTool}StrokeValue`).value = t.value;
    }
    if (selectedTool == "PBr"){
        paintBrushStroke = t.value
    }
}
function changeToolButtonColor(t){
    const ELEMENTS_ARRAY = document.querySelectorAll(`.${t.id.slice(0,3)}SvgElement`);
    for(i=0; i<ELEMENTS_ARRAY.length; i++){
        console.log(ELEMENTS_ARRAY)
        ELEMENTS_ARRAY[i].style.fill = "#682375";
    }
}
function reverseToolButtonColor(){
    const ELEMENTS_ARRAY = document.querySelectorAll(`.${selectedTool}SvgElement`);
    for(i=0; i<ELEMENTS_ARRAY.length; i++){
        console.log(ELEMENTS_ARRAY)
        ELEMENTS_ARRAY[i].style.fill = "#9A949B";
    }
}


function setColorFromLibrary(t){
    selectedColorPicker.value = t.getAttribute("hex-data");
    selectedColorHexInput.value = t.getAttribute("hex-data");
}
function setWithColorPicker(){
    selectedColorHexInput.value = selectedColorPicker.value;
}
function setColorWithHex(){
    selectedColorPicker.value = selectedColorHexInput.value;
}
function copyHex(){
    navigator.clipboard.writeText(selectedColorHexInput.value);
}