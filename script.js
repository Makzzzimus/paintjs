let selectedTool = null;
let paintBrushStroke = 6;
let paintBrushShape = "square";
let eraserStroke = 6;
let eraserShape = "square";
const selectedColorPicker = document.getElementById("SelectedColor");
const selectedColorHexInput = document.getElementById("SelectedColorHex");
const cursorLocationInput = document.getElementById("CursorLocationInput")
const selectedColorBox = document.getElementById("SelectedColorBox");
const canvas = document.getElementById("Canvas");
let ctx = canvas.getContext("2d");
let cursorX = 0;
let cursorY = 0;
let isMouseDown = false;
let undoActionsList = [];
let redoActionList = [];
let undoActionPropertiesList = [];
let redoActionPropertiesList = [];
let lineList = [];

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
        document.getElementById("ToolPreferencesFieldset").innerHTML = `<legend>Tool properties</legend> <div> <label>Selected width: </label><br> <input id="PBrStrokeSlider" type="range" min="1" max="72" value="${paintBrushStroke}" oninput="changeStroke(this)"> <input id="PBrStrokeValue" type="number" min="1" max="72" value="${paintBrushStroke}" onchange="changeStroke(this)"><br> </div> <div> <label>Selected shape: </label><br> <select id="SelectBrushShape" onchange="changeShape(this)"> <option id="square" value="square">Square</option> <option id="rounded" value="round">Rounded</option> </select> </div>`;
        ctx.globalCompositeOperation="source-over";
        ctx.lineWidth = paintBrushStroke;
        changeShape(null);
        document.getElementById("SelectBrushShape").value = paintBrushShape;
    }
    if(selectedTool == "Era"){
        document.getElementById("ToolPreferencesFieldset").innerHTML = `<legend>Tool properties</legend> <div> <label>Selected width: </label><br> <input id="EraStrokeSlider" type="range" min="1" max="72" value="${eraserStroke}" oninput="changeStroke(this)"> <input id="EraStrokeValue" type="number" min="1" max="72" value="${eraserStroke}" onchange="changeStroke(this)"><br> </div> <div> <label>Selected shape: </label><br> <select id="SelectEraserShape" onchange="changeShape(this)"> <option id="square" value="square">Square</option> <option id="rounded" value="round">Rounded</option> </select> </div>`;
        ctx.globalCompositeOperation="destination-out";
        ctx.lineWidth = eraserStroke;
        changeShape(null);
        document.getElementById("SelectEraserShape").value = eraserShape;
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
    if (selectedTool == "Era"){
        eraserStroke = t.value
        ctx.lineWidth = eraserStroke;
    }
}
function changeShape(t){
    if (selectedTool == "PBr"){
        if (t != null){
            paintBrushShape = t.value;
        }
        if (paintBrushShape == "square"){
            ctx.lineCap = "butt";
            ctx.lineJoin = "bevel";
        }
        else if(paintBrushShape == "round"){
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }
    }
    else if (selectedTool == "Era"){
        if (t != null){
            eraserShape = t.value;
        }
        if (eraserShape == "square"){
            ctx.lineCap = "butt";
            ctx.lineJoin = "bevel";
        }
        else if(eraserShape == "round"){
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }
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
function createCanvas(clearHistory){
    canvas.width = document.getElementById("WidthInput").value;
    canvas.height = document.getElementById("HeightInput").value;
    if (selectedTool == "PBr"){
        ctx.lineWidth = paintBrushStroke;
        ctx.strokeStyle = selectedColorPicker.value;
    }
    changeShape(null);
    closeFileCreationPopup();
    if (clearHistory !== false){
        undoActionsList = [];
        redoActionList = [];
        undoActionPropertiesList = [];
        redoActionPropertiesList = [];
        undoButtonColorChange("off");
        redoButtonColorChange("off");
    }
}
function closeFileCreationPopup(){
    document.getElementById("BackgroundDim").style.display = "none";
    document.getElementById("FileCreationPopup").style.display = "none";
}
function swapValues(){
    let temp = document.getElementById("HeightInput").value;
    document.getElementById("HeightInput").value = document.getElementById("WidthInput").value;
    document.getElementById("WidthInput").value = temp;
}
function saveFile(){
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    let adjective = ["Wonderful", "Stylized", "Sharp", "Detailed", "Geometric", "Futuristic", "Historic", "Vivid", "Beautiful", "Grainy", "Great", "Attractive", "Colorful", "Dramatic", "Evocative", "Digital", "Striking", "Distorted"];
    let subject = ["Painting", "Drawing", "Picture", "Sketch", "Canvas", "Portrait", "Portrayal", "Illustration", "Artwork", "Concept", "Depiction", "Visualization"];
    link.download = `${adjective[Math.round(Math.random()*17)]} ${subject[Math.round(Math.random()*11)]}.png`;
    link.click();
}


function undoButtonColorChange(status){
    const ELEMENTS_ARRAY = document.querySelectorAll(`.UndoSvgElement`);
    const undoButton = document.getElementById("UndoButton");
    if (status == "on"){
        for(i=0; i<ELEMENTS_ARRAY.length; i++){
            ELEMENTS_ARRAY[i].style.fill = "#682375";
        }
        undoButton.onclick = function(){undoLastAction()};
    }
    else if(status == "off"){
        for(i=0; i<ELEMENTS_ARRAY.length; i++){
            ELEMENTS_ARRAY[i].style.fill = "#9A949B";
        }
       undoButton.onclick = undefined;
    }
}
function redoButtonColorChange(status){
    const ELEMENTS_ARRAY = document.querySelectorAll(`.RedoSvgElement`);
    const redoButton = document.getElementById("RedoButton");
    if (status == "on"){
        for(i=0; i<ELEMENTS_ARRAY.length; i++){
            ELEMENTS_ARRAY[i].style.fill = "#682375";
        }
        redoButton.onclick = function(){redoLastAction()};
    }
    else if(status == "off"){
        for(i=0; i<ELEMENTS_ARRAY.length; i++){
            ELEMENTS_ARRAY[i].style.fill = "#9A949B";
        }
        redoButton.onclick = undefined;
    }
}
function undoLastAction(){
    createCanvas(false);
    for(i=0; i<undoActionsList.length-1; i++){
        ctx.strokeStyle = undoActionPropertiesList[i][0];
        ctx.lineCap = undoActionPropertiesList[i][1];
        ctx.lineJoin = undoActionPropertiesList[i][2];
        ctx.lineWidth = undoActionPropertiesList[i][3];
        ctx.globalCompositeOperation = undoActionPropertiesList[i][4];
        ctx.beginPath();
        for(j=0; j<undoActionsList[i].length; j++){
            let cursorLocations = undoActionsList[i][j].split("; ");
            ctx.lineTo(cursorLocations[0], cursorLocations[1]);
            ctx.stroke();
        }
    }
    redoActionList.push(undoActionsList.pop());
    const beforeUndoToolProperties = undoActionPropertiesList.pop();
    ctx.strokeStyle = beforeUndoToolProperties[0];
    ctx.lineCap = beforeUndoToolProperties[1];
    ctx.lineJoin = beforeUndoToolProperties[2];
    ctx.lineWidth = beforeUndoToolProperties[3];
    ctx.globalCompositeOperation = beforeUndoToolProperties[4];
    redoActionPropertiesList.push(beforeUndoToolProperties);
    if (undoActionsList.length == 0){
        undoButtonColorChange("off");
    }
    if (redoActionList.length != 0){
        redoButtonColorChange("on");
    }
}
function redoLastAction(){
    ctx.strokeStyle = redoActionPropertiesList[redoActionPropertiesList.length - 1][0];
    ctx.lineCap = redoActionPropertiesList[redoActionPropertiesList.length - 1][1];
    ctx.lineJoin = redoActionPropertiesList[redoActionPropertiesList.length - 1][2];
    ctx.lineWidth = redoActionPropertiesList[redoActionPropertiesList.length - 1][3];
    ctx.globalCompositeOperation = redoActionPropertiesList[redoActionPropertiesList.length - 1][4];
    ctx.beginPath();
    for(j=0; j<redoActionList[redoActionList.length - 1].length; j++){
        let cursorLocations = redoActionList[redoActionList.length - 1][j].split("; ");
        ctx.lineTo(cursorLocations[0], cursorLocations[1]);
        ctx.stroke();
    }
    undoActionsList.push(redoActionList.pop());
    const beforeRedoToolProperties = redoActionPropertiesList.pop();
    ctx.strokeStyle = beforeRedoToolProperties[0];
    ctx.lineCap = beforeRedoToolProperties[1];
    ctx.lineJoin = beforeRedoToolProperties[2];
    ctx.lineWidth = beforeRedoToolProperties[3];
    ctx.globalCompositeOperation = beforeRedoToolProperties[4];
    undoActionPropertiesList.push(beforeRedoToolProperties);
    if (redoActionList.length == 0){
        redoButtonColorChange("off");
    }
    if (undoActionsList.length != 0){
        undoButtonColorChange("on");
    }
}


function getCursorLocation(event){
    let rect = event.target.getBoundingClientRect();
    cursorX = Math.round(event.clientX - rect.left);
    cursorY = Math.round(event.clientY - rect.top);
    cursorLocationInput.value = `${cursorX}, ${cursorY}`;
    if (isMouseDown == true){
        if (selectedTool == "PBr" || selectedTool == "Era"){
            ctx.lineTo(cursorX, cursorY);
            ctx.stroke();
            lineList.push(`${cursorX}; ${cursorY}`);
        }
    }
}
function mouseDown(){
    isMouseDown = true;
    ctx.beginPath();
}
function mouseUp(){
    if (isMouseDown == true){
        if (selectedTool != null && canvas.height > 0){
            let lastActionProperties = [ctx.strokeStyle, ctx.lineCap, ctx.lineJoin, ctx.lineWidth, ctx.globalCompositeOperation];
            undoActionPropertiesList.push(lastActionProperties);
            console.log("Tool properties saved");
            undoActionsList.push(lineList);
            lineList = [];
            console.log("Action saved");
            undoButtonColorChange("on");
            redoActionList = []
            redoActionPropertiesList = [];
            redoButtonColorChange("off");
        }
    }
    isMouseDown = false;
}