let button = {
    success: function (resultsCtr) {
        if (resultsCtr != 0) {
            $("#refreshBtn").removeClass().addClass("btn-success").addClass("btn");
            $("#refresh-label").html(resultsCtr + " result(s) found");
        } else {
            $("#refreshBtn").removeClass("btn-info").addClass("btn-danger");
            $("#refresh-label").html("No results found");
        }

        $("#refresh-spinner").removeClass();

        var timeout = setTimeout(function () {
            $("#refreshBtn").removeClass().addClass("btn-info").addClass("btn");
            $("#refresh-label").html("Search/Refresh");
        }, 3000);
    },
    error: function () {
        $("#refresh-spinner").removeClass();

        $("#refreshBtn").removeClass("btn-info").addClass("btn-danger");
        $("#refresh-label").html("Search ERROR");

        var timeout = setTimeout(function () {
            $("#refreshBtn").removeClass().addClass("btn-info").addClass("btn");
            $("#refresh-label").html("Search/Refresh");
        }, 3000);
    },
    loading: function () {
        $("#refresh-spinner").addClass("spinner-border").addClass("spinner-border-sm");
        $("#refresh-label").html(" ");
    },
    togglePrint: function () {
        $("#non-printable").toggle(400);
        //$("#print-only").toggle(400);
        if($(".toggle-printable-btn").hasClass("btn-outline-light")){
            $(".toggle-printable-btn").removeClass("btn-outline-light").addClass("btn-light");
        }else {
            $(".toggle-printable-btn").removeClass("btn-light").addClass("btn-outline-light");
        }
    }
}
