let dateManager = {
    fullDay: function (dayString) {
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var dayStringCompare = ["S", "M", "T", "W", "TH", "F", "Sat"];
        
        for(var i = 0; i < dayStringCompare.length; i++){
            if(dayString == dayStringCompare[i]){
                return days[i];
            }
        }
        
        return "No Day";
    },
    fromFullMonthToInt: function(fullMonth) {
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        for(var i = 0; i < months.length; i++){
            if(months[i] == fullMonth){
                return i;
            }
        }
        
        return "No Month";
    }
}
