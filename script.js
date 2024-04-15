let selectedTool = null;
let paintBrushStroke = 12;
function selectTool(t){
    if (selectedTool === null){
        document.getElementById("ToolPreferencesBox").style.opacity = 1;
        document.getElementById("ToolPreferencesBox").style.transform = "scale(1)";
    }
    else{
        reverseButtonColor();
    }
    selectedTool = t.id.slice(0,3);
    changeButtonColor(t);
    if(selectedTool == "PBr"){
        document.getElementById("ToolPreferencesFieldset").innerHTML = `<legend>Tool Settings</legend> <div> <label>Selected width: </label><br> <input id="PBrStrokeSlider" type="range" min="1" max="72" value="${paintBrushStroke}" oninput="changeStrokeSlider(this)"> <input id="PBrStrokeValue" type="number" min="1" max="72" value="${paintBrushStroke}" onchange="changeStrokeNumber(this)"><br> </div> <div> <label>Selected brush type: </label><br> <select id="SelectBrushType"> <option value="">Square</option> </select> </div>`;
    }
}

function changeStrokeSlider(t){
    document.getElementById(`${selectedTool}StrokeValue`).value = t.value;
    if (selectedTool == "PBr"){
        paintBrushStroke = t.value
    }
}
function changeStrokeNumber(t){
    document.getElementById(`${selectedTool}StrokeSlider`).value = t.value;
    if (selectedTool == "PBr"){
        paintBrushStroke = t.value
    }
}
function changeButtonColor(t){
    const ELEMENTS_ARRAY = document.querySelectorAll(`.${t.id.slice(0,3)}SvgElement`);
    for(i=0; i<ELEMENTS_ARRAY.length; i++){
        console.log(ELEMENTS_ARRAY)
        ELEMENTS_ARRAY[i].style.fill = "#682375";
    }
}
function reverseButtonColor(){
    const ELEMENTS_ARRAY = document.querySelectorAll(`.${selectedTool}SvgElement`);
    for(i=0; i<ELEMENTS_ARRAY.length; i++){
        console.log(ELEMENTS_ARRAY)
        ELEMENTS_ARRAY[i].style.fill = "#9A949B";
    }
}
