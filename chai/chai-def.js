var jsdom = require("jsdom");
var fs = require("fs");
var _ = require("underscore");
var jquery = fs.readFileSync("../lib/jquery/jquery.js");
var sleep = require("sleep");


function name($, section) {
    var result = $(section).find(".summary h3").text().match(/^(.\w+)/)[0];
    result = result.indexOf(".") === 0 ? 
        result.substring(1, result.length) : result;

    return result;
}

function type($, section) {
    var signature = $(section).find(".summary h3").text();
    var optParamIndices = [];

    // The signature indicates optional parameters with square brackets. For
    // instance: foo(bar, [x], [y]) indicates that x and y is optional. The
    // loop below pushes the indices of optional parameters to an array by
    // examining the parameters after '('.
    var params = signature.split("(")[1];
    if(params) 
        _(params.split(",")).each(function(param, index) {
            if(param.toString().indexOf("[") != -1)
                optParamIndices.push(index);
        });
    
    var parameters = [];
    $(section).find("ul.tags li.tag").each(function(index) {
        var name = $(this).find("span.name").text();
        var type = $(this).find("span.types").text().match(/\w+/);
        type = type ? type.toString().toLowerCase() : type;

        var optional = _(optParamIndices).contains(index);

        var parameter = {
            name: name,
            type: type,
            optional: optional,

            toString: function() {
                var result = name + ": ";
                result += optional ? "[" + type + "]" : type;
                return result;
            }
        };

        if(name) 
            parameters.push(parameter);
    });

    this.type = "fn(";
    parameters.forEach(function(parameter, index, array) {
        this.type += parameter.toString();
        this.type += parameters.length > index + 1 ? ", " : "";
    });
    this.type += ")";
    var returns = "bool"; // All chai assert methods return bool.
    this.type += " -> " + returns;
    return this.type;
}

function url($, section, docUrl) {
    if(docUrl.substr(-1) != '/') 
        docUrl += "/";

    this.name = name($, section);
    return docUrl + "#" + this.name;
}

function doc($, section) {
    var signature = $(section).find(".summary h3").text();
    var params = [];
    $(section).find("ul.tags li.tag").each(function(index) {
        var type = $(this).find(".type").text();
        var types = $(this).find(".types").text();
        var name = $(this).find(".name").text();
        var desc = $(this).find(".desc").text();
        params.push("  * " + type + " " + types + " " + name + "" + desc);
    });
    var description = $(section).find(".description p").text();
    var example = $(section).find(".description pre").text();
    
    var documentation = signature + "\n\n" + params.join("\n") + "\n\n" + description + "\n\n" + example ;

    return documentation;
}

function docsForUrl(docUrl, moduleName) {
    jsdom.env({
        url: docUrl,
        src: [jquery],
        done: function (errors, window) {
            var $ = window.$;

            var docs = {};
            $(".segment").each(function () {
                docs[name($, this)] = {
                    "!doc": doc($, this),
                    "!url": url($, this, docUrl),
                    "!type": type($, this)
                };
            });

            newDocsAreReady(docs, moduleName);
        }
    });
}


var results = {};
function newDocsAreReady(docs, moduleName) {
    results[moduleName] = docs;

    if(_.keys(results).length == _.keys(modules).length)
        allDocsAreReady();
}

function allDocsAreReady() {
    var terndef = {
        "!name": libName 
    };
    
    for(var r in results) 
        terndef[r] = results[r];

    console.log(JSON.stringify(terndef, null, "\t"));
}

var libName = "chai";
var modules = {
    "expect": "http://chaijs.com/api/bdd",
    "assert": "http://chaijs.com/api/assert"
};

for(var module in modules) 
    docsForUrl(modules[module], module);



