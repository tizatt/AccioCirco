/*
 *  Copyright (c) 2016 by The Translational Genomics Research
 *  Institute. All rights reserved. This License is limited to, and you may
 *  use the Software solely for, your own internal and non-commercial use
 *  for academic and research purposes. Without limiting the foregoing, you
 *  may not use the Software as part of, or in any way in connection with
 *  the production, marketing, sale or support of any commercial product or
 *  service or for any governmental purposes. For commercial or governmental
 *  use, please contact dcraig@tgen.org. By installing this Software you are
 *  agreeing to the terms of the LICENSE file distributed with this
 *  software.
 *           
*/

//<![CDATA[
var original_copy = {};
var currentFile = false;
var defaultJson = {};
var color = d3.scale.category20c().domain(d3.range(0,20));
var color2 = d3.scale.ordinal().range(["red", "blue", "green"]);
var block;
var svg;
var radius;
var arc;
var outer4;
var width = 1024;
var height = 1024;

// Arrays that store positional attributes about the layers
var heatmapVals = new Array();
var heatmapTextVals = new Array();
var valTextArray = [];
var labelAttributes = new Array();
var thresholdList = new Array();


/*
  Various methods for settings of the circos
*/

$(function(){
  
  $(".chzn-select").chosen();
  $( "#nav" ).resizable();
  $("#drugs").hide();   
  $("#amount").val( 0 );
  $( "#addLayerForm").accordion({
      heightStyle: "content",
      active : false,
      collapsible : true
  });

    $( "#addALabelForm").accordion({
      heightStyle: "content",
      active : false,
      collapsible : true
  });

  $( "#addThresholdForm").accordion({
      heightStyle: "content",
      active : false,
      collapsible : true
  })



});



$('.chosen-select').css({"width": "150px"})
$('.chosen-drop').css({"width": "150px"});

// JS tree instance jstree
$(function () { 
  
});

$('#jstree_demo_div').on("changed.jstree", function (e, data) {
  console.log(data.selected);
});





/*
  User generates the circos from here.
*/

$("#csv_init").click(function() {

  block = JSON.parse( $("#csv_input").val() );
  block.settings.matchDrugs = true;
  doD3(block);

});
    








function updateCircFromDB () {
   block = JSON.parse( $("#csv_input").val() );
   block.settings.matchDrugs = true;
   
   doD3(block);
}





/* 
  Controls the Labels in the Data section.  1st function handle sorting them 
*/
 $("#search").keyup(function(){
        _this = this;
        // Show only matching TR, hide rest of them
        $.each($("#labelList").find("li"), function() {
            var value = $(this).find(".labels").val();
            if(value.toLowerCase().indexOf(_this.value.toLowerCase()) == -1)
               $(this).hide();
            else
                 $(this).show();                
        });
  }); 





// Reads in a json file and updates the app accordingly

function loadJson(file) {
    file = document.getElementById("jsonFile").files[0];


  if (file) {
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");    
    reader.onload = function (evt) {
      var contents = evt.target.result;
      var sel = document.getElementById('csv_input');
      sel.innerHTML = contents;
      block = JSON.parse( contents );
      doD3(block);
    }
  }  			
}







function receivedText(e) {
	lines = e.target.result;
	var newArr = JSON.parse(line);
}





function saveTextAsFile()
{
  var textToWrite = document.getElementById("csv_input").value;
  var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
  var fileNameToSaveAs = document.getElementById("inputFileNameToSaveAs").value;
  fileNameToSaveAs = fileNameToSaveAs+".json";
  var downloadLink = document.createElement("a");
  downloadLink.download = fileNameToSaveAs;
  downloadLink.innerHTML = "Download File";
  if (window.webkitURL != null)
  {
    // Chrome allows the link to be clicked
    // without actually adding it to the DOM.
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
  }
  else
  {
    // Firefox requires the link to be added to the DOM
    // before it can be clicked.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
  }

  downloadLink.click();
}




function angle(d) {
      var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
      //return a;
      return a > 90 ? a - 180 : a;
}

function dragAngle(d) {
      var a = (d.startAngle + d.endAngle) * 90 / Math.PI;
      return (a > 90 || a < -90) ? a - 180 : a;
      //return a;
}



// findSize
function findSize(content){
  if(content[0].start || content[0].start===0 ){
    if(content[0].start<1){
      content[0].start=1;

    }
    var s = [];
    var count = 0;
      for(i in content){
        var item = content[i];
        
        var position = parseInt(i) * 2;
        if(i==0){
          s.push({"s":item.start-1, "r":false});
          var test = s.push({"s":item.end-item.start, "r":true, "i":item,"position":position});      
        }
        else if (i>0 && i<content.length-1){
          s.push({"s":item.start-content[i-1].end, "r":false});
          s.push({"s":item.end-item.start, "r":true, "i":item,"position":position});
        }
        else if ( i == content.length-1 ) {

          s.push({"s":item.start-content[i-1].end, "r":false});
          s.push({"s":item.end-item.start, "r":true, "i":item,"position":position});
          s.push({"s":360-item.end, "r":false});
        }
      }




      for( i in s ){
        if (s[i].s === 0){
          s.splice(i,1);
        }
      }
    return s;
    }
    else{
    var set = [];

    for (item in content){
      set.push(content[item].size);
    }

    return set;
    }
}




function thresholdType(tt){

  $("#newThresholdFields").empty();
  var fieldEl = document.getElementById("newThresholdFields");
  var type = tt.options[tt.selectedIndex].text;
  
  if (type == "Slider (range)"){
    document.getElementById( 'thresholdRangeOptions' ).style.display = 'block';
    document.getElementById( 'thresholdCheckboxOptions').style.display = 'none';

    for ( i in labelAttributes){
      if (labelAttributes[i].type == "number"){
        var option = document.createElement('option');
        option.innerHTML = labelAttributes[i].attr;
        fieldEl.appendChild(option);
      }
    }

  }
  else if (type == "Checkbox (boolean)"){
    document.getElementById( 'thresholdRangeOptions' ).style.display = 'none';
    document.getElementById( 'thresholdCheckboxOptions').style.display = 'block';
    for ( i in labelAttributes){
      if (labelAttributes[i].type == "boolean"){
        var option = document.createElement('option');
        option.innerHTML = labelAttributes[i].attr;
        fieldEl.appendChild(option);
      }
    }
  }





}




function addNewThreshold() {
  var nan = NaN;
  $("#newThresholdError").html("");
  filters = {};
  filters.name = $("#newThresholdName").val();
  filters.type = $("#newThresholdType").val();
  filters.field = $("#newThresholdFields").val();
  filters.value = parseInt($("#newThresholdValue").val());
  filters.min = parseInt($("#newThresholdMinValue").val());
  filters.max = parseInt($("#newThresholdMaxValue").val());
  filters.step = parseInt($("#newThresholdStepValue").val());

  filters.checkboxVal = document.querySelector('input[name = "checkboxVal"]:checked').value;
  
 
/*
  Error checking for the Threshold values
*/

  if (filters.type == "range"){
    filters = checkThresholdErrors(filters);
    if (filters == undefined){
      return;
    }
  }

  /*
    Get info for the id to use, the parent element where the threshold elements will go
  */

  div = document.getElementById("thresholds");

  layerIndex = -1;
  //filter, parentElement, baseId
  for (i in block.layers.content){
    if (block.layers.content[i].type == "labelsLayer"){
      layerIndex = i; 
    }
  }

  var layerName = block.layers.content[i].layer;
  var baseId = layerIndex+"-"+layerName;

  /*
    Update the json accordingly
  */
  if (block.layers.content[layerIndex].filters != undefined){
    block.layers.content[layerIndex].filters.push(filters);
  }
  else{
    block.layers.content[layerIndex].filters = [];
    block.layers.content[layerIndex].filters.push(filters);
  }
  refreshInput();

  var filterIndex = block.layers.content[layerIndex].filters.length - 1;


  if (filters.type == "range"){
    createSliderFilterElement(filters, div, baseId+"-"+filterIndex);
  }
  else if (filters.type == "checkbox"){
    createCheckboxFilterElement(filters, div, baseId+"-"+filterIndex);
  }

  $("#newThresholdName").val('');
  $("#newThresholdFields").val('');
  $("#newThresholdValue").val('');
  $("#newThresholdMinValue").val('');
  $("#newThresholdMaxValue").val('');
  $("#newThresholdStepValue").val('');
  $("#addThresholdForm").accordion({active : false});
}




function checkThresholdErrors(filters){

  if (filters.name == undefined || filters.name == ""){
    console.log("Error");
    $("#newThresholdError").html("* Must type a name for the threshold.");
    return;
  }
  if (filters.field == undefined || filters.field == ""){
    $("#newThresholdError").html("* Must select a field type.");
    return;
  }
  if (filters.min == undefined || filters.min == "" || isNaN(filters.min)){
    filters.min = 0;
  }
  if (filters.value = undefined || filters.value == "" || isNaN(filters.value)){
    filters.value = filters.min;
  }
  if (filters.max == undefined || filters.max == "" || isNaN(filters.max)){
    console.log("can't find the max");
    $("#newThresholdError").html("* Must set a \"max\" value.");
    return;
  }
  if (filters.max <= filters.min ){
    $("#newThresholdError").html("* The \"max\" must be greater than \"min\"");
    return;
  }
  if (filters.step == undefined || filters.step == "" || isNaN(filters.step)){
    filters.step = 1;
  }

  return filters;
}

