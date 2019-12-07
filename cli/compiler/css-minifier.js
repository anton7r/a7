var csso = require("csso");
module.exports = function(css){
    try {
        return csso.minify(css).css;
    }
    catch(e){
        return css.replace(/\n\r/g, "");
    }
};