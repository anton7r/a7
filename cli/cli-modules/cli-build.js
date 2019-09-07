const fs = require("fs");
const chalk = require("chalk");
const log = console.log;
const UglifyJS = require("uglify-js");
const clicore = require("./cli-core.js");

module.exports = function() {
    var config = JSON.parse(fs.readFileSync("./a7.config.json", "utf-8"));

    if (config.entry === undefined){
        clicore.errorLog("You have not defined the entrypoint of your app.");
        return;
    } 
    else {
        clicore.infoLog("config was successfully loaded.");
    }

    var mainFile = fs.readFileSync(config.entry, "utf-8");

    mainFile = mainFile.replace(clicore.importA7rx, fs.readFileSync(clicore.pathToA7JS, "utf-8"));
    var imports = mainFile.match(/import .+ from \".+\"/g);
    console.log(imports);

    if (imports !== null){
        imports.forEach(function(val){
            var pathToComponent = val.match(/".+"/),
            document;
            var documentPath;

            pathToComponent[0] = pathToComponent[0].replace(/\"/g, "");
            if(clicore.isRelativePath(pathToComponent[0])){
                documentPath = "./app" + pathToComponent[0].replace(/\./, "");
                document = fs.readFileSync(documentPath, "utf-8");
            } else {
                documentPath = pathToComponent[0];
                document = fs.readFileSync(documentPath, "utf-8");
            }
            var documentFolder = documentPath.replace(/(\w|\n)+\.js/g, "");


            //FIXME: So many variable declarations, could be simplified
            var templateRawUrl = clicore.componentSource(document.match(/template(|\s+):(|\s+)\".+\"/i)[0]);
            var stylesRawUrl = clicore.componentSource(document.match(/styles(|\s+):(|\s+)\".+\"/i)[0]);
            var templateUrl;
            var stylesUrl;
            var componentTag = document.match(/tag(|\s+):(|\s+)\".+\"/i)[0].match(/\".+\"/)[0].replace(/\"/g, "");

            if(clicore.isRelativePath(templateRawUrl)){
                templateUrl = documentFolder + templateRawUrl.replace(/\.\//, "");
            } else {
                templateUrl = templateRawUrl;
            }

            if(clicore.isRelativePath(stylesRawUrl)){
                stylesUrl = documentFolder + stylesRawUrl.replace(/\.\//, "");
            } else {
                stylesUrl = stylesRawUrl;
            }

            var styles = fs.readFileSync(stylesUrl, "utf-8");

            //Add css compressor here!!!!
            styles = styles.replace(/\s/g, " ");

            var containerStyles = styles.match(/\.container(.|\s)+\{(.|\s)+\}/g, "");
            var containerOutStyles = "";

            containerStyles.forEach(function(style){
                containerOutStyles += style;
            });

            containerOutStyles = containerOutStyles.replace(/\.container/g, ".a7-component-container." + componentTag);

            var childrenStyles = styles.replace(/\.container(.|\s)+\{(.|\s)+\}/g, "");
            var template = fs.readFileSync(templateUrl, "utf-8");
            var templateOut = "";
            //HTML minifier
            template.split("\r\n").forEach(function(line){
                templateOut += line.replace(/^\s+/g, "");
            });
            templateOut = templateOut.replace(/\s+/g, " ");

            templateLiterals = templateOut.match();
            log(templateLiterals);
            
            var importerName = val.replace(/(import|from \".+\"| )/g, "");
            log(importerName);
            log(val);
            //Replaces component import with the boilerplate
            mainFile = mainFile.replace(val, "//import \na7.registerComponent(\"" + componentTag + "\", function(props){return \""+templateOut+"\"}); function "+ importerName +"(props){return a7.createElement(\""+ componentTag + "\", {props:props})}");
        });
    } else {
        clicore.infoLog("no component imports detected.");
    }
    console.log(mainFile);
    var minify = UglifyJS.minify(mainFile);
    if(minify.error){
        log(chalk.red("ERROR:"), minify.error.message, minify.error.line + ":" + minify.error.col);
    }

    fs.writeFileSync(config.output, minify.code);
};