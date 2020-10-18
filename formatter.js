sap.ui.define([], function () {
	
    return formatter =  {

        
        getSchedulerType :function(status){
            if(status=="1")
                return "Notification"

            if(status=="2")
                return "Chart"
                
            if(status=="3")
                return "Table"

            
        },
        formatterVisible :function(value){
            if(value ){
                return true
            }else{
                return false
            }
        },
        
     
}
});
