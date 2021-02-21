$(document).ready(function(){

    $('.dropdown-item').click(function (e){
        e.preventDefault()
        let avatarImg = $(this).attr("data-avatar")
        let colorName = $(this).attr("data-color")
        $('#avatarImg').attr('value', avatarImg)
        $('#avatarIndicator').attr('src', avatarImg)
        $('#selectedColor').html(colorName)
    })

});