/*
  Add a layer 
*/

function addNewLayer() {
  // 1. Layer Name
  // 2. Have a drop down list that contains the data ids to choose for this layer
  // 3. type - heatmap, heatmapTextLayer
  // 4. placement
  // 5. width
  // 6. opacity
  
  $("#newLayerError").html("");
  var layerName = $("#newLayerName").val();
  var dataId = $("#newLayerData").val();
  var type = $("#newLayerType").val();
  var placement = parseInt($("#newLayerPlacement").val());
  var width = parseInt($("#newLayerWidth").val());
  var opacity = parseFloat($("#newLayerOpacity").val());
  

  // Error Checking
  if (layerName == undefined || layerName == "" || layerName.length <= 0 ){
    $("#newLayerError").html("* Must enter a Name for the layer");
    return;
  }
  if (type == undefined || type.length <= 0){
    $("#newLayerError").html("* Please select a type of data for this layer");
    return;
  }
  if (dataId == undefined || dataId == ""){
    $("#newLayerError").html("* Must select data to load.  If dropdown is empty then go back to the Load tab to select data");
    return;
  }
  if (placement == undefined || placement == "" || placement < 0 || placement > 440){
    $("#newLayerError").html("* Placement must be between 0 - 440");
    return;
  }
  if (opacity == undefined || opacity == "" || opacity < 0 || opacity > 1){
    $("#newLayerError").html("* Opacity must be between 0 - 1");
    return;
  }
  if (width == undefined || width == "" || width < 0 || width > 114){
    $("#newLayerError").html("* Width must be between 0 - 114");
    return;
  }

  // Find the data object
  var dataContent, layerObj, index = 0, layerIndex;
  for (i in block.data.content){
    if (dataId == block.data.content[i].dataId){
      index = i;
    }
  }
  
  block.layers.content.push({"layer":layerName, "dataId":dataId, "type":type, "placement":placement, "width":width, "opacity":opacity});
  refreshInput();
  layerIndex = block.layers.content.length - 1;
  //Set some of the svg variables
  
  dataContent = block.data.content[index].dataContent;
  layerObj = block.layers.content[layerIndex];

  padAngle = 0;
  if(block.settings.padAngle && block.settings.padAngle!=0.00)
    padAngle=block.settings.padAngle;

  var pie = d3.layout.pie()
      .sort(null)
      .padAngle(padAngle);
          
  
  if (type == "heatmapLayer"){ 
    heatmapLayer( dataContent, svg, pie, placement, width, opacity, layerObj, radius, index );
  }
  else if (type == "linkLayer") {
    linkLayer( dataObj.dataContent, svg, pie, radius, arcLayer3, placement, layerObj, index );
  }
  else if (type == "heatmapTextLayer") {    
    heatmapTextLayer( dataObj.dataContent, svg, pie, radius, arc, labelLayer1r, placement, width, opacity, layerObj, index );
  }
  else {
    $("#newLayerError").val("The type was not found");
  }

  $("#newLayerName").val('');
  $("#newLayerData").val('');
  $("#newLayerPlacement").val('');
  $("#newLayerWidth").val('');
  $("#newLayerOpacity").val('');
  $("#accordion").accordion("refresh");
  $("#addLayerForm").accordion({active : false});
       
}


/*
  Part of adding a new layer - this chooses the data content to select based on the layer chosen.
*/

function displayDataId(nl){
  $("#newLayerData").empty();
  var type = nl.options[nl.selectedIndex].text;
  var dataEl = document.getElementById("newLayerData");
 
  var selectEl = [];

  if (block == undefined || block.data == undefined || block.data.content == undefined){
    $("#newLayerError").html("* There is no data loaded.  Please load data from the \"Load\" tab");
    return;
  }
  for (i in block.data.content){
    var dataId = block.data.content[i].dataId;
    selectEl.push(dataId);
  }

  for (i in selectEl){
    var option = document.createElement('option');
    option.innerHTML = selectEl[i];
    dataEl.appendChild(option);
  }

}








/*
  Modifies color of label text
*/
function clickColor(ce, value){
  
  var pos = ce.id.split("-")[1];
  var dataPos = ce.id.split("-")[2];
  block.data.content[dataPos].dataContent[pos].textColor = value;
  

  var selector = "#tl-"+pos+"-"+dataPos;
  d3.select(selector).attr("fill",value);
  refreshInput();

}




/*
  Controls the Labels colorpicker that changes all the labels to one color.  
*/


function changeLabelColors (cp) {

  var id = cp.className;
  var color = cp.value;
  d3.selectAll(".label").attr("fill",color);
  $(".colorpicker").val(color);


  for (var i = 0; i < block.data.content[id].dataContent.length; i++){
    block.data.content[id].dataContent[i].textColor = color;
  } 
  
  refreshInput();

}




function displayAllLabels (dl){
  
  var id = dl.className;
  var filter = "displayLabel"

  if (dl.checked){
  
     d3.selectAll(".label, .labelLine").filter(function(){    
      var passFilter = true;

      $(this).attr('class', function(index, classNames) { // remove this filter since it no longer applies
          return classNames.replace("filter-"+filter, '');
      }); 

      if ($(this).attr("class").indexOf("filter-") > -1){  // If another filter has been applied already then don't make visible
        passFilter = false;
      }
      else{
        var id = $(this).attr("id");
        var position = parseInt(id.split("-")[1]);
        var index = parseInt(id.split("-")[2]);
        $("#cb-"+position+"-"+index).prop("checked", true);
        block.data.content[index].dataContent[position].displayLabel = true;
      } 
      return passFilter;
    })
    .style("visibility", "visible");

    d3.selectAll(".labelLineGroup").style("visibility", "visible");

  
  }
  else {

     d3.selectAll(".label, .labelLine").filter(function(){    
               
       // hide the element, uncheck the checkbox in the label display
        $(this).attr('class', function(index, classNames) {

            if (classNames.indexOf("filter-"+filter) == -1){

              var position = $(this).attr("id").split("-")[1];
              var index = $(this).attr("id").split("-")[2];
              $("#cb-"+position+"-"+index).prop("checked", false); 
              block.data.content[index].dataContent[position].displayLabel = false;
              return classNames + " filter-"+filter;
            }
            else{
              return classNames;
            }
        });  
    
      return true;
    })
      .style("visibility", "hidden");

      d3.selectAll(".labelLineGroup").style("visibility", "hidden");
  }

  refreshInput();

}




function clickCheckBox (ce, s){

  var pos = ce.id.split("-")[1];
  var dataPos = ce.id.split("-")[2];
  block.data.content[dataPos].dataContent[pos].displayLabel = ce.checked;
  //block.layer4.content[pos].displayLabel = ce.checked;
  
  var selector = "#tl-"+pos+"-"+dataPos;
  var lineSelector = "#tll-"+pos+"-"+dataPos;
  var className = $(selector).attr("class");
  var search = /.*group(\d+)/;
  var group = className.match(search);
  var groupNum = "-1";
  if(group != null && group.length > 0 ){
    groupNum = group[1];
  }
  var groupSelector = "#tllg-"+groupNum;

  if ( ce.checked){
    d3.select(selector).style("visibility","visible");
    d3.select(lineSelector).style("visibility","visible");

  }
  else{
    d3.select(selector).style("visibility","hidden");
    d3.select(lineSelector).style("visibility","hidden");
  }
  // Determine if group line should be removed
  var groupVisible = false;
  d3.selectAll(".group"+groupNum).each(function(d,i){
      var visible = d3.select(this).style("visibility");
      if (visible == "visible"){
        groupVisible = true;
      }
  });

  if (groupVisible){
    d3.select(groupSelector).style("visibility","visible");
  }
  else{
    d3.select(groupSelector).style("visibility","hidden");
  }
  refreshInput();
}






function changeFont (tf, value){

  var pos = tf.id.split("-")[1];
  var dataPos = tf.id.split("-")[2];
  value = tf.value.match(/\d*\.?\d+/);
  if (block.data.content[dataPos].dataContent[pos] == undefined){
    block.data.content[dataPos].dataContent.push({"start":1, "end": 1.1, "elementFontSize" : value+"px"});
  }
  else{
    block.data.content[dataPos].dataContent[pos].elementFontSize = value+"px";
  }//block.layer4.content[pos].elementFontSize = value+"px";
  var selector = "#tl-"+pos+"-"+dataPos;
  d3.select(selector).style("font-size", value+"px");
  refreshInput();

}



/*
  Label functions
*/



function changeAllLabelTextSize( lt) {
  var dataPos = lt.className;

  d3.selectAll(".label").style("font-size", lt.value+"px");
  $(".fontSizeLabels").attr("placeholder", lt.value);
  for (var i = 0; i < block.data.content[dataPos].dataContent.length; i++){
    block.data.content[dataPos].dataContent[i].elementFontSize = lt.value+"px";
  } 

  refreshInput();
  
}



