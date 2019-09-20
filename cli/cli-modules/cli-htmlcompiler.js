//This file is used to compile html to our javascript equivelant code.

function getElTag(el){
    el = el.replace(/((\s.+)+?|\>|\/|\<)/g, "");

    return el;
}


function buildEl(tag, src, content){
    var attributes = {};
    var srcAttr = src.match(/(\@|)(\w|\d|\.)+?\=\'[^']+\'/g);
    
    if(srcAttr !== null){
        srcAttr.forEach(function(val){
            var attrName = val.match(/[^=]+/)[0];
            var attrValue = val.match(/[^=]+$/)[0].replace(/\'/g, "");
            
            //is not a property
            if(attrName.indexOf("@") !== 0){

                if(attrName.indexOf("a7on") === 0){
                    attrValue = attrValue.replace("()", "");
                }

                attributes[attrName] = attrValue;

            } else {

                if(attributes.props === undefined){
                    attributes.props = {};
                }

                var attrRName = attrName.replace("@", "");

                attributes.props[attrRName] = attrValue;

            }

        });
    }

    attributes = JSON.stringify(attributes);

    var EvListener = attributes.match(/\"a7on\w*\":\"[\w|\d\_]*\"/i);

    if(EvListener !== null){
        EvListener.forEach(function(val){

            var event = val.match(/\".+?\"/);
            var listener = val.match(/\:\".+?\"/)[0].replace(/\"/g, "");

            attributes = attributes.replace(val, event + listener);
       
        });
    }

    return "a7.createElement(\'"+tag+"\',"+attributes+","+content+")";
}

function returnHigherThan (arr, higherThan){

    function matcher(matchCase){
        if (matchCase > higherThan){
            return true;
        } else {
            return false;
        }
    }

    var matching = arr.filter(matcher);
    
    return matching;
}

module.exports = function htmlCompiler(html){

var htmlCopy1 = html;
var htmlCopy2 = html;
var htmlCopy3 = html;

//Aka result
var compiled = "";

//Only gets every "top level" element and then puts their children running through the compiler so that we can get them compiled efficiently
var headElements = [];

var ElementStarting = html.match(/\<[^<>/\s]+\s*[^<>]*?(?<=[^/])\>/g);

var ElementClosing = html.match(/\<\/(\w|\d)+?\>/g);

var ElementSelfClosing = html.match(/\<(\d|\w)+?(|\s|[^>]*?)\s*?\/\>/g);

var indexOF = {};
indexOF.ElementStarting = [];
indexOF.ElementClosing = [];
indexOF.ElementSelfClosing = [];

var lastIndexOF = {};
lastIndexOF.ElementStarting = [];
lastIndexOF.ElementClosing = [];
lastIndexOF.ElementSelfClosing = [];

var tagOF = {};
tagOF.ElementStarting = [];
tagOF.ElementClosing = [];
tagOF.ElementSelfClosing = [];

var Jump = 0;

if(ElementStarting !== null&& ElementStarting !== undefined){
    ElementStarting.forEach(val => {
        var index = htmlCopy1.indexOf(val) + Jump;
        var lIndex = htmlCopy1.lastIndexOf(val) + Jump;
        htmlCopy1 = htmlCopy1.replace(val, "");
        Jump += val.length;
        indexOF.ElementStarting.push(index);
        lastIndexOF.ElementStarting.push(lIndex);
        tagOF.ElementStarting.push(getElTag(val));
    });
}

Jump = 0;
if(ElementClosing !== null&& ElementClosing !== undefined){
    ElementClosing.forEach(val => {
        var index = htmlCopy2.indexOf(val) + Jump;
        var lIndex = htmlCopy2.lastIndexOf(val) + Jump;
        htmlCopy2 = htmlCopy2.replace(val, "");

        Jump += val.length;
        tagOF.ElementClosing.push(getElTag(val));
        indexOF.ElementClosing.push(index);
        lastIndexOF.ElementClosing.push(lIndex);
    });
}

Jump = 0;
if(ElementSelfClosing !== null&& ElementSelfClosing !== undefined){
    ElementSelfClosing.forEach(val => {
        var index = htmlCopy3.indexOf(val) + Jump;
        var lIndex = htmlCopy3.lastIndexOf(val) + Jump;
        htmlCopy3 = htmlCopy3.replace(val, "");

        Jump += val.length;
        indexOF.ElementSelfClosing.push(index);
        tagOF.ElementSelfClosing.push(getElTag(val));
        lastIndexOF.ElementSelfClosing.push(lIndex);
    });
}

//building algo
//Get topLevel Elements first
var loc = 0; 
var oldVAL = 0;
var len =  ElementStarting.length;
var y;
var oldCloseEnd;
for (y = 0; y < len; y++){
    //findClosing
    var start = indexOF.ElementStarting[loc];
    var nextStart = indexOF.ElementStarting[loc + 1];
    //closing needs to be different
    var close;
    var closePos;
    var nextClose;
    var nested = false;
    var i;

    for(var x = 0; x < indexOF.ElementClosing.length; x++){
        var valx = indexOF.ElementClosing[x];

        //checks if nested the check is working but we dont know how to make it work
        console.log("old",oldVAL+";","cur", valx+";");
        if(nextStart < valx && valx > oldVAL){
            nested = true;
            var allNextStart = returnHigherThan(indexOF.ElementStarting, start);
            var allNextClose = returnHigherThan(indexOF.ElementClosing, start);
            var difference = (allNextClose.length - allNextStart.length);
            console.log(allNextStart, allNextClose);
            console.log("inmatch", valx);
            //needs rewriting 
            var endTagLoc = indexOF.ElementClosing[x + difference];
            var endTagLen = ElementClosing[x + difference];
            if(endTagLoc === undefined){
                endTagLoc = indexOF.ElementClosing[x] + ElementClosing[x].length;
            }

            var innerElements = html.slice(start + ElementStarting[x].length, endTagLoc);
            console.log("in",innerElements);
            //fix me
            closePos = x + difference;
            close = oldVal = endTagLoc + endTagLen;
            y += difference;
            x += difference;
            i += difference;

            var ReturnElement = buildEl(tagOF.ElementStarting[loc],ElementStarting[loc],htmlCompiler(innerElements).replace(/;$/, ""));
            headElements.push(ReturnElement);
            break;

        } else if(valx > start && valx > oldVAL){
            console.log("match", valx);
            closePos = x;
            close = valx;
            oldVAL = valx;
            nextClose = indexOF.ElementClosing[i + 1];
            break;
        }
        //console.log(start, valx);
        i++;
    }

    //console.log(indexOF.ElementClosing);
    var text = "";
    var content = "";
    //parsed version of the element and also the text
    var el;
    var val = ElementStarting[y];
    //closing element start location
    var icl = indexOF.ElementClosing[loc];
    //closing element lenght
    var clEl = ElementClosing[loc].length;
    //endpoint
    var htmlLast = html.length;
    var afterText = html.slice(icl + clEl, nextStart);
    
    
    //does nothing because it is nested
    if (nextStart < close || nested === true) {

    //matches the ending tag of the element
    //safe close
    } else if(indexOF.ElementStarting[loc] !== 0 && loc === 0){
        
        text = html.slice(0, indexOF.ElementStarting[loc]);        
        content = html.slice(indexOF.ElementStarting[loc] + val.length, indexOF.ElementClosing[loc]);
        el = buildEl(tagOF.ElementStarting[loc],ElementStarting[loc],"\'" + content + "\'");
        headElements.push("\"" + text + "\"", el);

    } else if(nextStart > close && nextStart !== undefined){
        //TODO: Add text parsing

        content = html.slice(indexOF.ElementStarting[loc] + val.length, indexOF.ElementClosing[loc]);
        el = buildEl(tagOF.ElementStarting[loc],ElementStarting[loc],"\'" + content + "\'");
        headElements.push(el, "\"" + afterText + "\"");

    } else if (start < close && nextStart > close){
        //TODO: Add text parsing

        content = html.slice(indexOF.ElementStarting[loc] + val.length, indexOF.ElementClosing[loc]);
        el = buildEl(tagOF.ElementStarting[loc],ElementStarting[loc],"\'" + content + "\'");
        headElements.push(el);
    
    
    //at the end
    } else if (nextStart === undefined && nextClose === undefined){

        text = html.slice(icl + clEl, htmlLast);
        content = html.slice(indexOF.ElementStarting[loc] + val.length, icl);
        el = buildEl(tagOF.ElementStarting[loc],ElementStarting[loc],"\'" + content + "\'");
        headElements.push("\"" + text + "\"", el);
    
    } else {
        console.log("edge case");
    }

    if(nested === false){
        oldCloseEnd = close + ElementClosing[closePos];
    } else {
        oldCloseEnd = "";
    }

    loc++;
}

if(headElements !== null && headElements !== undefined){

    var len2 = headElements.length;
    var pos = 0;
    var trail = ",";

    headElements.forEach(function(el){
        
        //no trailing commas
        if(pos === len2 - 1){
            trail = "";
        }

        compiled += el + trail;
        pos++;
    });
}

return compiled;

};