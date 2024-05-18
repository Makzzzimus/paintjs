let selectedTool = null;
const paintBrush = {
    stroke: 6,
    strokeShape: "square",
    strokeQuality: "high",
};
const eraser = {
    stroke: 6,
    strokeShape: "square",
    strokeQuality: "medium",
};
const shapeTool = {
    stroke: 6,
    strokeShape: "sharp",
    shape: "rectangle",
    fillShape: false,
    shapeFillColor: "#000000"
};
let shapePoints = [];
let selectionBoxPoints = [];
let lastRadius = 0;
const selectedColorPicker = document.getElementById("SelectedColor");
const selectedColorHexInput = document.getElementById("SelectedColorHex");
const cursorLocationInput = document.getElementById("CursorLocationInput")
const selectedColorBox = document.getElementById("SelectedColorBox");
const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const previewCanvas = document.getElementById("PreviewCanvas");
const pctx = previewCanvas.getContext("2d", { willReadFrequently: true });
const canvasContainer = document.getElementById("CanvasContainer");
const tempCanvas = document.createElement("canvas");
const tctx = tempCanvas.getContext("2d");

let cursorX = 0;
let cursorY = 0;
let isMouseDown = false;
let undoActionsList = [];
let redoActionList = [];
let undoActionPropertiesList = [];
let redoActionPropertiesList = [];
let lineList = [];
let cooldown = 0;
let polygon = new Path2D();
let backgroundImage;
let movedCanvasFragment;
let isMovingFragment = false;
let distanceXY = [];