function changeLabelContent(tf, value){

  var pos = tf.id.split("-")[1];
  var dataPos = tf.id.split("-")[2];

  if (block.data.content[dataPos].dataContent[pos] != undefined){
    block.data.content[dataPos].dataContent[pos].text[0].val = tf.value;
  }
  else{
    block.data.content[dataPos].dataContent.push({"start":1, "end": 1.1, "text":[{"val": tf.value, "offset" : 0}]})
  }
  
  var selector = "#tl-"+pos+"-"+dataPos;
  d3.select(selector).text(tf.value);
  refreshInput();

}



function removeLabel(rl, value){
  var r = confirm("Are you sure you want to remove this label?");
  if (r == true) {
    var pos = rl.id.split("-")[1];
    var dataIndex = rl.id.split("-")[2];

    d3.select("#list-"+pos+"-"+dataIndex).remove();
    d3.select("#tl-"+pos+"-"+dataIndex).remove();
    d3.select("#tll-"+pos+"-"+dataIndex).remove();
    block.data.content[dataIndex].dataContent[pos] = "";
  }

}




function addNewLabel(){

  var labelName = document.getElementById("newLabelName");
  var labelNameValue = labelName.value;
  var pos = document.getElementById("newLabelPos");
  var chrPos = document.getElementById("newLabelChrPos").value;
  var radianPos;
  if (chrPos != undefined){
    radianPos = getLocation(chrPos);
  }
  console.log(radianPos);
  if (radianPos != undefined && !isNaN(radianPos)){
    pos.value = radianPos;
  }

  var start = parseInt(pos.value);
  var end = start + 0.1;
  var attr = document.getElementById("newLabelAttr");
  var le = $("#labelList li");
  var newlabelArrayPos = le.length;
  var newLabelIndex;
  $("#labelList li:first-child").find('input').each(function(){
    newLabelIndex = this.id.split("-")[2];
  })

  if (labelName != undefined && pos != undefined){
    if (newLabelIndex == undefined){
        console.log("can't add a label if no data is loaded");
    }
    else{
      block.data.content[newLabelIndex].dataContent.push({"start":start, "end":end , "text":[{"val": labelNameValue, "offset" : 0, "displayLabel": true}]});
      refreshInput();
      updateCircFromDB();
      document.getElementById("newLabelName").value = "";
      document.getElementById("newLabelPos").value = "";
      document.getElementById("newLabelAttr").value = "";
      document.getElementById("newLabelChrPos").value = "";
    }

  }

}





function updateLabels(val, labels, s) {

      var le = document.getElementById('labelList');


      val.sort(function (a, b) {
          return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
      });
      
      labels.sort(function (a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
      });
      

     
      for (lc in val){

          //#labelList
          var values = val[lc];
          var position = values.position;
          var textClass = values.textClass;
          var dataIndex = values.dataIndex;

          //Controls the checkbox display buttons
          var displayLabel = values.displayLabel;
          var fontSize = values.elementFontSize.replace("px","");
          var checkbox = document.createElement('input');
          
          checkbox.type = "checkbox";
          checkbox.name = dataIndex;
          
          checkbox.id = "cb-"+position+"-"+dataIndex;
          checkbox.className = textClass+" labelBox";
          checkbox.style.margin = "3px";
          checkbox.style.borderLeftWidth = "5px";
          checkbox.onclick = function(){clickCheckBox(this,s)};

          checkbox.style = "vertical-align: middle";
          
          // Adds the color picker to the table
          var colorPicker = document.createElement('input');
          colorPicker.type="color";
          colorPicker.id = "cp-"+position+"-"+dataIndex;
          
          var color = values.textColor;
          colorPicker.value = color;
          colorPicker.className = "colorpicker";
          colorPicker.style.width = "20px";
          colorPicker.style.margin = "3px";
          colorPicker.onchange = function(){clickColor(this, this.value, s)};

          // Adds the labels to the table
          var labelText = document.createElement("input");
          labelText.type = "text";
          labelText.style.width = "170px";
          labelText.style.margin = "3px";
          labelText.value = labels[lc];
          labelText.id = "lt-"+position+"-"+dataIndex;
          labelText.className = "labels";
          labelText.oninput = function(){changeLabelContent(this, this.value)};


          // Adds the font size selector to the table
          var fontSizeText = document.createElement("input");
          fontSizeText.type = "number";
          fontSizeText.id = "fst-"+position+"-"+dataIndex;
          fontSizeText.className="fontSizeLabels";
          fontSizeText.maxLength = "2";
          fontSizeText.size = 2;
          fontSizeText.placeholder = fontSize;
          fontSizeText.name = "fontSize";
          fontSizeText.style.width = "40px";
          fontSizeText.style.margin = "3px";

          fontSizeText.oninput = function(){changeFont(this, this.value)};

          var removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.id = "rb-"+position+"-"+dataIndex;
          removeButton.style.width = "5px";
          removeButton.style.height = "5px";
          removeButton.onclick = function(){removeLabel(this, this.value)};


          //Lists
          var list = document.createElement('li');
          list.id = "list-"+position+"-"+dataIndex;


          var colors = document.createElement('span');

          colors.appendChild(colorPicker);
          list.appendChild(checkbox);
          list.appendChild(colors);
          list.appendChild(labelText);
          list.appendChild(fontSizeText);
          le.appendChild(list);    
          
          document.getElementById("cb-"+position+"-"+dataIndex).checked = displayLabel; 
          
      }

}



/*
  Update the json which is displayed in the Copy/Paste Tab
*/

function refreshInput(){
     var sel = document.getElementById('csv_input');
     var layers = JSON.stringify(block, null, 4);
     sel.innerHTML = layers;
}


/*
  Threshold functions 
*/

function showLines(cb){
  if(cb.checked){
    outer4.selectAll("line").style("stroke-opacity", 1);
  }
  else{
    outer4.selectAll("line").style("stroke-opacity", 0);
  }
}




function showHover(cb){
  
  if(cb.checked){
    $("#tooltip").show();
  }
  else{
    $("#tooltip").hide();
  }
  $("#showHover").prop('checked');

}






/*
  Layer Functions
*/


function createAccordionLayerElement(layerObj, radius, layerIndex){
    
    var le = document.getElementById('accordion');
    var layerName = layerObj.layer.replace(" ","");

    var header = document.createElement('h3');
    header.id = layerIndex+"-"+layerName+"-header";
    header.innerHTML = layerObj.layer;
    
    div = document.createElement('div');
    div.id = layerIndex+"-"+layerObj.type+"-filters";

     
    le.appendChild(header);
    le.appendChild(div);

    
    var baseId = layerIndex+"-"+layerName;

    if (layerObj.placement != undefined){
          createSliderElement(layerObj.placement, 0, radius+100, 5, div, "placement", baseId);
    }
    if (layerObj.zoom != undefined){
          createSliderElement(layerObj.zoom, 0, 40, 1, div, "zoom", baseId);
    }
    if (layerObj.opacity != undefined){
          createSliderElement(layerObj.opacity, 0, 1, 0.1, div, "opacity", baseId);
    }
    if (layerObj.width != undefined){
          createSliderElement(layerObj.width, 0, radius/3, 1, div, "width", baseId);
    }
   

}





function createFilterElement(layerIndex){

    layerObj = block.layers.content[layerIndex];
    var layerName = layerObj.layer.replace(" ","");
    var baseId = layerIndex+"-"+layerName;
    div = document.getElementById("thresholds");
    
    for (i in layerObj.filters){
      filter = layerObj.filters[i];
      
      if (filter.type == "range"){
        createSliderFilterElement( filter, div, baseId+"-"+i );
      }
      else if (filter.type == "checkbox"){
        createCheckboxFilterElement ( filter, div, baseId+"-"+i );
      }
    
    } 

}





function createCheckboxFilterElement(filter, parentElement, baseId){

  var label = createLabelElement(filter.value, filter.name, "medium");
  var inputEl = { "id": baseId+"-"+filter.field+"-input-checkbox", "type":"checkbox", "border": 0, "width":"30px","color":"#ffffff","readonly":false};
  
  var input = createInputElement(inputEl);
  input.onclick = function(){thresholdCheckbox(this)};

  input.value = filter.field;
  input.style.margin.right = "3px";

  var div = document.createElement("div");
  div.id = baseId+"-"+filter.field+"-checkbox-div";
  var b = document.createElement("br");
  var b2 = document.createElement("br");
  var b3 = document.createElement("br");
  var b4 = document.createElement("br");

  div.appendChild(input);
  div.appendChild(label);
 

  parentElement.appendChild(div);
  parentElement.appendChild(b3);

  thresholdList.push({"field":filter.field,"value":value});
   
  if (filter.checkboxVal == "yes"){
    $("#"+baseId+"-"+filter.field+"-input-checkbox").prop("checked", true); 
  }
  else{
    $("#"+baseId+"-"+filter.field+"-input-checkbox").prop("checked", false);
  }
  var cbEl = document.getElementById(baseId+"-"+filter.field+"-input-checkbox");
  thresholdCheckbox(cbEl);
}




