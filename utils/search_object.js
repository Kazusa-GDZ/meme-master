function create_search_object(_type = "group",img_num){
    var object = {
        type : _type,
        img_num : img_num,
        max_page : -1,
        item_per_page : 10,
        current_page : 1,
        initalize : function(){
            max_page = img_num / item_per_page + 1
        }
    }
}