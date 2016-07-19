



font = "helvetica"
fontSize = "11px"
padAngle = 0
textDistance = 12


var chrSize = [];
	chrSize.push(249250621);
	chrSize.push(243199373);
	chrSize.push(198022430);
	chrSize.push(191154276);
	chrSize.push(180915260);
	chrSize.push(171115067);
	chrSize.push(159138663);
	chrSize.push(146364022);
	chrSize.push(141213431);
	chrSize.push(135534747);
	chrSize.push(135006516);
	chrSize.push(133851895);
	chrSize.push(115169878);
	chrSize.push(107349540);
	chrSize.push(102531392);
	chrSize.push(90354753);
	chrSize.push(81195210);
	chrSize.push(78077248);
	chrSize.push(59128983);
	chrSize.push(63025520);
	chrSize.push(48129895);
	chrSize.push(51304566);
	chrSize.push(155270560);
	chrSize.push(59373566);
var genomeSize = 0;


$.each(chrSize,function() {
    genomeSize += this;
});


//GENOME_SIZE=3156105057
CHRS=24
SPACE_BETWEEN_CHRS=2000000 // Represents the buffer between each chromosome to use
DEGREE_UNIT = ( genomeSize + SPACE_BETWEEN_CHRS*CHRS ) / 360

var circInput = {
	settings: {
		"font" : font,
		"fontSize" : fontSize,
		"padAngle" : padAngle,
		"textDistance" : textDistance
	},
	layers: { 
		content: []
	},
	data: {
		content: []
	}
};




var getLocation = function(chrPos){
	chrName = chrPos.split(":")[0].replace("chr","");
	pos = chrPos.split(":")[1];

	var chr;
	if (chrName.toLowerCase() == "x"){
		chr = 23;
	}
	else if (chrName.toLowerCase() == "y"){
		chr = 24;
	}
	else if (chrName.toLowerCase() == "mt"){
		chr = 25;
	}
	else{
		chr = chrName;
	}

	var location = 0;
	endPoint = chr -1;
	
	for (var i = 0; i < endPoint; i++){
		location += parseFloat(chrSize[i]);
		location += parseFloat(SPACE_BETWEEN_CHRS);
	}

	location += parseFloat(pos);
	locationDeg = location / DEGREE_UNIT;

	return locationDeg;
}


var printLayer = function(name, dataId, layerType, placement, width, opacity, filters){
		
		if (filters == undefined){
			circInput.layers.content.push({
				"layer" : name,
				"dataId" : dataId,
				"type" : layerType,
				"placement" : placement,
				"width" : width,
				"opacity" : opacity
			})
		}
		else{
			circInput.layers.content.push({
				"layer" : name,
				"dataId" : dataId,
				"type" : layerType,
				"placement" : placement,
				"width" : width,
				"opacity" : opacity,
				"filters" : filters
			})
		}


}





var printHeatmapText = function(dataId) {


	var dataArr = {
		dataContent: []
	}
	var color = d3.scale.category20c().domain(d3.range(0,20));

	for (var i = 0; i < chrSize.length; i++){
		chrName = i;
		chrName +=1;
		start = getLocation(chrName+":"+0);
		end = getLocation(chrName+":"+chrSize[i]);

		if (chrName == "23"){
			chrName = "X";
		}
		else if (chrName == "24"){
			chrName = "Y";
		}
		
		dataArr.dataContent.push({
			"start" : start,
			"end" : end,
			"text" : [{
				"val" : chrName,
				"offset" : 0.5
			}],
			"color" : color(i)
		})
	}

	circInput.data.content.push({
		"dataId" : dataId,
		"filters" : [
		],
		"dataContent" : dataArr.dataContent
	})
	
}


var printLinkLayer = function(data, dataId){
	var dataArr = {
    	dataContent: []
    }
	if(data){
		for (var i = 0; i< data.length; i++){
			dbFreq = data[i].dbFreq;
			effect = data[i].effect;
			gene = data[i].gene;
			level2 = data[i].geneInfo.level2;
			type = data[i].type;
			svCoordinate = data[i].variants.SvCoordinate;
			qual = data[i].variants.qual;

			var coords = svCoordinate.split("|");
			var firstSvCoord = coords[0].split(":");
			var secondSvCoord = coords[1].split(":");
			var firstChr = firstSvCoord[1];
			var firstCoord = firstSvCoord[2];
			var secondChr = secondSvCoord[1];
			var secondCoord = secondSvCoord[2];

			firstStart = getLocation(firstChr+":"+firstCoord);
			secondStart = getLocation(secondChr+":"+secondCoord);
			firstEnd = firstStart + 0.01;
			secondEnd = secondStart + 0.01;

			dataArr.dataContent.push({
				"start" : firstStart,
				"end" : firstEnd,
				"color" : "purple",
				"connection" : i,
				"qual" : qual,
				"attributes":{
					"svCoordinate" : svCoordinate,
					"gene" : gene,
					"effect" : effect,
					"type" : type			
				}
			});

			dataArr.dataContent.push({
				"start" : secondStart,
				"end" : secondEnd,
				"color" : "purple",
				"connection" : i,
				"qual" : qual,
				"attributes":{
					"svCoordinate" : svCoordinate,
					"gene" : gene,
					"effect" : effect,
					"type" : type			
				}
			})
		}

	circInput.data.content.push({
		"dataId" : dataId,
		"filters" : [
		],
		"dataContent" : dataArr.dataContent
	})
	}
}