/*
  Controls a checkbox "threshold".  Labels with "false" for the specified "field" will be filtered (made hidden), those with "true" will stay visible.
*/

function thresholdCheckbox(cb){
  
   var field = cb.value;
   var layerIndex = cb.id.split("-")[0];
   var filterIndex = cb.id.split("-")[2];

   if (cb.checked){  
     // Checkbox is checked so make "hidden" the labels that are "false" for the specified "field" (i.e. label w/ attribute drug_rule=false will be hidden.)
     d3.selectAll(".label, .labelLine").filter( function(){

        var passFilter = false;
        if ($(this).data(field) == undefined || $(this).data(field) == "" || ! $(this).data(field)){
          
          passFilter = true;
          $(this).attr('class', function(index, classNames) {
              if (classNames.indexOf("filter-"+field) == -1){
                
                var id = $(this).attr("id");
                var position = parseInt(id.split("-")[1]);
                var index = parseInt(id.split("-")[2]);
                var filterPos = parseInt(id.split("-")[3]);
                $("#cb-"+position+"-"+index).prop("checked", false);


                return classNames + " filter-"+field;
              }
              else{
                return classNames;
              }
          });  
        }
        return passFilter;
      })
      .style("visibility", "hidden");

    }
   else{  
    // Checkbox is unchecked so all fields should be returned to visible, except those that have another filter applied
    d3.selectAll(".label, .labelLine").filter(function(){    
      var passFilter = true;

      $(this).attr('class', function(index, classNames) { // remove this filter since it no longer applies
          return classNames.replace("filter-"+field, '');
      }); 
      if ($(this).attr("class").indexOf("filter") > -1){  // If another filter has been applied already then don't make visible
        passFilter = false;
      }
      else{
        var id = $(this).attr("id");
        var position = parseInt(id.split("-")[1]);
        var index = parseInt(id.split("-")[2]);
        $("#cb-"+position+"-"+index).prop("checked", true);
      } 
      return passFilter;
    })
      .style("visibility", "visible");
   }

  
    block.layers.content[layerIndex].filters[filterIndex].checkboxVal = cb.checked;
    refreshInput();


}





function createSliderFilterElement(filter, parentElement, baseId){
   
    var label = createLabelElement(filter.value, filter.name, "medium");
    var inputEl = { "id": baseId+"-"+filter.field+"-input", "type":"text", "border": 0, "width":"40px","color":"#f6931f","readonly":true};
    var input = createInputElement(inputEl);
    
    var div = document.createElement("div");
    div.id = baseId+"-"+filter.field+"-slider";
    var b = document.createElement("br");
    var b2 = document.createElement("br");
    var b3 = document.createElement("br");
    var b4 = document.createElement("br");

    div.appendChild(b2);
    div.appendChild(label);
    div.appendChild(input);
    div.appendChild(b);

    parentElement.appendChild(div);
    parentElement.appendChild(b3);
    parentElement.appendChild(b4);

    if (filter.step == undefined){
      filter.step = 1;
    }
    thresholdList.push({"field":filter.field,"value":filter.value});


   $(function() {
        $( "#"+baseId+"-"+filter.field+"-slider" ).slider({
          value:filter.value,
          min: filter.min,
          max: filter.max,
          step: filter.step,  
          slide: function( event, ui ) {
            
              $( "#"+input.id ).val( ui.value );
              var inputArray = input.id.split("-");
              var pos = inputArray[0];
              var name = inputArray[1];
              var filterIndex = inputArray[2];
              var parameter = inputArray[3];
              
              thresholdSliderFilter(filter.field, ui.value);
              
              block.layers.content[pos].filters[filterIndex].value = ui.value;
              refreshInput();
          }
        });

     $( "#"+input.id ).val( $( "#"+baseId+"-"+filter.field+"-slider" ).slider( "value" ) );
    });

}



function thresholdSliderFilter( filterEl, val){
   
    console.log(filterEl);
    d3.selectAll(".label, .labelLine").filter( function(){
        var passFilter;
        if ($(this).data(filterEl) == undefined || $(this).data(filterEl) == ""){
          passFilter = false;
        } 
        else{
          passFilter = val >= $(this).data(filterEl);
        }

        if ( passFilter ){  // hide the element, uncheck the checkbox in the label display
          $(this).attr('class', function(index, classNames) {

              if (classNames.indexOf("filter-"+filterEl) == -1){
                var position = $(this).attr("id").split("-")[1];
                var index = $(this).attr("id").split("-")[2];
                $("#cb-"+position+"-"+index).prop("checked", false);

                return classNames + " filter-"+filterEl;
              }
              else{
                return classNames;
              }
          });  
        }
        return passFilter;
      })
      .style("visibility", "hidden");

      
      d3.selectAll(".label, .labelLine").filter(function(){ 
        var passFilter = val < $(this).data(filterEl);
        
        if (passFilter){
            $(this).attr('class', function(index, classNames) { // remove this filter since it no longer applies, check the label checkbox from the data section. 
                return classNames.replace("filter-"+filterEl, '');
            });
            
            if ($(this).attr("class").indexOf("filter") != -1){  // If another filter has been applied already then don't make visible
              passFilter = false;
            }
            else{  // The filter will be applied to this label, so make it visible and update it's properties accordingly
             var position = $(this).attr("id").split("-")[1];
             var index = $(this).attr("id").split("-")[2];
             $("#cb-"+position+"-"+index).prop('checked', true);
          }
        } 

        return passFilter;
      })
        .style("visibility", "visible");
}



function createLabelElement(value, name, fontSize){
      var label = document.createElement('label');
      label.setAttribute("for", value);
      label.style.fontSize = fontSize;
      label.innerHTML = name;
      return label;
}


function createInputElement(ie){
      var input = document.createElement("input");
      input.id = ie.id;
      input.type = ie.type;
      input.setAttribute("readonly", ie.readonly);
      input.style.border = ie.border;
      input.style.width = ie.width;
      input.style.color = ie.color;

      return input;
}


function createSliderElement(value, min, max, step, parentElement, filterType, baseId){
     
      var label = createLabelElement(value, filterType);
      var inputEl = { "id": baseId+"-"+filterType+"-input", "border": 0, "width":"40px","color":"#f6931f","readonly":true};
       var input = createInputElement(inputEl);
      var div = document.createElement("div");
      div.id = baseId+"-"+filterType+"-slider";
      var b = document.createElement("br");
      var b2 = document.createElement("br");
      var b3 = document.createElement("br");
      var b4 = document.createElement("br");

      div.appendChild(b2);
      div.appendChild(label);
      div.appendChild(input);
      div.appendChild(b);

      parentElement.appendChild(div);
      parentElement.appendChild(b3);
      parentElement.appendChild(b4);
      

      $(function() {
          $( "#"+baseId+"-"+filterType+"-slider" ).slider({
            value:value,
            min: min,
            max: max,
            step: step,
            slide: function( event, ui ) {
              
                $( "#"+input.id ).val( ui.value );

                var width = $( "#"+baseId+"-width-slider" ).slider("value");
                var placement = $( "#"+baseId+"-placement-slider" ).slider("value");
                changeLayerAttribute(ui, input.id, filterType, width, placement);

            }
          });

       $( "#"+input.id ).val( $( "#"+baseId+"-"+filterType+"-slider" ).slider( "value" ) );
      });
}




function changeLayerAttribute(ui, inputId, filterType, width, placement){

    var inputArray = inputId.split("-");
    var pos = inputArray[0];
    var name = inputArray[1];
    var parameter = inputArray[2];
    var par;

    block.layers.content[pos][parameter] = ui.value;
    
    
    if (filterType == "opacity"){

      d3.selectAll('#'+name).style(filterType, ui.value);
      //d3.selectAll('#stroke-'+name).style(filterType, ui.value);

    }
    else if (filterType == "placement" || filterType == "width"){
       var className = $("#"+name).attr("class");
       if (className == undefined){
          className = "labelLayer";
       }
       if(className == "heatmapTextLayer"){
           d3.selectAll("#"+name).attr("d", function(d){
            var arc33 = d3.svg.arc()
                          .innerRadius(placement +width)
                          .outerRadius(placement);
                            
            return arc33(d);
          });

           d3.selectAll("#"+name+"-label").attr("x", function (d, i){
            
            var x = heatmapTextVals[0].vals[i].x;
            var h = heatmapTextVals[0].vals[i].h;
            var returnVal = x/h * ( placement * width/2+10);
            
            return (x/h * ( placement + width/2+10));

           });
           d3.selectAll("#"+name+"-label").attr("y", function (d, i){
             var y = heatmapTextVals[0].vals[i].y;
             var h = heatmapTextVals[0].vals[i].h;
             var returnVal = y/h * (placement * width/2+10);
             
            return (y/h * ( placement + width/2+10));
           });
          
       }
       else if (className == "heatmapLayer"){
          
          var heatmapPos = -1;
          heatmapPos = heatmapVals[0].index;
          var index;
          
          for (i in heatmapVals){
            if (name == heatmapVals[i].name){
              index = i;
            }
          }
           d3.selectAll("#"+name).attr("d", function(d,i){
            
            if('i' in heatmapVals[index].vals[i] && heatmapVals[index].vals[i].i.value != undefined ){

               var value = heatmapVals[index].vals[i].i.value;
               
               var arc2 = d3.svg.arc()
                  .innerRadius( placement + ( width*value ) )
                  .outerRadius( placement )
                
                return arc2(d);
            }
            else{
                 var arc33 = d3.svg.arc()
                    .innerRadius( placement + width )
                    .outerRadius( placement )
                 
                 return arc33(d);
            }
            
          });
          
       }
       else if (className == "labelLayer"){
          var offset, c, x, h, xPos, yPos;
            var arc = d3.svg.arc()
              .innerRadius(placement)
              .outerRadius(placement + width);

          var label = d3.selectAll(".label").attr("transform", function(d,i) {

              offset = {"endAngle": valTextArray[i].endAngle, "startAngle":valTextArray[i].startAngle};
              c = arc.centroid(offset), x = c[0],y = c[1], h = Math.sqrt(x*x + y*y)-block.settings.textDistance;
              if (valTextArray[i].group != undefined){
                xPos = (x/h * (placement+80));
                yPos = (y/h * (placement+80));
              }
              else{
                xPos = (x/h * placement);
                yPos = (y/h * placement);
              }
              return "translate(" + xPos + ',' + yPos +  ")rotate(" + angle(offset) + ")";
          });
       }
    }

    refreshInput();

}




