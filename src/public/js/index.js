// const e = require("express");

$('.btn-change-dark').click(function() {
    localStorage.setItem('theme', 'dark-mode-main');

    let theme = localStorage.getItem('theme');
    $('body').addClass(theme);
    $('.header-main').addClass(theme);
})

$('.btn-change-light').click(function() {
    let theme = localStorage.getItem('theme');
    $('body').removeClass(theme);
    $('.header-main').removeClass(theme);
    localStorage.setItem('theme', 'light');

})

$(document).ready(function() {
    let theme = localStorage.getItem('theme');
    // alert(theme)
    $('body').addClass(theme);
    $('.header-main').addClass(theme);
})
$('#addComment').click(function(e) {
    e.preventDefault();
    // alert('pass')
    let comment = $('.comment').val()
    let pid = $('.pid').val()
        // alert(comment)
    let userImage = $('.avatar').val()
    let username = $('.username').val()

    let html = `<div class="mb-3" style="height: 80px;">
        <div>
            <img src="${userImage}" alt="${userImage}" style="width: 35px; height: 35px; border-radius: 50%; line-height: 80px;">
            <span class="ml-3" style="font-size: 14px;">${username}</span>
            <div class="ml-5">
                <span class="" style="border: 1px solid rgb(228, 228, 228); padding: 10px 20px 10px 15px; border-radius: 8px; background-color: white;">
                    ${comment}
                </span>

                <button class="btn btn-reply"><i class="fa fa-reply" aria-hidden="true" style="font-size: 10px; color: rgb(76, 76, 76)"></i></button>
                <div class="reply d-none" style="margin-left: 100px; border-radius: 10px;">
                    <input type="text">
                </div>
            </div>
        </div>
        </div>`
        // $(this).val('')
    $('#commentBox').append(html);
    $('.comment').val('')
    $.ajax({
        url: '/product/comment',
        method: 'post',
        data: {
            comment,
            pid
        },
        success: (data) => {

        }
    })
})
$('#addComment').keydown(function(e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        $(this).trigger("enterKey");
    }
});