function pythagoras(a, b){
    return Math.sqrt(a*a+b*b);
}
function rgbToHex(r, g, b) { //thx man https://stackoverflow.com/a/5624139
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function selectTool(t){
    canvasContainer.style.cursor = "crosshair";
    changeActionButtonStatus("Copy", "off")
        changeActionButtonStatus("Cut", "off")
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
        document.getElementById("ToolPreferencesFieldset").innerHTML = `<legend>Tool properties</legend> <div> <label>Brush size: </label><br> <input id="PBrStrokeSlider" type="range" min="1" max="72" value="${paintBrush.stroke}" oninput="changeStroke(this)"> <input id="PBrStrokeValue" type="number" min="1" max="72" value="${paintBrush.stroke}" onchange="changeStroke(this)"><br> </div> <div> <label>Brush shape: </label><br> <select id="SelectBrushShape" onchange="changeShape(this)"> <option value="square">Square</option> <option value="round">Rounded</option> </select> </div> <div> <label>Brush stroke quality: </label><br> <select id="SelectBrushQuality" onchange="changeQuality(this)"> <option value="original">Original</option> <option value="high">High</option> <option value="medium">Medium</option> <option value="low">Low</option></select></div>`;
        ctx.globalCompositeOperation="source-over";
        ctx.lineWidth = paintBrush.stroke;
        changeShape(null);
        clearPreviewCanvas();
        document.getElementById("SelectBrushShape").value = paintBrush.strokeShape;
        document.getElementById("SelectBrushQuality").value = paintBrush.strokeQuality;
        cooldown = 0;
    }
    if(selectedTool == "Era"){
        document.getElementById("ToolPreferencesFieldset").innerHTML = `<legend>Tool properties</legend> <div> <label>Eraser size: </label><br> <input id="EraStrokeSlider" type="range" min="1" max="72" value="${eraser.stroke}" oninput="changeStroke(this)"> <input id="EraStrokeValue" type="number" min="1" max="72" value="${eraser.stroke}" onchange="changeStroke(this)"><br> </div> <div> <label>Eraser shape: </label><br> <select id="SelectEraserShape" onchange="changeShape(this)"> <option value="square">Square</option> <option value="round">Rounded</option> </select> </div> <label>Eraser stroke quality: </label><br> <select id="SelectEraserQuality" onchange="changeQuality(this)"> <option value="original">Original</option> <option value="high">High</option> <option value="medium">Medium</option> <option value="low">Low</option></select></div>`;
        ctx.globalCompositeOperation="destination-out";
        ctx.lineWidth = eraser.stroke;
        changeShape(null);
        clearPreviewCanvas();
        document.getElementById("SelectEraserShape").value = eraser.strokeShape;
        document.getElementById("SelectEraserQuality").value = eraser.strokeQuality;
        cooldown = 0;
    }
    if(selectedTool == "STo"){
        document.getElementById("ToolPreferencesFieldset").innerHTML = `<legend>Tool properties</legend> <div> <label>Shape stroke: </label><br> <input id="SToStrokeSlider" type="range" min="1" max="72" value="${shapeTool.stroke}" oninput="changeStroke(this)"> <input id="SToStrokeValue" type="number" min="1" max="72" value="${shapeTool.stroke}" onchange="changeStroke(this)"><br> </div> <div> <label>Selected shape: </label><br> <select id="SelectShapeToolShape" onchange="setShapeToolShape(this)"> <option value="rectangle">Rectangle</option> <option value="circle">Circle</option> <option value="line">Line</option> <option value="polygon">Polygon</option> </select><input type="number" min="3" max="24" value="3" id="InputCorners" onchange="resetPolygon()" style="width: 35px; display: none";></div><div><label>Selected corner shape: </label><br> <select id="SelectShapeToolCornerShape" onchange="changeShape(this)"> <option value="sharp">Sharp</option> <option value="cut">Cut</option> <option value="rounded">Rounded</option></select></div> <div><br><label>Fill shape: </label> <input type="checkbox" id="CheckboxShapeFill" onclick="changeIsFillShape(this)"></div> <div><label>Fill color: </label><br><input type="color" id="InputFillColor" onchange="setFillColor(this)"><button onclick="setFillColorFromPrimary()">Copy primary color</button></div>`;
        ctx.globalCompositeOperation="source-over";
        ctx.lineWidth = shapeTool.stroke;
        shapePoints = [];
        document.getElementById("SelectShapeToolShape").value = shapeTool.shape;
        document.getElementById("CheckboxShapeFill").checked = shapeTool.fillShape;
        document.getElementById("InputFillColor").value = shapeTool.shapeFillColor;
        if (shapeTool.shape == "polygon"){
            document.getElementById("InputCorners").style.display = "inline";
        }
        changeShape(null);
        clearPreviewCanvas();
    }
    if(selectedTool == "Sel"){
        document.getElementById("ToolPreferencesFieldset").innerHTML = `<legend>Tool properties</legend><br><label>This tool has no properties</label>`;
        selectionBoxPoints = [];
        clearPreviewCanvas();
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
        paintBrush.stroke = t.value
        ctx.lineWidth = paintBrush.stroke;
    }
    if (selectedTool == "Era"){
        eraser.stroke = t.value
        ctx.lineWidth = eraser.stroke;
    }
    if (selectedTool == "STo"){
        shapeTool.stroke = t.value
        ctx.lineWidth = shapeTool.stroke;
    }
}
function changeShape(t){
    if (selectedTool == "PBr"){
        if (t != null){
            paintBrush.strokeShape = t.value;
        }
        if (paintBrush.strokeShape == "square"){
            ctx.lineCap = "butt";
            ctx.lineJoin = "bevel";
        }
        else if(paintBrush.strokeShape == "round"){
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }
    }
    else if (selectedTool == "Era"){
        if (t != null){
            eraser.strokeShape = t.value;
        }
        if (eraser.strokeShape == "square"){
            ctx.lineCap = "butt";
            ctx.lineJoin = "bevel";
        }
        else if(eraser.strokeShape == "round"){
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }
    }
    else if (selectedTool == "STo"){
        if (t != null){
            shapeTool.strokeShape = t.value;
        }
        if (shapeTool.strokeShape == "sharp"){
            ctx.lineCap = "butt";
            ctx.lineJoin = "miter";
        }
        else if (shapeTool.strokeShape == "cut"){
            ctx.lineCap = "butt";
            ctx.lineJoin = "bevel";
        }
        else if (shapeTool.strokeShape == "rounded"){
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }
    }
}
function setShapeToolShape(t){
    if (selectedTool == "STo"){
        if (t != null){
            shapeTool.shape = t.value;
            if (shapeTool.shape == "polygon"){
                document.getElementById("InputCorners").style.display = "inline";
            }
            else {
                document.getElementById("InputCorners").style.display = "none";
            }
        }
        shapePoints = [];
    }
}
function changeQuality(t){
    if (selectedTool == "PBr"){
        paintBrush.strokeQuality = t.value;
        cooldown = 0;
    }
    else if (selectedTool == "Era"){
        eraser.strokeQuality = t.value;
        cooldown = 0;
    }
}
function changeIsFillShape(t){
    if (t.checked == true){
        shapeTool.fillShape = true;
    }
    else{
        shapeTool.fillShape = false;
    }
}
function changeToolButtonColor(t){
    const ELEMENTS_ARRAY = document.querySelectorAll(`.${t.id.slice(0,3)}SvgElement`);
    for(i=0; i<ELEMENTS_ARRAY.length; i++){
        ELEMENTS_ARRAY[i].style.fill = "#682375";
    }
}
function reverseToolButtonColor(){
    const ELEMENTS_ARRAY = document.querySelectorAll(`.${selectedTool}SvgElement`);
    for(i=0; i<ELEMENTS_ARRAY.length; i++){
        ELEMENTS_ARRAY[i].style.fill = "#9A949B";
    }
}