function heatmapLayer(content, svg, pie, placement, width, opacity, layerObj, radius, layerIndex){
  
  var s2 = [];
  s2 = findSize(content);

  var name = layerObj.layer.replace(" ","");
  heatmapVals.push({name:name, vals:s2, index:layerIndex});
  
  var pos = [];
  var opa = 1;
  if (opacity != undefined){
    opa = opacity;
  }

  for(i in s2){
    pos.push(s2[i].s);
  }

  createAccordionLayerElement(layerObj, radius, layerIndex);

  var work = svg.append("g");

  work.selectAll("path")
    .data(pie( pos  ))
    .enter().append("path")
    .attr("fill", function(d, i) { 

        if(! ('i' in s2[i])  ){
          return "white";
        }
        else{
          if(s2[i].i.color ){
            return s2[i].i.color;
          }
        }       
        return "white";
    })
    .on("mouseover", function (d, i) {
    
      if ( $("#showHover").attr('checked') ){
        d3.select("#tooltip")
          .style("left", d3.event.x - 350 + "px")
          .style("top", d3.event.y - 50 + "px")
          .style("opacity", 1)
          .select("#value")
          .html(function(d) {
                  var logRatio;
                  if (s2[i] && s2[i].i && s2[i].i.value){
                    logRatio = s2[i].i.value;
                  }
                  else{
                    logRatio = "";
                  }
              return "<strong>value : </strong> <span style='color:orange'>"+logRatio+"</span>";
          })
    }

  })
  .attr("stroke", function(d,i){

      if(! ('i' in s2[i])  ){
        return "white";
      }
      if(s2[i].i.stroke){
        return s2[i].i.stroke;
      }

    })
  .attr("stroke-width", function(d,i){

    if(! ('i' in s2[i])  ){
      return 0;
    }
    if(s2[i].i.strokewidth){
      return s2[i].i.strokewidth;
    }

  })
  .style("opacity", opa)
  .attr("class", "heatmapLayer")
  .attr("d", function(d,i){
      
      
      if('i' in s2[i] && s2[i].i.value != undefined){
         var arc2 = d3.svg.arc()
            .innerRadius( placement + ( width*s2[i].i.value ) )
            .outerRadius( placement )
             
          return arc2(d);
      }
      else{
         var arc33 = d3.svg.arc()
            .innerRadius( placement + width )
            .outerRadius( placement )
         return arc33(d);
      }
                         
  })
  .attr("id", layerObj.layer.replace(" ",""));
}


/*
  Prints a link layer - contains connections.
*/

function linkLayer(content, svg, pie, radius, arc, placement, layerObj, layerIndex){
  var s3 = [];
  if(content !== undefined && content.length > 0){
    s3 = findSize(content);
  }

  var pos2 = [];

  createAccordionLayerElement(layerObj, radius, layerIndex);

  for(i in s3){
    pos2.push(s3[i].s);
  }

  var work2 = svg.append("g");

  work2.selectAll("path")
      .data(pie( pos2  ))
      .enter().append("path");
  /*
    Handles the "links" on the inside.

  */
  var points = [];
  var numCons = 0;

  work2.selectAll("path").each(function(i,e){
      

      var p = { };
      var c = null;
      var offsetClone = { };

      var svCoordinate, type, effect;
      if (s3[e].i && s3[e].i.attributes != undefined){
        svCoordinate = s3[e].i.attributes.svCoordinate;
        type = s3[e].i.attributes.type;
        effect = s3[e].i.attributes.effect;
      }

      if(s3[e].i && 'offset' in s3[e].i && s3[e].i.offset>=0.0 && s3[e].i.offset<=1.0){

        var off = s3[e].i.offset;
        
        offsetClone.startAngle = i.startAngle;
        offsetClone.endAngle = i.startAngle + off*2*(i.endAngle - i.startAngle);

        c = arc.centroid(offsetClone),
                x = c[0],
                y = c[1],
                // pythagorean theorem for hypotenuse
                h = Math.sqrt(x*x + y*y)+242;

      } else {
       
        c = arc.centroid(i),
                x = c[0],
                y = c[1],
                // pythagorean theorem for hypotenuse
                h = Math.sqrt(x*x + y*y)+242;
      }

              if(s3[e].i && 'connection' in s3[e].i && s3[e].i.connection>0) {
                p.c = s3[e].i.connection;
                  if(p.c>numCons){
                    numCons=p.c;
                  }

                p.x = x/h*placement;
                p.y = y/h*placement;
              //  p.x = x/h*labelRadius;
              //  p.y = y/h*labelRadius;
                p.svCoordinate = svCoordinate;
                p.type = type;
                p.effect = effect;

                points.push(p);
              }

  });

  var temp;
  var currentPos;
  for(var i = 1; i<=numCons; i++){

    temp = [];
      
    for( var j = 0; j<points.length; j++){
      if(points[j].c == i){
        currentPos=j;
        temp.push( points[j]);
      }
    }
    
    if(temp.length==2){

      var cur = svg.append("g")
                   .attr("fill", "none");

      var curved = d3.svg.line()
          .x(function(d) { return d.x; })
          .y(function(d) { return d.y; })
          .interpolate("cardinal")
          .tension(0);

      var x1 = temp[0].x;
      var x2 = temp[1].x;
      var y1 = temp[0].y;
      var y2 = temp[1].y;
      var draw = [ {x: x1, y: y1}, {x: (x1+x2)/2.5 , y: (y1+y2)/2.5 }, {x:x2, y:y2 }];

      cur.append("path")
         .attr("d", curved(draw))
         .attr("stroke", "purple")
         .attr("stroke-opacity", function(){
              if (layerObj.opacity != undefined){
                return layerObj.opacity;
              }
              else{
                return 1;
              }
         })
         .attr("class", currentPos+" "+linkLayer)
         .attr("id", layerObj.layer)
         .on("mouseover", function (d, i) {
                  pos = parseInt($(this).attr("class"));
                  svCoordinate = points[pos].svCoordinate;
                  effect = points[pos].effect;
                  svArray = svCoordinate.split("|");
                  firstSV = svArray[0].split(":");
                  secondSV = svArray[1].split(":");
                  firstChr = firstSV[1];
                  firstCoord = firstSV[2];
                  secondChr = secondSV[1];
                  secondCoord = secondSV[2];
                  firstStrand = firstSV[0];
                  secondStrand = secondSV[0];
                  if ( $("#showHover").attr('checked') ){
                  
                    d3.select("#tooltip")
                        .style("left", d3.event.x - 350 + "px")
                        .style("top", d3.event.y - 50 + "px")
                        .style("opacity", 1)
                        .style("width", "300px")
                        .select("#value")
                        .html(function(d) {
                            return "<strong>location: </strong> <span style='color:orange'>"+firstChr+":"+firstCoord+" - "+secondChr+":"+secondCoord+"</span><br>"+
                                   "<strong>effect: </strong> <span style='color:orange'>"+points[pos].effect+"</span>";                      
                        })
                  }
          });

    }


    if(temp.length>2){


      for(item in temp){
        for(item2 in temp){

          if(item2!=item){

            var cur = svg.append("g")
                     .attr("fill", "none");


            var curved = d3.svg.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .interpolate("cardinal")
                .tension(0);

            
            var draw = [ {x: temp[item2].x, y: temp[item2].y }, {x: (temp[item2].x+temp[item].x)/2.5 , y: (temp[item2].y +temp[item].y )/2.5 }, {x: temp[item].x , y: temp[item].y }];

            cur.append("path")
               .attr("d", curved(draw))
               .attr("id", layerObj.layer)
               .attr("stroke", "purple");
          }

        }
      }

    }
  }
}



