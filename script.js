let selectedTool = null;
let paintBrushStroke = 6;
let eraserStroke = 6;
let selectedColorPicker = document.getElementById("SelectedColor");
let selectedColorHexInput = document.getElementById("SelectedColorHex");
let cursorLocationInput = document.getElementById("CursorLocationInput")
let selectedColorBox = document.getElementById("SelectedColorBox");
let canvas = document.getElementById("Canvas");
let ctx = canvas.getContext("2d");
let cursorX = 0;
let cursorY = 0;
let isMouseDown = false;

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
        ctx.lineWidth = paintBrushStroke;
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
        ctx.lineWidth = paintBrushStroke;
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
    ctx.strokeStyle = selectedColorPicker.value
    selectedColorBox.style.borderColor = selectedColorPicker.value
}
function setWithColorPicker(){
    selectedColorHexInput.value = selectedColorPicker.value;
    ctx.strokeStyle = selectedColorPicker.value
    selectedColorBox.style.borderColor = selectedColorPicker.value
}
function setColorWithHex(){
    selectedColorPicker.value = selectedColorHexInput.value;
    ctx.strokeStyle = selectedColorPicker.value
    selectedColorBox.style.borderColor = selectedColorPicker.value
}
function copyHex(){
    navigator.clipboard.writeText(selectedColorHexInput.value);
}


function openCreateFilePopup(){
    document.getElementById("BackgroundDim").style.display = "flex";
    document.getElementById("FileCreationPopup").style.display = "block"
}
function createCanvas(){
    canvas.width = document.getElementById("WidthInput").value;
    canvas.height = document.getElementById("HeightInput").value;
    if (selectedTool == "PBr"){
        ctx.lineWidth = paintBrushStroke;
        ctx.strokeStyle = selectedColorPicker.value;
    }
    closeFileCreationPopup();
}
function closeFileCreationPopup(){
    document.getElementById("BackgroundDim").style.display = "none";
    document.getElementById("FileCreationPopup").style.display = "none"
}
function swapValues(){
    let temp = document.getElementById("HeightInput").value;
    document.getElementById("HeightInput").value = document.getElementById("WidthInput").value;
    document.getElementById("WidthInput").value = temp;
}


function getCursorLocation(event){
    let rect = event.target.getBoundingClientRect();
    cursorX = Math.round(event.clientX - rect.left);
    cursorY = Math.round(event.clientY - rect.top);
    cursorLocationInput.value = `${cursorX}, ${cursorY}`;
    if (isMouseDown == true){
        if (selectedTool == "PBr"){
            ctx.lineTo(cursorX, cursorY);
            ctx.stroke();
        }
    }
}
function mouseDown(){
    isMouseDown = true;
    ctx.beginPath();
}
function mouseUp(){
    isMouseDown = false;
}