function setColorFromLibrary(t){
    if (t.id.slice(0,4) == "User"){
        let rgb = t.style.backgroundColor.split(", ");
        rgb[0] = rgb[0].slice(4);
        rgb[2] = rgb[2].slice(0, rgb[2].length-1);
        selectedColorPicker.value = rgbToHex(rgb[0], rgb[1], rgb[2]);
        selectedColorHexInput.value = rgbToHex(rgb[0], rgb[1], rgb[2]);
    }
    else{
        selectedColorPicker.value = t.getAttribute("hex-data");
        selectedColorHexInput.value = t.getAttribute("hex-data");
    }
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
function setFillColor(t){
    shapeTool.shapeFillColor = t.value;
    ctx.fillStyle = t.value;
}
function setFillColorFromPrimary(){
    document.getElementById("InputFillColor").value = selectedColorPicker.value;
    shapeTool.shapeFillColor = document.getElementById("InputFillColor").value;
}


function openCreateFilePopup(){
    document.getElementById("BackgroundDim").style.display = "flex";
    document.getElementById("FileCreationPopup").style.display = "block"
}
function createCanvas(clearHistory){
    let width = document.getElementById("WidthInput").value;
    let height = document.getElementById("HeightInput").value;
    canvasContainer.style.width = width+"px";
    canvasContainer.style.height = height+"px";
    canvas.width = width;
    canvas.height = height;
    previewCanvas.width = width;
    previewCanvas.height = height;
    if (selectedTool == "PBr"){
        ctx.lineWidth = paintBrush.stroke;
        ctx.strokeStyle = selectedColorPicker.value;
        changeShape(null);
    }
    if (selectedTool == "Era"){
        ctx.lineWidth = eraser.stroke;
        ctx.strokeStyle = selectedColorPicker.value;
        changeShape(null);
    }
    if (selectedTool == "STo"){
        ctx.lineWidth = shapeTool.stroke;
        ctx.strokeStyle = selectedColorPicker.value;
        changeShape(null);
    }
    changeShape(null);
    closeFileCreationPopup();
    if (clearHistory !== false){
        undoActionsList = [];
        redoActionList = [];
        undoActionPropertiesList = [];
        redoActionPropertiesList = [];
        changeActionButtonStatus("Undo", "off");
        changeActionButtonStatus("Redo", "off");
    }
}
function clearPreviewCanvas(){
    let width = document.getElementById("WidthInput").value;
    let height = document.getElementById("HeightInput").value;
    previewCanvas.width = width;
    previewCanvas.height = height;
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
function openFile(action, t){
    const uploadedImage = t.files[0];
    if (uploadedImage == null){
        alert("❌File wasn't selected");
    }
    console.log(uploadedImage);
    const img = new Image();
    img.src = URL.createObjectURL(uploadedImage);
    img.onload = function(){
        if (action == "open"){
            document.getElementById("WidthInput").value = img.width;
            document.getElementById("HeightInput").value = img.height;
            createCanvas(true);
            ctx.drawImage(img, 0 ,0);
            backgroundImage = img;
        }
        if (action == "insert" && canvas.height < img.height || canvas.width < img.width){
            alert("❌Image resolution is higher than canvas size");
        }
        else{
            ctx.drawImage(img, 0 ,0);
            backgroundImage = img;
        }
        
    };
}

function loadUserColors(){
    let raws = document.cookie.split("; ");
    let cells = []
    cells[0] = raws[0].split("!");
    cells[1] = raws[1].split("!");
    cells[0][0] = cells[0][0].slice(5);
    cells[1][0] = cells[1][0].slice(5);
    console.log(cells)
    for(let j=0; j<2; j++){
        for(let i=0; i<7; i++){
            let currentCell = document.getElementById(`UserColor${j+1}-${i+1}`);
            currentCell.style.backgroundColor = cells[j][i];
        }
    }
}
function saveUserColor(t){
    t.style.backgroundColor = selectedColorPicker.value;
    let raw = "";
    for(let j=1; j<3; j++){
        for(let i=1; i<8; i++){
            let currentCell = document.getElementById(`UserColor${j}-${i}`);
            if (i!=7){
                raw = raw + currentCell.style.backgroundColor + "!";
            }
            else{
                raw = raw + currentCell.style.backgroundColor
            }
        }
        document.cookie = `UsC${j}=${raw}; path=/` //UsC1 - UserColorsRaw1
        raw = [];
    }

}

const Fragment = {
    canvasFragment: undefined,
    copy(){
        this.canvasFragment = ctx.getImageData(selectionBoxPoints[0][0], selectionBoxPoints[0][1], selectionBoxPoints[1][0]-selectionBoxPoints[0][0], selectionBoxPoints[1][1]-selectionBoxPoints[0][1]);
        tempCanvas.height = this.canvasFragment.height;
        tempCanvas.width = this.canvasFragment.width;
        tctx.putImageData(this.canvasFragment, 0, 0);
        tempCanvas.toBlob(function(blob){
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
        });
        this.canvasFragment = undefined;
    },
    async paste(){
        const clipboardContents = await navigator.clipboard.read();
        for (const item of clipboardContents) {
            const blob = await item.getType("image/png");
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = () => {
                const canvasRefreshLine = new Path2D();
                canvasRefreshLine.lineTo(0, 1);
                ctx.stroke(canvasRefreshLine);
                ctx.drawImage(img, 0, 0);
                clearPreviewCanvas();
                const selectionBox = new Path2D();
                selectionBox.rect(0, 0, img.width, img.height);
                pctx.strokeStyle = "rgba(0,0,75,0.7)"
                pctx.setLineDash([8, 5]);
                pctx.stroke(selectionBox);
                selectionBoxPoints = [[0, 0], [img.width, img.height]];
            }
        }
    },
    cut(){
        this.canvasFragment = ctx.getImageData(selectionBoxPoints[0][0], selectionBoxPoints[0][1], selectionBoxPoints[1][0]-selectionBoxPoints[0][0], selectionBoxPoints[1][1]-selectionBoxPoints[0][1]);
        tempCanvas.height = this.canvasFragment.height
        tempCanvas.width = this.canvasFragment.width
        tctx.putImageData(this.canvasFragment, 0, 0);
        tempCanvas.toBlob(function(blob){
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
        });
        this.canvasFragment = undefined;
        
        ctx.globalCompositeOperation = "destination-out";
        const clearRect = new Path2D();
        clearRect.rect(selectionBoxPoints[0][0], selectionBoxPoints[0][1], selectionBoxPoints[1][0]-selectionBoxPoints[0][0], selectionBoxPoints[1][1]-selectionBoxPoints[0][1]);
        ctx.fill(clearRect);
        clearPreviewCanvas();
    }
};


function changeActionButtonStatus(buttonId, status){
    const ELEMENTS_ARRAY = document.querySelectorAll(`.${buttonId}SvgElement`);
    const button = document.getElementById(`${buttonId}Button`);
    if (status == "on"){
        for(i=0; i<ELEMENTS_ARRAY.length; i++){
            ELEMENTS_ARRAY[i].style.fill = "#682375";
        }
        if (buttonId == "Undo"){
            button.onclick = function(){undoLastAction()};
        }
        else if (buttonId == "Redo"){
            button.onclick = function(){redoLastAction()};
        }
        else if (buttonId == "Copy"){
            button.onclick = function(){Fragment.copy()};
        }
        else if (buttonId == "Cut"){
            button.onclick = function(){Fragment.cut()};
        }

    }
    else if(status == "off"){
        for(i=0; i<ELEMENTS_ARRAY.length; i++){
            ELEMENTS_ARRAY[i].style.fill = "#9A949B";
        }
        button.onclick = undefined;
    }
}

function undoLastAction(){
    createCanvas(false);
    if (backgroundImage != null){
        console.log(1)
        ctx.drawImage(backgroundImage, 0, 0);
    }
    for(i=0; i<undoActionsList.length-1; i++){
        ctx.strokeStyle = undoActionPropertiesList[i][0];
        ctx.lineCap = undoActionPropertiesList[i][1];
        ctx.lineJoin = undoActionPropertiesList[i][2];
        ctx.lineWidth = undoActionPropertiesList[i][3];
        ctx.globalCompositeOperation = undoActionPropertiesList[i][4];
        let actionType = undoActionPropertiesList[i][5];
        let actionShape = undoActionPropertiesList[i][6];
        if (actionType == "PBr" || actionType == "Era"){
            ctx.beginPath();
            for(j=0; j<undoActionsList[i].length; j++){
                let cursorLocations = undoActionsList[i][j].split("; ");
                ctx.lineTo(cursorLocations[0], cursorLocations[1]);
                ctx.stroke();
            }
        }
        else if(actionType == "STo"){
            let undoShapePoints = undoActionsList[i];
            const shape = new Path2D();
            if (actionShape == "rectangle"){
                shape.rect(undoShapePoints[0][0], undoShapePoints[0][1], undoShapePoints[1][0]-undoShapePoints[0][0], undoShapePoints[1][1]-undoShapePoints[0][1]);
            }
            else if (actionShape == "circle"){
                let radius = undoActionPropertiesList[i][9];
                shape.arc(undoShapePoints[0][0], undoShapePoints[0][1], radius, 0, 2*Math.PI, false);
            }
            else if (actionShape == "line"){
                shape.moveTo(undoShapePoints[0][0], undoShapePoints[0][1]);
                shape.lineTo(undoShapePoints[1][0], undoShapePoints[1][1]);
            }
            else if (actionShape == "polygon"){
                shape.moveTo(undoShapePoints[0][0], undoShapePoints[0][1])
                for (let i=1; i<undoShapePoints.length; i++){
                    shape.lineTo(undoShapePoints[i][0], undoShapePoints[i][1]);
                    ctx.stroke(shape);
                }
                shape.closePath();
            }
            ctx.stroke(shape);
            if (undoActionPropertiesList[i][7] == true){
                ctx.fillStyle = undoActionPropertiesList[i][8];
                ctx.fill(shape);
            }
        }
        else if(actionType == "Sel"){
            canvasContainer.style.cursor = "crosshair";
            selectionBoxPoints = [];
            const clearRect = new Path2D();
            ctx.globalCompositeOperation = "destination-out";
            clearRect.rect(undoActionsList[i][2][0], undoActionsList[i][2][1], undoActionsList[i][2][2], undoActionsList[i][2][3])
            ctx.fill(clearRect);
            ctx.putImageData(undoActionsList[i][0], undoActionsList[i][1][0], undoActionsList[i][1][1]);
        }
    }
    redoActionList.push(undoActionsList.pop());
    const beforeUndoToolProperties = undoActionPropertiesList.pop();
    ctx.strokeStyle = beforeUndoToolProperties[0];
    ctx.lineCap = beforeUndoToolProperties[1];
    ctx.lineJoin = beforeUndoToolProperties[2];
    ctx.lineWidth = beforeUndoToolProperties[3];
    ctx.globalCompositeOperation = beforeUndoToolProperties[4];
    ctx.fillStyle = beforeUndoToolProperties[8];
    redoActionPropertiesList.push(beforeUndoToolProperties);
    if (undoActionsList.length == 0){
        changeActionButtonStatus("Undo", "off");
    }
    if (redoActionList.length != 0){
        changeActionButtonStatus("Redo", "on");
    }
}
function redoLastAction(){
    ctx.strokeStyle = redoActionPropertiesList[redoActionPropertiesList.length - 1][0];
    ctx.lineCap = redoActionPropertiesList[redoActionPropertiesList.length - 1][1];
    ctx.lineJoin = redoActionPropertiesList[redoActionPropertiesList.length - 1][2];
    ctx.lineWidth = redoActionPropertiesList[redoActionPropertiesList.length - 1][3];
    ctx.globalCompositeOperation = redoActionPropertiesList[redoActionPropertiesList.length - 1][4];
    let actionType = redoActionPropertiesList[redoActionPropertiesList.length - 1][5];
    let actionShape = redoActionPropertiesList[redoActionPropertiesList.length - 1][6];
    if (actionType == "PBr" || actionType == "Era"){
        ctx.beginPath();
        for(j=0; j<redoActionList[redoActionList.length - 1].length; j++){
            let cursorLocations = redoActionList[redoActionList.length - 1][j].split("; ");
            ctx.lineTo(cursorLocations[0], cursorLocations[1]);
            ctx.stroke();
        }
    }
    else if (actionType == "STo"){
        let redoShapePoints = redoActionList[redoActionList.length - 1];
            const shape = new Path2D();
            if (actionShape == "rectangle"){
                shape.rect(redoShapePoints[0][0], redoShapePoints[0][1], redoShapePoints[1][0]-redoShapePoints[0][0], redoShapePoints[1][1]-redoShapePoints[0][1]);
            }
            else if (actionShape == "circle"){
                let radius = redoActionPropertiesList[redoActionPropertiesList.length - 1][9];
                shape.arc(redoShapePoints[0][0], redoShapePoints[0][1], radius, 0, 2*Math.PI, false);
            }
            else if (actionShape == "line"){
                shape.moveTo(redoShapePoints[0][0], redoShapePoints[0][1]);
                shape.lineTo(redoShapePoints[1][0], redoShapePoints[1][1]);
            }
            else if (actionShape == "polygon"){
                shape.moveTo(redoShapePoints[0][0], redoShapePoints[0][1])
                for (let i=1; i<redoShapePoints.length; i++){
                    shape.lineTo(redoShapePoints[i][0], redoShapePoints[i][1]);
                    ctx.stroke(shape);
                }
                shape.closePath();
            }
            ctx.stroke(shape);
            if (redoActionPropertiesList[redoActionPropertiesList.length - 1][7] == true){
                ctx.fillStyle = redoActionPropertiesList[redoActionPropertiesList.length - 1][8];
                ctx.fill(shape);
            }
    }
    else if(actionType == "Sel"){
        canvasContainer.style.cursor = "crosshair";
        selectionBoxPoints = [];
        const clearRect = new Path2D();
        ctx.globalCompositeOperation = "destination-out";
        clearRect.rect(redoActionList[redoActionList.length - 1][2][0], redoActionList[redoActionList.length - 1][2][1], redoActionList[redoActionList.length - 1][2][2], redoActionList[redoActionList.length - 1][2][3])
        ctx.fill(clearRect);
        ctx.putImageData(redoActionList[redoActionList.length - 1][0], redoActionList[redoActionList.length - 1][1][0], redoActionList[redoActionList.length - 1][1][1]);
    }
    
    undoActionsList.push(redoActionList.pop());
    const beforeRedoToolProperties = redoActionPropertiesList.pop();
    ctx.strokeStyle = beforeRedoToolProperties[0];
    ctx.lineCap = beforeRedoToolProperties[1];
    ctx.lineJoin = beforeRedoToolProperties[2];
    ctx.lineWidth = beforeRedoToolProperties[3];
    ctx.globalCompositeOperation = beforeRedoToolProperties[4];
    ctx.fillStyle = beforeRedoToolProperties[8]
    undoActionPropertiesList.push(beforeRedoToolProperties);
    if (redoActionList.length == 0){
        changeActionButtonStatus("Redo", "off");
    }
    if (undoActionsList.length != 0){
        changeActionButtonStatus("Undo", "on");
    }
}

function keyUp(e) {
    switch (e.code){
        case "KeyB":
            document.getElementById("PBrButton").click();
            break;
        case "KeyE":
            document.getElementById("EraButton").click();
            break;
        case "KeyS":
            document.getElementById("SToButton").click();
            break;    
        case "KeyA":
            document.getElementById("SelButton").click();
            break;
        
        case "KeyZ":
            document.getElementById("UndoButton").click();
            break;
        case "KeyY":
            document.getElementById("RedoButton").click();
            break;
        case "KeyC":
            document.getElementById("CopyButton").click();
            break;
        case "KeyV":
            document.getElementById("PasteButton").click();
            break;
        case "KeyX":
            document.getElementById("CutButton").click();
            break;
        case "KeyT":
            selectedColorPicker.click();
            break;    
    }
    if (e.altKey){
        switch (e.code){
            case "KeyN":
                document.getElementById("NewFileButton").click();
                break;
            case "KeyO":
                document.getElementById("OpenFileButton").click();
                break;
            case "KeyI":
                document.getElementById("InsertFileButton").click();
                break;
            case "KeyS":
                document.getElementById("SaveAsButton").click();
                break;
        }
    }
    if (e.code.slice(0, 3) == "Dig"){
        let num = e.code.slice(e.code.length-1)
        if (num<8 && num>0){
            if (e.shiftKey && e.altKey){
                document.getElementById(`UserColor2-${num}`).click();
            }
            else if (e.altKey){
                document.getElementById(`UserColor1-${num}`).click();
            }
            else if (e.shiftKey){
                document.getElementById(`DefaultColor2-${num}`).click();
            }
            else{
                document.getElementById(`DefaultColor1-${num}`).click();
            }
        }
    }
}


function drawStroke(X,Y){
    ctx.lineTo(X, Y);
    ctx.stroke();
    lineList.push(`${X}; ${Y}`);
}
function resetPolygon(){
    shapePoints = [];
    polygon = new Path2D();
    clearPreviewCanvas();
}
function getCursorLocation(event){
    let rect = event.target.getBoundingClientRect();
    cursorX = Math.round(event.clientX - rect.left);
    cursorY = Math.round(event.clientY - rect.top);
    cursorLocationInput.value = `${cursorX}, ${cursorY}`;
    if (isMouseDown == true){
        if (selectedTool == "PBr"){
            if (paintBrush.strokeQuality == "original"){
                drawStroke(cursorX, cursorY);
            }
            if (paintBrush.strokeQuality == "high"){
                if (cooldown == 1){
                    drawStroke(cursorX, cursorY);
                    cooldown = 0;
                }
                else{
                    cooldown++;
                }
            }
            if (paintBrush.strokeQuality == "medium"){
                if (cooldown == 3){
                    drawStroke(cursorX, cursorY);
                    cooldown = 0;
                }
                else{
                    cooldown++;
                }
            }
            if (paintBrush.strokeQuality == "low"){
                if (cooldown == 5){
                    drawStroke(cursorX, cursorY);
                    cooldown = 0;
                }
                else{
                    cooldown++;
                }
            }
        }
        if (selectedTool == "Era"){
            if (eraser.strokeQuality == "original"){
                drawStroke(cursorX, cursorY);
            }
            if (eraser.strokeQuality == "high"){
                if (cooldown == 1){
                    drawStroke(cursorX, cursorY);
                    cooldown = 0;
                }
                else{
                    cooldown++;
                }
            }
            if (eraser.strokeQuality == "medium"){
                if (cooldown == 3){
                    drawStroke(cursorX, cursorY);
                    cooldown = 0;
                }
                else{
                    cooldown++;
                }
            }
            if (eraser.strokeQuality == "low"){
                if (cooldown == 5){
                    drawStroke(cursorX, cursorY);
                    cooldown = 0;
                }
                else{
                    cooldown++;
                }
            }
        }
    }
    if ((selectedTool == "STo" && shapePoints.length == 1) || (selectedTool == "STo" && shapeTool.shape == "polygon" && shapePoints.length > 0 && shapePoints.length != document.getElementById("InputCorners").value)){
        let shape = new Path2D();
        if (shapeTool.shape == "rectangle"){
            clearPreviewCanvas();
            shape.rect(shapePoints[0][0], shapePoints[0][1], cursorX-shapePoints[0][0], cursorY-shapePoints[0][1]);
        }
        else if (shapeTool.shape == "circle"){
            clearPreviewCanvas();
            shape.arc(shapePoints[0][0], shapePoints[0][1], Math.abs(pythagoras(Math.abs(shapePoints[0][0]-cursorX), Math.abs(shapePoints[0][1]-cursorY))), 0, 2*Math.PI);
        }
        else if (shapeTool.shape == "line"){
            clearPreviewCanvas();
            shape.moveTo(shapePoints[0][0],shapePoints[0][1])
            shape.lineTo(cursorX, cursorY)
        }
        else if (shapeTool.shape == "polygon"){
            clearPreviewCanvas();
            shape.moveTo(shapePoints[shapePoints.length - 1][0],shapePoints[shapePoints.length - 1][1])
            shape.lineTo(cursorX, cursorY)
        }
        pctx.setLineDash([]);
        pctx.strokeStyle = "rgba(0,0,0,0.7)"
        pctx.stroke(shape);
    }
    if (selectedTool == "Sel" && selectionBoxPoints.length == 1){
        clearPreviewCanvas();
        const selectionBox = new Path2D();
        selectionBox.rect(selectionBoxPoints[0][0], selectionBoxPoints[0][1], cursorX-selectionBoxPoints[0][0], cursorY-selectionBoxPoints[0][1])
        pctx.strokeStyle = "rgba(0,0,75,0.7)"
        pctx.setLineDash([8, 5]);
        pctx.stroke(selectionBox);
    }
    if (selectedTool == "Sel" && selectionBoxPoints.length == 2 && isMovingFragment == false){
        let greaterCoordinates = [];
        let lesserCoordinates = [];
        if (Number(selectionBoxPoints[0][0])>Number(selectionBoxPoints[1][0])){
            greaterCoordinates.push(selectionBoxPoints[0][0]);
            lesserCoordinates.push(selectionBoxPoints[1][0])
        }
        else{
            greaterCoordinates.push(selectionBoxPoints[1][0]);
            lesserCoordinates.push(selectionBoxPoints[0][0])
        }
        if (Number(selectionBoxPoints[0][1])>Number(selectionBoxPoints[1][1])){
            greaterCoordinates.push(selectionBoxPoints[0][1]);
            lesserCoordinates.push(selectionBoxPoints[1][1])
        }
        else{
            greaterCoordinates.push(selectionBoxPoints[1][1]);
            lesserCoordinates.push(selectionBoxPoints[0][1])
        }
        //console.log(`(${cursorX}>${lesserCoordinates[0]} && ${cursorX}<${greaterCoordinates[0]}) && (${cursorY}>${lesserCoordinates[1]} && ${cursorY}<${greaterCoordinates[1]}) ${(cursorX>lesserCoordinates[0] && cursorX<greaterCoordinates[0]) && (cursorY>lesserCoordinates[1] && cursorY<greaterCoordinates[1])}`);
        if ((cursorX>lesserCoordinates[0] && cursorX<greaterCoordinates[0]) && (cursorY>lesserCoordinates[1] && cursorY<greaterCoordinates[1])){
            canvasContainer.style.cursor = "grab";
        }
        else{
            canvasContainer.style.cursor = "crosshair";
        }
    }
    if (isMouseDown == true && canvasContainer.style.cursor == "grab" && selectedTool == "Sel"){
        isMovingFragment = true;
    }
    if (isMovingFragment == true && isMouseDown == true && movedCanvasFragment != undefined){
        clearPreviewCanvas();
        //console.log(movedCanvasFragment)
        pctx.putImageData(movedCanvasFragment, cursorX-distanceXY[0], cursorY-distanceXY[1]);
    }
    if(isMovingFragment == true && isMouseDown == false && movedCanvasFragment != undefined){
        isMovingFragment = false;
        clearPreviewCanvas();
        ctx.putImageData(movedCanvasFragment, cursorX-distanceXY[0], cursorY-distanceXY[1]);

        undoActionsList.push([movedCanvasFragment, [cursorX-distanceXY[0], cursorY-distanceXY[1]], [selectionBoxPoints[0][0], selectionBoxPoints[0][1], selectionBoxPoints[1][0]-selectionBoxPoints[0][0], selectionBoxPoints[1][1]-selectionBoxPoints[0][1]]]);
        let lastActionProperties = [ctx.strokeStyle, ctx.lineCap, ctx.lineJoin, ctx.lineWidth, ctx.globalCompositeOperation, selectedTool, shapeTool.shape, shapeTool.fillShape, shapeTool.shapeFillColor, lastRadius];
        undoActionPropertiesList.push(lastActionProperties);
        movedCanvasFragment = undefined;

        const selectionBox = new Path2D();
        selectionBox.rect(cursorX-distanceXY[0], cursorY-distanceXY[1], selectionBoxPoints[1][0]-selectionBoxPoints[0][0], selectionBoxPoints[1][1]-selectionBoxPoints[0][1])
        pctx.strokeStyle = "rgba(0,0,75,0.7)"
        pctx.setLineDash([8, 5]);
        pctx.stroke(selectionBox);

        selectionBoxPoints = [[cursorX-distanceXY[0], cursorY-distanceXY[1]], [(cursorX-distanceXY[0])+(selectionBoxPoints[1][0]-selectionBoxPoints[0][0]), (cursorY-distanceXY[1])+(selectionBoxPoints[1][1]-selectionBoxPoints[0][1])]];
        distanceXY = [];
        changeActionButtonStatus("Undo", "on");
    }
}
function mouseDown(){
    isMouseDown = true;
    if (selectedTool == "PBr" || selectedTool == "Era"){
        ctx.beginPath();
    }
    let cursorAxises = cursorLocationInput.value.split(", ");
    if (selectedTool == "STo"){
        if (shapeTool.shape == "rectangle" || shapeTool.shape == "circle" || shapeTool.shape == "line"){
            if (shapePoints.length != 1){
                shapePoints.push(cursorAxises);
            }
            else{
                shapePoints.push(cursorAxises);
                const shape = new Path2D();
                if (shapeTool.shape == "rectangle"){
                    shape.rect(shapePoints[0][0], shapePoints[0][1], shapePoints[1][0]-shapePoints[0][0], shapePoints[1][1]-shapePoints[0][1]);
                }
                else if (shapeTool.shape == "circle"){
                    let radius = pythagoras(Math.abs(shapePoints[0][0]-shapePoints[1][0]), Math.abs(shapePoints[0][1]-shapePoints[1][1]));
                    lastRadius = radius;
                    console.log(radius);
                    shape.arc(shapePoints[0][0], shapePoints[0][1], Math.abs(radius), 0, 2*Math.PI, false);  
                }
                else if (shapeTool.shape == "line"){
                    shape.moveTo(shapePoints[0][0],shapePoints[0][1]);
                    shape.lineTo(shapePoints[1][0],shapePoints[1][1]);
                }
                
                ctx.stroke(shape);
                if (shapeTool.fillShape == true){
                    ctx.fillStyle = shapeTool.shapeFillColor;
                    ctx.fill(shape);
                }
                clearPreviewCanvas();
            }
        }
        else if(shapeTool.shape == "polygon"){
            let corners = document.getElementById("InputCorners").value;
            if (shapePoints.length == 0){
                shapePoints.push(cursorAxises);
                //ctx.beginPath();
                polygon.moveTo(cursorAxises[0], cursorAxises[1]);
            }
            else if(shapePoints.length != 0 && shapePoints.length != corners-1){
                shapePoints.push(cursorAxises);
                polygon.lineTo(cursorAxises[0], cursorAxises[1]);
                ctx.stroke(polygon);
            }
            else if (shapePoints.length == corners-1){
                polygon.lineTo(cursorAxises[0], cursorAxises[1]);
                polygon.closePath();
                ctx.stroke(polygon)
                if (shapeTool.fillShape == true){
                    ctx.fillStyle = shapeTool.shapeFillColor;
                    ctx.fill(polygon);
                }
                shapePoints.push(cursorAxises);
                polygon = new Path2D();
            }
        }
    }
    if (selectedTool == "Sel" && canvasContainer.style.cursor != "grab"){
        if (selectionBoxPoints.length != 1){
            selectionBoxPoints = [];
            selectionBoxPoints.push(cursorAxises);
            changeActionButtonStatus("Copy", "off")
            changeActionButtonStatus("Cut", "off")
        }
        else{
            selectionBoxPoints.push(cursorAxises);
            const selectionBox = new Path2D();
            selectionBox.rect(selectionBoxPoints[0][0], selectionBoxPoints[0][1], selectionBoxPoints[1][0]-selectionBoxPoints[0][0], selectionBoxPoints[1][1]-selectionBoxPoints[0][1])
            pctx.strokeStyle = "rgba(0,0,75,0.8)"
            pctx.setLineDash([8, 5]);
            pctx.stroke(selectionBox);
            changeActionButtonStatus("Copy", "on")
            changeActionButtonStatus("Cut", "on")
        }
    }
    if (selectedTool == "Sel" && canvasContainer.style.cursor == "grab"){
        movedCanvasFragment = ctx.getImageData(selectionBoxPoints[0][0], selectionBoxPoints[0][1], selectionBoxPoints[1][0]-selectionBoxPoints[0][0], selectionBoxPoints[1][1]-selectionBoxPoints[0][1]);
        ctx.globalCompositeOperation = "destination-out";
        const eraseRect = new Path2D();
        eraseRect.rect(selectionBoxPoints[0][0], selectionBoxPoints[0][1], selectionBoxPoints[1][0]-selectionBoxPoints[0][0], selectionBoxPoints[1][1]-selectionBoxPoints[0][1]);
        distanceXY[0] = cursorX-selectionBoxPoints[0][0];
        distanceXY[1] = cursorY-selectionBoxPoints[0][1];
        ctx.fill(eraseRect);
    }
}
function mouseUp(){
    if (isMouseDown == true){
        if (selectedTool != null && canvas.height > 0){  
            if (lineList.length != 0 || (selectedTool == "STo" && shapePoints.length == 2 && shapeTool.shape != "polygon") || (selectedTool == "STo" && shapeTool.shape == "polygon" && shapePoints.length == Number(document.getElementById("InputCorners").value))){
                if (selectedTool == "PBr" || selectedTool == "Era"){
                    undoActionsList.push(lineList);
                    lineList = [];
                    console.log("Action saved");
                }
                else if(selectedTool == "STo"){
                    undoActionsList.push(shapePoints);
                    console.log("Action saved");
                    shapePoints = [];
                    clearPreviewCanvas();
                }
                changeActionButtonStatus("Undo", "on");
                redoActionList = []
                redoActionPropertiesList = [];
                changeActionButtonStatus("Redo", "off");
                let lastActionProperties = [ctx.strokeStyle, ctx.lineCap, ctx.lineJoin, ctx.lineWidth, ctx.globalCompositeOperation, selectedTool, shapeTool.shape, shapeTool.fillShape, shapeTool.shapeFillColor, lastRadius];
                undoActionPropertiesList.push(lastActionProperties);
                console.log("Tool properties saved");
            }
        }
    }
    isMouseDown = false;
}

document.addEventListener('contextmenu', event => {
    event.preventDefault();
});
addEventListener("paste", (event) => {document.getElementById("PasteButton").click();});
document.addEventListener('keyup', keyUp, false);
tippy('[data-tippy-content]',{
    delay: [400, 100],
    animation: 'shift-toward',
    allowHTML: true,
});
loadUserColors();