function heatmapTextLayer(dataObj, svg, pie, labelRadius, placement, width, opacity, layerIndex){
  
  var s1 = [];
  s1 = findSize(dataObj);
  var opa = 1;
  createAccordionLayerElement(block.layers.content[layerIndex], radius, layerIndex);

  if (opacity != undefined){
    opa = opacity;
  }
  if (placement == undefined){
    console.log("placement variable is missing for heatmapTextLayer object : "+dataObj);
  }

  var outerData = [];

  for(i in s1){
    outerData.push(s1[i].s);
  }

  var outer = svg.append("g");

  outer.selectAll("path")
      .data(pie( outerData ))
      .enter().append("path")
      .attr("fill", function(d, i) { 
        
        if(! ('i' in s1[i])  ){
          return "white";
        }
        
        if(s1[i].i.color){
          return s1[i].i.color;
        }
       
        return color(i); })
      .attr("stroke", function(d,i){

        if(! ('i' in s1[i])  ){
          return "white";
        }
        if(s1[i].i.stroke){
          return s1[i].i.stroke;
        }

      })
      .attr("stroke-width", function(d,i){

        if(! ('i' in s1[i])  ){
          return 0;
        }
        if(s1[i].i.strokewidth){
          return s1[i].i.strokewidth;
        }

      })
      .style("opacity", opa)
      .attr("id", block.layers.content[layerIndex].layer)
      .attr("class", "heatmapTextLayer")
      .attr("d", function(d,i){
        var arc33 = d3.svg.arc()
                      .innerRadius(placement + width)
                      .outerRadius(placement);
                        
        return arc33(d);
      });


  var vals = [];

  outer.selectAll("path").each(function(i,e){

    original_copy = {};
    original_copy = i;

    /// Handles printing the text labels for layer 1.
    if(s1[e].i){
      
      for(it in s1[e].i.text){

        var offsetTest = {};

        offsetTest.startAngle = original_copy.startAngle;

        var ref = s1[e].i.text[it];
        
        var t = ref.val;
        var start = s1[e].i.start;
        var radianFromEdge = s1[e].i.radianFromEdge;
        var end = s1[e].i.end;
        var offset = ref.offset;
        var off = ref.offset;
        var fs = block.settings.fontSize;
        var f = block.settings.font;
        

        offsetTest.endAngle = original_copy.startAngle + off*2*(original_copy.endAngle - original_copy.startAngle);

        //
        var radiusTest = placement + width/2+10;

        /*if(radianFromEdge){
          radiusTest = radius - radianFromEdge;
        }*/
        if('offset' in ref && off>=0.0 && off<=1.0){

          var c = arc.centroid(offsetTest),
          x = c[0],
          y = c[1],
          // pythagorean theorem for hypotenuse
          h = Math.sqrt(x*x + y*y)-block.settings.textDistance;

          vals.push({"x":x, "y":y, "h":h});
          
          var te_ = outer.append("svg:text")
           /* .attr("transform", function(d) {
                return "translate(" + (x/h * radiusTest) +  ',' +
                   (y/h * radiusTest) +  ")rotate(" + angle(offsetTest) + ")"; 
            })*/
            .attr("x", x/h * radiusTest)
            .attr("y", y/h * radiusTest)
            .attr("dy", ".35em")
            .attr("id", block.layers.content[layerIndex].layer+"-label")
            .attr("text-anchor", function() {
                return (offsetTest.endAngle + offsetTest.startAngle)/2 > Math.PI ?
                    "end" : "start";
            })
            .style("font-size", fs)
            .style("font-family", f)
            .text( t );
      
      }else{
        
            var c = arc.centroid(original_copy),
              x = c[0],
              y = c[1],
              // pythagorean theorem for hypotenuse
              h = Math.sqrt(x*x + y*y)-block.settings.textDistance;
            vals.push({"x":x, "y":y, "h":h});

      
            var te_ = outer.append("svg:text")
              /*.attr("transform", function(d) {
                  return "translate(" + (x/h * radiusTest) +  ',' +
                     (y/h * radiusTest) +  ")rotate(" + angle(original_copy) + ")"; 
              })*/
              .attr("x", x/h * radiusTest)
              .attr("y", y/h * radiusTest)
              .attr("dy", ".35em")
              .attr("id", block.layers.content[layerIndex].layer+"-label")
              .attr("text-anchor", function() {
                  return (original_copy.endAngle + original_copy.startAngle)/2 > Math.PI ?
                      "end" : "start";
              })
              .style("font-size", fs)
              .style("font-family", f)
              .text( t );
      }
    }
  }
  });
 heatmapTextVals.push({name:block.layers.content[layerIndex].layer, vals: vals});
}




