// Hide all item in .carousel-item initially
$(".carousel-item *").addClass("d-none");

// Animate the first slide
setTimeout(function() {
    $(".carousel-item.active *")
        .removeClass("d-none")
        .addClass("animated");
}, 3000);

// Animate after the slider changes
$("#mainBanner").on("slid.bs.carousel", function(e) {
    // Add .d-none to previous shown slide
    $(".carousel-item *").addClass("d-none");

    // Element for new slide
    var c = e["relatedTarget"];

    // After 0.7 sec slide changes, then make the animation for new slide
    setTimeout(function() {
        $(c)
            .find("*")
            .removeClass("d-none")
            .addClass("animated");
    }, 3000);
});


// Add product selection start

// Add product selection end