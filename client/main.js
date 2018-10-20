import '../imports/api/routes.js';

$(document).ready(function() {
    if (window.location.pathname.indexOf("/galileo/share/review") == 0) {
        console.log();
    } else if (window.location.pathname.indexOf("/galileo/browse/KEFIR") == 0) {
        $("title").html("Galileo | KEFIR");
    } else if (window.location.pathname.indexOf("/galileo/browse/KOMBUCHA") == 0) {
        $("title").html("Galileo | KOMBUCHA");
    } else if (window.location.pathname.indexOf("/galileo/browse/OPENHUMANS") == 0) {
        $("title").html("Galileo | OPENHUMANS");
    } else if (window.location.pathname.indexOf("/galileo/browse/AMERICANGUT") == 0) {
        $("title").html("Galileo | AMERICANGUT");
    } else if (window.location.pathname.indexOf("/galileo/browse/T1%20Diabetes") == 0) {
        $("title").html("Galileo | T1Diabetes");
    } else if (window.location.pathname.indexOf("/galileo/browse/LYME") == 0) {
        $("title").html("Galileo | LYME");
    } else if (window.location.pathname.indexOf("/galileo/browse/APOLLO") == 0) {
        $("title").html("Galileo | APOLLO");
    } else if (window.location.pathname.indexOf("/galileo/browse/TUDELFT") == 0) {
        $("title").html("Galileo | TUDELFT");
    } else if (window.location.pathname.indexOf("/galileo/browse/SOYLENT") == 0) {
        $("title").html("Galileo | SOYLENT");
    } else if (window.location.pathname.indexOf("/galileo/browse/GLUTEN") == 0) {
        $("title").html("Galileo | GLUTEN");
    } else if (window.location.pathname.indexOf("/galileo") == 0) {
        $("title").html("Galileo | Beta");
    }

});