function labelLayer(pie, layerIndex, dataIndex, placement, width, opacity){

  valTextArray = [];
  var labelsArray = [];
  var s4 = [];

  createAccordionLayerElement(block.layers.content[layerIndex], placement, layerIndex);
  
  s4 = findSize(block.data.content[dataIndex].dataContent);
  var labelData = [];

  for(i in s4){
    labelData.push(s4[i].s);
  }


  outer4 = svg.append("g");

  outer4.selectAll("path")
      .data(pie( labelData ))
      .enter().append("path");

  var blockCounter = 0;
  var currentGroupElement = {};
  outer4.selectAll("path").each(function(i,e){

    original_copy = {};
    original_copy = i;
    /// Handles printing the text labels for layer 4.

    if(s4[e].i){
  

        for(it in s4[e].i.text){
          var line;
          var offsetTest = {};

          offsetTest.startAngle = original_copy.startAngle;
          
          var ref = s4[e].i.text[it], t = ref.val, start = s4[e].i.start, xPos = s4[e].i.xPos, yPos = s4[e].i.yPos,
              startAngle = s4[e].i.startAngle, endAngle = s4[e].i.endAngle, end = s4[e].i.end, group, offset = ref.offset,
              displayLabel = s4[e].i.displayLabel, off = ref.offset, fs = block.settings.fontSize, textColor = s4[e].i.textColor,
              line_x1 = s4[e].i.line_x1, line_x2 = s4[e].i.line_x2, line_y1 = s4[e].i.line_y1, line_y2 = s4[e].i.line_y2,
              elementFontSize = s4[e].i.elementFontSize, qualityScore, drug_rule_matched_flag, type, chrPos="", filterByQuality = false,
              groupRadius = placement + 110, groupElement = false, minQualityScore = block.settings.minQualityScore, 
              matchDrug = block.settings.matchDrugs;
         var attributes = s4[e].i.attributes;
         
          if (s4[e].i.attributes !== undefined){
              group = attributes.group;

              for (var key in attributes){
                if (attributes.hasOwnProperty(key)){   
                  var inAttr = false;
                  for (var la in labelAttributes){ 

                    if (key == labelAttributes[la].attr ){
                        inAttr = true;
                        break;
                    }
                  }

                  if (!inAttr){
                      attr = {};
                      if (attributes[key].substring) {
                        // test if this is a string
                          attr = {"attr":key, "type":"string"};
                      }
                      else if (typeof(attributes[key]) === "boolean"){
                          attr = {"attr":key, "type":"boolean"};
                      }
                      else{
                        attr = {"attr":key, "type":"number"};
                      }
                      labelAttributes.push(attr);
                  }
                }
              }
          }
          
          if (group != undefined && group != ""){
            groupElement = true;
          }


          if (elementFontSize === undefined){
              block.data.content[dataIndex].dataContent[s4[e].position/2].elementFontSize = fs;
              elementFontSize = fs;
          }

          if (textColor === undefined){
            textColor = "#000000";
          }

          if (displayLabel === undefined){
            displayLabel = true;
          }
          block.data.content[dataIndex].dataContent[s4[e].position/2].displayLabel = displayLabel;
          var f = block.settings.font;          
          var printLabel;
          labelsArray.push(t);
          
          offsetTest.endAngle = original_copy.startAngle + off*2*(original_copy.endAngle - original_copy.startAngle);

          if('offset' in ref && off>=0.0 && off<=1.0){
            
            var deg;
            var c = arc.centroid(offsetTest),
            x = c[0],
            y = c[1],
            // pythagorean theorem for hypotenuse
            h = Math.sqrt(x*x + y*y)-block.settings.textDistance;

            var angle2 = angle(offsetTest);
            var locationString, xLoc, yLoc, textAnchor;
            
            if (xPos == null || xPos == "undefined"){
              if (groupElement){
                xPos = (x/h * groupRadius);
                yPos = (y/h * groupRadius);

              }
              else{
                xPos = (x/h * placement);
                yPos = (y/h * placement);
              }
              locationString = "translate(" + xPos + ',' + yPos +  ")rotate(" + angle(offsetTest) + ")";
              textAnchor = (offsetTest.endAngle + offsetTest.startAngle)/2 > Math.PI ? "end" : "start"
            }
            else{

              offsetTest.endAngle = endAngle;
              offsetTest.startAngle = startAngle;
              locationString = "translate(" + xPos + ',' + yPos + ")rotate(" + dragAngle(offsetTest) + ")";
              textAnchor = Math.abs(offsetTest.endAngle + offsetTest.startAngle) > Math.PI ? "end" : "start"
            }
            
            // Does the grouping
            if (groupElement && displayLabel){
                if (group != currentGroupElement.group){
                  currentGroupElement.group = group;
                  currentGroupElement.xLoc = x/h * (placement + 80);
                  currentGroupElement.yLoc = y/h * (placement + 80);

                  outer4.append("line")
                      .style("stroke", "grey")
                      .style("stroke-dasharray", "4,2")
                      .style("stroke-linecap","round")
                      .style("stroke-opacity", 1)
                      .attr("class","labelLineGroup")
                      .attr("id", "tllg-"+group)
                      .attr("x1", x/h * (placement - 20))
                      .attr("y1", y/h * (placement - 20))
                      .attr("x2", x/h * (placement + 80))
                      .attr("y2", y/h * (placement + 80));
                }
                
                line_x1 = currentGroupElement.xLoc;
                line_y1 = currentGroupElement.yLoc;
            }

            if(!line_x1){
              line_x1 = x/h * (placement - 20);
              line_y1 = y/h * (placement - 20);
            }

            line_x2 = xPos;
            line_y2 = yPos;

            if (displayLabel){
               line = outer4.append("line")
                            .style("stroke", "black")
                            .style("stroke-dasharray", "4,2")
                            .style("stroke-linecap","round")
                            .style("stroke-opacity", 1)
                            //.data("qualityScore", qualityScore)
                            .attr("class",function(){
                              var string = "labelLine";
                              return string;
                              if (groupElement){
                                return string+" group"+group;
                              }
                              else{
                                return string;
                              }
                            })
                            .attr("id", "tll-"+s4[e].position/2+"-"+dataIndex)
                            .attr("x1", line_x1)
                            .attr("y1", line_y1)
                            .attr("x2", line_x2)
                            .attr("y2", line_y2);
  
              var dragInitialize = false;

              var drag = d3.behavior.drag()
               .on("dragstart", function (d,i){
                   dragInitialize = false;
                   if (d3.event.sourceEvent.button == 0){
                      dragInitialize = true;
                   }
                   
               })
               .on("drag", function(d,i) {
                    if(dragInitialize){
                      var radians = Math.atan2 (d3.event.y, d3.event.x);
                      deg = radians * (180 / Math.PI) + 90;
                      var diff = start - end;
                      end = deg+diff, start = deg, yDrag= d3.event.y, xDrag = d3.event.x, offsetTest.startAngle = radians, offsetTest.endAngle = radians;
                      
                      line.attr("x2", d3.event.x);
                      line.attr("y2", d3.event.y);

                      d3.select(this)
                        .attr("transform", function(d){
                          return "translate(" + [ d3.event.x ,d3.event.y ] +")rotate(" + dragAngle(offsetTest) +")"
                        })
                      .attr("dy", ".35em")
                      .attr("text-anchor", function() {
                          return Math.abs(offsetTest.endAngle + offsetTest.startAngle) > Math.PI ?
                              "end" : "start";
                          });
                      //.attr("text-anchor", "end");
                   }
                  })
                  
              .on("dragend", function(d,i){
                 //update the json "block" with the new positions for the label.
                if(dragInitialize){

                   block.data.content[dataIndex].dataContent[s4[e].position/2].end = end;
                   block.data.content[dataIndex].dataContent[s4[e].position/2].start = start;
                   block.data.content[dataIndex].dataContent[s4[e].position/2].xPos = xDrag;
                   block.data.content[dataIndex].dataContent[s4[e].position/2].yPos = yDrag;
                   block.data.content[dataIndex].dataContent[s4[e].position/2].startAngle = offsetTest.startAngle;
                   block.data.content[dataIndex].dataContent[s4[e].position/2].endAngle = offsetTest.endAngle;
                   block.data.content[dataIndex].dataContent[s4[e].position/2].line_x1 = line_x1;
                   block.data.content[dataIndex].dataContent[s4[e].position/2].line_y1 = line_y1;
                   textColor = block.data.content[dataIndex].dataContent[s4[e].position/2].textColor;
                   elementFontSize = block.data.content[dataIndex].dataContent[s4[e].position/2].elementFontSize;


                   labelAttr = {text:t, start:start, end:end, offset:offset, elementFontSize:elementFontSize, blockFont:f, xPos:xPos, yPos:yPos, textColor:textColor, position:s4[e].position/2, displayLabel:displayLabel, dataIndex:dataIndex, startAngle:offsetTest.startAngle, endAngle:offsetTest.endAngle, group:group};

                   valTextArray[s4[e].position/2] = labelAttr;
                    
                   
                   refreshInput();
                  }

                });



              
              var te_ = outer4.append("svg:text")
                .attr("transform", function(d) {
                      return locationString; 
                })
                .attr("dy", ".35em")
                .attr("fill", textColor)
                .attr("id", "tl-"+s4[e].position/2+"-"+dataIndex)
                .attr("text-anchor", function() {
                    return textAnchor;
                })
                .attr("class",function(){
                  var string = "label";
                  if (groupElement){
                    return string+" group"+group;
                  }
                  else{
                    return string;
                  }
                })
                .on("mouseover", function (d, i) {

                      if ( $("#showHover").is(":checked") ){
                        d3.select("#tooltip")
                            .style("left", d3.event.x - 375 + "px")
                            .style("top", d3.event.y - 50 + "px")
                            .style("opacity", 1)
                            .select("#value")
                            .html(function(d) {        
                              return "<strong>name:</strong> <span style='color:orange'>"+$("#tl-"+s4[e].position/2+"-"+dataIndex).text()+"</span>"+ 
                                "<p><strong>type:</strong> <span style='color:orange'>"+attributes.type+"</span></p>"+
                                "<p><strong>location:</strong> <span style='color:orange'>"+attributes.chrPos+"</span></p>";
                            })
                      }
                })
                .style("font-size", elementFontSize)
                .style("font-family", f)
                .text( t )
                .call(drag);
                var attributes = s4[e].i.attributes;
                for (var key in attributes) {
                  if (attributes.hasOwnProperty(key)) {
                    te_.attr("data-"+key, attributes[key]);
                    line.attr("data-"+key, attributes[key]);
                  }
                }

              
              var labelAttr = {text:t, start:start, end:end, offset:offset, elementFontSize:elementFontSize, blockFont:f, xPos:xPos, yPos : yPos, textColor : textColor, position : s4[e].position/2, displayLabel : displayLabel, dataIndex:dataIndex, startAngle:offsetTest.startAngle, endAngle:offsetTest.endAngle, group:group};
              
              valTextArray.push(labelAttr);
            }
         
        }else{
          console.log("You need to give an offset for layer4 content");
        }

      }
  }
  });
  
  refreshInput();
  updateLabels(valTextArray, labelsArray, s4);

}




function doD3(block){


// Make sure all the previous layer/data elements are removed 
$("#svgTest").remove();
$("#circ").empty();
$("#labelList").empty();
$( "#accordion" ).accordion({active: 1});
$("#accordion").accordion("destroy");
$("#accordion").empty();
$("#colorChooser").val("#000000");
$("#labelTextSize").placeholder = block.settings.fontSize;
$("#displayAllLabels").prop('checked',true);
$("#thresholds").empty();
document.getElementById( 'thresholdRangeOptions' ).style.display = 'none';
labelAttributes = new Array();
thresholdList = new Array();

$('#jstree_demo_div').jstree(block);



// Setup the svg and layer variables
radius = Math.min(width, height)/3, labelLayer1r = radius - 45, labelLayer3r = radius - 14;
arc = d3.svg.arc()
  .innerRadius(radius - 70)
  .outerRadius(radius - 35);

var arcLayer3 = d3.svg.arc()
    .innerRadius(labelLayer3r - 50)
    .outerRadius(labelLayer3r - 15);

svg = d3.select("#circ").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "svgTest")
      .on('click', function(d,i){
          $("#tooltip").hide();
      })
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


var padAngle = 0;
if(block.settings.padAngle && block.settings.padAngle!=0.00)
    padAngle=block.settings.padAngle;

var pie = d3.layout.pie()
      .sort(null)
      .padAngle(padAngle);

/*
  Print the layers w/data according to the json 'block' element.

*/

  var numLabelsLayer = 0;
  $.each(block.layers.content, function(index, layerObj){
           
       if(typeof(layerObj.dataId) !== 'undefined'){
          
          var dataId = layerObj.dataId;
          var type = layerObj.type; // labelsLayer, linkLayer, etc....
          var width = layerObj.width;
          var opacity = layerObj.opacity;
          var placement = layerObj.placement;
          
          $.each(block.data.content, function(index2, dataObj){

              if (dataObj.dataId == dataId){

                    if (type == "labelsLayer" && numLabelsLayer == 0){
                      numLabelsLayer++;

                      labelLayer( pie, index, index2, placement, width, opacity );
                      createFilterElement( index );                      
                      $("#colorChooser").attr("class", index2);
                      $("#displayAllLabels").attr("class", index2);
                      $("#labelTextSize").attr("class", index2);
                    }
                    else if (type == "heatmapLayer"){ 
                      heatmapLayer( dataObj.dataContent, svg, pie, placement, width, opacity, layerObj, radius, index );
                    }
                    else if (type == "linkLayer") {
                      linkLayer( dataObj.dataContent, svg, pie, radius, arcLayer3, placement, layerObj, index );
                    }
                    else if (type == "heatmapTextLayer") {    
                      heatmapTextLayer( dataObj.dataContent, svg, pie, labelLayer1r, placement, width, opacity, index );
                    }
                    else {
                      console.log( "unknown data type: "+type );
                    }
              }
          });
       }
  });


