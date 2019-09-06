#!/usr/bin/env node

const log = console.log;
const fs = require("fs");
const chalk = require("chalk");
const a7build = require("./cli-modules/cli-build.js");
const clicore = require("./cli-modules/cli-core.js");
const [, , ...args] = process.argv;
const endbar = "======================================";

const createHtmlDoc = function (name) {
    return [`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>`, name, `</title>
    <meta name="description" content="`, name, `"></meta>
    <link href="/css/style.css" rel="stylesheet">
</head>
<body>
    <div data-a7-page-container></div>
    <script type="module" src="/appbuild.js"></script>
</body>
</html>`].join("");
};
const cssDoc = `:root{\n    --main-color:black;\n    --bg-color:white;\n}\n\n* {\n    margin:0px;\n    padding:0px;\n}\n\nbody {\n    font:"FONT HERE";\n}`;

const a7greet = function () {
    log();
    log("================", chalk.blue("a7JS"), "================");
    log("installed version:", chalk.green("v4-pre"));
    log();
};

const a7helper = function () {
        log("=============", chalk.blue("a7JS Help"), "==============");
        clicore.helperLog("newproject", "create a new project with a7.");
        clicore.syntaxLog("a7 newproject [projectname]");
        clicore.syntaxLog("a7 np [projectname]");
        clicore.helperLog("newcomponent", "create a new component into the current project.");
        clicore.syntaxLog("a7 newcomponent [componentname]");
        clicore.syntaxLog("a7 nc [componentname]");
        clicore.helperLog("build", "build the a7 project.");
        clicore.syntaxLog("a7 build");
        log(endbar);
};

const a7newproject = function (name) {
    if (name === undefined) {
        return clicore.errorLog("You have not defined a name for your project.");
    } else if (fs.existsSync(name) !== false) {
        return clicore.errorLog(name + " folder already exists in this directory.");
    }

    infoLog("creating a new project in " + name);

    fs.mkdir(name, {
        recursive: true
    }, function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "there was an error while creating project folder.");
        } else {
            log(chalk.green("SUCCESS:"), "project folder was created.");
        }
    });

    fs.writeFile(name + "/package.json", "empty", function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "package.json could not be created.");
        } else {

        }
    });

    fs.mkdirSync(name +"/app");

    fs.writeFile(name + "/index.html", createHtmlDoc(name), function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "index.html could not be created.");
        }
    });

    fs.mkdir(name + "/css", {
        recursive: true
    }, function (err) {
        if (err) {
            return clicore.errorLog("css folder could not be created.");
        }
    });

    fs.writeFile(name + "/css/style.css", cssDoc, function (err) {
        if (err) {
            return clicore.errorLog("css file could not be created.");
        }
    });
    var conf = fs.readFileSync(require.resolve("./project-template/defaultconfig.json"));
    fs.writeFile(name + "/a7.config.json", conf, function (err) {
        if (err) {
            return clicore.errorLog("config could not be created.");
        }
    });

    fs.writeFile(name + "/app/index.js", fs.readFileSync(require.resolve("./project-template/index.js")), function (err) {
        if (err) {
            return clicore.errorLog("app/index.js could not be created.");
        }
    });

    log(chalk.green("SUCCESS:"), "The Project was created without any errors!");
};
//TODO:
const a7createComponent = function(name) {
    var pathToComponents = "./app/";
    var jsFileName = pathToComponents + name + "/" + name + ".js";
    var cssFileName = pathToComponents + name + "/" + name + ".css";
    var htmlFileName = pathToComponents + name + "/" + name + ".html";
    fs.mkdirSync(pathToComponents + "/" + name);
    fs.writeFileSync(jsFileName, "export default {\n    tag:\""+name+"\",\n    template:\"./"+name+".html\",\n    styles:\"./"+name+".css\"\n};");
    fs.writeFileSync(htmlFileName, "");
    fs.writeFileSync(cssFileName, "");
    clicore.successLog("Component" + name + " was successfully created.");
};

const a7unknownArg = function () {
    clicore.errorLog(chalk.cyan(args.join(" ")) + " is not a valid argument.");
};

switch (args[0]) {
    case undefined:
        a7greet();
    case "help":
        a7helper();
        break;
    case "newproject":
    case "np":
        a7newproject(args[1]);
        break;
    case "build":
        a7build();
        break;
    case "newcomponent":
    case "nc":
        a7createComponent(args[1]);
        break;
    default:
        a7unknownArg();
        break;
}