var emptyCircInput = function(){
	circInput.data.content = [];
	circInput.layers.content = [];
}




var printLabels = function(data, dataId){


	var dataArr = {
    	dataContent: []
    };

    var effects = [];
    var variantsMap = {};
    var positionsMap = {};

    var useQualityFilter;

    if (data){
		for (var i = 0; i< data.length; i++){
			effect = data[i].effect;
			effectCompare = effect.replace(" ","")

			if (  $.inArray(effectCompare, effects) == -1){
				effects.push(effectCompare);
				useQualityFilter = false;
				chrPos = data[i].chrPos;
				chr = chrPos.split(":")[0].replace("chr","");
				dbFreq = data[i].dbFreq;
				drug_flag = data[i].drug_rule_matched_flag;
				drug_rule_matched_flag = false;
				if (drug_flag == 1){
					drug_rule_matched_flag = true;
				}
				
				gene = data[i].gene;
				chrPos = data[i].chrPos;

				level2 = data[i].geneInfo.level2;
				level2Flag = false;

				if (level2 !== undefined && level2.length > 0){
					level2Flag = true;
				}

				type = data[i].type;
				elementFontSize = "10px";
				variantType = chrPos+":"+type;
				var xPos, yPos, group, qualFieldName;

				if (type == "SNV" || type == "smallInsertion" || type == "smallDeletion"){
					qualFieldName = "snvindelqual";
				}
				else{
					qualFieldName = "logqual";
				}

				qual = 0;
				if ( data[i].variants[0]){
					qual = parseFloat(data[i].variants[0].qual);
				}
				

				start = getLocation(chrPos);
				end = start+0.01;

				textVal = effect;

				key = Math.round(start);
				if (key in variantsMap){
					variantsMap[key] += 1.2;
					start = variantsMap[key];
					end = variantsMap[key]+0.01;
					group = positionsMap[key];

				}
				else{
					variantsMap[key] = start;
					positionsMap[key] = i;
					group = "";
				}

				dataArr.dataContent.push({
					"start" : start,
					"end" : end,
					"displayLabel" : true,
					"elementFontSize" : elementFontSize,
					"text" : [{
						"val" : textVal,
						"offset" : 0
					}],
					"attributes":{
						[qualFieldName] : qual,
						"dbFreq" : dbFreq,
						"drug_flag" : drug_rule_matched_flag,
						"gene" : gene,
						"effect" : effect,
						"level2" : level2Flag,
						"type" : type,
						"chrPos" : chrPos,
						"group" : group				
					}
				});
			}

		}

	circInput.data.content.push({
		"dataId" : dataId,
		"dataContent" : dataArr.dataContent
	})

	}
	
}

var printHeatmap = function(data, dataId){
	
	var dataArr = {
    	dataContent: []
    }

    var color = d3.scale.category20c().domain(d3.range(0,20));
	
	if(data){
		for (var i = 0; i< data.length; i++){
			studyPatient = data[i].studyPatient;
			log2fc = parseFloat(data[i].log2fc);
			filename = data[i].filename;
			chr = data[i].chr;
			end = data[i].end;
			start = data[i].start;
			startLoc = getLocation(chr+":"+start);
			endLoc = getLocation(chr+":"+end);
			var colorLayer2 = "green";
			
			if (log2fc < 0){
				colorLayer2 = "red";
			}

			dataArr.dataContent.push({
				"start" : startLoc,
				"end" : endLoc,
				"value" : log2fc,
				"color" : colorLayer2
			});
		}
		
		circInput.data.content.push({
			"dataId" : dataId,
			"dataContent" : dataArr.dataContent
		}) 
	
	}
	else{

		for (var i = 0; i < chrSize.length; i++){
			chrName = i;
			chrName +=1;
			start = getLocation(chrName+":"+0);
			end = getLocation(chrName+":"+chrSize[i]);
			
			dataArr.dataContent.push({
				"start" : start,
				"end" : end,
				"value" : 1,
				"color" : color(i)
			})
		}

		circInput.data.content.push({
			"dataId" : dataId,
			"filters" : [
			],
			"dataContent" : dataArr.dataContent
		})

	}

}




var showStudyPatients = function(data){
	$("#studyPatient").append($('<option>',{
		value : "",
		text : "-- select a sample --",
		style : "display:none"
	}));
	$.each(data, function(index, element){
		$("#studyPatient").append($('<option>',{
			value : element._id,
			text : element._id
		}));
	});
}


function isEven(n) {
   return n % 2 == 0;
}


var updateCirc = function(){
	
	$("#csv_input").empty();

	    var myJson = JSON.stringify(circInput, null, 4);
        var sel = document.getElementById('csv_input');
        sel.innerHTML = myJson;
        updateCircFromDB();
}