/*
    Start the accordion for the Layers tab
*/


  $(function() {

      $( "#accordion" ).accordion({
        heightStyle: "content",
        active : false,
        collapsible : true
      });

      $( "#labelDataAccordion").accordion({
       heightStyle: "content",
       active : false,
       collapsible : true
      });
  });
  


  /// Create the SVG

  saveSVGtoImage();

};



    $("#prs").chosen({
        width: "10%"
    });




function saveSVGtoImage(){

  d3.select("#generate")
      .on("click", writeDownloadLink);

}



function writeDownloadLink(){

    try {
        var isFileSaverSupported = !!new Blob();
    } catch (e) {
        alert("blob not supported");
    }
    var html = d3.select("svg")
        .attr("title", "test2")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    
    //var blob = new Blob([html], {type: "image/svg+xml"});
    var blob = new Blob( [html], {type: "image/svg+xml;base64 "});
    
    var fileNameToSaveAs = document.getElementById("inputFileNameToSaveAs").value;
    saveAs(blob, fileNameToSaveAs+".svg");
};

function submit_download_form(output_format)
{
  // Get the d3js SVG element
  var tmp = document.getElementById("ex1");
  var svg = tmp.getElementById("#svg");
  // Extract the data as SVG text string
  var svg_xml = (new XMLSerializer).serializeToString(svg);

  // Submit the <FORM> to the server.
  // The result will be an attachment file to download.
  var form = document.getElementById("svgform");
  form['output_format'].value = output_format;
  form['data'].value = svg_xml ;
  form.submit();
}

 
  /*
   * hoverIntent | Copyright 2011 Brian Cherne
   * http://cherne.net/brian/resources/jquery.hoverIntent.html
   * modified by the jQuery UI team
   */
  $.event.special.hoverintent = {
    setup: function() {
      $( this ).bind( "mouseover", jQuery.event.special.hoverintent.handler );
    },
    teardown: function() {
      $( this ).unbind( "mouseover", jQuery.event.special.hoverintent.handler );
    },
    handler: function( event ) {
      var currentX, currentY, timeout,
        args = arguments,
        target = $( event.target ),
        previousX = event.pageX,
        previousY = event.pageY;
 
      function track( event ) {
        currentX = event.pageX;
        currentY = event.pageY;
      };
 
      function clear() {
        target
          .unbind( "mousemove", track )
          .unbind( "mouseout", clear );
        clearTimeout( timeout );
      }
 
      function handler() {
        var prop,
          orig = event;
 
        if ( ( Math.abs( previousX - currentX ) +
            Math.abs( previousY - currentY ) ) < 7 ) {
          clear();
 
          event = $.Event( "hoverintent" );
          for ( prop in orig ) {
            if ( !( prop in event ) ) {
              event[ prop ] = orig[ prop ];
            }
          }
          // Prevent accessing the original event since the new event
          // is fired asynchronously and the old event is no longer
          // usable (#6028)
          delete event.originalEvent;
 
          target.trigger( event );
        } else {
          previousX = currentX;
          previousY = currentY;
          timeout = setTimeout( handler, 100 );
        }
      }
 
      timeout = setTimeout( handler, 100 );
      target.bind({
        mousemove: track,
        mouseout: clear
      });
    }
  };




/*
    Menu that appears when text labels are selected in the svg
*/

function contextMenu() {
    var height,
        width, 
        margin = 0.1, // fraction of width
        items = [], 
        rescale = false, 
        style = {
            'rect': {
                'mouseout': {
                    'fill': 'rgb(244,244,244)', 
                    'stroke': 'white', 
                    'stroke-width': '1px'
                }, 
                'mouseover': {
                    'fill': 'rgb(200,200,200)'
                }
            }, 
            'text': {
                'fill': 'steelblue', 
                'font-size': '13'
            }
        }; 
    
function menu(x, y) {
    d3.select('.context-menu').remove();
    scaleItems();

    // Draw the menu
    d3.select('svg')
        .append('g').attr('class', 'context-menu')
        .selectAll('tmp')
        .data(items).enter()
        .append('g').attr('class', 'menu-entry')
        .style({'cursor': 'pointer'})
        .on('mouseover', function(){ 
            d3.select(this).select('rect').style(style.rect.mouseover) })
        .on('mouseout', function(){ 
            d3.select(this).select('rect').style(style.rect.mouseout) });
    
    d3.selectAll('.menu-entry')
        .append('rect')
        .attr('x', x)
        .attr('y', function(d, i){ return y + (i * height); })
        .attr('width', width)
        .attr('height', height)
        .style(style.rect.mouseout);
    
    d3.selectAll('.menu-entry')
        .append('text')
        .text(function(d){ return d; })
        .attr('x', x)
        .attr('y', function(d, i){ return y + (i * height); })
        .attr('dy', height - margin / 2)
        .attr('dx', margin)
        .style(style.text);

        // Other interactions
        /*d3.select('body')
            .on('click', function() {
                d3.select('.context-menu').remove();
            });*/

    }
    
    menu.items = function(e) {
        if (!arguments.length) return items;
        for (i in arguments) items.push(arguments[i]);
        rescale = true;
        return menu;
    }


    // Automatically set width, height, and margin;
    function scaleItems() {
        if (rescale) {
            d3.select('svg').selectAll('tmp')
                .data(items).enter()
                .append('text')
                .text(function(d){ return d; })
                .style(style.text)
                .attr('x', -1000)
                .attr('y', -1000)
                .attr('class', 'tmp');
            var z = d3.selectAll('.tmp')[0]
                      .map(function(x){ return x.getBBox(); });
            width = d3.max(z.map(function(x){ return x.width; }));
            margin = margin * width;
            width =  width + 2 * margin;
            height = d3.max(z.map(function(x){ return x.height + margin / 2; }));
            
            // cleanup
            d3.selectAll('.tmp').remove();
            rescale = false;
        }
    }

    return menu;
}



// Converts json object children into an array



if (!Object.keys) {
    Object.keys = function (obj) {
        var arr = [],
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(key);
            }
        }
        return arr;
    };
}


    var loadStudyPatient = function(studyPatient){
        $("#circ").empty();
        $("#labelBoxes").empty();
        emptyCircInput();

        if (studyPatient == undefined || studyPatient == ""){
            studyPatient = {
                qy: $("#studyPatient").val().toString()
            };
        }
        if (studyPatient.qy.length > 0) {
                
            printLayer("Chromosomes", "ideogram", "heatmapTextLayer", 270, 30, 0.8);
            printLayer("Small Chromosomes", "ideogram2","heatmapLayer", 180, 5, 0.3);
            printHeatmapText("ideogram");
            printHeatmap(undefined, "ideogram2");
            
            $.getJSON("/circ/sigSNVs", studyPatient, function(data) {
                if (data.length > 0){
                    defaultFilters = [];
                    defaultFilters.push({"name":"Quality Score", "field":"snvindelqual", "value":20, "type":"range", "min":0, "max":400});
                    defaultFilters.push({"name":"Log2 Scores", "field": "logqual", "value":0, "type":"range", "min":0, "max":12,"step":0.2});
                    defaultFilters.push({"name":"Level 2", "field":"level2", "checkboxVal":true, "type":"checkbox"});
                    defaultFilters.push({"name":"Drug Rules", "field":"drug_rule","checkboxVal":false, "type":"checkbox"});
                    
                    printLayer( "Mutations", "mutationLabels", "labelsLayer", 300, 50, 1, defaultFilters );
                    printLabels( data, "mutationLabels" );
                }
                $.getJSON("/circ/translocations", studyPatient, function(data2) {
                    if(data2.length > 0){
                        printLayer("Translocations", "translocations", "linkLayer", 325, 20, 1);
                        printLinkLayer(data2, "translocations");
                    }
                    $.getJSON("/circ/cna", studyPatient, function(data3){
                        if (data3.length > 0){
                            printLayer("CNVs", "cnvTrack", "heatmapLayer", 230, 15, 1);
                            printHeatmap(data3, "cnvTrack");
                        }
                        updateCirc(); 
                    });
                });    
            });

       }
    }




    var loadStudy = function() {
        $("#studyPatient").empty();
        var study = {
                qy: $("#study").val().toString()
            };

        
        
        if ($("#study").val().length > 0) {
 
           $.getJSON("/circ/studyPatients", study, function(data){
                showStudyPatients(data);
           });
        }
          if($("#studyPatient option").length == 1) {
            loadStudyPatient();
          }

    }


// Controls searching through the text labels
$(function() {
  $("#search").on("keyup",function() {
    $("#body tr").hide();
    $("#body tr:containsi('"+this.value+"')").show();
  });
});


/*
  Load Default circos from the database
*/


var sp = { qy: "C017.0019" };
loadStudyPatient(sp);
//]]>
